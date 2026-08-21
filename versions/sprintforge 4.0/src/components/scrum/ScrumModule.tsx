import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { ProjectMethodologyBar } from '../shared/ProjectMethodologyBar';
import { MethodologyGuideModal } from '../shared/MethodologyGuideModal';
import { ProjectProgressTab } from '../shared/ProjectProgressTab';
import { TabExplainer } from '../shared/TabExplainer';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MOCK_BURNDOWN_DATA } from '../../data/mockData';
import {
  Repeat,
  Target,
  Clock,
  CheckCircle2,
  ListTodo,
  TrendingDown,
  Users,
  Plus,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Flame,
  Award,
  Layers,
  ArrowRight,
  Vote,
  HelpCircle,
  BarChart2,
  Dice5,
} from 'lucide-react';

interface ScrumModuleProps {
  onOpenTaskModal?: () => void;
  onToggleChat?: () => void;
}

export const ScrumModule: React.FC<ScrumModuleProps> = ({ onOpenTaskModal, onToggleChat }) => {
  const { currentUser } = useAuth();
  const {
    activeProject,
    tasks,
    activeSprint,
    planningPoker,
    votePlanningPoker,
    revealPlanningPoker,
    resetPlanningPoker,
    dailyNotes,
    addDailyNote,
    retroCards,
    addRetroCard,
    voteRetroCard,
    teamMembers,
    moveTaskStatus,
    updateTask,
    completeActiveSprint,
  } = useProject();

  const [scrumSubTab, setScrumSubTab] = useState<'BACKLOG' | 'POKER' | 'BURNDOWN' | 'DAILY_RETRO' | 'PROGRESS'>('BACKLOG');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Daily form state
  const [dailyYesterday, setDailyYesterday] = useState('');
  const [dailyToday, setDailyToday] = useState('');
  const [dailyImpediments, setDailyImpediments] = useState('');
  const [dailyAuthor, setDailyAuthor] = useState(teamMembers[0]?.name || '');
  const [showDailyForm, setShowDailyForm] = useState(false);

  // Retro form state
  const [retroContent, setRetroContent] = useState('');
  const [retroCategory, setRetroCategory] = useState<'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM'>('WENT_WELL');
  const [retroAuthor, setRetroAuthor] = useState(teamMembers[0]?.name || '');
  const [showRetroForm, setShowRetroForm] = useState(false);

  const fibonacciCards = [1, 2, 3, 5, 8, 13, 21, '?'];

  const productBacklog = tasks.filter((t) => t.projectId === activeProject?.id && (t.inBacklog || !t.sprintId));
  const sprintBacklog = tasks.filter((t) => t.projectId === activeProject?.id && t.sprintId === activeSprint?.id);

  const completedSprintPoints = sprintBacklog
    .filter((t) => t.status === 'done')
    .reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const totalSprintPoints = sprintBacklog.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

  const handleCreateDaily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyToday.trim()) return;
    addDailyNote(dailyYesterday, dailyToday, dailyImpediments || 'Nenhum', dailyAuthor);
    setDailyYesterday('');
    setDailyToday('');
    setDailyImpediments('');
    setShowDailyForm(false);
  };

  const handleCreateRetro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retroContent.trim()) return;
    addRetroCard(retroCategory, retroContent, retroAuthor);
    setRetroContent('');
    setShowRetroForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Project Methodology Isolation Bar */}
      <ProjectMethodologyBar
        currentModule="SCRUM"
        onOpenTaskModal={onOpenTaskModal}
        onToggleChat={onToggleChat}
      />

      {/* Active Sprint Banner */}
      {activeSprint && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Repeat className="w-3.5 h-3.5 inline mr-1" /> {activeSprint.name}
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  ● Sprint Ativa
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Goal: {activeSprint.goal}
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="p-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1"
                  title="Saber mais sobre o Scrum Framework"
                >
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">Guia Scrum</span>
                </button>
              </h2>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> {activeSprint.startDate} até {activeSprint.endDate}
                </span>
                <span>•</span>
                <span>Sprint #{activeSprint.number}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
              <div className="text-center px-3 border-r border-slate-800">
                <div className="text-2xl font-black text-purple-400">{completedSprintPoints} / {totalSprintPoints}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Story Points Concluídos</div>
              </div>

              <button
                onClick={completeActiveSprint}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
              >
                Concluir Sprint 🏆
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setScrumSubTab('BACKLOG')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'BACKLOG'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ListTodo className="w-4 h-4" /> Product & Sprint Backlog
        </button>

        <button
          onClick={() => setScrumSubTab('POKER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'POKER'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Vote className="w-4 h-4" /> Planning Poker Integrado
        </button>

        <button
          onClick={() => setScrumSubTab('PROGRESS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'PROGRESS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-purple-400" /> Progresso & Métricas
        </button>

        <button
          onClick={() => setScrumSubTab('BURNDOWN')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'BURNDOWN'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <TrendingDown className="w-4 h-4" /> Burndown Chart & Métricas
        </button>

        <button
          onClick={() => setScrumSubTab('DAILY_RETRO')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'DAILY_RETRO'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Daily Scrum & Retrospectiva
        </button>
      </div>

      {/* Tab 1: Product & Sprint Backlog */}
      {scrumSubTab === 'BACKLOG' && (
        <div className="space-y-6">
          <TabExplainer
            title="Product Backlog & Sprint Backlog"
            badge="Scrum Core"
            methodology="SCRUM"
            summary="O Product Backlog é o repositório central de todas as estórias de usuário e funcionalidades desejadas para o produto (priorizadas pelo Product Owner). O Sprint Backlog é o subconjunto selecionado de tarefas que o time de desenvolvimento se compromete a entregar na Sprint ativa."
            howItWorks={[
              'Cadastre novas estórias/tarefas com pontuação (Story Points) no Product Backlog.',
              'Mova as tarefas prioritárias para a Sprint atual usando o botão "Mover p/ Sprint".',
              'Atualize o status das tarefas (A Fazer, Em Progresso, Concluído) conforme o trabalho avança.',
              'Ao finalizar todos os itens previstos, clique em "Concluir Sprint" no painel superior para registrar o ciclo.'
            ]}
            tips={[
              'Quebre estórias grandes (Épicos) em tarefas menores que possam ser finalizadas dentro da Sprint.',
              'Mantenha o Product Backlog sempre refinado antes da reunião de Sprint Planning.',
              'Evite adicionar novas demandas na Sprint Backlog depois que a Sprint já foi iniciada.'
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Product Backlog Column */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" /> Product Backlog
                </h3>
                <p className="text-xs text-slate-400">Demandas não atribuídas à Sprint ativa.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-extrabold text-amber-400">
                {productBacklog.length} estórias
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {productBacklog.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3 bg-slate-950/40">
                  <div className="text-slate-300 text-xs font-bold">
                    📌 Product Backlog Vazio
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Nenhuma estória cadastrada neste projeto. Crie sua primeira demanda para iniciar o backlog.
                  </p>
                  {onOpenTaskModal && (
                    <button
                      onClick={onOpenTaskModal}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-purple-900/30"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> + Criar Nova Tarefa
                    </button>
                  )}
                </div>
              ) : (
                productBacklog.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">{task.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                        {task.storyPoints || 0} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">{task.priority}</span>
                      <button
                        onClick={() => updateTask(task.id, { sprintId: activeSprint?.id, inBacklog: false, status: 'todo' })}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        Puxar para Sprint <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sprint Backlog Column */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-purple-400" /> Sprint Backlog ({activeSprint?.name})
                </h3>
                <p className="text-xs text-slate-400">Comprometimento do time para a iteração atual.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-xs font-extrabold text-purple-300 border border-purple-500/30">
                {sprintBacklog.length} estórias
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {sprintBacklog.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3 bg-slate-950/40">
                  <div className="text-slate-300 text-xs font-bold">
                    🚀 Sprint Backlog Vazio
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    {productBacklog.length > 0
                      ? 'Puxe estórias do Product Backlog ao lado ou crie uma nova tarefa para esta Sprint.'
                      : 'Nenhuma estória na Sprint atual. Crie uma nova tarefa para começar.'}
                  </p>
                  {onOpenTaskModal && (
                    <button
                      onClick={onOpenTaskModal}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-purple-900/30"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> + Criar Tarefa para a Sprint
                    </button>
                  )}
                </div>
              ) : (
                sprintBacklog.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">{task.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.status === 'done'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : task.status === 'in_progress'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.status === 'done' ? 'Concluído' : task.status === 'in_progress' ? 'Em Progresso' : 'A Fazer'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-[11px]">
                      <span className="text-purple-300 font-bold">{task.storyPoints || 0} Story Points</span>
                      <div className="flex items-center gap-1">
                        {task.status !== 'done' && (
                          <button
                            onClick={() => moveTaskStatus(task.id, 'done')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold"
                          >
                            Concluir ✓
                          </button>
                        )}
                        <button
                          onClick={() => updateTask(task.id, { sprintId: null, inBacklog: true })}
                          className="px-2 py-1 text-slate-400 hover:text-slate-200"
                          title="Devolver ao Backlog"
                        >
                          Devolver
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
        </div>
      )}

      {/* Tab 2: Planning Poker Integrado */}
      {scrumSubTab === 'POKER' && (
        <div className="space-y-6">
          <TabExplainer
            title="Planning Poker Integrado (Sequência Fibonacci)"
            badge="Estimativa Ágil"
            methodology="SCRUM"
            summary="Cerimônia de estimativa consensual onde todos os integrantes votam anonimamente a complexidade de cada estória usando a escala Fibonacci (1, 2, 3, 5, 8, 13, 21). Isso previne a influência de líderes e estimula debates técnicos valiosos."
            howItWorks={[
              'Selecione a estória/tarefa no topo para iniciar a rodada de votação.',
              'Cada desenvolvedor clica na carta com sua estimativa de Story Points.',
              'Utilize o botão "Simular Votos do Time" para obter automaticamente os palpites dos demais colegas do projeto.',
              'Clique em "Revelar Cartas" para exibir todos os votos e verificar o Consenso Médio calculado.'
            ]}
            tips={[
              'Votos divergentes (ex: uma nota 2 e outra 13) indicam entendimentos diferentes do requisito; debatam os riscos antes de fechar a nota.',
              'Cartas altas (13 ou 21) sugerem que a estória é muito complexa e deve ser dividida em tarefas menores.'
            ]}
          />

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold mb-1">
                <Vote className="w-3.5 h-3.5" /> Planning Poker por Sequência Fibonacci
              </div>
              <h3 className="text-lg font-bold text-white">Estimação Coletiva da Estória</h3>
              <p className="text-xs text-slate-400">Estória em Votação: <span className="text-purple-300 font-bold">{planningPoker.taskTitle}</span></p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!planningPoker.revealed && (
                <button
                  type="button"
                  onClick={() => {
                    const fibChoices = [1, 2, 3, 5, 8, 13];
                    planningPoker.votes.forEach((v) => {
                      if (!v.hasVoted) {
                        const randomVote = fibChoices[Math.floor(Math.random() * fibChoices.length)];
                        votePlanningPoker(v.memberId, randomVote);
                      }
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shadow-md active:scale-95"
                  title="Preencher estimativas automaticamente para os outros integrantes do time"
                >
                  <Dice5 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Simular Votos do Time</span>
                </button>
              )}

              {!planningPoker.revealed ? (
                <button
                  onClick={revealPlanningPoker}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 hover:from-purple-500 active:scale-95 transition-all"
                >
                  Revelar Cartas 🃏
                </button>
              ) : (
                <button
                  onClick={() => resetPlanningPoker('task_scrum_4', 'Módulo de Recomendação Baseado em IA')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all"
                >
                  Nova Votação
                </button>
              )}
            </div>
          </div>

          {/* Interactive Fibonacci Voting Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Selecione sua estimativa ({currentUser?.name || teamMembers[0]?.name || 'Sua Carta'}):
              </label>
              <span className="text-xs text-purple-300 font-bold">
                {planningPoker.votes.filter((v) => v.hasVoted).length} de {planningPoker.votes.length} votos registrados
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {fibonacciCards.map((cardVal) => {
                const myVoteId = currentUser?.id || teamMembers[0]?.id;
                const isSelected = planningPoker.votes.find((v) => v.memberId === myVoteId)?.vote === cardVal;
                return (
                  <button
                    key={cardVal}
                    onClick={() => votePlanningPoker(myVoteId, cardVal)}
                    className={`py-4 rounded-xl font-extrabold text-base border transition-all duration-200 hover:scale-105 shadow-lg ${
                      isSelected
                        ? 'bg-purple-600 border-purple-400 text-white ring-2 ring-purple-400 shadow-purple-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cardVal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team Members Votes Display - Aligned with actual project registered members */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Status das Cartas dos Integrantes do Projeto ({planningPoker.votes.length} {planningPoker.votes.length === 1 ? 'integrante' : 'integrantes'}):
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Sincronizado com os membros ativos do projeto</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {planningPoker.votes.map((v) => {
                const member = teamMembers.find((m) => m.id === v.memberId) || (v.memberId === currentUser?.id ? { name: currentUser.name, avatar: currentUser.avatarUrl, role: currentUser.techArea } : undefined);
                const isCurrentUser = v.memberId === currentUser?.id;

                return (
                  <div
                    key={v.memberId}
                    className={`p-3.5 rounded-xl border text-center space-y-2 relative transition-all ${
                      isCurrentUser ? 'bg-purple-950/20 border-purple-500/40 ring-1 ring-purple-500/30' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {isCurrentUser && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500 text-white">
                        Você
                      </span>
                    )}
                    <img
                      src={member?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-full mx-auto object-cover border border-purple-500/30 shadow-md"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200 truncate">{member?.name || 'Membro do Time'}</div>
                      <div className="text-[10px] text-slate-400 truncate">{member?.role || 'Desenvolvedor'}</div>
                    </div>
                    
                    <div className="pt-1">
                      {planningPoker.revealed ? (
                        <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-extrabold text-sm border border-purple-500/40">
                          {v.vote ?? '?'}
                        </span>
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${v.hasVoted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                          {v.hasVoted ? 'Votou ✓' : 'Aguardando'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {planningPoker.revealed && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center space-y-1">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Consenso Calculado</div>
                <div className="text-3xl font-black text-white">{planningPoker.consensusEstimate} Story Points</div>
                <p className="text-xs text-slate-400">Estimativa média final sugerida para atribuição na tarefa.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Tab: Project Progress & Metrics */}
      {scrumSubTab === 'PROGRESS' && (
        <div className="space-y-6">
          <TabExplainer
            title="Progresso & Métricas Analíticas do Projeto"
            badge="Relatórios em Tempo Real"
            methodology="SCRUM"
            summary="Painel consolidado com gráficos interativos em Recharts para análise visual de conclusão de tarefas, esforço estimado vs. realizado, distribuição de prioridades e evolução do time."
            howItWorks={[
              'Acompanhe os cartões de KPIs no topo (Taxa de Conclusão, Total de Horas, Tarefas Bloqueadas e Eficiência).',
              'Analise a distribuição de tarefas por status no gráfico Donut e por prioridade no gráfico de barras.',
              'Monitore a velocidade e taxa de entrega acumulada ao longo do tempo.',
              'Identifique gargalos ou estagnação de demandas com base nos gráficos de esforço e bloqueios.'
            ]}
            tips={[
              'Revise este painel periodicamente com o time para verificar se a estimativa de horas está calibrada com a realidade.',
              'Se a taxa de conclusão estiver abaixo de 70% na reta final da Sprint, reavalie os itens prioritários.'
            ]}
          />
          <ProjectProgressTab onOpenTaskModal={onOpenTaskModal} />
        </div>
      )}

      {/* Tab 3: Burndown Chart & Metrics */}
      {scrumSubTab === 'BURNDOWN' && (
        <div className="space-y-6">
          <TabExplainer
            title="Gráfico Burndown da Sprint"
            badge="Velocidade & Previsibilidade"
            methodology="SCRUM"
            summary="O Burndown Chart é a representação visual da quantidade de trabalho restante (em Story Points) ao longo dos dias úteis da Sprint. Ele permite antecipar riscos de atraso com dias de antecedência."
            howItWorks={[
              'A Linha Tracejada (Ideal) traça a queima linear perfeita de pontos do primeiro ao último dia da Sprint.',
              'A Linha Roxa Sólida (Real) reflete o trabalho que ainda resta à medida que tarefas são concluídas.',
              'Se a Linha Real estiver acima da Ideal, a equipe está com ritmo abaixo do previsto; se estiver abaixo, a entrega está adiantada.',
              'Ao concluir estórias no Backlog, o gráfico atualiza automaticamente o total restante.'
            ]}
            tips={[
              'Analise o Burndown diariamente na reunião de Daily Scrum para replanejar o foco do dia.',
              'Um gráfico que só queima pontos no último dia da Sprint indica tarefas muito grandes ou falta de entregas incrementais.'
            ]}
          />

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-purple-400" /> Burndown Chart (Sprint 14)
              </h3>
              <p className="text-xs text-slate-400">Acompanhamento do progresso diário em Story Points (Linha Ideal vs. Linha Real).</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_BURNDOWN_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="ideal" name="Ideal (Meta)" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="real" name="Real (Trabalho Restante)" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      )}

      {/* Tab 4: Daily Scrum & Retrospectiva */}
      {scrumSubTab === 'DAILY_RETRO' && (
        <div className="space-y-6">
          <TabExplainer
            title="Daily Scrum & Retrospectiva da Sprint"
            badge="Alinhamento & Melhoria Contínua"
            methodology="SCRUM"
            summary="A Daily Scrum é o alinhamento diário rápido de 15 minutos para sincronizar o progresso e expor bloqueios. A Retrospectiva ocorre ao fim de cada Sprint para a equipe inspecionar processos e definir ações concretas de melhoria."
            howItWorks={[
              'Na seção Daily Scrum, registre as respostas: O que fiz ontem, O que farei hoje e Impedimentos.',
              'Identifique bloqueios sinalizados por colegas para que o Scrum Master e o time atuem na remoção.',
              'Na seção Retrospectiva, crie cartões nas colunas: O que funcionou bem, O que podemos melhorar e Ações práticas.',
              'Vote com Thumbs Up nas ideias de melhoria para priorizar o que será implementado na próxima Sprint.'
            ]}
            tips={[
              'A Daily não é uma prestação de contas para o gestor, mas uma conversa entre desenvolvedores sobre compromissos mútuos.',
              'Na Retrospectiva, foque em causas-raiz e processos, nunca em culpar pessoas individualmente.'
            ]}
          />
          
          {/* Daily Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" /> Daily Scrum Notes
                </h3>
                <p className="text-xs text-slate-400">Registros das reuniões de alinhamento de 15 minutos.</p>
              </div>

              <button
                onClick={() => setShowDailyForm(!showDailyForm)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                + Registrar Daily
              </button>
            </div>

            {showDailyForm && (
              <form onSubmit={handleCreateDaily} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Autor</label>
                    <select
                      value={dailyAuthor}
                      onChange={(e) => setDailyAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    >
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">O que fiz ontem?</label>
                    <input
                      type="text"
                      placeholder="Atividades concluídas..."
                      value={dailyYesterday}
                      onChange={(e) => setDailyYesterday(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">O que farei hoje?</label>
                    <input
                      type="text"
                      placeholder="Planos para hoje..."
                      value={dailyToday}
                      onChange={(e) => setDailyToday(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Algum impedimento?</label>
                    <input
                      type="text"
                      placeholder="Bloqueios ou ajudas necessárias..."
                      value={dailyImpediments}
                      onChange={(e) => setDailyImpediments(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
                  >
                    Salvar Daily
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300">{note.author}</span>
                    <span className="text-slate-500">{note.date}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div><span className="text-slate-500 font-bold">Ontem:</span> {note.yesterday}</div>
                    <div><span className="text-slate-500 font-bold">Hoje:</span> {note.today}</div>
                    {note.impediments && note.impediments !== 'Nenhum' && (
                      <div className="text-rose-400 font-semibold"><span className="text-slate-500 font-bold">Impedimento:</span> {note.impediments}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retrospective Board */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" /> Quadro de Retrospectiva da Sprint
                </h3>
                <p className="text-xs text-slate-400">Feedback do time: O que funcionou, o que melhorar e planos de ação.</p>
              </div>

              <button
                onClick={() => setShowRetroForm(!showRetroForm)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                + Adicionar Post-it
              </button>
            </div>

            {showRetroForm && (
              <form onSubmit={handleCreateRetro} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                    <select
                      value={retroCategory}
                      onChange={(e) => setRetroCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    >
                      <option value="WENT_WELL">O que funcionou bem? 😊</option>
                      <option value="TO_IMPROVE">O que pode melhorar? 🤔</option>
                      <option value="ACTION_ITEM">Ação Prática / Solução ⚡</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Autor</label>
                    <select
                      value={retroAuthor}
                      onChange={(e) => setRetroAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                    >
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Conteúdo do Post-it</label>
                  <textarea
                    rows={2}
                    placeholder="Sua observação para o time..."
                    value={retroContent}
                    onChange={(e) => setRetroContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs">
                    Adicionar
                  </button>
                </div>
              </form>
            )}

            {/* 3 Retro Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Went Well */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  😊 O Que Funcionou Bem
                </h4>
                {retroCards.filter((c) => c.category === 'WENT_WELL').map((card) => (
                  <div key={card.id} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                    <p className="text-slate-200 font-medium">{card.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{card.author}</span>
                      <button
                        onClick={() => voteRetroCard(card.id)}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        <ThumbsUp className="w-3 h-3" /> {card.votes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* To Improve */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  🤔 O Que Pode Melhorar
                </h4>
                {retroCards.filter((c) => c.category === 'TO_IMPROVE').map((card) => (
                  <div key={card.id} className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
                    <p className="text-slate-200 font-medium">{card.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{card.author}</span>
                      <button
                        onClick={() => voteRetroCard(card.id)}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold"
                      >
                        <ThumbsUp className="w-3 h-3" /> {card.votes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Items */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  ⚡ Ações de Melhoria
                </h4>
                {retroCards.filter((c) => c.category === 'ACTION_ITEM').map((card) => (
                  <div key={card.id} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-2">
                    <p className="text-slate-200 font-medium">{card.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{card.author}</span>
                      <button
                        onClick={() => voteRetroCard(card.id)}
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold"
                      >
                        <ThumbsUp className="w-3 h-3" /> {card.votes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      <MethodologyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialMethodology="SCRUM"
      />

    </div>
  );
};
