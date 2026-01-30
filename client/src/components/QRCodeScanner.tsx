import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, QrCode, Barcode, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRCodeScannerProps {
  onScan: (decodedText: string, format: string) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
}

export default function QRCodeScanner({
  onScan,
  onError,
  className,
  title = "Scanner de Código",
  description = "Aponte a câmera para o código de barras ou QR Code do patrimônio",
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Som de beep para feedback
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 150);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader", {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
        ],
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          // Evitar leituras duplicadas em sequência
          if (decodedText === lastScanned) return;
          
          setLastScanned(decodedText);
          playBeep();
          
          const format = decodedResult.result.format?.formatName || "UNKNOWN";
          onScan(decodedText, format);
          
          // Reset após 2 segundos para permitir nova leitura do mesmo código
          setTimeout(() => setLastScanned(null), 2000);
        },
        (errorMessage) => {
          // Ignorar erros de leitura contínua (normal quando não há código na tela)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Erro ao iniciar scanner:", err);
      setHasCamera(false);
      onError?.("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Erro ao parar scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8"
              title={soundEnabled ? "Desativar som" : "Ativar som"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área do scanner */}
        <div
          ref={containerRef}
          className="relative bg-muted rounded-lg overflow-hidden"
          style={{ minHeight: "300px" }}
        >
          <div id="qr-reader" className="w-full" />
          
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted">
              <div className="flex items-center gap-3 text-muted-foreground">
                <QrCode className="h-8 w-8" />
                <Barcode className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground text-center px-4">
                Clique no botão abaixo para iniciar a câmera
              </p>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="flex-1 bg-gradient-to-r from-[#005A92] to-[#00A651]"
              disabled={!hasCamera}
            >
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Câmera
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
              className="flex-1"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Parar Câmera
            </Button>
          )}
        </div>

        {!hasCamera && (
          <p className="text-sm text-destructive text-center">
            Câmera não disponível. Verifique as permissões do navegador.
          </p>
        )}

        {/* Formatos suportados */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Formatos suportados: QR Code, EAN-13, EAN-8, Code 128, Code 39, UPC-A, UPC-E</p>
        </div>
      </CardContent>
    </Card>
  );
}
