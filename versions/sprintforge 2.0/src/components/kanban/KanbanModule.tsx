import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const StrictDragDropContext = DragDropContext as any;
const StrictDroppable = Droppable as any;
const StrictDraggable = Draggable as any;

import { useProject } from '../../context/ProjectContext';
import { ProjectMethodologyBar } from '../shared/ProjectMethodologyBar';
import { MethodologyGuideModal } from '../shared/MethodologyGuideModal';
import { KanbanColumnId, Task, TaskPriority } from '../../types';
import {
  Kanban as KanbanIcon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  BarChart3,
  Flame,
  User,
  Sparkles,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  HelpCircle,
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

  const [activeTab, setActiveTab] = useState<'BOARD' | 'METRICS'>('BOARD');
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
    { id: 'backlog', title: 'Backlog', color: 'border-slate-700/80 text-slate-400' },
    { id: 'todo', title: 'A Fazer', color: 'border-indigo-500/30 text-indigo-400' },
    { id: 'in_progress', title: 'Em Progresso', color: 'border-purple-500/30 text-purple-400' },
    { id: 'review', title: 'Em Revisão', color: 'border-amber-500/30 text-amber-400' },
    { id: 'done', title: 'Concluído', color: 'border-emerald-500/30 text-emerald-400' },
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
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">Urgente</span>;
      case 'Alta':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Alta</span>;
      case 'Média':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Média</span>;
      case 'Baixa':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">Baixa</span>;
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <KanbanIcon className="w-3.5 h-3.5" /> Módulo Kanban de Fluxo Contínuo
            </div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Quadro Trello & Limitação de WIP
              <button
                onClick={() => setIsGuideOpen(true)}
                className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
                title="Saber mais sobre Kanban de Fluxo Contínuo"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Guia Kanban</span>
              </button>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Arraste e solte os cards entre as colunas. O sistema emitirá alertas visuais em tempo real caso o limite de Work-In-Progress seja violado!
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xl font-extrabold text-emerald-400">{avgLeadTimeDays} dias</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">Lead Time Médio</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xl font-extrabold text-cyan-400">{avgCycleTimeDays} dias</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">Cycle Time Médio</div>
            </div>
            <button
              onClick={() => setEditingWip(!editingWip)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Limites WIP</span>
            </button>
          </div>
        </div>

        {/* WIP Limits Edit Panel */}
        {editingWip && (
          <div className="mt-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ajustar Limite de Trabalho em Andamento (WIP):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {columns.map((col) => (
                <div key={col.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">{col.title}</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tempWipLimits[col.id] || 3}
                    onChange={(e) => setTempWipLimits({ ...tempWipLimits, [col.id]: parseInt(e.target.value) || 1 })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white text-center font-bold"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingWip(false)} className="px-3 py-1 text-xs text-slate-400">Cancelar</button>
              <button onClick={handleSaveWipLimits} className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400">
                Salvar Limites
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher: Board vs Metrics */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('BOARD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'BOARD'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <KanbanIcon className="w-4 h-4" /> Quadro Drag & Drop
          </button>
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'METRICS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Métricas de Fluxo & Gargalos
          </button>
        </div>

        <button
          onClick={() => onOpenTaskModal()}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Criar Card
        </button>
      </div>

      {/* Tab 1: Drag and Drop Kanban Board */}
      {activeTab === 'BOARD' && (
        <div className="space-y-4">
          {activeProjectTasks.length === 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Quadro Kanban Limpo</span>
                  <span className="text-slate-400 text-[11px]">
                    Nenhuma tarefa cadastrada neste projeto. Clique no botão ao lado para criar sua primeira demanda.
                  </span>
                </div>
              </div>
              <button
                onClick={() => onOpenTaskModal()}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shrink-0 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> + Criar Primeira Tarefa
              </button>
            </div>
          )}

          <StrictDragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
              {columns.map((col) => {
                const colTasks = activeProjectTasks.filter((t) => t.status === col.id);
                const limit = activeProject?.wipLimits[col.id] || 3;
                const isOverWip = colTasks.length > limit;

                return (
                  <div
                    key={col.id}
                    className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all space-y-3 min-w-[260px] ${
                      isOverWip
                        ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/50'
                        : 'border-slate-800/80'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[0].replace('border-', 'bg-')}`} />
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.title}</h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                            isOverWip
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {colTasks.length} / {limit}
                        </span>
                      </div>
                    </div>

                    {/* WIP Violation Alert Warning Banner */}
                    {isOverWip && (
                      <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-[11px] font-semibold text-rose-300 flex items-start gap-1.5 animate-bounce">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <span>Limite de WIP Excedido! Alerte a equipe para desbloquear gargalos antes de puxar novas tarefas.</span>
                      </div>
                    )}

                    {/* Droppable Task Container */}
                    <StrictDroppable droppableId={col.id}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[350px] p-1 rounded-xl transition-colors ${
                            snapshot.isDraggingOver ? 'bg-slate-800/40 border border-dashed border-emerald-500/40' : ''
                          }`}
                        >
                          {colTasks.length === 0 ? (
                            <div className="p-4 text-center border border-dashed border-slate-800/80 rounded-xl space-y-2 bg-slate-950/30 my-2">
                              <span className="text-[11px] font-semibold text-slate-500 block">Coluna Vazia</span>
                              {(col.id === 'backlog' || col.id === 'todo') && (
                                <button
                                  onClick={() => onOpenTaskModal()}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[10px] font-bold transition-all border border-emerald-500/30"
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
                                  className={`p-3.5 rounded-xl bg-slate-950 border transition-all duration-150 cursor-grab active:cursor-grabbing space-y-2.5 shadow-md group ${
                                    snapshot.isDragging
                                      ? 'border-emerald-500 bg-slate-900 shadow-2xl scale-105 z-50 ring-2 ring-emerald-400'
                                      : 'border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                      {task.title}
                                    </span>
                                    {getPriorityBadge(task.priority)}
                                  </div>

                                  {task.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>
                                  )}

                                  {/* Tags */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {task.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Footer Info: Story Points + Assignees */}
                                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-400">
                                      {task.storyPoints ? `${task.storyPoints} pts` : ''}
                                    </span>

                                    <div className="flex -space-x-1.5 overflow-hidden">
                                      {assignees.map((m) => (
                                        <img
                                          key={m.id}
                                          src={m.avatar}
                                          alt={m.name}
                                          title={m.name}
                                          className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-950 object-cover"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Lead Time vs. Cycle Time
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              **Lead Time:** Tempo total decorrido desde a criação do pedido pelo cliente até a entrega final.<br />
              **Cycle Time:** Tempo ativo em que os desenvolvedores estiveram trabalhando no card (Em Progresso → Concluído).
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400">3.4 dias</div>
                <div className="text-xs font-bold text-slate-400">Lead Time Médio</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-2xl font-black text-cyan-400">1.8 dias</div>
                <div className="text-xs font-bold text-slate-400">Cycle Time Médio</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Vazão Semanal (Throughput)
            </h3>
            <p className="text-xs text-slate-400">Quantidade de itens concluídos por semana útil de trabalho.</p>

            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around text-center">
              <div>
                <div className="text-3xl font-extrabold text-purple-400">14</div>
                <div className="text-xs text-slate-400">Cards/Semana</div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div>
                <div className="text-3xl font-extrabold text-emerald-400">92%</div>
                <div className="text-xs text-slate-400">Eficiência de Fluxo</div>
              </div>
            </div>
          </div>
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
