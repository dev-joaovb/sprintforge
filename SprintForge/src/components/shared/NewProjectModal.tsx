import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Methodology } from '../../types';
import { X, Zap, FolderPlus, Code2, Repeat, Kanban as KanbanIcon, Users, Calendar, Clock } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostic: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onOpenDiagnostic,
}) => {
  const { createProject } = useProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [methodology, setMethodology] = useState<Methodology>('SCRUM');
  const [teamSize, setTeamSize] = useState<number>(5);
  const [deadline, setDeadline] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject(name, description, undefined, methodology, teamSize, deadline || undefined);
    setName('');
    setDescription('');
    setTeamSize(5);
    setDeadline('');
    onClose();
  };

  const setPresetDeadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeadline(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Criar Novo Projeto</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option to use Diagnostic instead */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-purple-300">Não sabe qual metodologia escolher?</div>
            <div className="text-[11px] text-slate-400">Faça nosso questionário de 5 perguntas.</div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenDiagnostic();
            }}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Diagnóstico
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nome do Projeto *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Plataforma Pix Realtime"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descrição
            </label>
            <textarea
              rows={2}
              placeholder="Descreva o escopo e objetivos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Quantidade de Integrantes no Projeto
            </label>
            <div className="flex flex-col gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm text-center focus:outline-none focus:border-purple-500"
                />
                <span className="text-xs text-slate-200 font-semibold">
                  {teamSize === 1 ? '1 integrante (projeto individual)' : `${teamSize} integrantes no total`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                📌 A quantidade de integrantes configurada definirá o limite de vagas e convites que poderão ser feitos para este projeto.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Prazo de Entrega do Projeto
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPresetDeadline(15)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  +15 dias
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(30)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  +30 dias
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDeadline(60)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  +60 dias
                </button>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 [color-scheme:dark]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Definir um prazo permite acompanhar a contagem regressiva e a curva de evolução no painel de progresso.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Metodologia Inicial
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethodology('XP')}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  methodology === 'XP'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Code2 className="w-4 h-4 mb-1 text-cyan-400" /> XP (Extreme)
              </button>
              <button
                type="button"
                onClick={() => setMethodology('SCRUM')}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  methodology === 'SCRUM'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Repeat className="w-4 h-4 mb-1 text-purple-400" /> Scrum
              </button>
              <button
                type="button"
                onClick={() => setMethodology('KANBAN')}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  methodology === 'KANBAN'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <KanbanIcon className="w-4 h-4 mb-1 text-emerald-400" /> Kanban
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20"
            >
              Criar Projeto
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
