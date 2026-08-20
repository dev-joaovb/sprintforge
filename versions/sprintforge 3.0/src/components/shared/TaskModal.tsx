import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, KanbanColumnId, TaskPriority } from '../../types';
import { X, ListTodo, Trash2, CheckCircle2 } from 'lucide-react';

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
  const { addTask, updateTask, deleteTask, teamMembers, activeSprint } = useProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<KanbanColumnId>('todo');
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
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('Média');
      setStoryPoints(3);
      setSelectedAssignees(teamMembers[0] ? [teamMembers[0].id] : []);
      setTagsInput('Geral');
    }
  }, [taskToEdit, isOpen, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title,
        description,
        status,
        priority,
        storyPoints,
        assignees: selectedAssignees,
        tags: tagsArray,
      });
    } else {
      addTask({
        title,
        description,
        status,
        priority,
        storyPoints,
        assignees: selectedAssignees,
        tags: tagsArray,
        sprintId: activeSprint?.id,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit && confirm('Deseja realmente excluir este card?')) {
      deleteTask(taskToEdit.id);
      onClose();
    }
  };

  const toggleAssignee = (id: string) => {
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
            <h3 className="text-base font-bold text-white">
              {taskToEdit ? 'Editar Card de Tarefa' : 'Criar Nova Tarefa'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Implementar Webhook de Pagamento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descrição / Detalhes
            </label>
            <textarea
              rows={3}
              placeholder="Critérios de aceite, observações de arquitetura..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coluna / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KanbanColumnId)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
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
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
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
                value={storyPoints}
                onChange={(e) => setStoryPoints(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
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
                    onClick={() => toggleAssignee(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
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
              placeholder="Ex: API, Segurança, Pix, Frontend"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            {taskToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Excluir Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
              >
                {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
