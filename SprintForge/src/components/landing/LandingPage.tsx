
import React, { useState } from 'react';
import {
  Flame,
  Code2,
  Repeat,
  Kanban as KanbanIcon,
  Zap,
  ShieldCheck,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  Vote,
  ListChecks,
  Clock,
  LogIn,
  UserPlus,
  Layers,
  ChevronRight,
  Star,
  Activity,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

type MethodologyKey = 'XP' | 'SCRUM' | 'KANBAN';

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
}) => {
  const [selectedMethodology, setSelectedMethodology] =
    useState<MethodologyKey>('SCRUM');

  const features = [
    {
      icon: Code2,
      badge: 'Extreme Programming',
      title: 'XP Engine & TDD Checklist',
      desc: 'Sessões de Pair Programming com rotação Pomodoro de 25 min, suíte TDD interativa e pipelines de Integração Contínua (CI).',
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      badgeBg: 'bg-cyan-50',
    },
    {
      icon: Repeat,
      badge: 'Scrum Master Suite',
      title: 'Planning Poker & Sprint Metrics',
      desc: 'Estimação Fibonacci com cartas sincronizadas ao número real de integrantes, Daily Scrums, Retrospectivas votadas e Burndown.',
      border: 'border-violet-200',
      iconBg: 'bg-violet-50',
      textColor: 'text-violet-700',
      badgeBg: 'bg-violet-50',
    },
    {
      icon: KanbanIcon,
      badge: 'Kanban Contínuo',
      title: 'Quadro Drag & Drop com WIP',
      desc: 'Quadro com arrastar e soltar ultra-fluido, controle estrito de limites WIP por coluna, cálculo automático de Lead Time e Cycle Time.',
      border: 'border-blue-200',
      iconBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      badgeBg: 'bg-blue-50',
    },
  ];

  const methodologyDetails = {
    XP: {
      title: 'Engenharia Extrema para Código de Alta Fidelidade',
      desc: 'Ideal para equipes com requisitos dinâmicos, código crítico e foco inegociável em cobertura de testes automatizados e integração sem fricção.',
      highlights: [
        'Temporizador Pomodoro Driver & Navigator de 25 min',
        'Ciclos Red-Green-Refactor com suíte de testes simulada',
        'Checklist de 12 práticas fundamentais do XP',
        'Métricas de build e automação de deploy',
      ],
      color: 'cyan',
    },
    SCRUM: {
      title: 'Ciclos de Entrega Previsíveis e Planejamento Ágil',
      desc: 'Perfeito para projetos de escopo moderado ou grande, com cerimônias estruturadas em Sprints de 1 a 4 semanas e alinhamento diário.',
      highlights: [
        'Planning Poker em tempo real alinhado à equipe do projeto',
        'Mural de Daily Scrums com registro de impedimentos',
        'Retrospectivas categorizadas com votação coletiva',
        'Gráficos de Burndown e velocidade da Sprint',
      ],
      color: 'violet',
    },
    KANBAN: {
      title: 'Fluxo Contínuo e Eliminação Imediata de Gargalos',
      desc: 'Feito sob medida para demandas contínuas, suporte, sustentação e equipes que buscam minimizar o tempo de entrega de cada cartão.',
      highlights: [
        'Arrastar e soltar de cards entre 5 colunas de fluxo',
        'Limites WIP (Work in Progress) configuráveis por coluna',
        'Métricas de vazão semanal (Throughput)',
        'Análise de tempo médio de espera e execução',
      ],
      color: 'blue',
    },
  };

  const methodologyTheme = {
    SCRUM: {
      activeTab: 'bg-violet-700 text-white shadow-sm',
      accentText: 'text-violet-700',
      accentBg: 'bg-violet-50',
      accentBorder: 'border-violet-200',
    },
    XP: {
      activeTab: 'bg-cyan-700 text-white shadow-sm',
      accentText: 'text-cyan-700',
      accentBg: 'bg-cyan-50',
      accentBorder: 'border-cyan-200',
    },
    KANBAN: {
      activeTab: 'bg-blue-700 text-white shadow-sm',
      accentText: 'text-blue-700',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-200',
    },
  };

  const activeTheme = methodologyTheme[selectedMethodology];

  return (
    <div className="min-h-screen bg-[#E2E8F0] text-[#0F172A] flex flex-col font-sans selection:bg-blue-200 selection:text-blue-950">

      {/* Navigation Topbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#1D4ED8] flex items-center justify-center shadow-sm">
              <Flame className="w-5 h-5 text-white" />
            </div>

            <div className="min-w-0">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                SprintForge
              </span>
              <span className="hidden md:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                Agile Engine
              </span>
              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                Agile Platform
              </p>
            </div>
          </div>

          {/* Quick Nav & Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-transparent transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cadastre-se Grátis</span>
              <span className="sm:hidden">Cadastrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-16 lg:pt-24 lg:pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-semibold text-blue-800 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Engenharia de Software Moderna & Gestão Unificada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight sm:leading-tight">
            A plataforma ágil definitiva para equipes que usam{' '}
            <span className="text-[#1D4ED8]">
              XP, Scrum e Kanban
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elimine planilhas desconexas. Tenha diagnósticos inteligentes de metodologia,
            planning poker Fibonacci sincronizado, pareamento de código, quadros interativos
            e gráficos de progresso em tempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Começar Gratuitamente</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-blue-700" />
              <span>Acessar Minha Conta</span>
            </button>
          </div>

          {/* Key Stat Badges */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-blue-700">3-em-1</div>
              <div className="text-xs text-slate-600 mt-1">XP, Scrum & Kanban</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-cyan-700">100%</div>
              <div className="text-xs text-slate-600 mt-1">Sincronizado em Equipe</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-emerald-700">Tempo Real</div>
              <div className="text-xs text-slate-600 mt-1">Chat & Planning Poker</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-amber-700">Driver.js</div>
              <div className="text-xs text-slate-600 mt-1">Onboarding Guiado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              Metodologias Ágeis de Ponta a Ponta
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950">
              Projetado para desenvolvedores e líderes técnicos
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Cada metodologia conta com ferramentas e cerimônias práticas nativas
              da engenharia moderna de software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const IconComp = f.icon;

              return (
                <div
                  key={i}
                  className={`p-6 rounded-2xl bg-white border ${f.border} shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-3 rounded-xl ${f.iconBg} border ${f.border}`}>
                      <IconComp className={`w-6 h-6 ${f.textColor}`} />
                    </div>

                    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full ${f.badgeBg} border ${f.border} ${f.textColor} text-right`}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {f.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Methodology Explorer */}
      <section className="py-16 sm:py-24 bg-[#E2E8F0] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-blue-700 border border-blue-200 text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5" />
                Explorador Interativo
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                Escolha sua metodologia favorita
              </h2>

              <p className="text-sm text-slate-600 mt-2 max-w-xl">
                Explore os recursos de cada metodologia antes de começar seu projeto.
              </p>
            </div>

            {/* Methodology Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm self-start max-w-full">
              <button
                onClick={() => setSelectedMethodology('SCRUM')}
                aria-pressed={selectedMethodology === 'SCRUM'}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedMethodology === 'SCRUM'
                    ? methodologyTheme.SCRUM.activeTab
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Repeat className="w-4 h-4" /> Scrum
              </button>

              <button
                onClick={() => setSelectedMethodology('XP')}
                aria-pressed={selectedMethodology === 'XP'}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedMethodology === 'XP'
                    ? methodologyTheme.XP.activeTab
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Code2 className="w-4 h-4" /> XP
              </button>

              <button
                onClick={() => setSelectedMethodology('KANBAN')}
                aria-pressed={selectedMethodology === 'KANBAN'}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedMethodology === 'KANBAN'
                    ? methodologyTheme.KANBAN.activeTab
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <KanbanIcon className="w-4 h-4" /> Kanban
              </button>
            </div>
          </div>

          {/* Explorer Detail Card */}
          <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${activeTheme.accentBg} ${activeTheme.accentText} border ${activeTheme.accentBorder} text-xs font-bold`}>
                  {selectedMethodology === 'SCRUM' && <Repeat className="w-3.5 h-3.5" />}
                  {selectedMethodology === 'XP' && <Code2 className="w-3.5 h-3.5" />}
                  {selectedMethodology === 'KANBAN' && <KanbanIcon className="w-3.5 h-3.5" />}
                  {selectedMethodology}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  {methodologyDetails[selectedMethodology].title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {methodologyDetails[selectedMethodology].desc}
                </p>

                <div className="space-y-3 pt-2">
                  {methodologyDetails[selectedMethodology].highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={onOpenRegister}
                    className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <span>Experimentar com seu time</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Demonstrative Panel */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Simulação do Painel
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${activeTheme.accentBg} ${activeTheme.accentText}`}>
                    Demonstração
                  </span>
                </div>

                {selectedMethodology === 'SCRUM' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-violet-700 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          Planning Poker Sincronizado
                        </span>
                      </div>

                      <span className="text-[11px] font-extrabold text-violet-700 whitespace-nowrap">
                        5/5 Votos
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center">
                      {['3 SP', '5 SP', '5 SP', '8 SP', '5 SP'].map((sp, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-violet-50 border border-violet-200 text-xs font-bold text-violet-800"
                        >
                          {sp}
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-center text-slate-500">
                      Consenso Automático: 5 Story Points
                    </div>
                  </div>
                )}

                {selectedMethodology === 'XP' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-700 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          Pair Rotation Timer
                        </span>
                      </div>

                      <span className="text-[11px] font-extrabold text-cyan-700 whitespace-nowrap">
                        25:00 min
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-700">
                        Driver: Lucas • Navigator: Mariana
                      </span>
                      <span className="text-emerald-700 font-bold">
                        TDD: 94% Passando
                      </span>
                    </div>
                  </div>
                )}

                {selectedMethodology === 'KANBAN' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500">A Fazer</div>
                        <div className="text-sm font-bold text-blue-700">4 Cards</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-blue-200 text-center">
                        <div className="text-[10px] text-slate-500">WIP (3 máx)</div>
                        <div className="text-sm font-bold text-blue-700">2 Cards</div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-center">
                        <div className="text-[10px] text-slate-500">Concluído</div>
                        <div className="text-sm font-bold text-emerald-700">18 Cards</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-center text-slate-500">
                      Lead Time Médio: 2.8 dias
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Comece com seu próximo projeto
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
            Pronto para transformar a entrega do seu time?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Junte-se ao SprintForge hoje mesmo. Crie seu primeiro projeto,
            adicione seus colegas e utilize o tour guiado para começar em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Criar Conta Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-slate-900">SprintForge</span>
            <span>— Plataforma de Engenharia Ágil</span>
          </div>

          <p>
            © {new Date().getFullYear()} SprintForge. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
