import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const StrictDragDropContext = DragDropContext as any;
const StrictDroppable = Droppable as any;
const StrictDraggable = Draggable as any;

import { useProject } from '../../context/ProjectContext';
import { ProjectMethodologyBar } from '../shared/ProjectMethodologyBar';
import { MethodologyGuideModal } from '../shared/MethodologyGuideModal';
import { ProjectProgressTab } from '../shared/ProjectProgressTab';
import { TabExplainer } from '../shared/TabExplainer';
import { KanbanColumnId, Task, TaskPriority } from '../../types';
import {
  Kanban as KanbanIcon,
  AlertTriangle,
  Clock,
  Plus,
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  HelpCircle,
  BarChart2,
} from 'lucide-react';

interface KanbanModuleProps {
  onOpenTaskModal: (task?: Task) => void;
  onToggleChat?: () => void;
}

export const KanbanModule: React.FC<KanbanModuleProps> = ({ onOpenTaskModal, onToggleChat }) => {
  const {
    activeProject,
    activeProjectTasks,
    moveTaskStatus,
    updateProjectWipLimits,
    teamMembers,
  } = useProject();

  const [activeTab, setActiveTab] = useState<'BOARD' | 'METRICS' | 'PROGRESS'>('BOARD');
  const [editingWip, setEditingWip] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [tempWipLimits, setTempWipLimits] = useState(
    activeProject?.wipLimits || {
      backlog: 15,
      todo: 5,
      in_progress: 3,
      review: 2,
      done: 50,
    }
  );

  const columns: { id: KanbanColumnId; title: string; color: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'bg-slate-400' },
    { id: 'todo', title: 'A Fazer', color: 'bg-blue-500' },
    { id: 'in_progress', title: 'Em Progresso', color: 'bg-violet-500' },
    { id: 'review', title: 'Em Revisão', color: 'bg-amber-500' },
    { id: 'done', title: 'Concluído', color: 'bg-emerald-500' },
  ];

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newColumnId = destination.droppableId as KanbanColumnId;
    moveTaskStatus(draggableId, newColumnId);
  };

  const handleSaveWipLimits = () => {
    if (activeProject) {
      updateProjectWipLimits(activeProject.id, tempWipLimits);
      setEditingWip(false);
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgente':
        return <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">Urgente</span>;
      case 'Alta':
        return <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Alta</span>;
      case 'Média':
        return <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">Média</span>;
      case 'Baixa':
        return <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Baixa</span>;
    }
  };

  // Metrics Calculation
  const completedTasks = activeProjectTasks.filter((t) => t.status === 'done');

  // Calculate average Lead Time & Cycle Time (simulated calculation)
  const avgLeadTimeDays = completedTasks.length > 0 ? 3.4 : 0;
  const avgCycleTimeDays = completedTasks.length > 0 ? 1.8 : 0;

  return (
    <div className="space-y-6">
      {/* Project Methodology Isolation Bar */}
      <ProjectMethodologyBar
        currentModule="KANBAN"
        onOpenTaskModal={() => onOpenTaskModal()}
        onToggleChat={onToggleChat}
      />

      {/* Kanban Header & WIP Controls Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <KanbanIcon className="h-3.5 w-3.5" /> Módulo Kanban de Fluxo Contínuo
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Quadro Trello & Limitação de WIP</h2>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                title="Saber mais sobre Kanban de Fluxo Contínuo"
              >
                <HelpCircle className="h-4 w-4" /> <span>Guia Kanban</span>
              </button>
            </div>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-600">
              Arraste e solte os cards entre as colunas. O sistema emitirá alertas visuais em tempo real caso o limite de Work-In-Progress seja violado!
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:w-auto">
            <div className="border-r border-slate-200 px-3 text-center">
              <div className="text-xl font-extrabold text-slate-900">{avgLeadTimeDays} dias</div>
              <div className="text-[10px] font-medium uppercase text-slate-500">Lead Time Médio</div>
            </div>
            <div className="px-3 text-center">
              <div className="text-xl font-extrabold text-slate-900">{avgCycleTimeDays} dias</div>
              <div className="text-[10px] font-medium uppercase text-slate-500">Cycle Time Médio</div>
            </div>
            <button
              onClick={() => setEditingWip(!editingWip)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
              <span>Limites WIP</span>
            </button>
          </div>
        </div>

        {/* WIP Limits Edit Panel */}
        {editingWip && (
          <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Ajustar Limite de Trabalho em Andamento (WIP):</h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {columns.map((col) => (
                <div key={col.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">{col.title}</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tempWipLimits[col.id] || 3}
                    onChange={(e) => setTempWipLimits({ ...tempWipLimits, [col.id]: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingWip(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onClick={handleSaveWipLimits} className="rounded-lg bg-[#2563EB] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1D4ED8]">Salvar Limites</button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher: Board vs Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('BOARD')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'BOARD'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <KanbanIcon className="h-4 w-4" /> Quadro Drag & Drop
          </button>
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'METRICS'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Métricas de Fluxo & Gargalos
          </button>
          <button
            onClick={() => setActiveTab('PROGRESS')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'PROGRESS'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="h-4 w-4" /> Progresso & Métricas
          </button>
        </div>

        <button
          onClick={() => onOpenTaskModal()}
          className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Criar Card
        </button>
      </div>

      {/* Tab 1: Drag and Drop Kanban Board */}
      {activeTab === 'BOARD' && (
        <div className="space-y-4">
          <TabExplainer
            title="Quadro de Fluxo Contínuo & Limites WIP"
            badge="Puxar ao invés de Empurrar"
            methodology="KANBAN"
            summary="O quadro Kanban visualiza a passagem contínua de tarefas através de colunas de trabalho. Ao limitar a quantidade de itens simultâneos em andamento (WIP - Work In Progress), a equipe previne sobrecargas, expõe gargalos operacionais e acelera o tempo de entrega."
            howItWorks={[
              'Arraste e solte os cards entre as colunas conforme a evolução da demanda.',
              'Observe as contagens de cards versus limites configurados em cada coluna (ex: 2/3).',
              'Se o limite de uma coluna for ultrapassado, o quadro emitirá um alerta visual destacado.',
              'Clique no botão "Limites WIP" no topo para personalizar as capacidades de cada etapa.'
            ]}
            tips={[
              'Lema do Kanban: "Pare de começar e comece a terminar".',
              'Quando uma coluna atingir o limite WIP, foque em ajudar a desobstruir os cards daquela etapa antes de puxar novos itens.'
            ]}
          />

          {activeProjectTasks.length === 0 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-slate-700 sm:flex-row">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <span className="block font-bold text-slate-900">Quadro Kanban Limpo</span>
                  <span className="text-[11px] text-slate-600">Nenhuma tarefa cadastrada neste projeto. Clique no botão ao lado para criar sua primeira demanda.</span>
                </div>
              </div>
              <button
                onClick={() => onOpenTaskModal()}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                <Plus className="h-4 w-4 stroke-[3]" /> + Criar Primeira Tarefa
              </button>
            </div>
          )}

          <StrictDragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 items-start gap-4 overflow-x-auto pb-4 md:grid-cols-3 lg:grid-cols-5">
              {columns.map((col) => {
                const colTasks = activeProjectTasks.filter((t) => t.status === col.id);
                const limit = activeProject?.wipLimits[col.id] || 3;
                const isOverWip = colTasks.length > limit;

                return (
                  <div
                    key={col.id}
                    className={`min-w-0 space-y-3 rounded-2xl border p-3.5 transition-colors ${
                      isOverWip
                        ? 'border-rose-300 bg-rose-50 ring-1 ring-rose-200'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${col.color}`} />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">{col.title}</h3>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${
                        isOverWip ? 'bg-rose-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
                      }`}>
                        {colTasks.length} / {limit}
                      </span>
                    </div>

                    {/* WIP Violation Alert Warning Banner */}
                    {isOverWip && (
                      <div className="flex items-start gap-1.5 rounded-xl border border-rose-200 bg-rose-100 p-2 text-[11px] font-semibold text-rose-800">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <span>Limite de WIP Excedido! Alerte a equipe para desbloquear gargalos antes de puxar novas tarefas.</span>
                      </div>
                    )}

                    {/* Droppable Task Container */}
                    <StrictDroppable droppableId={col.id}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[350px] space-y-3 rounded-xl p-1 transition-colors ${
                            snapshot.isDraggingOver ? 'border border-dashed border-blue-300 bg-blue-50' : ''
                          }`}
                        >
                          {colTasks.length === 0 ? (
                            <div className="my-2 space-y-2 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center">
                              <span className="block text-[11px] font-semibold text-slate-500">Coluna Vazia</span>
                              {(col.id === 'backlog' || col.id === 'todo') && (
                                <button
                                  onClick={() => onOpenTaskModal()}
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
                                >
                                  + Criar Tarefa
                                </button>
                              )}
                            </div>
                          ) : (
                            colTasks.map((task, index) => {
                              const assignees = teamMembers.filter((m) => task.assignees.includes(m.id));

                              return (
                                <StrictDraggable key={task.id} draggableId={String(task.id)} index={index}>
                                  {(provided: any, snapshot: any) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => onOpenTaskModal(task)}
                                      className={`group cursor-grab space-y-2.5 rounded-xl border bg-white p-3.5 shadow-sm transition-all duration-150 active:cursor-grabbing ${
                                        snapshot.isDragging
                                          ? 'z-50 scale-[1.02] border-blue-400 shadow-xl ring-2 ring-blue-200'
                                          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="line-clamp-2 text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-700">
                                          {task.title}
                                        </span>
                                        {getPriorityBadge(task.priority)}
                                      </div>

                                      {task.description && (
                                        <p className="line-clamp-2 text-[11px] text-slate-600">{task.description}</p>
                                      )}

                                      {/* Tags */}
                                      {task.tags && task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {task.tags.map((tag, tIdx) => (
                                            <span key={tIdx} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {/* Footer Info: Story Points + Assignees */}
                                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                                        <span className="font-bold text-slate-500">
                                          {task.storyPoints ? `${task.storyPoints} pts` : ''}
                                        </span>
                                        <div className="flex -space-x-1.5 overflow-hidden">
                                          {assignees.map((m) => (
                                            <img
                                              key={m.id}
                                              src={m.avatar}
                                              alt={m.name}
                                              title={m.name}
                                              className="inline-block h-6 w-6 rounded-full object-cover ring-2 ring-white"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </StrictDraggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictDroppable>
                  </div>
                );
              })}
            </div>
          </StrictDragDropContext>
        </div>
      )}

      {/* Tab 2: Flow Metrics & Throughput */}
      {activeTab === 'METRICS' && (
        <div className="space-y-6">
          <TabExplainer
            title="Métricas de Fluxo, Eficiência & Gargalos"
            badge="Lean & Kanban Metrics"
            methodology="KANBAN"
            summary="Métricas quantitativas essenciais para avaliar a saúde do fluxo de entrega: Lead Time (tempo do pedido à entrega), Cycle Time (tempo de desenvolvimento ativo), Throughput (vazão de entrega semanal) e Eficiência de Fluxo."
            howItWorks={[
              'Analise o Lead Time Médio para saber quanto tempo o cliente espera desde a criação da demanda.',
              'Acompanhe o Cycle Time Médio para medir a agilidade do time ao codificar e testar a tarefa.',
              'Monitore a Vazão Semanal (Throughput) para projetar datas de entregas futuras com base no histórico real.',
              'Identifique gargalos nas colunas intermediárias para equilibrar o ritmo de trabalho.'
            ]}
            tips={[
              'Trabalhe para reduzir a diferença entre Lead Time e Cycle Time, eliminando tempos mortos de espera.',
              'Evite flutuações bruscas no Throughput mantendo o tamanho dos cards homogêneo.'
            ]}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Clock className="h-5 w-5 text-blue-600" /> Lead Time vs. Cycle Time
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                **Lead Time:** Tempo total decorrido desde a criação do pedido pelo cliente até a entrega final.<br />
                **Cycle Time:** Tempo ativo em que os desenvolvedores estiveram trabalhando no card (Em Progresso → Concluído).
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-black text-slate-900">3.4 dias</div>
                  <div className="text-xs font-bold text-slate-500">Lead Time Médio</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-black text-slate-900">1.8 dias</div>
                  <div className="text-xs font-bold text-slate-500">Cycle Time Médio</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <TrendingUp className="h-5 w-5 text-blue-600" /> Vazão Semanal (Throughput)
              </h3>
              <p className="text-xs text-slate-600">Quantidade de itens concluídos por semana útil de trabalho.</p>
              <div className="flex items-center justify-around rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900">14</div>
                  <div className="text-xs text-slate-500">Cards/Semana</div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <div className="text-3xl font-extrabold text-slate-900">92%</div>
                  <div className="text-xs text-slate-500">Eficiência de Fluxo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Project Progress & Metrics */}
      {activeTab === 'PROGRESS' && (
        <div className="space-y-6">
          <TabExplainer
            title="Progresso & Métricas do Projeto Kanban"
            badge="Visão Geral Analítica"
            methodology="KANBAN"
            summary="Acompanhamento analítico da evolução do projeto Kanban com gráficos Recharts de conclusão de cards, análise de esforço e equilíbrio de fluxo."
            howItWorks={[
              'Consulte a distribuição de status dos cards no gráfico Donut.',
              'Monitore a velocidade e taxa de entrega acumulada ao longo dos dias.',
              'Acompanhe o balanço de prioridades (Crítica, Alta, Média, Baixa).'
            ]}
            tips={[
              'Use os gráficos de progresso nas reuniões de reabastecimento (Replenishment) do Kanban para planejar os próximos passos.'
            ]}
          />
          <ProjectProgressTab onOpenTaskModal={onOpenTaskModal} />
        </div>
      )}

      <MethodologyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialMethodology="KANBAN"
      />
    </div>
  );
};
