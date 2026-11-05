import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectMethodologyBar } from '../shared/ProjectMethodologyBar';
import { MethodologyGuideModal } from '../shared/MethodologyGuideModal';
import { ProjectProgressTab } from '../shared/ProjectProgressTab';
import { TabExplainer } from '../shared/TabExplainer';
import {
  Code2, Users, CheckCircle2, XCircle, Play, RotateCw, GitBranch, ShieldCheck,
  Zap, Plus, Clock, Sparkles, Terminal, Activity, Layers, FileCode, ListChecks,
  HelpCircle, BarChart2,
} from 'lucide-react';

interface XPModuleProps {
  onOpenTaskModal?: () => void;
  onToggleChat?: () => void;
}

export const XPModule: React.FC<XPModuleProps> = ({ onOpenTaskModal, onToggleChat }) => {
  const {
    teamMembers, pairSessions, addPairSession, updatePairStatus,
    tddTests, addTddTest, toggleTddStatus, runTddSuiteSimulated, ciBuilds,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'PAIR' | 'TDD' | 'CI' | 'PRACTICES' | 'PROGRESS'>('PAIR');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [driverId, setDriverId] = useState(teamMembers[0]?.id || '');
  const [navigatorId, setNavigatorId] = useState(teamMembers[1]?.id || '');
  const [pairFeature, setPairFeature] = useState('');
  const [showPairForm, setShowPairForm] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
  const activePairs = pairSessions.filter((p) => p.status === 'ACTIVE').length;

  const tabs = [
    { id: 'PAIR', label: 'Pair Programming', icon: Users, detail: 'Tracker' },
    { id: 'TDD', label: `TDD (${greenTests}/${totalTests})`, icon: ListChecks, detail: 'Checklist' },
    { id: 'CI', label: 'Integração Contínua', icon: GitBranch, detail: 'CI' },
    { id: 'PRACTICES', label: '12 Práticas XP', icon: Sparkles, detail: 'Guia' },
    { id: 'PROGRESS', label: 'Progresso & Métricas', icon: BarChart2, detail: 'Análise' },
  ] as const;

  const card = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm';
  const field = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';
  const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
  const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50';

  return (
    <div className="space-y-6 text-slate-800">
      <ProjectMethodologyBar currentModule="XP" onOpenTaskModal={onOpenTaskModal} onToggleChat={onToggleChat} />

      {/* XP overview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB]">
              <Code2 className="h-3.5 w-3.5" /> Extreme Programming · XP Engine
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Engenharia Ágil & Feedbacks Ultra-Rápidos</h2>
              <button onClick={() => setIsGuideOpen(true)} className={secondaryButton} title="Saber mais sobre Extreme Programming">
                <HelpCircle className="h-4 w-4 text-[#2563EB]" /> Guia XP
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">Práticas extremas de desenvolvimento focado em qualidade do código, testes automatizados TDD e pareamento em tempo real.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[360px]">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-center sm:p-4">
              <div className="text-2xl font-extrabold tabular-nums text-[#2563EB]">{activePairs}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Pares ativos</div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-center sm:p-4">
              <div className="text-2xl font-extrabold tabular-nums text-emerald-700">{tddPassPercentage}%</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">TDD passando</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center sm:p-4">
              <div className="text-2xl font-extrabold text-slate-800">12/12</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Práticas XP</div>
            </div>
          </div>
        </div>
      </section>

      {/* Module navigation */}
      <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3" aria-label="Seções XP">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={selected ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition-colors ${selected ? 'border-blue-200 bg-blue-50 text-[#2563EB]' : 'border-transparent bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </nav>

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
              'Finalize a sessão de pareamento para registrar a atividade no histórico do projeto.',
            ]}
            tips={[
              'Troque os pares com frequência para que todo o time conheça todas as partes do sistema (Propriedade Coletiva).',
              'O Copiloto não deve ser passivo: faça perguntas, aponte melhorias e elabore casos de teste futuros.',
            ]}
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <section className={`${card} flex flex-col justify-between gap-5`}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700"><Clock className="h-4 w-4 text-[#2563EB]" /> Temporizador</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">25 min · Pomodoro XP</span>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 py-6 text-center font-mono text-4xl font-extrabold tabular-nums tracking-wider text-[#2563EB] sm:text-5xl" role="timer">
                  {formatTimer(timerSeconds)}
                </div>
                <p className="text-center text-xs text-slate-500">Rotação entre Piloto e Copiloto</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`flex-1 ${isTimerRunning ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100' : primaryButton}`}>
                  <Play className="h-3.5 w-3.5" /> {isTimerRunning ? 'Pausar Troca' : 'Iniciar Rotação'}
                </button>
                <button onClick={() => { setIsTimerRunning(false); setTimerSeconds(25 * 60); }} className={secondaryButton}>Reiniciar</button>
              </div>
            </section>

            <section className={`${card} space-y-5 lg:col-span-2`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nova Sessão de Pareamento</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Selecione o Piloto (escrevendo código) e o Copiloto (revisando e arquitetando).</p>
                </div>
                <button onClick={() => setShowPairForm(!showPairForm)} className={secondaryButton}>
                  <Plus className="h-4 w-4 text-[#2563EB]" /> {showPairForm ? 'Cancelar' : 'Nova Dupla'}
                </button>
              </div>
              {showPairForm ? (
                <form onSubmit={handleStartPair} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Piloto (Driver - No Teclado)</label>
                      <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className={field}>
                        {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Copiloto (Navigator - Visão Macro)</label>
                      <select value={navigatorId} onChange={(e) => setNavigatorId(e.target.value)} className={field}>
                        {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Funcionalidade / Módulo em Pareamento</label>
                    <input type="text" placeholder="Ex: Handler de Pagamento Pix / Refatoração de Repositório" value={pairFeature} onChange={(e) => setPairFeature(e.target.value)} className={field} />
                  </div>
                  <div className="flex justify-end"><button type="submit" className={primaryButton}>Iniciar Sessão de Pareamento</button></div>
                </form>
              ) : (
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center">
                  <p className="max-w-lg text-xs leading-relaxed text-slate-500">Prática de Pair Programming ativa no time. Clique acima para registrar uma nova dupla em tempo real.</p>
                  <button onClick={() => setShowPairForm(true)} className={secondaryButton}>Registrar Agora</button>
                </div>
              )}
            </section>
          </div>

          <section className={`${card} space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Users className="h-5 w-5 text-[#2563EB]" /> Duplas Ativas & Histórico de Pareamento</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{pairSessions.length} sessões</span>
            </div>
            {pairSessions.length === 0 ? (
              <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-blue-400" />
                <h4 className="text-sm font-bold text-slate-800">Nenhuma Sessão de Pareamento Registrada</h4>
                <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">Este projeto ainda não possui sessões de Pair Programming. Clique em Nova Dupla acima para registrar os desenvolvedores.</p>
                <button onClick={() => setShowPairForm(true)} className={primaryButton}>Iniciar Primeira Dupla</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pairSessions.map((session) => {
                  const driver = teamMembers.find((m) => m.id === session.driverId);
                  const navigator = teamMembers.find((m) => m.id === session.navigatorId);
                  return (
                    <article key={session.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{session.featureName}</h4>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            session.status === 'ACTIVE'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : session.status === 'PAUSED'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : session.status === 'CANCELLED'
                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                  : 'border-slate-200 bg-slate-100 text-slate-600'
                          }`}
                        >
                          {session.status === 'ACTIVE'
                            ? 'Em Andamento'
                            : session.status === 'PAUSED'
                              ? 'Pausada'
                              : session.status === 'CANCELLED'
                                ? 'Cancelada'
                                : 'Concluída'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <img src={driver?.avatar} alt="" className="h-9 w-9 rounded-full border border-blue-200 object-cover" />
                          <div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-800">{driver?.name}</div><div className="text-[10px] font-bold uppercase text-[#2563EB]">Piloto (Driver)</div></div>
                        </div>
                        <span className="text-lg font-bold text-slate-400">⇄</span>
                        <div className="flex min-w-0 items-center gap-2 text-right">
                          <div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-800">{navigator?.name}</div><div className="text-[10px] font-bold uppercase text-violet-700">Copiloto (Navigator)</div></div>
                          <img src={navigator?.avatar} alt="" className="h-9 w-9 rounded-full border border-violet-200 object-cover" />
                        </div>
                      </div>
                      {session.status === 'ACTIVE' && (
                        <div className="flex justify-end"><button onClick={() => updatePairStatus(session.id, 'COMPLETED')} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">Concluir Sessão</button></div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

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
              'Monitore a porcentagem de testes verdes na barra de status superior.',
            ]}
            tips={[
              'Nunca escreva código funcional sem um teste prévio que falhe.',
              'Mantenha os testes pequenos, rápidos e totalmente independentes uns dos outros.',
            ]}
          />
          <section className={`${card} space-y-5`}>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><ListChecks className="h-5 w-5 text-[#2563EB]" /> Matriz TDD (Red-Green-Refactor)</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Ciclo de Desenvolvimento Guiado por Testes: Escreva o Teste (Red), faça Passar (Green) e Refatore (Refactor).</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={runTddSuiteSimulated} className={primaryButton}><Play className="h-3.5 w-3.5" /> Executar Suite Completa</button>
                <button onClick={() => setShowTddForm(!showTddForm)} className={secondaryButton}><Plus className="h-4 w-4" /> Novo Teste</button>
              </div>
            </div>
            {showTddForm && (
              <form onSubmit={handleCreateTddTest} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Módulo / Funcionalidade</label><input type="text" placeholder="Ex: Anti-Fraud Engine / Validação Pix" value={newTestFeature} onChange={(e) => setNewTestFeature(e.target.value)} className={field} /></div>
                  <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Nome do Teste Unitário</label><input type="text" placeholder="Ex: deveBloquearTransacaoComScoreAlto" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} className={field} /></div>
                </div>
                <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Snippet de Código / Assertions</label><textarea rows={3} placeholder="expect(result.status).toBe('BLOCKED');" value={newTestCode} onChange={(e) => setNewTestCode(e.target.value)} className={`${field} resize-y font-mono`} /></div>
                <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowTddForm(false)} className={secondaryButton}>Cancelar</button><button type="submit" className={primaryButton}>Criar Teste (RED)</button></div>
              </form>
            )}
            <div className="space-y-3">
              {tddTests.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                  <ListChecks className="mx-auto h-8 w-8 text-blue-400" />
                  <h4 className="text-sm font-bold text-slate-800">Nenhum Teste TDD Cadastrado</h4>
                  <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-500">Nenhum teste unitário criado neste projeto. Clique em Novo Teste acima para adicionar o primeiro caso de teste no ciclo Red-Green.</p>
                  <button onClick={() => setShowTddForm(true)} className={primaryButton}>Criar Primeiro Teste TDD</button>
                </div>
              ) : (
                tddTests.map((test) => (
                  <article key={test.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">{test.featureName}</span>
                        <span className="break-all font-mono text-xs font-bold text-slate-800">{test.testName}</span>
                      </div>
                      {test.codeSnippet && <pre className="max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-600">{test.codeSnippet}</pre>}
                      <p className="text-[11px] text-slate-500">Última execução: {test.lastRunAt}</p>
                    </div>
                    <button onClick={() => toggleTddStatus(test.id)} className={`inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border px-3 py-2 text-xs font-bold transition-colors sm:self-auto ${test.status === 'RED' ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : test.status === 'GREEN' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
                      {test.status === 'RED' && <XCircle className="h-4 w-4" />}
                      {test.status === 'GREEN' && <CheckCircle2 className="h-4 w-4" />}
                      {test.status === 'REFACTORED' && <RotateCw className="h-4 w-4" />}
                      {test.status === 'RED' ? 'VERMELHO (Falhando)' : test.status === 'GREEN' ? 'VERDE (Passou)' : 'REFATORADO'}
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}

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
              'Trate qualquer falha na esteira como emergência prioritária de todo o time.',
            ]}
            tips={[
              'Mantenha a suíte de testes de CI rápida (tempo ideal abaixo de 10 minutos).',
              'Nunca deixe a branch principal quebrada no fim do dia de trabalho.',
            ]}
          />
          <section className={`${card} space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><GitBranch className="h-5 w-5 text-[#2563EB]" /> Pipeline de Integração Contínua (CI)</h3><p className="mt-1 text-xs text-slate-500">Histórico de compilação automatizada e integridade do código do XP.</p></div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><Activity className="h-4 w-4" /> Pipeline Saudável</span>
            </div>
            <div className="space-y-3">
              {ciBuilds.map((build) => (
                <article key={build.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-0.5 shrink-0 rounded-xl border p-2.5 ${build.status === 'SUCCESS' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                      {build.status === 'SUCCESS' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-[#2563EB]">#{build.commitHash}</span><span className="text-xs font-bold text-slate-900">{build.commitMessage}</span></div>
                      <p className="text-[11px] text-slate-500">Autor: <span className="font-medium text-slate-700">{build.author}</span> · {build.timestamp} ({build.durationSeconds}s)</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-left sm:text-right"><p className="text-xs font-bold text-slate-800">{build.testsPassed}/{build.testsTotal} Testes Passando</p><p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${build.status === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-700'}`}>{build.status === 'SUCCESS' ? 'Deploy Automático Liberado' : 'Build Interrompido'}</p></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

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
              'Mantenha as práticas de bem-estar e cultura: Ritmo Sustentável, Propriedade Coletiva e Padrões de Código.',
            ]}
            tips={[
              'Adotar apenas uma ou duas práticas isoladas reduz o impacto; combine TDD + Pareamento + CI para resultados exponenciais.',
              'Revise este guia em momentos de onboarding de novos membros da equipe.',
            ]}
          />
          <section className="space-y-5">
            <div className="mx-auto max-w-xl space-y-2 text-center"><h3 className="text-lg font-bold text-slate-900">As 12 Práticas Fundamentais do XP</h3><p className="text-sm leading-relaxed text-slate-500">O Extreme Programming leva as boas práticas de engenharia de software ao nível máximo para entregar valor com qualidade total.</p></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {xpPractices.map((p, idx) => {
                const IconComp = p.icon;
                return (
                  <article key={idx} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                    <div className="flex items-center justify-between gap-2"><span className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-[#2563EB]"><IconComp className="h-5 w-5" /></span><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">✓ {p.status}</span></div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4><p className="text-xs leading-relaxed text-slate-500">{p.desc}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

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
              'Visualize tendências de entregas acumuladas ao longo dos ciclos de desenvolvimento.',
            ]}
            tips={['Comemore o fechamento de tarefas em ritmo sustentável (40h semanais) sem necessidade de horas extras exaustivas.']}
          />
          <ProjectProgressTab onOpenTaskModal={onOpenTaskModal} />
        </div>
      )}

      <MethodologyGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} initialMethodology="XP" />
    </div>
  );
};
