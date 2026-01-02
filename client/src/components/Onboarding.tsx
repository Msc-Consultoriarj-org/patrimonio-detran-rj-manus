import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface OnboardingProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function Onboarding({ run, onComplete, onSkip }: OnboardingProps) {
  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[#0066CC]">Bem-vindo ao Sistema Patrimônio DTIC! 🎉</h2>
          <p className="text-gray-700">
            Vamos fazer um tour rápido pelas principais funcionalidades do sistema.
          </p>
          <p className="text-sm text-gray-600">
            Você pode pular este tour a qualquer momento clicando em "Pular".
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Dashboard - Visão Geral</h3>
          <p className="text-sm text-gray-700">
            Aqui você encontra estatísticas gerais do sistema: total de patrimônios, valor total, categorias e localizações.
          </p>
          <p className="text-sm text-gray-700">
            Os gráficos mostram a distribuição dos equipamentos por categoria e localização.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="patrimonios"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Gestão de Patrimônios</h3>
          <p className="text-sm text-gray-700">
            Nesta seção você pode visualizar, cadastrar, editar e excluir patrimônios de informática.
          </p>
          <p className="text-sm text-gray-700">
            Use os filtros para buscar por descrição, categoria ou localização.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="levantamento"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Levantamento de Campo</h3>
          <p className="text-sm text-gray-700">
            Use esta funcionalidade para cadastrar patrimônios rapidamente durante o levantamento de campo.
          </p>
          <p className="text-sm text-gray-700">
            Você pode tirar foto do equipamento e preencher os dados diretamente no sistema.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="relatorios"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Relatórios</h3>
          <p className="text-sm text-gray-700">
            Gere relatórios completos dos patrimônios em formato CSV, PDF ou Markdown.
          </p>
          <p className="text-sm text-gray-700">
            Ideal para apresentações e documentação.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="upload-csv"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Importação em Lote</h3>
          <p className="text-sm text-gray-700">
            Importe múltiplos patrimônios de uma vez usando planilhas CSV ou Excel.
          </p>
          <p className="text-sm text-gray-700">
            O sistema valida os dados automaticamente e mostra erros antes de salvar.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="sugestoes"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Sugestões e Melhorias</h3>
          <p className="text-sm text-gray-700">
            Tem alguma ideia para melhorar o sistema? Envie suas sugestões aqui!
          </p>
          <p className="text-sm text-gray-700">
            Sua opinião é muito importante para nós.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[#00AA44]">Pronto para começar! ✅</h2>
          <p className="text-gray-700">
            Agora você conhece as principais funcionalidades do sistema.
          </p>
          <p className="text-sm text-gray-600">
            Se precisar ver este tour novamente, acesse o menu do seu perfil e clique em "Ver Tour Novamente".
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED) {
      onComplete();
    } else if (status === STATUS.SKIPPED) {
      onSkip();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#0066CC",
          textColor: "#333",
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: "#0066CC",
          fontSize: 14,
          padding: "8px 16px",
          borderRadius: "6px",
        },
        buttonBack: {
          color: "#666",
          fontSize: 14,
        },
        buttonSkip: {
          color: "#999",
          fontSize: 13,
        },
        tooltip: {
          borderRadius: "8px",
          padding: "16px",
        },
        tooltipContent: {
          padding: "8px 0",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular Tour",
      }}
    />
  );
}
