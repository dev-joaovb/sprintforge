import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const TOUR_STEPS: DriveStep[] = [
  {
    element: '#tour-brand',
    popover: {
      title: '🚀 Bem-vindo ao SprintForge!',
      description:
        'Sua plataforma de engenharia ágil integrada com Scrum, Extreme Programming (XP) e Kanban contínuo. Vamos conhecer as principais áreas da plataforma.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-project-selector',
    popover: {
      title: '📁 Seletor de Projetos Ativos',
      description:
        'Alterne rapidamente entre seus projetos. Cada projeto possui isolamento total de membros, chat dedicado, métricas e metodologia própria.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-methodology-tabs',
    popover: {
      title: '⚡ Módulos de Metodologias Ágeis',
      description:
        'Navegue entre XP (Pair Programming & TDD), Scrum (Backlogs, Planning Poker & Dailies), Kanban (Quadro Drag & Drop) e o Diagnóstico Inteligente.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#tour-new-project-btn',
    popover: {
      title: '✨ Criar Novo Projeto',
      description:
        'Crie um projeto do zero, defina prazo de entrega, quantidade máxima de vagas para integrantes e a metodologia inicial.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-diagnostic-btn',
    popover: {
      title: '🎯 Diagnóstico Inteligente',
      description:
        'Responda a 5 perguntas estratégicas sobre seu time e escopo para receber a recomendação ideal entre XP, Scrum e Kanban.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-profile-btn',
    popover: {
      title: '👤 Seu Perfil & Foto',
      description:
        'Personalize sua foto de perfil, área tecnológica e exporte relatórios executivos de projetos em PDF a qualquer momento.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-help-btn',
    popover: {
      title: '💡 Ajuda & Tour Interativo',
      description:
        'Precisa rever este passo a passo no futuro? Basta clicar neste botão para reiniciar o guia interativo quando quiser!',
      side: 'bottom',
      align: 'end',
    },
  },
];

export const startOnboardingTour = (userId?: string, force: boolean = false) => {
  if (!userId) return;

  const storageKey = `sprintforge_tour_seen_${userId}`;
  const alreadySeen = localStorage.getItem(storageKey);

  if (!force && alreadySeen) {
    return;
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(11, 15, 23, 0.85)',
    stagePadding: 6,
    stageRadius: 12,
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Começar a Usar! 🚀',
    steps: TOUR_STEPS,
    onDestroyed: () => {
      localStorage.setItem(storageKey, 'true');
    },
  });

  driverObj.drive();
};
