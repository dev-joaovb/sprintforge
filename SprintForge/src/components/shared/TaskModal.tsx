import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, KanbanColumnId, TaskPriority } from '../../types';
import { X, ListTodo, Trash2, CheckCircle2, Layers, Repeat, AlertTriangle, Lock } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {taskToEdit ? (isCompleted ? 'Detalhes da Tarefa (Concluída)' : 'Editar Card de Tarefa') : 'Criar Nova Tarefa'}
              {isCompleted && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Bloqueada
                </span>
              )}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Task Lock Notice */}
        {isCompleted && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-amber-300">Tarefa Concluída e Bloqueada para Alterações:</span>
              <p className="text-amber-200/80 leading-relaxed text-[11px]">
                Esta tarefa já foi entregue e finalizada. Por integridade do histórico do Scrum, itens concluídos não podem sofrer modificações.
              </p>
            </div>
          </div>
        )}

        {taskToEdit?.isOverdue && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-rose-300">Tarefa Atrasada:</span>{' '}
              <span className="text-rose-200/80">
                {taskToEdit.overdueNotice || `Esta tarefa não foi concluída durante a ${taskToEdit.overdueFromSprint || 'Sprint anterior'} e foi replanejada.`}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Destino Inicial da Tarefa *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isCompleted}
                onClick={() => {
                  setDestination('PRODUCT_BACKLOG');
                  setStatus('backlog');
                }}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                  isCompleted ? 'opacity-60 cursor-not-allowed' : ''
                } ${
                  destination === 'PRODUCT_BACKLOG'
                    ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className={`w-4 h-4 mt-0.5 shrink-0 ${destination === 'PRODUCT_BACKLOG' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Product Backlog (Padrão)</div>
                  <div className="text-[10px] text-slate-400">Passa primeiro pelo refinamento</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!activeSprint || isCompleted}
                onClick={() => {
                  setDestination('SPRINT_BACKLOG');
                  if (status === 'backlog') setStatus('todo');
                }}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                  !activeSprint || isCompleted
                    ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600'
                    : destination === 'SPRINT_BACKLOG'
                    ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Repeat className={`w-4 h-4 mt-0.5 shrink-0 ${destination === 'SPRINT_BACKLOG' ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Sprint Backlog</div>
                  <div className="text-[10px] text-slate-400">
                    {activeSprint ? activeSprint.name : 'Nenhuma sprint ativa'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              disabled={isCompleted}
              placeholder="Ex: Implementar Webhook de Pagamento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descrição / Detalhes
            </label>
            <textarea
              rows={3}
              disabled={isCompleted}
              placeholder="Critérios de aceite, observações de arquitetura..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coluna / Status</label>
              <select
                disabled={isCompleted}
                value={status}
                onChange={(e) => setStatus(e.target.value as KanbanColumnId)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Progresso</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridade</label>
              <select
                disabled={isCompleted}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente ⚡</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Story Points</label>
              <select
                disabled={isCompleted}
                value={storyPoints}
                onChange={(e) => setStoryPoints(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Responsáveis
            </label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((m) => {
                const isAssigned = selectedAssignees.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={isCompleted}
                    onClick={() => toggleAssignee(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isCompleted ? 'opacity-60 cursor-not-allowed' : ''
                    } ${
                      isAssigned
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <img src={m.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span>{m.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Tags (Separadas por vírgula)
            </label>
            <input
              type="text"
              disabled={isCompleted}
              placeholder="Ex: API, Segurança, Pix, Frontend"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            {taskToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Excluir Card"
              >
                <Trash2 className="w-4 h-4" /> Excluir Tarefa
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
                {isCompleted ? 'Fechar' : 'Cancelar'}
              </button>
              {isCompleted ? (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Tarefa Concluída (Bloqueada)
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
                >
                  {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
