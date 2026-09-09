import React, { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Target,
  BarChart2,
  FileText,
  Layers,
  Flame,
  Zap,
} from 'lucide-react';

interface ProjectProgressTabProps {
  onOpenTaskModal?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: '#64748b',
  todo: '#6366f1',
  in_progress: '#a855f7',
  review: '#f59e0b',
  done: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  Baixa: '#64748b',
  Média: '#6366f1',
  Alta: '#f59e0b',
  Urgente: '#ef4444',
};

export const ProjectProgressTab: React.FC<ProjectProgressTabProps> = ({ onOpenTaskModal }) => {
  const { activeProject, activeProjectTasks, teamMembers, downloadProjectPdf, sprints } = useProject();
  const [metricView, setMetricView] = useState<'POINTS' | 'COUNT'>('POINTS');

  if (!activeProject) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <p className="text-slate-400 text-sm">Selecione ou crie um projeto para visualizar suas métricas de progresso.</p>
      </div>
    );
  }

  // 1. Task Metrics Calculations
  const totalTasks = activeProjectTasks.length;
  const doneTasks = activeProjectTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = activeProjectTasks.filter((t) => t.status === 'in_progress').length;
  const reviewTasks = activeProjectTasks.filter((t) => t.status === 'review').length;
  const todoTasks = activeProjectTasks.filter((t) => t.status === 'todo').length;
  const backlogTasks = activeProjectTasks.filter((t) => t.status === 'backlog').length;

  const totalStoryPoints = activeProjectTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const doneStoryPoints = activeProjectTasks
    .filter((t) => t.status === 'done')
    .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

  const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const pointsPercentage = totalStoryPoints > 0 ? Math.round((doneStoryPoints / totalStoryPoints) * 100) : 0;

  // 2. Deadline Calculations
  const deadlineInfo = useMemo(() => {
    if (!activeProject.deadline) {
      return {
        hasDeadline: false,
        formattedDate: '',
        daysRemaining: 0,
        isOverdue: false,
        statusBadge: 'Sem prazo definido',
        statusColor: 'bg-slate-800 text-slate-400 border-slate-700',
      };
    }

    const deadlineDate = new Date(activeProject.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusBadge = '';
    let statusColor = '';

    if (activeProject.status === 'COMPLETED') {
      statusBadge = 'Projeto Entregue';
      statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else if (diffDays < 0) {
      statusBadge = `Atrasado por ${Math.abs(diffDays)} dias`;
      statusColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    } else if (diffDays === 0) {
      statusBadge = 'Prazo encerra hoje!';
      statusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else if (diffDays <= 5) {
      statusBadge = `Atenção: ${diffDays} dias restantes`;
      statusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else {
      statusBadge = `No Prazo (${diffDays} dias restantes)`;
      statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }

    return {
      hasDeadline: true,
      formattedDate: deadlineDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      daysRemaining: diffDays,
      isOverdue: diffDays < 0,
      statusBadge,
      statusColor,
    };
  }, [activeProject.deadline, activeProject.status]);

  // 3. Status Distribution Chart Data
  const statusData = [
    { name: 'Backlog', count: backlogTasks, points: activeProjectTasks.filter((t) => t.status === 'backlog').reduce((a, b) => a + (b.storyPoints || 0), 0), color: STATUS_COLORS.backlog },
    { name: 'A Fazer', count: todoTasks, points: activeProjectTasks.filter((t) => t.status === 'todo').reduce((a, b) => a + (b.storyPoints || 0), 0), color: STATUS_COLORS.todo },
    { name: 'Em Progresso', count: inProgressTasks, points: activeProjectTasks.filter((t) => t.status === 'in_progress').reduce((a, b) => a + (b.storyPoints || 0), 0), color: STATUS_COLORS.in_progress },
    { name: 'Em Revisão', count: reviewTasks, points: activeProjectTasks.filter((t) => t.status === 'review').reduce((a, b) => a + (b.storyPoints || 0), 0), color: STATUS_COLORS.review },
    { name: 'Concluído', count: doneTasks, points: doneStoryPoints, color: STATUS_COLORS.done },
  ];

  // 4. Member Workload Data
  const memberWorkloadData = teamMembers.map((member) => {
    const assignedTasks = activeProjectTasks.filter((t) => t.assignees?.includes(member.id));
    const completedTasks = assignedTasks.filter((t) => t.status === 'done');
    const totalPoints = assignedTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    return {
      name: member.name.split(' ')[0],
      fullName: member.name,
      tasksAssigned: assignedTasks.length,
      tasksDone: completedTasks.length,
      pointsAssigned: totalPoints,
      pointsDone: completedPoints,
    };
  });

  // 5. Timeline / Progress Evolution calculated dynamically from Sprints
  const timelineData = useMemo(() => {
    const projectSprints = (sprints || [])
      .filter((s) => s.projectId === activeProject.id)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (projectSprints.length === 0) {
      return [
        { day: 'Início', planejado: totalStoryPoints, realizado: 0 },
        { day: 'Atual', planejado: Math.max(0, totalStoryPoints - doneStoryPoints), realizado: doneStoryPoints },
      ];
    }

    let accumulatedPoints = 0;
    const pointsPerSprint = totalStoryPoints / (projectSprints.length || 1);

    const timeline = [
      { day: 'Início', planejado: totalStoryPoints, realizado: 0 },
    ];

    projectSprints.forEach((sprint, idx) => {
      const sprintTasks = activeProjectTasks.filter((t) => t.sprintId === sprint.id && t.status === 'done');
      const sprintDonePts = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
      accumulatedPoints += sprintDonePts;

      const remainingIdeal = Math.max(0, Math.round(totalStoryPoints - pointsPerSprint * (idx + 1)));

      timeline.push({
        day: sprint.name || `Sprint ${idx + 1}`,
        planejado: remainingIdeal,
        realizado: accumulatedPoints,
      });
    });

    return timeline;
  }, [sprints, activeProject.id, activeProjectTasks, totalStoryPoints, doneStoryPoints]);

  // 6. Priority Distribution Data
  const priorityData = ['Urgente', 'Alta', 'Média', 'Baixa'].map((pri) => ({
    name: pri,
    value: activeProjectTasks.filter((t) => t.priority === pri).length,
    color: PRIORITY_COLORS[pri],
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Progress KPI & Project Info */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> Painel de Progresso e Métricas
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${deadlineInfo.statusColor} flex items-center gap-1`}>
                <Clock className="w-3 h-3" /> {deadlineInfo.statusBadge}
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {activeProject.name}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">{activeProject.description || 'Acompanhamento do ciclo de entrega, produtividade da equipe e vazão de tarefas.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadProjectPdf(activeProject.id)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95"
              title="Baixar Relatório Executivo do Projeto em PDF"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Exportar PDF</span>
            </button>

            {onOpenTaskModal && (
              <button
                type="button"
                onClick={activeProject.status === 'COMPLETED' ? undefined : onOpenTaskModal}
                disabled={activeProject.status === 'COMPLETED'}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
                  activeProject.status === 'COMPLETED'
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                }`}
                title={activeProject.status === 'COMPLETED' ? 'Projeto Concluído: Criação de tarefas bloqueada' : 'Criar Nova Tarefa'}
              >
                <Zap className="w-4 h-4" />
                <span>{activeProject.status === 'COMPLETED' ? 'Projeto Concluído' : '+ Nova Tarefa'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" />
              Taxa Geral de Conclusão do Escopo:
            </span>
            <span className="text-purple-300 font-extrabold text-sm">{pointsPercentage}% ({doneStoryPoints} de {totalStoryPoints} Story Points)</span>
          </div>

          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 transition-all duration-700 shadow-lg shadow-purple-500/20"
              style={{ width: `${Math.min(100, Math.max(progressPercentage, pointsPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tarefas Entregues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-2">
            {doneTasks} <span className="text-xs font-normal text-slate-400">/ {totalTasks} tarefas</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold">
            {progressPercentage}% do volume concluído
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Story Points</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-2">
            {doneStoryPoints} <span className="text-xs font-normal text-slate-400">/ {totalStoryPoints} pts</span>
          </div>
          <div className="text-[11px] text-purple-400 font-bold">
            {totalStoryPoints - doneStoryPoints} pts restantes
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Prazo de Entrega</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white truncate">
            {deadlineInfo.hasDeadline ? deadlineInfo.formattedDate : 'Não cadastrado'}
          </div>
          <div className={`text-[11px] font-bold ${deadlineInfo.isOverdue ? 'text-rose-400' : 'text-cyan-400'}`}>
            {deadlineInfo.hasDeadline ? (deadlineInfo.daysRemaining >= 0 ? `${deadlineInfo.daysRemaining} dias até a entrega` : `Prazo excedido`) : 'Defina um prazo ao criar'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Integrantes Registrados</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-2">
            {teamMembers.length} <span className="text-xs font-normal text-slate-400">/ {activeProject.teamSize} vagas</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-bold">
            {activeProject.activeMethodology} Framework Ativo
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Evolução do Progresso / Curva de Entrega */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Curva de Evolução e Burndown
              </h3>
              <p className="text-[11px] text-slate-400">Ritmo de entrega de Story Points ao longo das iterações.</p>
            </div>
            <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
              {doneStoryPoints} pts entregues
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPlanejado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="realizado" name="Story Points Realizados" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorRealizado)" />
                <Area type="monotone" dataKey="planejado" name="Pontos Restantes (Ideal)" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPlanejado)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Distribuição das Tarefas por Status do Fluxo */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Distribuição por Etapas do Fluxo
              </h3>
              <p className="text-[11px] text-slate-400">Volume de tarefas alocadas em cada coluna.</p>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMetricView('POINTS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${metricView === 'POINTS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Pontos
              </button>
              <button
                type="button"
                onClick={() => setMetricView('COUNT')}
                className={`px-2.5 py-1 rounded-lg transition-all ${metricView === 'COUNT' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Qtd Cards
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar
                  dataKey={metricView === 'POINTS' ? 'points' : 'count'}
                  name={metricView === 'POINTS' ? 'Story Points' : 'Qtd Tarefas'}
                  radius={[6, 6, 0, 0]}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Carga de Trabalho por Integrante Registrado */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Desempenho por Integrante do Time
              </h3>
              <p className="text-[11px] text-slate-400">Tarefas atribuídas e entregues por cada membro cadastrado no projeto.</p>
            </div>
          </div>

          {memberWorkloadData.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">Nenhum integrante associado a tarefas no momento.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberWorkloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="tasksAssigned" name="Tarefas Atribuídas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasksDone" name="Tarefas Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. Distribuição de Prioridades & Resumo do Time */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Níveis de Prioridade do Projeto
              </h3>
              <p className="text-[11px] text-slate-400">Proporção de esforço crítico x rotineiro.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {['Urgente', 'Alta', 'Média', 'Baixa'].map((pri) => {
                const count = activeProjectTasks.filter((t) => t.priority === pri).length;
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={pri} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[pri] }} />
                      <span className="text-xs font-semibold text-slate-300">{pri}</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {count} cards <span className="text-[10px] text-slate-500 font-normal">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};