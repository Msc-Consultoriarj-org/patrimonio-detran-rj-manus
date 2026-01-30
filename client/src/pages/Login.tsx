import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";

export default function Login() {
  const handleLogin = () => {
    // Redirecionar diretamente para OAuth Manus
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#005A92] via-[#007AAA] to-[#00A651] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          {/* Logo do Detran-RJ */}
          <div className="mx-auto mb-4">
            <img 
              src="/assets/detran-rj-logo.png" 
              alt="DETRAN.RJ" 
              className="h-20 w-auto"
              onError={(e) => {
                // Fallback se a imagem não carregar
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-[#005A92]">
            Sistema Patrimônio DTIC
          </CardTitle>
          <CardDescription className="text-base">
            Departamento de Tecnologia da Informação e Comunicação
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            {/* Informação do sistema */}
            <div className="bg-[#005A92]/5 rounded-lg p-4 text-center">
              <p className="text-sm text-[#005A92] font-medium">
                Gerenciamento de Patrimônio de Informática
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Acesso restrito aos servidores do DETRAN-RJ
              </p>
            </div>

            {/* Botão de Login */}
            <Button
              onClick={handleLogin}
              className="w-full h-14 text-lg font-semibold bg-[#00A651] hover:bg-[#008C44] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Utilize sua conta Google corporativa (@detran.rj.gov.br)
            </p>

            {/* Rodapé institucional */}
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-center text-muted-foreground">
                DETRAN-RJ - Departamento de Trânsito do Estado do Rio de Janeiro
              </p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                DTIC - Departamento de Tecnologia da Informação e Comunicação
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
