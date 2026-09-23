import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Sprint } from '../../types';
import {
  Calendar,
  Target,
  AlertTriangle,
  X,
  Check,
  Plus,
  Repeat,
  Info,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintToEdit?: Sprint | null;
}

// Helper to safely parse dates in YYYY-MM-DD or DD/MM/YYYY
export const parseFlexibleDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr || !dateStr.trim()) return null;
  const str = dateStr.trim();

  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // If DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Fallback to Date.parse
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDateDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Não definida';
  const d = parseFlexibleDate(dateStr);
  if (!d) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const SprintModal: React.FC<SprintModalProps> = ({
  isOpen,
  onClose,
  sprintToEdit,
}) => {
  const {
    activeProject,
    sprints,
    activeSprint,
    createSprint,
    updateSprint,
    deleteSprint,
  } = useProject();

  const isEditing = Boolean(sprintToEdit);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPoints, setTotalPoints] = useState<number>(20);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (sprintToEdit) {
      setName(sprintToEdit.name || '');
      setGoal(sprintToEdit.goal || '');
      setStartDate(sprintToEdit.startDate || '');
      setEndDate(sprintToEdit.endDate || '');
      setTotalPoints(sprintToEdit.totalPoints || 20);
    } else {
      const currentCount = sprints.filter((s) => s.projectId === activeProject?.id).length;
      const nextNum = currentCount + 1;
      const padNum = String(nextNum).padStart(2, '0');
      setName(`Sprint ${padNum}`);
      setGoal(`Meta e entregas da Sprint ${padNum}`);
      
      // Suggest default 2-week interval based on active sprint end or today
      const baseStart = activeSprint?.endDate
        ? parseFlexibleDate(activeSprint.endDate) || new Date()
        : new Date();
      
      const startIso = baseStart.toISOString().split('T')[0];
      const endCalc = new Date(baseStart);
      endCalc.setDate(endCalc.getDate() + 14);
      const endIso = endCalc.toISOString().split('T')[0];

      setStartDate(startIso);
      setEndDate(endIso);
      setTotalPoints(24);
    }
    setFormError(null);
  }, [sprintToEdit, isOpen, activeProject?.id, sprints.length, activeSprint]);

  // Project timeframe boundary validations
  const validationWarnings = useMemo(() => {
    if (!activeProject) return [];
    const warnings: string[] = [];

    const projectStart = parseFlexibleDate(activeProject.startDate);
    const projectDeadline = parseFlexibleDate(activeProject.deadline);

    const sprintStart = parseFlexibleDate(startDate);
    const sprintEnd = parseFlexibleDate(endDate);

    if (sprintStart && sprintEnd && sprintEnd < sprintStart) {
      warnings.push('A data de término da Sprint não pode ser anterior à data de início.');
    }

    if (projectDeadline && sprintEnd) {
      if (sprintEnd > projectDeadline) {
        warnings.push(
          `❌ Prazo Excedido: A data de término da Sprint (${formatDateDisplay(endDate)}) ultrapassa o prazo final definido para o projeto (${formatDateDisplay(activeProject.deadline)}). No Scrum, todas as Sprints devem estar contidas no cronograma do projeto.`
        );
      }
    }

    if (projectStart && sprintStart) {
      if (sprintStart < projectStart) {
        warnings.push(
          `⚠️ Início Antecipado: A data de início da Sprint (${formatDateDisplay(startDate)}) é anterior à data de início do projeto (${formatDateDisplay(activeProject.startDate)}).`
        );
      }
    }

    return warnings;
  }, [activeProject, startDate, endDate]);

  const hasCriticalError = validationWarnings.some((w) => w.startsWith('❌') || w.includes('não pode ser anterior'));

  if (!isOpen || !activeProject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome da Sprint é obrigatório.');
      return;
    }
    if (!goal.trim()) {
      setFormError('A definição de objetivo (Goal) da Sprint é obrigatória.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('As datas de início e término da Sprint são obrigatórias.');
      return;
    }

    if (hasCriticalError) {
      setFormError('Corrija as datas da Sprint para respeitar os limites do projeto antes de prosseguir.');
      return;
    }

    if (isEditing && sprintToEdit) {
      updateSprint(sprintToEdit.id, {
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        totalPoints: Number(totalPoints) || 20,
      });
    } else {
      createSprint({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        totalPoints: Number(totalPoints) || 20,
        projectId: activeProject.id,
        status: sprints.some((s) => s.projectId === activeProject.id && s.status === 'ACTIVE') ? 'PLANNED' : 'ACTIVE',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {isEditing ? 'Configurar / Editar Sprint' : 'Planejar Nova Sprint'}
              </h2>
              <p className="text-xs text-slate-400">
                Projeto: <span className="text-purple-300 font-semibold">{activeProject.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Bounds Info Banner */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center justify-between font-bold text-slate-200">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Clock className="w-4 h-4 text-purple-400" /> Período do Projeto:
            </span>
            <span className="bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
              {activeProject.startDate ? formatDateDisplay(activeProject.startDate) : 'Início livre'} →{' '}
              {activeProject.deadline ? formatDateDisplay(activeProject.deadline) : 'Sem prazo final fixado'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            As Sprints devem possuir datas próprias e objetivo claro, contidas estritamente dentro do cronograma do projeto.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Validation Warnings / Errors */}
          {validationWarnings.length > 0 && (
            <div className="space-y-2">
              {validationWarnings.map((warn, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    warn.startsWith('❌')
                      ? 'bg-rose-950/50 border-rose-500/40 text-rose-200 font-medium'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${warn.startsWith('❌') ? 'text-rose-400' : 'text-amber-400'}`} />
                  <div className="leading-relaxed">{warn}</div>
                </div>
              ))}
            </div>
          )}

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Sprint Name & Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nome da Sprint *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sprint 01, Sprint 02..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Meta Points
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Sprint Goal */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" /> Objetivo da Sprint (Sprint Goal) *
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex: Entregar arquitetura de autenticação e tela de pagamentos"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              required
            />
          </div>

          {/* Highlighted Sprint Timeline & Critical Date Modification Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-indigo-950/40 border-2 border-purple-500/60 shadow-xl shadow-purple-950/50 space-y-3 ring-1 ring-purple-400/30">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
              <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <div className="p-1 rounded-lg bg-purple-600 text-white shadow-sm">
                  <Calendar className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <span>Período & Prazos da Sprint (Campo Crítico) *</span>
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
                ⭐ Alta Prioridade
              </span>
            </div>

            <p className="text-[11px] text-purple-200/90 leading-relaxed font-medium">
              As datas abaixo definem o cronograma de queima do <strong>Burndown Chart</strong> e o período oficial de entrega da iteração.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white stroke-[2.5]" /> Data de Início *
                  </span>
                  {startDate && (
                    <span className="text-[10px] font-bold text-purple-300">
                      {formatDateDisplay(startDate)}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-purple-500/50 focus:border-purple-400 text-white text-xs font-bold focus:ring-2 focus:ring-purple-500/40 outline-none transition-all shadow-inner [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white stroke-[2.5]" /> Data de Término *
                  </span>
                  {endDate && (
                    <span className="text-[10px] font-bold text-purple-300">
                      {formatDateDisplay(endDate)}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-purple-500/50 focus:border-purple-400 text-white text-xs font-bold focus:ring-2 focus:ring-purple-500/40 outline-none transition-all shadow-inner [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <div>
              {isEditing && sprintToEdit && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir a ${sprintToEdit.name}?`)) {
                      deleteSprint(sprintToEdit.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={hasCriticalError}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isEditing ? 'Salvar Alterações' : 'Criar Sprint'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
