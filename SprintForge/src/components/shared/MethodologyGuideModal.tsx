import React, { useEffect, useState } from 'react';
import { Methodology } from '../../types';
import {
  X, BookOpen, Code2, Repeat, Kanban as KanbanIcon, CheckCircle2,
  Zap, Users, Target, Clock, Layers, HelpCircle, Lightbulb,
  ShieldCheck, BarChart3, Flame,
} from 'lucide-react';

interface MethodologyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethodology: Methodology;
}

type GuideStep = {
  title: string;
  description: React.ReactNode;
  icon: React.ElementType;
  accent: string;
};

type GuideContent = {
  name: string;
  shortName: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  softAccent: string;
  borderAccent: string;
  summary: React.ReactNode;
  tags: string[];
  steps: GuideStep[];
  recommendations: string[];
};

const guides: Record<'XP' | 'SCRUM' | 'KANBAN', GuideContent> = {
  XP: {
    name: 'XP (Extreme Programming)',
    shortName: 'XP',
    subtitle: 'Engenharia de software e excelência técnica',
    icon: Code2,
    accent: 'text-cyan-700',
    softAccent: 'bg-cyan-50',
    borderAccent: 'border-cyan-200',
    summary: <>
      XP é uma metodologia ágil focada na <strong>excelência técnica de engenharia de software</strong>, alta capacidade de resposta a mudanças de requisitos e feedback contínuo. Leva as práticas de programação ao extremo para garantir qualidade de código impecável e zero defeitos.
    </>,
    tags: [
      'Foco: Qualidade de Código & Engenharia',
      'Iterações: 1 a 2 Semanas',
      'Feedback: Minutos / Horas',
    ],
    steps: [
      {
        title: '1. Pair Programming Tracker', icon: Users, accent: 'text-cyan-700',
        description: <>Selecione uma dupla de desenvolvedores (<strong>Piloto / Driver</strong> que digita e <strong>Copiloto / Navigator</strong> que valida a arquitetura). Ative o timer Pomodoro de 25min para alternar os papéis e manter o foco elevado.</>,
      },
      {
        title: '2. Ciclo TDD (Red-Green-Refactor)', icon: CheckCircle2, accent: 'text-emerald-700',
        description: <>Cadastre os cenários de testes antes do código. Mantenha o teste em <strong className="text-rose-700">RED</strong> (falhando), implemente a solução até ficar <strong className="text-emerald-700">GREEN</strong> e refatore para manter o design simples.</>,
      },
      {
        title: '3. Integração Contínua (CI/CD)', icon: Zap, accent: 'text-violet-700',
        description: <>Simule a execução da suíte de testes integrada e acompanhe o pipeline de compilação. Em XP, novos códigos são integrados e validados múltiplas vezes ao dia.</>,
      },
      {
        title: '4. As 12 Práticas do XP', icon: ShieldCheck, accent: 'text-amber-700',
        description: <>Utilize o checklist das 12 práticas (Design Simples, Padrão de Código, Ritmo Sustentável, Propriédade Coletiva) para auditoria e evolução da equipe.</>,
      },
    ],
    recommendations: [
      'Projetos de alta complexidade técnica e requisitos hipermutáveis.',
      'Sistemas críticos onde falhas em produção geram grande prejuízo financeiro ou reputacional.',
      'Equipes de desenvolvimento sênior focadas em código limpo, TDD e refatoração diária.',
    ],
  },
  SCRUM: {
    name: 'Scrum Framework',
    shortName: 'Scrum',
    subtitle: 'Entregas iterativas e planejamento colaborativo',
    icon: Repeat,
    accent: 'text-violet-700',
    softAccent: 'bg-violet-50',
    borderAccent: 'border-violet-200',
    summary: <>
      O Scrum é um framework iterativo e incremental estruturado em ciclos fixos de tempo chamados <strong>Sprints</strong> (normalmente de 1 a 4 semanas). Ele garante transparência, inspeção frequente e adaptação através de rituais bem definidos.
    </>,
    tags: [
      'Foco: Entregas Iterativas & Previsibilidade',
      'Sprints: 1 a 4 Semanas',
      'Papéis: PO, Scrum Master, Developers',
    ],
    steps: [
      {
        title: '1. Sprint Goal & Backlog', icon: Target, accent: 'text-violet-700',
        description: <>Defina a meta clara da Sprint (<strong>Sprint Goal</strong>) no banner do topo. Puxe itens do <strong>Product Backlog</strong> para o <strong>Sprint Backlog</strong> priorizando por valor de negócio.</>,
      },
      {
        title: '2. Planning Poker', icon: Layers, accent: 'text-cyan-700',
        description: <>Efetue votação assíncrona ou em tempo real de Story Points usando a sequência de Fibonacci (1, 2, 3, 5, 8, 13, 21). Revele as cartas para consenso sem viés de ancoragem.</>,
      },
      {
        title: '3. Burndown Chart', icon: BarChart3, accent: 'text-emerald-700',
        description: <>Monitore diariamente a queima de Story Points. A linha roxa (Real) deve acompanhar a linha tracejada (Ideal) para atingir 100% da meta na data limite.</>,
      },
      {
        title: '4. Daily Scrum & Retrospectiva', icon: Users, accent: 'text-amber-700',
        description: <>Registre notas da reunião diária e utilize o quadro de post-its da <strong>Retrospectiva</strong> (O que funcionou, O que melhorar, Ações) com contagem de votos.</>,
      },
    ],
    recommendations: [
      'Projetos de novos produtos (SaaS/Apps) com roadmap e entregas planejadas em marcos regulares.',
      'Equipes multidisciplinares que precisam de rituais claros para alinhamento e autonomia.',
      'Cenários onde stakeholders necessitam de previsibilidade de escopo ao final de cada Sprint.',
    ],
  },
  KANBAN: {
    name: 'Kanban Continuous Flow',
    shortName: 'Kanban',
    subtitle: 'Fluxo contínuo, eficiência e visibilidade',
    icon: KanbanIcon,
    accent: 'text-emerald-700',
    softAccent: 'bg-emerald-50',
    borderAccent: 'border-emerald-200',
    summary: <>
      Kanban é um sistema visual de gestão de trabalho puxado focando na <strong>otimização de fluxo contínuo</strong>, eliminação de gargalos e limitação estrita do Trabalho em Andamento (<strong>WIP - Work in Progress</strong>). Não utiliza Sprints nem datas rígidas.
    </>,
    tags: [
      'Foco: Otimização de Fluxo & Redução de Lead Time',
      'Ritmo: Contínuo (Puxado)',
      'Regra Chave: Limite de WIP Explicito',
    ],
    steps: [
      {
        title: '1. Quadro Drag & Drop', icon: KanbanIcon, accent: 'text-emerald-700',
        description: <>Arraste os cards entre as colunas (<strong>Backlog, A Fazer, Em Progresso, Em Revisão, Concluído</strong>). A transição do trabalho deve refletir o estado real em tempo real.</>,
      },
      {
        title: '2. Alertas de Violação de WIP', icon: Flame, accent: 'text-rose-700',
        description: <>Ajuste os limites de WIP pelo painel de controle. Se uma coluna ultrapassar o limite (ex: mais de 3 itens em progresso), o sistema emitirá alertas visuais de gargalo.</>,
      },
      {
        title: '3. Lead Time vs. Cycle Time', icon: Clock, accent: 'text-cyan-700',
        description: <>Acompanhe o <strong>Lead Time</strong> (do pedido à entrega) e o <strong>Cycle Time</strong> (tempo de mão na massa). O objetivo é reduzir continuamente ambos os indicadores.</>,
      },
      {
        title: '4. Throughput (Vazão Semanal)', icon: BarChart3, accent: 'text-violet-700',
        description: <>Monitore quantos cards a equipe é capaz de entregar por semana de forma consistente e com alta qualidade.</>,
      },
    ],
    recommendations: [
      'Equipes de sustentação, suporte técnico, DevOps ou manutenção contínua.',
      'Demandas com alta frequência de chamados não planejados que chegam a qualquer momento.',
      'Processos que exigem fluxo constante sem interrupções por reuniões de planejamento de Sprint.',
    ],
  },
};

const methodologyOrder = ['XP', 'SCRUM', 'KANBAN'] as const;

export const MethodologyGuideModal: React.FC<MethodologyGuideModalProps> = ({
  isOpen,
  onClose,
  initialMethodology,
}) => {
  const [activeTab, setActiveTab] = useState<Methodology>(initialMethodology);

  useEffect(() => {
    if (isOpen) setActiveTab(initialMethodology);
  }, [isOpen, initialMethodology]);

  if (!isOpen) return null;

  const guide = guides[activeTab as keyof typeof guides];
  const GuideIcon = guide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-guide-title"
        className="flex max-h-[92vh] w-full max-w-4xl min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">
                Guia de Metodologias Ágeis & Boas Práticas
              </p>
              <h2 id="methodology-guide-title" className="text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">
                Como Utilizar {activeTab} no Seu Contexto
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Explore práticas e funcionalidades disponíveis no SprintForge.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia de metodologias"
            className="shrink-0 rounded-xl border border-transparent p-2 text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Methodology navigation */}
        <nav aria-label="Metodologias disponíveis" className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 pt-3 sm:px-7">
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Selecionar metodologia">
            {methodologyOrder.map((methodology) => {
              const item = guides[methodology];
              const ItemIcon = item.icon;
              const selected = activeTab === methodology;
              return (
                <button
                  key={methodology}
                  type="button"
                  role="tab"
                  id={`methodology-tab-${methodology.toLowerCase()}`}
                  aria-selected={selected}
                  aria-controls="methodology-guide-panel"
                  onClick={() => setActiveTab(methodology)}
                  className={`flex shrink-0 items-center gap-2 rounded-t-xl border-b-[3px] px-3 py-3 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 sm:px-5 sm:text-sm ${
                    selected
                      ? `${item.accent} border-current bg-white`
                      : 'border-transparent text-slate-500 hover:bg-white/80 hover:text-slate-800'
                  }`}
                >
                  <ItemIcon className="h-4 w-4 shrink-0" />
                  <span className="sm:hidden">{item.shortName}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Scrollable guide */}
        <main
          id="methodology-guide-panel"
          role="tabpanel"
          aria-labelledby={`methodology-tab-${activeTab.toLowerCase()}`}
          className="min-h-0 flex-1 space-y-7 overflow-y-auto bg-white px-5 py-6 sm:px-7 sm:py-7"
        >
          <section className={`space-y-4 rounded-2xl border ${guide.borderAccent} ${guide.softAccent} p-5 sm:p-6`}>
            <div className="flex items-start gap-3">
              <div className={`rounded-xl border border-white/80 bg-white p-2.5 shadow-sm ${guide.accent}`}>
                <GuideIcon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-xs font-semibold ${guide.accent}`}>{guide.subtitle}</p>
                <h3 className="mt-1 text-base font-extrabold text-slate-900 sm:text-lg">
                  {activeTab === 'XP' ? 'O que é Extreme Programming (XP)?' : activeTab === 'SCRUM' ? 'O que é o Scrum Framework?' : 'O que é Kanban (Fluxo Contínuo)?'}
                </h3>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-700">{guide.summary}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {guide.tags.map((tag, index) => (
                <span
                  key={tag}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold ${index === 0 ? `${guide.borderAccent} bg-white ${guide.accent}` : 'border-slate-200 bg-white/85 text-slate-600'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                  Como Utilizar o Módulo {guide.shortName} no SprintForge
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">Práticas e ferramentas disponíveis para sua equipe</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {guide.steps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
                    <div className="mb-3 flex items-start gap-2.5">
                      <div className={`rounded-lg bg-slate-50 p-2 ${step.accent}`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <h4 className="pt-1.5 text-sm font-bold leading-5 text-slate-900">{step.title}</h4>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${guide.accent}`} />
              <h3 className="text-sm font-extrabold text-slate-900">Quando {guide.shortName} é o mais recomendado?</h3>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 marker:text-slate-400">
              {guide.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </section>
        </main>

        {/* Footer */}
        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <span>Você pode alterar a metodologia ativa do seu projeto a qualquer momento na barra superior.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full shrink-0 rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
          >
            Entendido
          </button>
        </footer>
      </div>
    </div>
  );
};
