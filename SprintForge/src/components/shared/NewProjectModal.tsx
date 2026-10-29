
import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Methodology } from '../../types';
import {
  X,
  Zap,
  FolderPlus,
  Code2,
  Repeat,
  Kanban as KanbanIcon,
  Users,
} from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createProject(
      name,
      description,
      undefined,
      methodology,
      teamSize,
      deadline || undefined
    );

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl shadow-slate-950/20 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] shrink-0">
              <FolderPlus className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Criar Novo Projeto
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure as informações iniciais do projeto.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar criação de projeto"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-blue-800">
              Não sabe qual metodologia escolher?
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Faça nosso questionário de 5 perguntas.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDiagnostic();
            }}
            className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Diagnóstico
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome do Projeto *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Plataforma Pix Realtime"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              rows={2}
              placeholder="Descreva o escopo e objetivos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantidade de Integrantes no Projeto
            </label>

            <div className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 shrink-0" />

                <input
                  type="number"
                  min={1}
                  max={50}
                  value={teamSize}
                  onChange={(e) =>
                    setTeamSize(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold text-sm text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="text-xs text-slate-700 font-semibold">
                  {teamSize === 1
                    ? '1 integrante (projeto individual)'
                    : `${teamSize} integrantes no total`}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                📌 A quantidade de integrantes configurada definirá o limite
                de vagas e convites que poderão ser feitos para este projeto.
              </p>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Prazo de Entrega do Projeto
              </label>

              <div className="flex items-center gap-1.5">
                {[15, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setPresetDeadline(days)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors"
                  >
                    +{days} dias
                  </button>
                ))}
              </div>
            </div>

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [color-scheme:light]"
            />

            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Definir um prazo permite acompanhar a contagem regressiva e a
              curva de evolução no painel de progresso.
            </p>
          </div>

          {/* Methodology */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Metodologia Inicial
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethodology('XP')}
                aria-pressed={methodology === 'XP'}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  methodology === 'XP'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Code2 className={`w-4 h-4 mb-2 ${
                  methodology === 'XP' ? 'text-blue-600' : 'text-slate-500'
                }`} />
                XP (Extreme)
              </button>

              <button
                type="button"
                onClick={() => setMethodology('SCRUM')}
                aria-pressed={methodology === 'SCRUM'}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  methodology === 'SCRUM'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Repeat className={`w-4 h-4 mb-2 ${
                  methodology === 'SCRUM' ? 'text-blue-600' : 'text-slate-500'
                }`} />
                Scrum
              </button>

              <button
                type="button"
                onClick={() => setMethodology('KANBAN')}
                aria-pressed={methodology === 'KANBAN'}
                className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  methodology === 'KANBAN'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <KanbanIcon className={`w-4 h-4 mb-2 ${
                  methodology === 'KANBAN' ? 'text-blue-600' : 'text-slate-500'
                }`} />
                Kanban
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm transition-colors"
            >
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
