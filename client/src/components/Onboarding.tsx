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
          <h2 className="text-xl font-bold text-[#0066CC]">Bem-vindo ao Sistema Patrimônio DTIC!</h2>
          <p className="text-gray-700">
            Sistema de Gerenciamento de Patrimônio de Informática do Detran-RJ.
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
          <h3 className="font-bold text-[#0066CC]">Dashboard</h3>
          <p className="text-sm text-gray-700">
            Visão geral com estatísticas e gráficos dos patrimônios.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="patrimonios"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Patrimônios</h3>
          <p className="text-sm text-gray-700">
            Visualize, cadastre e gerencie os equipamentos.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="levantamento"]',
      content: (
        <div className="space-y-2">
          <h3 className="font-bold text-[#0066CC]">Levantamento</h3>
          <p className="text-sm text-gray-700">
            Cadastro rápido durante o levantamento de campo.
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
            Gere relatórios em Excel para documentação.
          </p>
        </div>
      ),
      placement: "right",
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
        last: "Concluir",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
}
