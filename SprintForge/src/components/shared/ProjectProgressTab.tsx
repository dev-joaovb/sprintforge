import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, CheckCircle2, Clock, Calendar, Users, Target, BarChart2,
  FileText, Layers, Flame, Zap,
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

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  review: 'Em Revisão',
  done: 'Concluído',
};

const PRIORITY_COLORS: Record<string, string> = {
  Baixa: '#64748b',
  Média: '#6366f1',
  Alta: '#f59e0b',
  Urgente: '#ef4444',
};

const chartTooltipStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#cbd5e1',
  borderRadius: '0.75rem',
  color: '#0f172a',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  fontSize: '12px',
};

export const ProjectProgressTab: React.FC<ProjectProgressTabProps> = ({ onOpenTaskModal }) => {
  const { activeProject, activeProjectTasks, teamMembers, downloadProjectPdf, sprints } = useProject();
  const [metricView, setMetricView] = useState<'POINTS' | 'COUNT'>('POINTS');

  if (!activeProject) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">Selecione ou crie um projeto para visualizar suas métricas de progresso.</p>
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
  let deadlineInfo = {
    hasDeadline: Boolean(activeProject.deadline),
    formattedDate: '',
    daysRemaining: 0,
    isOverdue: false,
    statusBadge: 'Sem prazo definido',
    statusColor: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  if (activeProject.deadline) {
    const deadlineDate = new Date(activeProject.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    deadlineInfo.formattedDate = deadlineDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    deadlineInfo.daysRemaining = diffDays;
    deadlineInfo.isOverdue = diffDays < 0;

    if (activeProject.status === 'COMPLETED') {
      deadlineInfo.statusBadge = 'Projeto Entregue';
      deadlineInfo.statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (diffDays < 0) {
      deadlineInfo.statusBadge = `Atrasado por ${Math.abs(diffDays)} dias`;
      deadlineInfo.statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (diffDays === 0) {
      deadlineInfo.statusBadge = 'Prazo encerra hoje!';
      deadlineInfo.statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (diffDays <= 5) {
      deadlineInfo.statusBadge = `Atenção: ${diffDays} dias restantes`;
      deadlineInfo.statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      deadlineInfo.statusBadge = `No Prazo (${diffDays} dias restantes)`;
      deadlineInfo.statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  }

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

  // 5. Timeline / Progress Simulation Curve
  const timelineData = [
    { day: 'Início', planejado: totalStoryPoints || 20, realizado: 0 },
    { day: 'Semana 1', planejado: Math.round((totalStoryPoints || 20) * 0.8), realizado: Math.round(doneStoryPoints * 0.25) },
    { day: 'Semana 2', planejado: Math.round((totalStoryPoints || 20) * 0.5), realizado: Math.round(doneStoryPoints * 0.6) },
    { day: 'Semana 3', planejado: Math.round((totalStoryPoints || 20) * 0.2), realizado: Math.round(doneStoryPoints * 0.85) },
    { day: 'Atual', planejado: 0, realizado: doneStoryPoints },
  ];

  // 6. Priority Distribution Data
  const priorityData = ['Urgente', 'Alta', 'Média', 'Baixa'].map((pri) => ({
    name: pri,
    value: activeProjectTasks.filter((t) => t.priority === pri).length,
    color: PRIORITY_COLORS[pri],
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Progress KPI & Project Info */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                <BarChart2 className="h-3.5 w-3.5" /> Painel de Progresso e Métricas
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${deadlineInfo.statusColor}`}>
                <Clock className="h-3 w-3" /> {deadlineInfo.statusBadge}
              </span>
            </div>
            <h2 className="break-words text-2xl font-extrabold tracking-tight text-slate-900">{activeProject.name}</h2>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-600">
              {activeProject.description || 'Acompanhamento do ciclo de entrega, produtividade da equipe e vazão de tarefas.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadProjectPdf(activeProject.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              title="Baixar Relatório Executivo do Projeto em PDF"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Exportar PDF</span>
            </button>

            {onOpenTaskModal && (
              <button
                onClick={activeProject.status === 'COMPLETED' ? undefined : onOpenTaskModal}
                disabled={activeProject.status === 'COMPLETED'}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  activeProject.status === 'COMPLETED'
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : 'border-blue-600 bg-blue-600 text-white shadow-sm hover:border-blue-700 hover:bg-blue-700'
                }`}
                title={activeProject.status === 'COMPLETED' ? 'Projeto Concluído: Criação de tarefas bloqueada' : 'Criar Nova Tarefa'}
              >
                <Zap className="h-4 w-4" />
                <span>{activeProject.status === 'COMPLETED' ? 'Projeto Concluído' : '+ Nova Tarefa'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-2 border-t border-slate-200 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Target className="h-4 w-4 text-blue-600" />
              Taxa Geral de Conclusão do Escopo:
            </span>
            <span className="text-sm font-extrabold text-blue-700">
              {pointsPercentage}% ({doneStoryPoints} de {totalStoryPoints} Story Points)
            </span>
          </div>
          <div
            className="h-3.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5"
            role="progressbar"
            aria-label="Progresso geral do escopo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(100, Math.max(progressPercentage, pointsPercentage))}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(progressPercentage, pointsPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Tarefas Entregues</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 text-2xl font-black text-slate-900">
            {doneTasks} <span className="text-xs font-normal text-slate-500">/ {totalTasks} tarefas</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-700">{progressPercentage}% do volume concluído</div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Story Points</span>
            <Flame className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 text-2xl font-black text-slate-900">
            {doneStoryPoints} <span className="text-xs font-normal text-slate-500">/ {totalStoryPoints} pts</span>
          </div>
          <div className="text-[11px] font-bold text-blue-700">{totalStoryPoints - doneStoryPoints} pts restantes</div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Prazo de Entrega</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="truncate text-base font-bold text-slate-900">
            {deadlineInfo.hasDeadline ? deadlineInfo.formattedDate : 'Não cadastrado'}
          </div>
          <div className={`text-[11px] font-bold ${deadlineInfo.isOverdue ? 'text-rose-700' : 'text-blue-700'}`}>
            {deadlineInfo.hasDeadline ? (deadlineInfo.daysRemaining >= 0 ? `${deadlineInfo.daysRemaining} dias até a entrega` : `Prazo excedido`) : 'Defina um prazo ao criar'}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Integrantes Registrados</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 text-2xl font-black text-slate-900">
            {teamMembers.length} <span className="text-xs font-normal text-slate-500">/ {activeProject.teamSize} vagas</span>
          </div>
          <div className="text-[11px] font-bold text-blue-700">{activeProject.activeMethodology} Framework Ativo</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Evolução do Progresso / Curva de Entrega */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <TrendingUp className="h-4 w-4 text-blue-600" /> Curva de Evolução e Burndown
              </h3>
              <p className="text-[11px] text-slate-600">Ritmo de entrega de Story Points ao longo das iterações.</p>
            </div>
            <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              {doneStoryPoints} pts entregues
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPlanejado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                <Area type="monotone" dataKey="realizado" name="Story Points Realizados" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRealizado)" />
                <Area type="monotone" dataKey="planejado" name="Pontos Restantes (Ideal)" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPlanejado)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Distribuição das Tarefas por Status do Fluxo */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Layers className="h-4 w-4 text-blue-600" /> Distribuição por Etapas do Fluxo
              </h3>
              <p className="text-[11px] text-slate-600">Volume de tarefas alocadas em cada coluna.</p>
            </div>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMetricView('POINTS')}
                aria-pressed={metricView === 'POINTS'}
                className={`rounded-lg px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${metricView === 'POINTS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
              >
                Pontos
              </button>
              <button
                type="button"
                onClick={() => setMetricView('COUNT')}
                aria-pressed={metricView === 'COUNT'}
                className={`rounded-lg px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${metricView === 'COUNT' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
              >
                Qtd Cards
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={chartTooltipStyle} />
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
        <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users className="h-4 w-4 text-blue-600" /> Desempenho por Integrante do Time
              </h3>
              <p className="text-[11px] text-slate-600">Tarefas atribuídas e entregues por cada membro cadastrado no projeto.</p>
            </div>
          </div>

          {memberWorkloadData.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">Nenhum integrante associado a tarefas no momento.</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberWorkloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                  <Bar dataKey="tasksAssigned" name="Tarefas Atribuídas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasksDone" name="Tarefas Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 4. Distribuição de Prioridades & Resumo do Time */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Flame className="h-4 w-4 text-amber-600" /> Níveis de Prioridade do Projeto
              </h3>
              <p className="text-[11px] text-slate-600">Proporção de esforço crítico x rotineiro.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
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
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {['Urgente', 'Alta', 'Média', 'Baixa'].map((pri) => {
                const count = activeProjectTasks.filter((t) => t.priority === pri).length;
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={pri} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[pri] }} />
                      <span className="text-xs font-semibold text-slate-700">{pri}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {count} cards <span className="text-[10px] font-normal text-slate-500">({percentage}%)</span>
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
