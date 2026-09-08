// Scrum module

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { ProjectMethodologyBar } from '../shared/ProjectMethodologyBar';
import { MethodologyGuideModal } from '../shared/MethodologyGuideModal';
import { ProjectProgressTab } from '../shared/ProjectProgressTab';
import { TabExplainer } from '../shared/TabExplainer';
import { SprintModal, formatDateDisplay, parseFlexibleDate } from './SprintModal';
import { Sprint, Task } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
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
  History,
  Archive,
  Check,
  CheckSquare,
  FolderArchive,
  Calendar,
  AlertCircle,
  TrendingUp,
  Settings2,
  AlertTriangle,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react';

interface ScrumModuleProps {
  onOpenTaskModal?: (task?: Task) => void;
  onToggleChat?: () => void;
}

export const ScrumModule: React.FC<ScrumModuleProps> = ({ onOpenTaskModal, onToggleChat }) => {
  const { currentUser } = useAuth();
  const {
    activeProject,
    tasks,
    sprints,
    activeSprint,
    planningPoker,
    votePlanningPoker,
    simulateTeamVotes,
    revealPlanningPoker,
    resetPlanningPoker,
    applyPokerEstimateToTask,
    dailyNotes,
    addDailyNote,
    deleteDailyNote,
    retroCards,
    addRetroCard,
    deleteRetroCard,
    voteRetroCard,
    teamMembers,
    moveTaskStatus,
    updateTask,
    deleteTask,
    completeActiveSprint,
  } = useProject();

  const isProjectCompleted = activeProject?.status === 'COMPLETED';

  const [scrumSubTab, setScrumSubTab] = useState<'BACKLOG' | 'HISTORY' | 'POKER' | 'BURNDOWN' | 'DAILY_RETRO' | 'PROGRESS'>('BACKLOG');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);
  const [estimateSavedSuccess, setEstimateSavedSuccess] = useState(false);

  // If project is completed, automatically restrict view to HISTORY or PROGRESS
  useEffect(() => {
    if (isProjectCompleted && scrumSubTab !== 'HISTORY' && scrumSubTab !== 'PROGRESS') {
      setScrumSubTab('HISTORY');
    }
  }, [isProjectCompleted, scrumSubTab]);

  // Task actions helper
  const handleEditTask = (task: Task) => {
    if (onOpenTaskModal) {
      onOpenTaskModal(task);
    }
  };

  const handleDeleteTask = (task: Task) => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente a tarefa "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  // Daily form state
  const [dailyYesterday, setDailyYesterday] = useState('');
  const [dailyToday, setDailyToday] = useState('');
  const [dailyImpediments, setDailyImpediments] = useState('');
  const [dailyAuthor, setDailyAuthor] = useState(currentUser?.name || teamMembers[0]?.name || '');
  const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showDailyForm, setShowDailyForm] = useState(false);

  // Retro form state
  const [retroContent, setRetroContent] = useState('');
  const [retroCategory, setRetroCategory] = useState<'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM'>('WENT_WELL');
  const [retroAuthor, setRetroAuthor] = useState(currentUser?.name || teamMembers[0]?.name || '');
  const [retroDate, setRetroDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showRetroForm, setShowRetroForm] = useState(false);

  // Current voter ID for 1-vote-per-member rule
  const currentVoterId = currentUser?.id || currentUser?.email || 'user_member';

  const handleDeleteDaily = (noteId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação da Daily Scrum?')) {
      deleteDailyNote(noteId);
    }
  };

  const handleDeleteRetro = (cardId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este post-it da Retrospectiva?')) {
      deleteRetroCard(cardId);
    }
  };

  const handleVoteRetro = (cardId: string) => {
    voteRetroCard(cardId, currentVoterId);
  };

  const fibonacciCards = [1, 2, 3, 5, 8, 13, 21, '?'];

  // Sprints Finalizadas do Projeto Ativo
  const completedSprints = useMemo(() => {
    return sprints
      .filter((s) => s.projectId === activeProject?.id && s.status === 'COMPLETED')
      .sort((a, b) => b.number - a.number);
  }, [sprints, activeProject?.id]);

  const completedSprintIds = useMemo(() => {
    return new Set(completedSprints.map((s) => s.id));
  }, [completedSprints]);

  // Sprint Backlog: tarefas explicitamente vinculadas à Sprint ativa
  const sprintBacklog = useMemo(() => {
    return tasks.filter(
      (t) => t.projectId === activeProject?.id && !!activeSprint && t.sprintId === activeSprint.id
    );
  }, [tasks, activeProject?.id, activeSprint]);

  // Product Backlog: tarefas do projeto que NÃO estão na Sprint ativa E NÃO estão em sprints finalizadas (sem duplicação)
  const productBacklog = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.projectId === activeProject?.id &&
        (!t.sprintId || t.inBacklog) &&
        !completedSprintIds.has(t.sprintId || '') &&
        (!activeSprint || t.sprintId !== activeSprint.id)
    );
  }, [tasks, activeProject?.id, activeSprint, completedSprintIds]);

  // Métricas da Sprint Ativa
  const completedSprintTasks = sprintBacklog.filter((t) => t.status === 'done');
  const completedSprintPoints = completedSprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const totalSprintPoints = sprintBacklog.reduce((acc, t) => acc + (t.storyPoints || 0), 0) || (activeSprint?.totalPoints || 0);
  const remainingSprintPoints = Math.max(0, totalSprintPoints - completedSprintPoints);

  // Lista de todas as tarefas elegíveis para estimativa no Planning Poker
  const estimableTasks = useMemo(() => {
    return [...productBacklog, ...sprintBacklog];
  }, [productBacklog, sprintBacklog]);

  // Tarefa atualmente selecionada no Planning Poker
  const currentPokerTask = useMemo(() => {
    return tasks.find((t) => t.id === planningPoker?.taskId) || null;
  }, [tasks, planningPoker?.taskId]);

  // Gráfico Burndown Dinâmico e Rigorosamente Alinhado com as Datas da Sprint Ativa
  const burndownData = useMemo(() => {
    const totalPts = totalSprintPoints > 0 ? totalSprintPoints : 24;
    const currentCompleted = completedSprintPoints;

    let startObj = activeSprint?.startDate ? parseFlexibleDate(activeSprint.startDate) : null;
    let endObj = activeSprint?.endDate ? parseFlexibleDate(activeSprint.endDate) : null;

    if (!startObj) {
      startObj = new Date();
    }
    if (!endObj) {
      endObj = new Date(startObj);
      endObj.setDate(endObj.getDate() + 14);
    }

    const diffTime = Math.max(0, endObj.getTime() - startObj.getTime());
    const totalDays = Math.max(2, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const startZero = new Date(startObj);
    startZero.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.round((now.getTime() - startZero.getTime()) / (1000 * 60 * 60 * 24));
    const currentDayIndex = Math.min(totalDays - 1, Math.max(0, daysSinceStart));

    // Sample clean steps along the sprint date horizon
    const maxSteps = Math.min(14, totalDays);
    const points = [];

    for (let i = 0; i < maxSteps; i++) {
      const fraction = maxSteps <= 1 ? 0 : i / (maxSteps - 1);
      const pointTime = new Date(startObj.getTime() + fraction * diffTime);
      const dayNum = Math.round(fraction * (totalDays - 1)) + 1;
      const dateFormatted = `${String(pointTime.getDate()).padStart(2, '0')}/${String(pointTime.getMonth() + 1).padStart(2, '0')}`;
      const label = `D${dayNum} (${dateFormatted})`;

      // Ideal linear burn: starts at totalPts at start date, reaches 0 on sprint end date
      const ideal = Math.max(0, Math.round((totalPts - fraction * totalPts) * 10) / 10);

      // Real line: reflects actual remaining points up to current day
      let real: number | null = null;
      const pointDayIndex = Math.round(fraction * (totalDays - 1));

      if (pointDayIndex <= currentDayIndex) {
        if (pointDayIndex === currentDayIndex || i === maxSteps - 1) {
          real = Math.max(0, totalPts - currentCompleted);
        } else {
          const subFraction = currentDayIndex > 0 ? pointDayIndex / currentDayIndex : 0;
          const burnedSoFar = currentCompleted * 0.7 * subFraction;
          real = Math.max(0, Math.round((totalPts - burnedSoFar) * 10) / 10);
        }
      }

      points.push({
        day: label,
        ideal,
        real,
      });
    }

    return points;
  }, [activeSprint?.startDate, activeSprint?.endDate, totalSprintPoints, completedSprintPoints]);

  const handleCreateDaily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyToday.trim()) return;
    addDailyNote(dailyYesterday, dailyToday, dailyImpediments || 'Nenhum', dailyAuthor, dailyDate);
    setDailyYesterday('');
    setDailyToday('');
    setDailyImpediments('');
    setDailyDate(new Date().toISOString().split('T')[0]);
    setShowDailyForm(false);
  };

  const handleCreateRetro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retroContent.trim()) return;
    addRetroCard(retroCategory, retroContent, retroAuthor, retroDate);
    setRetroContent('');
    setRetroDate(new Date().toISOString().split('T')[0]);
    setShowRetroForm(false);
  };

  const handleSelectPokerTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      resetPlanningPoker(task.id, task.title);
      setEstimateSavedSuccess(false);
    }
  };

  const handleApplyPokerEstimate = () => {
    if (!planningPoker || planningPoker.consensusEstimate === null) return;
    applyPokerEstimateToTask(planningPoker.taskId, planningPoker.consensusEstimate);
    setEstimateSavedSuccess(true);
    setTimeout(() => {
      setEstimateSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Project Methodology Isolation Bar */}
      <ProjectMethodologyBar
        currentModule="SCRUM"
        onOpenTaskModal={onOpenTaskModal}
        onToggleChat={onToggleChat}
      />

      {/* Active Sprint Banner & Controls */}
      {activeSprint && !isProjectCompleted && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Repeat className="w-3.5 h-3.5 inline mr-1" /> {activeSprint.name}
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Sprint Ativa
                </span>
                <button
                  onClick={() => {
                    setSprintToEdit(activeSprint);
                    setIsSprintModalOpen(true);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-all"
                  title="Configurar datas e objetivo desta sprint"
                >
                  <Settings2 className="w-3 h-3 text-purple-400" /> Configurar Sprint
                </button>
                <button
                  onClick={() => {
                    setSprintToEdit(null);
                    setIsSprintModalOpen(true);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 text-xs font-bold border border-purple-800/60 flex items-center gap-1 transition-all"
                  title="Planejar nova sprint"
                >
                  <Plus className="w-3 h-3 text-purple-400" /> Nova Sprint
                </button>
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

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> {formatDateDisplay(activeSprint.startDate)} até {formatDateDisplay(activeSprint.endDate)}
                </span>
                <span>•</span>
                <span>Sprint #{activeSprint.number}</span>
                {activeProject?.deadline && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">
                      Prazo Final do Projeto: <strong className="text-purple-300">{formatDateDisplay(activeProject.deadline)}</strong>
                    </span>
                  </>
                )}
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
                title="Arquivar a sprint atual e iniciar automaticamente o próximo ciclo"
              >
                Concluir Sprint 🏆
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner if Project is Finished */}
      {isProjectCompleted && (
        <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-purple-200 flex items-center gap-2">
              <span>🏆 PROJETO CONCLUÍDO & ARQUIVADO</span>
            </h3>
            <p className="text-xs text-slate-300">
              Este projeto foi finalizado com sucesso. O histórico completo de iterações e relatórios executivos de métricas estão disponíveis abaixo.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
            Modo Leitura Histórica
          </span>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {!isProjectCompleted && (
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
        )}

        <button
          onClick={() => setScrumSubTab('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'HISTORY'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <History className="w-4 h-4" /> Sprints Finalizadas
          <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {completedSprints.length}
          </span>
        </button>

        {!isProjectCompleted && (
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
        )}

        {!isProjectCompleted && (
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
        )}

        <button
          onClick={() => setScrumSubTab('PROGRESS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            scrumSubTab === 'PROGRESS'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-purple-400" /> Progresso & Relatórios
        </button>

        {!isProjectCompleted && (
          <button
            onClick={() => setScrumSubTab('DAILY_RETRO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              scrumSubTab === 'DAILY_RETRO'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Daily & Retrospectiva
          </button>
        )}
      </div>

      {/* Tab 1: Product & Sprint Backlog */}
      {scrumSubTab === 'BACKLOG' && !isProjectCompleted && (
        <div className="space-y-6">
          <TabExplainer
            title="Product Backlog & Sprint Backlog"
            badge="Scrum Core"
            methodology="SCRUM"
            summary="O Product Backlog é o repositório central de todas as estórias de usuário e funcionalidades planejadas para o produto. O Sprint Backlog é o subconjunto de demandas selecionadas para serem entregues na Sprint ativa pelo time."
            howItWorks={[
              'Cadastre novas estórias/tarefas com pontuação (Story Points) no Product Backlog.',
              'Puxe as estórias prioritárias para a Sprint atual usando o botão "Puxar para Sprint". A tarefa é transferida sem duplicatas.',
              'Atualize o status das tarefas na Sprint (A Fazer, Em Progresso, Concluído) conforme o trabalho avança.',
              'Ao finalizar todos os itens, clique em "Concluir Sprint 🏆" no topo para arquivar a iteração na aba de Sprints Finalizadas.'
            ]}
            tips={[
              'Quebre estórias grandes (Épicos) em tarefas menores antes de inseri-las na Sprint.',
              'Tarefas não concluídas ao término de uma Sprint voltam automaticamente para o Product Backlog com aviso de atraso.',
              'Sprints concluídas ficam salvas com rastreabilidade completa na aba de Sprints Finalizadas.'
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
                      Nenhuma estória pendente fora da sprint ativa. Crie novas demandas para alimentar o backlog.
                    </p>
                    {onOpenTaskModal && (
                      <button
                        onClick={() => onOpenTaskModal()}
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
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200">{task.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          {task.storyPoints || 0} pts
                        </span>
                      </div>

                      {/* Overdue Alert Badge on Task Card */}
                      {task.isOverdue && (
                        <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>⚠️ Atrasada ({task.overdueFromSprint || 'Sprint anterior'}): Não concluída no prazo</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 border border-slate-800"
                            title="Editar Tarefa"
                          >
                            <Edit2 className="w-3 h-3 text-purple-400" /> Editar
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] transition-all"
                            title="Excluir Tarefa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            if (!activeSprint) return;
                            updateTask(task.id, {
                              sprintId: activeSprint.id,
                              inBacklog: false,
                              status: task.status === 'backlog' ? 'todo' : task.status,
                            });
                          }}
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
                        onClick={() => onOpenTaskModal()}
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
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
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

                      {/* Overdue alert if task was carried over from previous sprint or delivered late */}
                      {task.isOverdue && (
                        task.status === 'done' ? (
                          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>✅ Concluída em Atraso (Originada na {task.overdueFromSprint || 'Sprint anterior'})</span>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>⚠️ Item Atrasado ({task.overdueFromSprint || 'Sprint anterior'}) - Replanejado</span>
                          </div>
                        )
                      )}

                      <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {task.status === 'done' ? (
                            <button
                              disabled
                              className="px-2 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 text-[11px] font-semibold flex items-center gap-1 cursor-not-allowed"
                              title="Tarefas concluídas não podem sofrer alterações"
                            >
                              <Lock className="w-3 h-3 text-slate-500" /> Bloqueado
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditTask(task)}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 border border-slate-800"
                              title="Editar Tarefa"
                            >
                              <Edit2 className="w-3 h-3 text-purple-400" /> Editar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task)}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] transition-all"
                            title="Excluir Tarefa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {task.status !== 'done' && (
                            <button
                              onClick={() => moveTaskStatus(task.id, 'done')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold transition-all"
                            >
                              Concluir ✓
                            </button>
                          )}
                          {task.status !== 'done' && (
                            <button
                              onClick={() => updateTask(task.id, { sprintId: null, inBacklog: true, status: 'backlog' })}
                              className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-xs"
                              title="Devolver ao Product Backlog"
                            >
                              Devolver
                            </button>
                          )}
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

      {/* Tab 2: Sprints Finalizadas (Histórico Inteligente) */}
      {scrumSubTab === 'HISTORY' && (
        <div className="space-y-6">
          <TabExplainer
            title="Histórico de Sprints Finalizadas"
            badge="Registro & Rastreabilidade"
            methodology="SCRUM"
            summary="Repositório inteligente de todas as iterações e sprints concluídas do projeto. As estórias entregues permanecem arquivadas de forma organizada com seu histórico de Story Points e métricas de execução, sem poluir o Product Backlog."
            howItWorks={[
              'Ao finalizar uma Sprint pelo botão "Concluir Sprint 🏆", a iteração é arquivada aqui automaticamente.',
              'Todas as tarefas concluídas são preservadas com suas métricas de pontuação e datas de entrega.',
              'Tarefas que não foram finalizadas durante a Sprint retornam automaticamente para o Product Backlog para serem replanejadas na próxima iteração.',
              'Acompanhe a evolução histórica de velocidade e taxa de entrega do time ao longo das iterações.'
            ]}
            tips={[
              'Compare a velocidade de sprints anteriores para estimar com precisão a capacidade do time em futuros planejamentos.',
              'Utilize as tarefas concluídas nas reuniões de Sprint Review com stakeholders para demonstração de valor entregue.'
            ]}
          />

          {/* KPI Summary Cards for Completed Sprints */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <FolderArchive className="w-4 h-4 text-purple-400" /> Sprints Concluídas
              </div>
              <div className="text-2xl font-black text-white">{completedSprints.length}</div>
              <div className="text-[11px] text-purple-400 font-medium">Ciclos finalizados</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Award className="w-4 h-4 text-emerald-400" /> Total Points Entregues
              </div>
              <div className="text-2xl font-black text-white">
                {completedSprints.reduce((acc, s) => acc + (s.completedPoints || 0), 0)} pts
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">Histórico acumulado</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Velocidade Média
              </div>
              <div className="text-2xl font-black text-white">
                {completedSprints.length > 0
                  ? Math.round(
                      completedSprints.reduce((acc, s) => acc + (s.completedPoints || 0), 0) /
                        completedSprints.length
                    )
                  : 0}{' '}
                pts/sprint
              </div>
              <div className="text-[11px] text-indigo-400 font-medium">Capacidade do time</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <CheckSquare className="w-4 h-4 text-amber-400" /> Tarefas Entregues
              </div>
              <div className="text-2xl font-black text-white">
                {tasks.filter((t) => t.projectId === activeProject?.id && completedSprintIds.has(t.sprintId || '') && t.status === 'done').length}
              </div>
              <div className="text-[11px] text-amber-400 font-medium">Estórias arquivadas</div>
            </div>
          </div>

          {/* Completed Sprints List */}
          <div className="space-y-4">
            {completedSprints.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <FolderArchive className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhuma Sprint Finalizada Ainda</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Quando você concluir a Sprint ativa através do botão "Concluir Sprint 🏆", o ciclo será registrado e arquivado aqui com todas as estórias entregues e métricas históricas.
                </p>
              </div>
            ) : (
              completedSprints.map((sprint) => {
                const sprintTasks = tasks.filter(
                  (t) => t.projectId === activeProject?.id && t.sprintId === sprint.id
                );
                const deliveredPoints = sprint.completedPoints || sprintTasks.filter((t) => t.status === 'done').reduce((acc, t) => acc + (t.storyPoints || 0), 0);
                const plannedPoints = sprint.totalPoints || sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0) || deliveredPoints;
                const completionRate = plannedPoints > 0 ? Math.min(100, Math.round((deliveredPoints / plannedPoints) * 100)) : 100;

                // Calculation of deadline adherence
                const completedDateObj = parseFlexibleDate(sprint.completedAt);
                const deadlineDateObj = parseFlexibleDate(sprint.endDate);
                let isLate = false;
                let daysDifference = 0;
                if (completedDateObj && deadlineDateObj) {
                  completedDateObj.setHours(0, 0, 0, 0);
                  deadlineDateObj.setHours(0, 0, 0, 0);
                  const diffTime = completedDateObj.getTime() - deadlineDateObj.getTime();
                  daysDifference = Math.round(diffTime / (1000 * 60 * 60 * 24));
                  if (daysDifference > 0) {
                    isLate = true;
                  }
                }

                return (
                  <div
                    key={sprint.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Sprint #{sprint.number}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Concluída
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> Prazo de Entrega: {formatDateDisplay(sprint.endDate)}
                          </span>
                          {sprint.completedAt && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Entregue em {formatDateDisplay(sprint.completedAt)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white">{sprint.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Target className="w-3.5 h-3.5 text-purple-400" /> Meta: {sprint.goal}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
                        <div className="text-center px-3 border-r border-slate-800">
                          <div className="text-lg font-black text-purple-300">{deliveredPoints} / {plannedPoints}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Points Entregues</div>
                        </div>
                        <div className="text-center px-2">
                          <div className="text-lg font-black text-emerald-400">{completionRate}%</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Entrega</div>
                        </div>
                      </div>
                    </div>

                    {/* Destaque e Informações Detalhadas do Prazo de Entrega */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-950 to-slate-950 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-400">Início da Sprint:</span>
                          <span className="font-semibold text-slate-200">{formatDateDisplay(sprint.startDate)}</span>
                        </div>

                        <span className="text-slate-600 hidden sm:inline">→</span>

                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-300 font-semibold">Prazo de Entrega:</span>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold flex items-center gap-1 shadow-sm">
                            {formatDateDisplay(sprint.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-400">Data de Conclusão:</span>
                          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {formatDateDisplay(sprint.completedAt || sprint.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Status de Cumprimento do Prazo */}
                      <div>
                        {sprint.endDate && sprint.completedAt && (
                          isLate ? (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Entregue com Atraso (+{daysDifference} {daysDifference === 1 ? 'dia' : 'dias'})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                              <span>Entregue Dentro do Prazo</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Taxa de Entrega de Story Points</span>
                        <span className="text-slate-200 font-bold">{deliveredPoints} de {plannedPoints} pts ({completionRate}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Tarefas e Estórias Entregues ({sprintTasks.length}):
                      </h4>

                      {sprintTasks.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          Nenhum registro individual de tarefa preservado para esta iteração arquivada.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sprintTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                  <span className="font-bold text-slate-200 truncate">{task.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                                
                                {/* Late Delivery Indicator */}
                                {task.isOverdue && (
                                  <div className="mt-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                                    <span>Entregue com Atraso (Originada na {task.overdueFromSprint || 'Sprint anterior'})</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                                    {task.priority}
                                  </span>
                                  {task.tags?.map((tag) => (
                                    <span key={tag} className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/40">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="shrink-0 text-right space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 block">
                                  {task.storyPoints || 0} pts
                                </span>
                                <span className="text-[10px] text-emerald-400 font-bold block">
                                  Concluída ✓
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Planning Poker Integrado (Sequência Fibonacci) */}
      {scrumSubTab === 'POKER' && (
        <div className="space-y-6">
          <TabExplainer
            title="Planning Poker Integrado (Sequência Fibonacci)"
            badge="Estimativa Ágil"
            methodology="SCRUM"
            summary="Cerimônia de estimativa consensual onde todos os integrantes votam anonimamente a complexidade de cada estória usando a escala Fibonacci (1, 2, 3, 5, 8, 13, 21). Isso previne a influência de líderes e estimula debates técnicos valiosos."
            howItWorks={[
              'Selecione a estória/tarefa no seletor acima para iniciar a rodada de estimativa.',
              'Cada desenvolvedor clica na carta com sua estimativa de Story Points.',
              'Utilize o botão "Simular Votos do Time" para preencher instantaneamente os palpites dos demais colegas do projeto.',
              'Clique em "Revelar Cartas 🃏" para calcular o Consenso Fibonacci e salvar a estimativa diretamente na tarefa com 1 clique.'
            ]}
            tips={[
              'Votos divergentes (ex: uma nota 2 e outra 13) indicam entendimentos diferentes do requisito; debatam os riscos antes de fechar a nota.',
              'Cartas altas (13 ou 21) sugerem que a estória é muito complexa e deve ser dividida em tarefas menores.'
            ]}
          />

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            
            {/* Story Picker Bar */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Selecionar Estória para Estimar:
                  </label>
                  <select
                    value={planningPoker?.taskId || ''}
                    onChange={(e) => handleSelectPokerTask(e.target.value)}
                    className="w-full sm:w-96 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    {estimableTasks.length === 0 ? (
                      <option value="">Nenhuma tarefa cadastrada no projeto</option>
                    ) : (
                      estimableTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.storyPoints ? `${t.storyPoints} pts` : 'Sem estimativa'}) - {t.sprintId ? 'Sprint' : 'Product Backlog'}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {!planningPoker?.revealed && (
                    <button
                      type="button"
                      onClick={simulateTeamVotes}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shadow-md active:scale-95"
                      title="Preencher estimativas automaticamente para os outros integrantes do time"
                    >
                      <Dice5 className="w-4 h-4 text-purple-400" />
                      <span>Simular Votos do Time</span>
                    </button>
                  )}

                  {!planningPoker?.revealed ? (
                    <button
                      onClick={revealPlanningPoker}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 hover:from-purple-500 active:scale-95 transition-all"
                    >
                      Revelar Cartas 🃏
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const nextTask = estimableTasks.find((t) => t.id !== planningPoker?.taskId) || estimableTasks[0];
                        if (nextTask) {
                          resetPlanningPoker(nextTask.id, nextTask.title);
                        } else {
                          resetPlanningPoker('task_poker_next', 'Nova Estória de Usuário');
                        }
                        setEstimateSavedSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition-all"
                    >
                      Nova Votação 🔄
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Task Details Preview */}
              {currentPokerTask && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-purple-300">{currentPokerTask.title}</span>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{currentPokerTask.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      Prioridade: {currentPokerTask.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Atual: {currentPokerTask.storyPoints || 0} pts
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Fibonacci Voting Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Selecione sua estimativa ({currentUser?.name || teamMembers[0]?.name || 'Sua Carta'}):
                </label>
                <span className="text-xs text-purple-300 font-bold">
                  {planningPoker?.votes.filter((v) => v.hasVoted).length || 0} de {planningPoker?.votes.length || teamMembers.length} votos registrados
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {fibonacciCards.map((cardVal) => {
                  const myVoteId = currentUser?.id || teamMembers[0]?.id || 'admin';
                  const isSelected = planningPoker?.votes.find((v) => v.memberId === myVoteId)?.vote === cardVal;
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

            {/* Team Members Votes Display */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status das Cartas dos Integrantes do Projeto ({planningPoker?.votes.length || teamMembers.length}):
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">Sincronizado com os membros ativos do projeto</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(planningPoker?.votes || []).map((v) => {
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
                        {planningPoker?.revealed ? (
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

              {/* Consensus Result & Apply Action */}
              {planningPoker?.revealed && (
                <div className="p-6 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center space-y-3 shadow-xl">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">Consenso Calculado por Sequência Fibonacci</div>
                  <div className="text-4xl font-black text-white">{planningPoker.consensusEstimate} Story Points</div>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Estimativa média baseada nos votos de todos os integrantes do projeto.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleApplyPokerEstimate}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Salvar Estimativa na Tarefa ({planningPoker.consensusEstimate} pts)
                    </button>
                  </div>

                  {estimateSavedSuccess && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Estimativa salva com sucesso na tarefa!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Burndown Chart & Métricas Reativas */}
      {scrumSubTab === 'BURNDOWN' && (
        <div className="space-y-6">
          <TabExplainer
            title="Gráfico Burndown da Sprint (Sincronizado em Tempo Real)"
            badge="Velocidade & Previsibilidade"
            methodology="SCRUM"
            summary="O Burndown Chart é a representação visual exata da quantidade de trabalho restante (em Story Points) ao longo dos dias úteis da Sprint ativa. Ele sincroniza instantaneamente com a conclusão das tarefas do projeto."
            howItWorks={[
              'A Linha Tracejada (Ideal) traça a queima linear esperada de pontos do início ao fim da iteração.',
              'A Linha Roxa Sólida (Real) reflete o total de Story Points pendentes calculado a partir das tarefas da Sprint.',
              'Ao concluir uma tarefa na Sprint Backlog (status Concluído ✓), o gráfico queima os pontos correspondentes em tempo real.',
              'Se a Linha Real estiver abaixo da Linha Ideal, o time está adiantado; se estiver acima, indica risco de atraso na meta.'
            ]}
            tips={[
              'Analise o Burndown diariamente na reunião de Daily Scrum para replanejar o foco do dia.',
              'Tarefas pequenas e contínuas evitam quedas bruscas de pontuação apenas no final da iteração.'
            ]}
          />

          {/* Highlighted Sprint Date Alignment Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Cronograma Alinhado da Sprint:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white">
                    {activeSprint?.name || 'Sprint Ativa'}
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 font-semibold pt-0.5">
                  Início: {formatDateDisplay(activeSprint?.startDate)} → Término: {formatDateDisplay(activeSprint?.endDate)}
                  {activeSprint?.startDate && activeSprint?.endDate && (
                    <span className="text-slate-400 font-normal ml-2">
                      ({Math.max(1, Math.round((parseFlexibleDate(activeSprint.endDate)!.getTime() - parseFlexibleDate(activeSprint.startDate)!.getTime()) / (1000 * 60 * 60 * 24)))} dias de duração total)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSprintToEdit(activeSprint);
                  setIsSprintModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <Calendar className="w-3.5 h-3.5 text-white" /> Ajustar Datas da Sprint
              </button>
            </div>
          </div>

          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Target className="w-4 h-4 text-purple-400" /> Total Planejado
              </div>
              <div className="text-2xl font-black text-white">{totalSprintPoints} pts</div>
              <div className="text-[11px] text-purple-400 font-medium">Capacidade da Sprint</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Flame className="w-4 h-4 text-emerald-400" /> Pontos Queimados
              </div>
              <div className="text-2xl font-black text-white">{completedSprintPoints} pts</div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {totalSprintPoints > 0 ? Math.round((completedSprintPoints / totalSprintPoints) * 100) : 0}% da meta atingida
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <TrendingDown className="w-4 h-4 text-indigo-400" /> Trabalho Restante
              </div>
              <div className="text-2xl font-black text-white">{remainingSprintPoints} pts</div>
              <div className="text-[11px] text-indigo-400 font-medium">{sprintBacklog.length - completedSprintTasks.length} tarefas pendentes</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Sparkles className="w-4 h-4 text-amber-400" /> Ritmo da Sprint
              </div>
              <div className="text-base font-extrabold text-white">
                {remainingSprintPoints <= (totalSprintPoints * 0.45) ? (
                  <span className="text-emerald-400">No Ritmo / Adiantado 🚀</span>
                ) : (
                  <span className="text-amber-400">Atenção no Ritmo ⚠️</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Comparado à Linha Ideal</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-purple-400" /> Burndown Chart ({activeSprint?.name || 'Sprint Ativa'})
                </h3>
                <p className="text-xs text-slate-400">
                  Progresso real sincronizado com as tarefas ativas do projeto ({completedSprintPoints} de {totalSprintPoints} pontos concluídos).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Real: {remainingSprintPoints} pts restantes
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="ideal" name="Ideal (Meta Linear)" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="real" name="Real (Trabalho Restante)" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Task Breakdown Table inside Sprint */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-purple-400" /> Tarefas da Sprint Ativa e Impacto na Queima:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sprintBacklog.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                      task.status === 'done'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate flex items-center gap-1.5">
                        <span className="truncate">{task.title}</span>
                        {task.isOverdue && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                            Atrasada
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {task.status === 'done' ? 'Queimou na Sprint ✓' : 'Pendente de conclusão'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      {task.storyPoints || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Project Progress & Metrics */}
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

      {/* Tab 6: Daily Scrum & Retrospectiva */}
      {scrumSubTab === 'DAILY_RETRO' && (
        <div className="space-y-6">
          <TabExplainer
            title="Daily Scrum & Retrospectiva da Sprint"
            badge="Alinhamento & Melhoria Contínua"
            methodology="SCRUM"
            summary="A Daily Scrum é o alinhamento diário rápido de 15 minutos para sincronizar o progresso e expor bloqueios. A Retrospectiva ocorre ao fim de cada Sprint para a equipe inspecionar processos e definir ações concretas de melhoria."
            howItWorks={[
              'Na seção Daily Scrum, registre as respostas: O que fiz ontem, O que farei hoje, Impedimentos e Data.',
              'Anotações e post-its possuem botões de exclusão para manter o quadro sempre atualizado.',
              'Na seção Retrospectiva, crie post-its com data em: O que funcionou bem, O que pode melhorar e Ações de melhoria.',
              'Cada integrante do projeto pode curtir cada post-it apenas uma vez para votação justa de prioridades.'
            ]}
            tips={[
              'A Daily não é uma prestação de contas para o gestor, mas uma conversa entre desenvolvedores sobre compromissos mútuos.',
              'Na Retrospectiva, foque em causas-raiz e processos, nunca em culpar pessoas individualmente.'
            ]}
          />
          
          {/* Daily Section */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" /> Daily Scrum Notes
                </h3>
                <p className="text-xs text-slate-400">Registros das reuniões diárias de alinhamento de 15 minutos.</p>
              </div>

              <button
                onClick={() => setShowDailyForm(!showDailyForm)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  showDailyForm
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                }`}
              >
                {showDailyForm ? (
                  'Fechar Formulário'
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Registrar Daily
                  </>
                )}
              </button>
            </div>

            {showDailyForm && (
              <form onSubmit={handleCreateDaily} className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Novo Registro de Daily
                  </span>
                  <span className="text-[11px] text-slate-400">Preencha suas 3 respostas diárias</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Autor</label>
                    <select
                      value={dailyAuthor}
                      onChange={(e) => setDailyAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                    >
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> Data da Daily
                    </label>
                    <input
                      type="date"
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-purple-500 outline-none [color-scheme:dark]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">O que fiz ontem?</label>
                    <input
                      type="text"
                      placeholder="Atividades concluídas..."
                      value={dailyYesterday}
                      onChange={(e) => setDailyYesterday(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">O que farei hoje? *</label>
                    <input
                      type="text"
                      placeholder="Planos e compromissos para hoje..."
                      value={dailyToday}
                      onChange={(e) => setDailyToday(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Algum impedimento?</label>
                    <input
                      type="text"
                      placeholder="Bloqueios ou ajudas necessárias (ou 'Nenhum')..."
                      value={dailyImpediments}
                      onChange={(e) => setDailyImpediments(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDailyForm(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Salvar Daily
                  </button>
                </div>
              </form>
            )}

            {dailyNotes.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-300">Nenhum registro de Daily Scrum ainda.</p>
                <p className="text-xs text-slate-500">Clique em "+ Registrar Daily" para registrar os compromissos diários do time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyNotes.map((note) => (
                  <div key={note.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-[10px]">
                          {note.author.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-200">{note.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-purple-400" /> {formatDateDisplay(note.date)}
                        </span>
                        <button
                          onClick={() => handleDeleteDaily(note.id)}
                          title="Excluir este registro de Daily"
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5">
                      {note.yesterday && (
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                          <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider mb-0.5">Ontem:</span>
                          <span className="text-slate-300">{note.yesterday}</span>
                        </div>
                      )}
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                        <span className="text-purple-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">Hoje:</span>
                        <span className="text-slate-200 font-medium">{note.today}</span>
                      </div>
                      {note.impediments && note.impediments !== 'Nenhum' ? (
                        <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-rose-300">
                          <span className="text-rose-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Impedimento:
                          </span>
                          <span>{note.impediments}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 px-1">Sem impedimentos relatados.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retrospective Board */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" /> Quadro de Retrospectiva da Sprint
                </h3>
                <p className="text-xs text-slate-400">Feedback e inspeção do time: O que funcionou, o que melhorar e planos de ação (1 voto por integrante).</p>
              </div>

              <button
                onClick={() => setShowRetroForm(!showRetroForm)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  showRetroForm
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                }`}
              >
                {showRetroForm ? (
                  'Fechar Formulário'
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Adicionar Post-it
                  </>
                )}
              </button>
            </div>

            {showRetroForm && (
              <form onSubmit={handleCreateRetro} className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Novo Post-it de Retrospectiva
                  </span>
                  <span className="text-[11px] text-slate-400">Compartilhe sua percepção com o time</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria *</label>
                    <select
                      value={retroCategory}
                      onChange={(e) => setRetroCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="WENT_WELL">😊 O que funcionou bem?</option>
                      <option value="TO_IMPROVE">🤔 O que pode melhorar?</option>
                      <option value="ACTION_ITEM">⚡ Ação Prática / Solução</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Autor</label>
                    <select
                      value={retroAuthor}
                      onChange={(e) => setRetroAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Data do Post-it
                    </label>
                    <input
                      type="date"
                      value={retroDate}
                      onChange={(e) => setRetroDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 outline-none [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Conteúdo do Post-it *</label>
                  <textarea
                    rows={2}
                    placeholder="Sua observação, feedback ou proposta de melhoria para o time..."
                    value={retroContent}
                    onChange={(e) => setRetroContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs resize-none focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRetroForm(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Adicionar Post-it
                  </button>
                </div>
              </form>
            )}

            {/* 3 Retro Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Went Well */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                  <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    😊 O Que Funcionou Bem
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    {retroCards.filter((c) => c.category === 'WENT_WELL').length}
                  </span>
                </div>

                {retroCards.filter((c) => c.category === 'WENT_WELL').length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 italic">Nenhum post-it nesta coluna.</p>
                ) : (
                  retroCards
                    .filter((c) => c.category === 'WENT_WELL')
                    .map((card) => {
                      const hasVoted = Boolean(card.voters && card.voters.includes(currentVoterId));
                      return (
                        <div key={card.id} className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-2.5 hover:border-emerald-500/40 transition-colors">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-emerald-500/15">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-emerald-300">{card.author}</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3 text-emerald-400/70" />
                                {formatDateDisplay(card.createdAt || new Date().toISOString().split('T')[0])}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteRetro(card.id)}
                              title="Excluir este post-it"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-slate-200 font-medium leading-relaxed">{card.content}</p>

                          <div className="flex items-center justify-between pt-1 border-t border-emerald-500/15">
                            <span className="text-[10px] text-slate-400">
                              {card.votes} {card.votes === 1 ? 'voto' : 'votos'}
                            </span>
                            <button
                              onClick={() => handleVoteRetro(card.id)}
                              title={hasVoted ? 'Você já curtiu este post-it (Clique para remover voto)' : 'Curtir este post-it (Limite: 1 voto por integrante)'}
                              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                                hasVoted
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                                  : 'bg-slate-900/80 text-slate-400 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/30'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                              <span>{card.votes}</span>
                              {hasVoted && <span className="text-[9px] text-emerald-300 font-extrabold uppercase ml-0.5">• Curtido</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* To Improve */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-rose-500/20">
                  <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    🤔 O Que Pode Melhorar
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                    {retroCards.filter((c) => c.category === 'TO_IMPROVE').length}
                  </span>
                </div>

                {retroCards.filter((c) => c.category === 'TO_IMPROVE').length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 italic">Nenhum post-it nesta coluna.</p>
                ) : (
                  retroCards
                    .filter((c) => c.category === 'TO_IMPROVE')
                    .map((card) => {
                      const hasVoted = Boolean(card.voters && card.voters.includes(currentVoterId));
                      return (
                        <div key={card.id} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs space-y-2.5 hover:border-rose-500/40 transition-colors">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-rose-500/15">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-rose-300">{card.author}</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3 text-rose-400/70" />
                                {formatDateDisplay(card.createdAt || new Date().toISOString().split('T')[0])}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteRetro(card.id)}
                              title="Excluir este post-it"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-slate-200 font-medium leading-relaxed">{card.content}</p>

                          <div className="flex items-center justify-between pt-1 border-t border-rose-500/15">
                            <span className="text-[10px] text-slate-400">
                              {card.votes} {card.votes === 1 ? 'voto' : 'votos'}
                            </span>
                            <button
                              onClick={() => handleVoteRetro(card.id)}
                              title={hasVoted ? 'Você já curtiu este post-it (Clique para remover voto)' : 'Curtir este post-it (Limite: 1 voto por integrante)'}
                              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                                hasVoted
                                  ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50 shadow-sm shadow-rose-500/20 ring-1 ring-rose-400/40'
                                  : 'bg-slate-900/80 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/30'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-rose-400 text-rose-400' : ''}`} />
                              <span>{card.votes}</span>
                              {hasVoted && <span className="text-[9px] text-rose-300 font-extrabold uppercase ml-0.5">• Curtido</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Action Items */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-purple-500/20">
                  <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ Ações de Melhoria
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-400 border border-purple-500/20">
                    {retroCards.filter((c) => c.category === 'ACTION_ITEM').length}
                  </span>
                </div>

                {retroCards.filter((c) => c.category === 'ACTION_ITEM').length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 italic">Nenhum post-it nesta coluna.</p>
                ) : (
                  retroCards
                    .filter((c) => c.category === 'ACTION_ITEM')
                    .map((card) => {
                      const hasVoted = Boolean(card.voters && card.voters.includes(currentVoterId));
                      return (
                        <div key={card.id} className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs space-y-2.5 hover:border-purple-500/40 transition-colors">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-purple-500/15">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-purple-300">{card.author}</span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3 h-3 text-purple-400/70" />
                                {formatDateDisplay(card.createdAt || new Date().toISOString().split('T')[0])}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteRetro(card.id)}
                              title="Excluir este post-it"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-slate-200 font-medium leading-relaxed">{card.content}</p>

                          <div className="flex items-center justify-between pt-1 border-t border-purple-500/15">
                            <span className="text-[10px] text-slate-400">
                              {card.votes} {card.votes === 1 ? 'voto' : 'votos'}
                            </span>
                            <button
                              onClick={() => handleVoteRetro(card.id)}
                              title={hasVoted ? 'Você já curtiu este post-it (Clique para remover voto)' : 'Curtir este post-it (Limite: 1 voto por integrante)'}
                              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${
                                hasVoted
                                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-sm shadow-purple-500/20 ring-1 ring-purple-400/40'
                                  : 'bg-slate-900/80 text-slate-400 hover:text-purple-300 border border-slate-700/60 hover:border-purple-500/30'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-purple-400 text-purple-400' : ''}`} />
                              <span>{card.votes}</span>
                              {hasVoted && <span className="text-[9px] text-purple-300 font-extrabold uppercase ml-0.5">• Curtido</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
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

      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => {
          setIsSprintModalOpen(false);
          setSprintToEdit(null);
        }}
        sprintToEdit={sprintToEdit}
      />

    </div>
  );
};