import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectMethodologyBar } from '../shared/ProjectMethodologyBar';
import { MethodologyGuideModal } from '../shared/MethodologyGuideModal';
import { ProjectProgressTab } from '../shared/ProjectProgressTab';
import { TabExplainer } from '../shared/TabExplainer';
import {
  Code2,
  Users,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  GitBranch,
  ShieldCheck,
  Zap,
  Plus,
  Clock,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  FileCode,
  ListChecks,
  HelpCircle,
  BarChart2,
} from 'lucide-react';

interface XPModuleProps {
  onOpenTaskModal?: () => void;
  onToggleChat?: () => void;
}

export const XPModule: React.FC<XPModuleProps> = ({ onOpenTaskModal, onToggleChat }) => {
  const {
    activeProject,
    teamMembers,
    pairSessions,
    addPairSession,
    updatePairStatus,
    tddTests,
    addTddTest,
    toggleTddStatus,
    runTddSuiteSimulated,
    ciBuilds,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'PAIR' | 'TDD' | 'CI' | 'PRACTICES' | 'PROGRESS'>('PAIR');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Pair Session form state
  const [driverId, setDriverId] = useState(teamMembers[0]?.id || '');
  const [navigatorId, setNavigatorId] = useState(teamMembers[1]?.id || '');
  const [pairFeature, setPairFeature] = useState('');
  const [showPairForm, setShowPairForm] = useState(false);

  // Driver/Navigator timer state (25 min pomodoro rotation)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // TDD New Test Form state
  const [newTestFeature, setNewTestFeature] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestCode, setNewTestCode] = useState('');
  const [showTddForm, setShowTddForm] = useState(false);

  const handleStartPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairFeature.trim()) return;
    addPairSession(driverId, navigatorId, pairFeature, 30);
    setPairFeature('');
    setShowPairForm(false);
  };

  const handleCreateTddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !newTestFeature.trim()) return;
    addTddTest(newTestFeature, newTestName, newTestCode);
    setNewTestFeature('');
    setNewTestName('');
    setNewTestCode('');
    setShowTddForm(false);
  };

  const xpPractices = [
    { name: 'Pair Programming', desc: 'Duas pessoas desenvolvedoras compartilhando uma única estação de trabalho.', icon: Users, status: 'Ativo' },
    { name: 'Test-Driven Development (TDD)', desc: 'Escrever o teste com falha antes da implementação do código funcional.', icon: ListChecks, status: 'Ativo' },
    { name: 'Continuous Integration (CI)', desc: 'Integração e compilação do código várias vezes ao dia no repositório principal.', icon: GitBranch, status: 'Ativo' },
    { name: 'Refactoring Contínuo', desc: 'Melhoria constante do design do código sem alterar seu comportamento externo.', icon: RotateCw, status: 'Ativo' },
    { name: 'Design Simples', desc: 'Escrever apenas o código estritamente necessário para atender aos testes atuais.', icon: Layers, status: 'Ativo' },
    { name: 'Pequenas Releases', desc: 'Colocar o sistema em produção rapidamente em ciclos frequentes.', icon: Zap, status: 'Ativo' },
    { name: 'Cliente Presente (On-site Customer)', desc: 'Disponibilidade contínua do cliente para tirar dúvidas de negócio.', icon: ShieldCheck, status: 'Ativo' },
    { name: 'Propriedade Coletiva de Código', desc: 'Qualquer pessoa do time pode alterar qualquer linha do sistema a qualquer momento.', icon: FileCode, status: 'Ativo' },
    { name: 'Ritmo Sustentável', desc: 'Trabalho contínuo sem horas extras excessivas para manter alta energia e foco.', icon: Activity, status: 'Ativo' },
    { name: 'Padrões de Código', desc: 'Estilo de codificação padronizado para leitura fluida por todo o time.', icon: Terminal, status: 'Ativo' },
    { name: 'Metáfora do Sistema', desc: 'História simples que descreve o funcionamento arquitetural do produto.', icon: Sparkles, status: 'Ativo' },
    { name: 'Jogo do Planejamento', desc: 'Definição rápida de prioridades entre o time técnico e o cliente.', icon: Code2, status: 'Ativo' },
  ];

  const totalTests = tddTests.length;
  const greenTests = tddTests.filter((t) => t.status === 'GREEN' || t.status === 'REFACTORED').length;
  const tddPassPercentage = totalTests > 0 ? Math.round((greenTests / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Project Methodology Isolation Bar */}
      <ProjectMethodologyBar
        currentModule="XP"
        onOpenTaskModal={onOpenTaskModal}
        onToggleChat={onToggleChat}
      />

      {/* Top XP Banner Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5" /> Extreme Programming (XP) Engine
            </div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Engenharia Ágil & Feedbacks Ultra-Rápidos
              <button
                onClick={() => setIsGuideOpen(true)}
                className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1"
                title="Saber mais sobre Extreme Programming"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Guia XP</span>
              </button>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Práticas extremas de desenvolvimento focado em qualidade do código, testes automatizados TDD e pareamento em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-lg font-extrabold text-cyan-400">{pairSessions.filter((p) => p.status === 'ACTIVE').length}</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">Pares Ativos</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-lg font-extrabold text-emerald-400">{tddPassPercentage}%</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">TDD Passando</div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-extrabold text-purple-400">12/12</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">Práticas XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PAIR')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PAIR'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" /> Pair Programming Tracker
        </button>

        <button
          onClick={() => setActiveTab('TDD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TDD'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ListChecks className="w-4 h-4" /> TDD Checklist ({greenTests}/{totalTests})
        </button>

        <button
          onClick={() => setActiveTab('CI')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CI'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-4 h-4" /> Continuous Integration (CI)
        </button>

        <button
          onClick={() => setActiveTab('PRACTICES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'PRACTICES'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" /> As 12 Práticas do XP
        </button>

        <button
          onClick={() => setActiveTab('PROGRESS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'PROGRESS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-cyan-400" /> Progresso & Métricas
        </button>
      </div>

      {/* Tab 1: Pair Programming Tracker */}
      {activeTab === 'PAIR' && (
        <div className="space-y-6">
          <TabExplainer
            title="Pair Programming Tracker (Piloto / Copiloto)"
            badge="Engenharia de Pares"
            methodology="XP"
            summary="Dois desenvolvedores trabalham simultaneamente no mesmo código. O Piloto (Driver) foca na digitação tática e sintaxe, enquanto o Copiloto (Navigator) avalia a estratégia arquitetural, cobertura de testes e possíveis casos de borda."
            howItWorks={[
              'Inicie uma nova dupla selecionando o Piloto e o Copiloto nos membros do time.',
              'O cronômetro Pomodoro de 25 minutos inicia a contagem da sessão.',
              'Ao término do ciclo, os desenvolvedores invertem os papéis (quem digitava agora orienta).',
              'Finalize a sessão de pareamento para registrar a atividade no histórico do projeto.'
            ]}
            tips={[
              'Troque os pares com frequência para que todo o time conheça todas as partes do sistema (Propriedade Coletiva).',
              'O Copiloto não deve ser passivo: faça perguntas, aponte melhorias e elabore casos de teste futuros.'
            ]}
          />

          {/* Driver / Navigator Timer & Live Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timer Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Temporizador Piloto / Copiloto
                  </span>
                  <span className="text-[10px] text-slate-400">25 min (Pomodoro XP)</span>
                </div>
                <div className="text-4xl font-mono font-extrabold text-white text-center py-4 bg-slate-950 rounded-xl border border-slate-800/80 tracking-widest text-cyan-300 shadow-inner">
                  {formatTimer(timerSeconds)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isTimerRunning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isTimerRunning ? 'Pausar Troca' : 'Iniciar Rotação'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Reiniciar
                </button>
              </div>
            </div>

            {/* Register New Pair Form / Button */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Nova Sessão de Pareamento</h3>
                  <p className="text-xs text-slate-400">Selecione o Piloto (escrevendo código) e o Copiloto (revisando & arquitetando).</p>
                </div>
                <button
                  onClick={() => setShowPairForm(!showPairForm)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {showPairForm ? 'Cancelar' : '+ Nova Dupla'}
                </button>
              </div>

              {showPairForm ? (
                <form onSubmit={handleStartPair} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Piloto (Driver - No Teclado)</label>
                      <select
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      >
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Copiloto (Navigator - Visão Macro)</label>
                      <select
                        value={navigatorId}
                        onChange={(e) => setNavigatorId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                      >
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Funcionalidade / Módulo em Pareamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Handler de Pagamento Pix / Refatoração de Repositório"
                      value={pairFeature}
                      onChange={(e) => setPairFeature(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      Iniciar Sessão de Pareamento
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                  <span>Prática de Pair Programming ativa no time. Clique acima para registrar uma nova dupla em tempo real.</span>
                  <button
                    onClick={() => setShowPairForm(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                  >
                    Registrar Agora
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active & Historical Pair Sessions List */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" /> Duplas Ativas & Histórico de Pareamento
            </h3>

            {pairSessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3 bg-slate-950/40">
                <div className="text-slate-300 text-xs font-bold">👥 Nenhuma Sessão de Pareamento Registrada</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Este projeto ainda não possui sessões de Pair Programming. Clique em "+ Nova Dupla" acima para registrar os desenvolvedores.
                </p>
                <button
                  onClick={() => setShowPairForm(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  + Iniciar Primeira Dupla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pairSessions.map((session) => {
                const driver = teamMembers.find((m) => m.id === session.driverId);
                const navigator = teamMembers.find((m) => m.id === session.navigatorId);

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{session.featureName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          session.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {session.status === 'ACTIVE' ? 'Em Andamento' : 'Concluído'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      {/* Driver */}
                      <div className="flex items-center gap-2">
                        <img src={driver?.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-cyan-400" />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{driver?.name}</div>
                          <div className="text-[10px] font-bold text-cyan-400 uppercase">Piloto (Driver)</div>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-slate-500">⇄</div>

                      {/* Navigator */}
                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{navigator?.name}</div>
                          <div className="text-[10px] font-bold text-purple-400 uppercase">Copiloto (Navigator)</div>
                        </div>
                        <img src={navigator?.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-purple-400" />
                      </div>
                    </div>

                    {session.status === 'ACTIVE' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updatePairStatus(session.id, 'COMPLETED')}
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20"
                        >
                          Concluir Sessão
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

      {/* Tab 2: TDD Checklist & Runner */}
      {activeTab === 'TDD' && (
        <div className="space-y-6">
          <TabExplainer
            title="Suíte TDD (Test-Driven Development)"
            badge="Ciclo Red-Green-Refactor"
            methodology="XP"
            summary="O TDD inverte o fluxo tradicional: você escreve o teste unitário antes de qualquer linha de código funcional. O teste falha inicialmente (Red), depois você escreve o código estritamente necessário para passar (Green), e finalmente refatora para manter o design limpo (Refactor)."
            howItWorks={[
              'Clique em "+ Novo Teste" para cadastrar os critérios de aceitação automatizados de uma funcionalidade.',
              'Alterne os status clicando no botão de status (RED -> GREEN -> REFACTORED).',
              'Utilize "Executar Suite Completa" para simular a execução de toda a esteira de testes.',
              'Monitore a porcentagem de testes verdes na barra de status superior.'
            ]}
            tips={[
              'Nunca escreva código funcional sem um teste prévio que falhe.',
              'Mantenha os testes pequenos, rápidos e totalmente independentes uns dos outros.'
            ]}
          />

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-cyan-400" /> Matriz TDD (Red-Green-Refactor)
                </h3>
                <p className="text-xs text-slate-400">
                  Ciclo de Desenvolvimento Guiado por Testes: Escreva o Teste (Red), faça Passar (Green) e Refatore (Refactor).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runTddSuiteSimulated}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 hover:from-emerald-500 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Executar Suite Completa
                </button>
                <button
                  onClick={() => setShowTddForm(!showTddForm)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  + Novo Teste
                </button>
              </div>
            </div>

            {showTddForm && (
              <form onSubmit={handleCreateTddTest} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Módulo / Funcionalidade</label>
                    <input
                      type="text"
                      placeholder="Ex: Anti-Fraud Engine / Validação Pix"
                      value={newTestFeature}
                      onChange={(e) => setNewTestFeature(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Teste Unitário</label>
                    <input
                      type="text"
                      placeholder="Ex: deveBloquearTransacaoComScoreAlto"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Snippet de Código / Assertions</label>
                  <textarea
                    rows={2}
                    placeholder="expect(result.status).toBe('BLOCKED');"
                    value={newTestCode}
                    onChange={(e) => setNewTestCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTddForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                  >
                    Criar Teste (RED)
                  </button>
                </div>
              </form>
            )}

            {/* Test Cards List */}
            <div className="space-y-3">
              {tddTests.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3 bg-slate-950/40">
                  <div className="text-slate-300 text-xs font-bold">🧪 Nenhum Teste TDD Cadastrado</div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Nenhum teste unitário criado neste projeto. Clique em "+ Novo Teste" acima para adicionar o primeiro caso de teste no ciclo Red-Green.
                  </p>
                  <button
                    onClick={() => setShowTddForm(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20"
                  >
                    + Criar Primeiro Teste TDD
                  </button>
                </div>
              ) : (
                tddTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                          {test.featureName}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200">{test.testName}</span>
                      </div>
                      {test.codeSnippet && (
                        <pre className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 overflow-x-auto">
                          {test.codeSnippet}
                        </pre>
                      )}
                      <div className="text-[10px] text-slate-500">Última execução: {test.lastRunAt}</div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => toggleTddStatus(test.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          test.status === 'RED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                            : test.status === 'GREEN'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                        }`}
                      >
                        {test.status === 'RED' && <XCircle className="w-4 h-4 text-rose-400" />}
                        {test.status === 'GREEN' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {test.status === 'REFACTORED' && <RotateCw className="w-4 h-4 text-purple-400" />}
                        <span>
                          {test.status === 'RED' ? 'VERMELHO (Falhando)' : test.status === 'GREEN' ? 'VERDE (Passou)' : 'REFATORADO'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CI/CD Pipeline & Builds */}
      {activeTab === 'CI' && (
        <div className="space-y-6">
          <TabExplainer
            title="Integração Contínua (Continuous Integration - CI)"
            badge="Automação & Qualidade"
            methodology="XP"
            summary="A prática de CI no Extreme Programming exige que o código seja integrado à branch principal múltiplas vezes por dia. Cada commit dispara builds automáticos, validação de lint e execução de todos os testes para detectar regressões imediatamente."
            howItWorks={[
              'Visualize o histórico dos commits e builds mais recentes com hashes e mensagens descritivas.',
              'Observe o status de cada build: Sucesso (Verde) com deploy automático liberado ou Falha (Vermelho) com build interrompido.',
              'Analise a quantidade de testes unitários que foram executados e validados na esteira.',
              'Trate qualquer falha na esteira como emergência prioritária de todo o time.'
            ]}
            tips={[
              'Mantenha a suíte de testes de CI rápida (tempo ideal abaixo de 10 minutos).',
              'Nunca deixe a branch principal quebrada no fim do dia de trabalho.'
            ]}
          />

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" /> Pipeline de Integração Contínua (CI)
              </h3>
              <p className="text-xs text-slate-400">Histórico de compilação automatizada e integridade do código do XP.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Pipeline Saudável
            </div>
          </div>

          <div className="space-y-3">
            {ciBuilds.map((build) => (
              <div
                key={build.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl border mt-0.5 ${
                      build.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {build.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        #{build.commitHash}
                      </span>
                      <span className="text-xs font-bold text-white">{build.commitMessage}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Autor: <span className="text-slate-200">{build.author}</span> • {build.timestamp} ({build.durationSeconds}s)
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-300">
                    {build.testsPassed}/{build.testsTotal} Testes Passando
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {build.status === 'SUCCESS' ? 'Deploy Automático Liberado' : 'Build Interrompido'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Tab 4: As 12 Práticas do XP */}
      {activeTab === 'PRACTICES' && (
        <div className="space-y-6">
          <TabExplainer
            title="As 12 Práticas Fundamentais do Extreme Programming"
            badge="Pilares da Disciplina Ágil"
            methodology="XP"
            summary="Conjunto de doze disciplinas técnicas e gerenciais formuladas por Kent Beck. O poder do XP reside no efeito cumulativo: cada prática apoia e compensa as outras, gerando código robusto e alta adaptabilidade a mudanças."
            howItWorks={[
              'Explore cada cartão com o resumo e o objetivo da prática no ciclo de vida do software.',
              'Verifique as práticas de feedback fino: Pair Programming, TDD, On-site Customer e Jogo do Planejamento.',
              'Consulte as práticas de processo contínuo: Integração Contínua, Refatoração e Pequenas Releases.',
              'Mantenha as práticas de bem-estar e cultura: Ritmo Sustentável, Propriedade Coletiva e Padrões de Código.'
            ]}
            tips={[
              'Adotar apenas uma ou duas práticas isoladas reduz o impacto; combine TDD + Pareamento + CI para resultados exponenciais.',
              'Revise este guia em momentos de onboarding de novos membros da equipe.'
            ]}
          />

          <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">As 12 Práticas Fundamentais do XP</h3>
            <p className="text-xs text-slate-400">
              O Extreme Programming leva as boas práticas de engenharia de software ao nível máximo para entregar valor com qualidade total.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {xpPractices.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:scale-[1.01] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ {p.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* Tab: Project Progress & Metrics */}
      {activeTab === 'PROGRESS' && (
        <div className="space-y-6">
          <TabExplainer
            title="Progresso & Métricas do Projeto XP"
            badge="Visão Geral Analítica"
            methodology="XP"
            summary="Acompanhamento analítico da evolução do projeto XP com métricas de entrega, distribuição de esforço, status de tarefas e integridade da engenharia."
            howItWorks={[
              'Analise os gráficos em tempo real com distribuição de tarefas por status e prioridades.',
              'Monitore a relação entre horas planejadas e executadas para calibrar a velocidade do time.',
              'Visualize tendências de entregas acumuladas ao longo dos ciclos de desenvolvimento.'
            ]}
            tips={[
              'Comemore o fechamento de tarefas em ritmo sustentável (40h semanais) sem necessidade de horas extras exaustivas.'
            ]}
          />
          <ProjectProgressTab onOpenTaskModal={onOpenTaskModal} />
        </div>
      )}

      <MethodologyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialMethodology="XP"
      />

    </div>
  );
};
