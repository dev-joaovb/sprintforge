import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, KanbanColumnId, TaskPriority } from '../../types';
import { X, ListTodo, Trash2, Layers, Repeat, AlertTriangle, Lock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { addTask, updateTask, deleteTask, teamMembers, activeSprint, activeProject } = useProject();

  const isCompleted = taskToEdit?.status === 'done';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState<'PRODUCT_BACKLOG' | 'SPRINT_BACKLOG'>('PRODUCT_BACKLOG');
  const [status, setStatus] = useState<KanbanColumnId>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('Média');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setStoryPoints(taskToEdit.storyPoints || 3);
      setSelectedAssignees(taskToEdit.assignees || []);
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(', ') : '');
      setDestination(taskToEdit.sprintId && !taskToEdit.inBacklog ? 'SPRINT_BACKLOG' : 'PRODUCT_BACKLOG');
    } else {
      setTitle('');
      setDescription('');
      // Default to Product Backlog and backlog status!
      setStatus('backlog');
      setDestination('PRODUCT_BACKLOG');
      setPriority('Média');
      setStoryPoints(3);
      setSelectedAssignees(teamMembers[0] ? [teamMembers[0].id] : []);
      setTagsInput('Geral');
    }
  }, [taskToEdit, isOpen, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) return; // Prevent any update on completed tasks
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isProductBacklog = destination === 'PRODUCT_BACKLOG' || (status as string) === 'backlog';

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title,
        description,
        status: isProductBacklog ? 'backlog' : (status as string) === 'backlog' ? 'todo' : status,
        priority,
        storyPoints,
        assignees: selectedAssignees,
        tags: tagsArray,
        sprintId: isProductBacklog ? null : (taskToEdit.sprintId || activeSprint?.id || null),
        inBacklog: isProductBacklog,
      });
    } else {
      addTask({
        title,
        description,
        status: isProductBacklog ? 'backlog' : (status as string) === 'backlog' ? 'todo' : status,
        priority,
        storyPoints,
        assignees: selectedAssignees,
        tags: tagsArray,
        sprintId: isProductBacklog ? null : (activeSprint?.id || null),
        inBacklog: isProductBacklog,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit && confirm('Deseja realmente excluir este card de tarefa?')) {
      deleteTask(taskToEdit.id);
      onClose();
    }
  };

  const toggleAssignee = (id: string) => {
    if (isCompleted) return;
    if (selectedAssignees.includes(id)) {
      setSelectedAssignees(selectedAssignees.filter((mId) => mId !== id));
    } else {
      setSelectedAssignees([...selectedAssignees, id]);
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
  const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="relative flex max-h-[min(92dvh,900px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
              <ListTodo className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 id="task-modal-title" className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
                {taskToEdit ? (isCompleted ? 'Detalhes da Tarefa (Concluída)' : 'Editar Card de Tarefa') : 'Criar Nova Tarefa'}
              </h3>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <Lock className="h-3 w-3" /> Bloqueada
                </span>
              ) : (
                <p className="text-xs text-slate-500">Defina os detalhes e o destino da tarefa.</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de tarefa"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-4">
            {isCompleted && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-amber-900">Tarefa Concluída e Bloqueada para Alterações:</span>
                  <p className="leading-relaxed text-amber-800">
                    Esta tarefa já foi entregue e finalizada. Por integridade do histórico do Scrum, itens concluídos não podem sofrer modificações.
                  </p>
                </div>
              </div>
            )}

            {taskToEdit?.isOverdue && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-rose-900">Tarefa Atrasada:</span>{' '}
                  <span className="text-rose-800">
                    {taskToEdit.overdueNotice || `Esta tarefa não foi concluída durante a ${taskToEdit.overdueFromSprint || 'Sprint anterior'} e foi replanejada.`}
                  </span>
                </div>
              </div>
            )}

            <form id="task-modal-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Destino Inicial da Tarefa *</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isCompleted}
                    aria-pressed={destination === 'PRODUCT_BACKLOG'}
                    onClick={() => {
                      setDestination('PRODUCT_BACKLOG');
                      setStatus('backlog');
                    }}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                      destination === 'PRODUCT_BACKLOG'
                        ? 'border-blue-500 bg-blue-50 text-slate-900 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <Layers className={`mt-0.5 h-4 w-4 shrink-0 ${destination === 'PRODUCT_BACKLOG' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold">Product Backlog (Padrão)</div>
                      <div className="mt-1 text-[11px] leading-snug text-slate-500">Passa primeiro pelo refinamento</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!activeSprint || isCompleted}
                    aria-pressed={destination === 'SPRINT_BACKLOG'}
                    onClick={() => {
                      setDestination('SPRINT_BACKLOG');
                      if (status === 'backlog') setStatus('todo');
                    }}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${
                      destination === 'SPRINT_BACKLOG'
                        ? 'border-blue-500 bg-blue-50 text-slate-900 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <Repeat className={`mt-0.5 h-4 w-4 shrink-0 ${destination === 'SPRINT_BACKLOG' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold">Sprint Backlog</div>
                      <div className="mt-1 text-[11px] leading-snug text-slate-500">
                        {activeSprint ? activeSprint.name : 'Nenhuma sprint ativa'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="task-title" className={labelClass}>Título da Tarefa *</label>
                <input
                  id="task-title"
                  type="text"
                  required
                  disabled={isCompleted}
                  placeholder="Ex: Implementar Webhook de Pagamento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="task-description" className={labelClass}>Descrição / Detalhes</label>
                <textarea
                  id="task-description"
                  rows={3}
                  disabled={isCompleted}
                  placeholder="Critérios de aceite, observações de arquitetura..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="task-status" className={labelClass}>Coluna / Status</label>
                  <select
                    id="task-status"
                    disabled={isCompleted}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as KanbanColumnId)}
                    className={inputClass}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="review">Em Revisão</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-priority" className={labelClass}>Prioridade</label>
                  <select
                    id="task-priority"
                    disabled={isCompleted}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className={inputClass}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente ⚡</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-points" className={labelClass}>Story Points</label>
                  <select
                    id="task-points"
                    disabled={isCompleted}
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(parseInt(e.target.value))}
                    className={inputClass}
                  >
                    <option value={1}>1 pt</option>
                    <option value={2}>2 pts</option>
                    <option value={3}>3 pts</option>
                    <option value={5}>5 pts</option>
                    <option value={8}>8 pts</option>
                    <option value={13}>13 pts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Responsáveis</label>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((m) => {
                    const isAssigned = selectedAssignees.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={isCompleted}
                        aria-pressed={isAssigned}
                        onClick={() => toggleAssignee(m.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                          isAssigned
                            ? 'border-blue-500 bg-blue-50 font-semibold text-blue-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <img src={m.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                        <span>{m.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="task-tags" className={labelClass}>Tags (Separadas por vírgula)</label>
                <input
                  id="task-tags"
                  type="text"
                  disabled={isCompleted}
                  placeholder="Ex: API, Segurança, Pix, Frontend"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={inputClass}
                />
              </div>
            </form>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {taskToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Excluir Card"
            >
              <Trash2 className="h-4 w-4" /> Excluir Tarefa
            </button>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {isCompleted ? 'Fechar' : 'Cancelar'}
            </button>
            {isCompleted ? (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-500"
              >
                <Lock className="h-3.5 w-3.5" /> Tarefa Concluída (Bloqueada)
              </button>
            ) : (
              <button
                type="submit"
                form="task-modal-form"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
