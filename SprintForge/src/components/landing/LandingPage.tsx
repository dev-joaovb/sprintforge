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

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onOpenRegister }) => {
  const [selectedMethodology, setSelectedMethodology] = useState<'XP' | 'SCRUM' | 'KANBAN'>('SCRUM');

  const features = [
    {
      icon: Code2,
      badge: 'Extreme Programming',
      title: 'XP Engine & TDD Checklist',
      desc: 'Sessões de Pair Programming com rotação Pomodoro de 25 min, suíte TDD interativa e pipelines de Integração Contínua (CI).',
      color: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
    },
    {
      icon: Repeat,
      badge: 'Scrum Master Suite',
      title: 'Planning Poker & Sprint Metrics',
      desc: 'Estimação Fibonacci com cartas sincronizadas ao número real de integrantes, Daily Scrums, Retrospectivas votadas e Burndown.',
      color: 'from-purple-500/20 to-indigo-500/20',
      border: 'border-purple-500/30',
      textColor: 'text-purple-400',
    },
    {
      icon: KanbanIcon,
      badge: 'Kanban Contínuo',
      title: 'Quadro Drag & Drop com WIP',
      desc: 'Quadro com arrastar e soltar ultra-fluido, controle estrito de limites WIP por coluna, cálculo automático de Lead Time e Cycle Time.',
      color: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
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
      color: 'purple',
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
      color: 'emerald',
    },
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Navigation Topbar */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                SprintForge
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/30">
                Agile Engine
              </span>
            </div>
          </div>

          {/* Quick Nav & Auth Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastre-se Grátis</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800/80">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Engenharia de Software Moderna & Gestão Unificada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            A plataforma ágil definitiva para equipes que usam{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              XP, Scrum e Kanban
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Elimine planilhas desconexas. Tenha diagnósticos inteligentes de metodologia, planning poker Fibonacci sincronizado, pareamento de código, quadros interativos e gráficos de progresso em tempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Começar Gratuitamente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>Acessar Minha Conta</span>
            </button>
          </div>

          {/* Key Stat Badges */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-purple-400">3-em-1</div>
              <div className="text-xs text-slate-400">XP, Scrum & Kanban</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-cyan-400">100%</div>
              <div className="text-xs text-slate-400">Sincronizado em Equipe</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400">Tempo Real</div>
              <div className="text-xs text-slate-400">Chat & Planning Poker</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400">Driver.js</div>
              <div className="text-xs text-slate-400">Onboarding Guiado</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 sm:py-24 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" /> Metodologias Ágeis de Ponta a Ponta
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Projetado para desenvolvedores e líderes técnicos
            </h2>
            <p className="text-sm text-slate-400">
              Cada metodologia conta com ferramentas e cerimônias práticas nativas da engenharia moderna de software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const IconComp = f.icon;
              return (
                <div
                  key={i}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${f.color} to-slate-900/90 border ${f.border} shadow-xl space-y-4 hover:scale-[1.02] transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <IconComp className={`w-6 h-6 ${f.textColor}`} />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 ${f.textColor}`}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Interactive Methodology Explorer */}
      <section className="py-16 sm:py-24 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold mb-2">
                <Zap className="w-3.5 h-3.5" /> Explorador Interativo
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Escolha sua metodologia favorita
              </h2>
            </div>

            {/* Methodology Tab Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setSelectedMethodology('SCRUM')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethodology === 'SCRUM'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Repeat className="w-4 h-4" /> Scrum
              </button>
              <button
                onClick={() => setSelectedMethodology('XP')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethodology === 'XP'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-4 h-4" /> XP
              </button>
              <button
                onClick={() => setSelectedMethodology('KANBAN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethodology === 'KANBAN'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KanbanIcon className="w-4 h-4" /> Kanban
              </button>
            </div>
          </div>

          {/* Explorer Detail Card */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {methodologyDetails[selectedMethodology].title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {methodologyDetails[selectedMethodology].desc}
                </p>

                <div className="space-y-2.5 pt-2">
                  {methodologyDetails[selectedMethodology].highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={onOpenRegister}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
                  >
                    <span>Experimentar com seu time</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulação do Painel</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300">
                    Ao Vivo
                  </span>
                </div>

                {selectedMethodology === 'SCRUM' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-slate-200">Planning Poker Sincronizado</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-purple-300">5/5 Votos</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {['3 SP', '5 SP', '5 SP', '8 SP', '5 SP'].map((sp, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs font-bold text-purple-200">
                          {sp}
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-center text-slate-400">Consenso Automático: 5 Story Points</div>
                  </div>
                )}

                {selectedMethodology === 'XP' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-200">Pair Rotation Timer</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-cyan-300">25:00 min</span>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs">
                      <span className="text-slate-300">Driver: Lucas • Navigator: Mariana</span>
                      <span className="text-emerald-400 font-bold">TDD: 94% Passando</span>
                    </div>
                  </div>
                )}

                {selectedMethodology === 'KANBAN' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">A Fazer</div>
                        <div className="text-sm font-bold text-indigo-400">4 Cards</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/30 text-center">
                        <div className="text-[10px] text-slate-400">WIP (3 máx)</div>
                        <div className="text-sm font-bold text-purple-400">2 Cards</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-center">
                        <div className="text-[10px] text-slate-400">Concluído</div>
                        <div className="text-sm font-bold text-emerald-400">18 Cards</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-center text-slate-400">Lead Time Médio: 2.8 dias</div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-900/60 to-[#0B0F17] border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Pronto para transformar a entrega do seu time?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Junte-se ao SprintForge hoje mesmo. Crie seu primeiro projeto, adicione seus colegas e utilize o tour guiado para começar em segundos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Criar Conta Gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-300">SprintForge</span>
            <span>— Plataforma de Engenharia Ágil</span>
          </div>
          <p>© {new Date().getFullYear()} SprintForge. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
};
