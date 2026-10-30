import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Sprint } from '../../types';
import {
  Calendar,
  Target,
  AlertTriangle,
  X,
  Check,
  Repeat,
  Clock,
  Trash2,
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

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';
  const labelClass = 'block text-xs font-semibold text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sprint-modal-title"
        className="flex max-h-[min(92vh,850px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-700">
              <Repeat className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="sprint-modal-title" className="text-base font-bold text-slate-900 sm:text-lg">
                {isEditing ? 'Configurar / Editar Sprint' : 'Planejar Nova Sprint'}
              </h2>
              <p className="truncate text-xs text-slate-500">
                Projeto: <span className="font-semibold text-slate-700">{activeProject.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Project Bounds Info Banner */}
        <div className="shrink-0 space-y-2 border-b border-slate-200 bg-slate-50 px-5 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <Clock className="h-4 w-4 text-purple-600" /> Período do Projeto
            </span>
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700">
              {activeProject.startDate ? formatDateDisplay(activeProject.startDate) : 'Início livre'} →{' '}
              {activeProject.deadline ? formatDateDisplay(activeProject.deadline) : 'Sem prazo final fixado'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            As Sprints devem possuir datas próprias e objetivo claro, contidas estritamente dentro do cronograma do projeto.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {/* Validation Warnings / Errors */}
            {validationWarnings.length > 0 && (
              <div className="space-y-2" aria-live="polite">
                {validationWarnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed ${
                      warn.startsWith('❌')
                        ? 'border-rose-200 bg-rose-50 font-medium text-rose-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${warn.startsWith('❌') ? 'text-rose-600' : 'text-amber-600'}`} />
                    <div>{warn}</div>
                  </div>
                ))}
              </div>
            )}

            {formError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Sprint Name & Points */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="sprint-name" className={labelClass}>Nome da Sprint *</label>
                <input
                  id="sprint-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sprint 01, Sprint 02..."
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sprint-points" className={labelClass}>Meta Points</label>
                <input
                  id="sprint-points"
                  type="number"
                  min={1}
                  max={200}
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Sprint Goal */}
            <div className="space-y-1.5">
              <label htmlFor="sprint-goal" className={`${labelClass} flex items-center gap-1.5`}>
                <Target className="h-4 w-4 text-purple-600" /> Objetivo da Sprint (Sprint Goal) *
              </label>
              <input
                id="sprint-goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex: Entregar arquitetura de autenticação e tela de pagamentos"
                className={inputClass}
                required
              />
            </div>

            {/* Highlighted Sprint Timeline & Critical Date Modification Section */}
            <section aria-labelledby="sprint-timeline-title" className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-3">
                <h3 id="sprint-timeline-title" className="flex items-center gap-2 text-xs font-bold text-slate-900 sm:text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Calendar className="h-4 w-4" />
                  </span>
                  Período & Prazos da Sprint (Campo Crítico) *
                </h3>
                <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Alta prioridade
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                As datas abaixo definem o cronograma de queima do <strong className="font-semibold text-slate-800">Burndown Chart</strong> e o período oficial de entrega da iteração.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="sprint-start" className={`${labelClass} flex flex-wrap items-center justify-between gap-1`}>
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-blue-600" /> Data de Início *</span>
                    {startDate && <span className="text-[11px] font-semibold text-blue-700">{formatDateDisplay(startDate)}</span>}
                  </label>
                  <input
                    id="sprint-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`${inputClass} border-blue-200 bg-white font-semibold [color-scheme:light]`}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sprint-end" className={`${labelClass} flex flex-wrap items-center justify-between gap-1`}>
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-blue-600" /> Data de Término *</span>
                    {endDate && <span className="text-[11px] font-semibold text-blue-700">{formatDateDisplay(endDate)}</span>}
                  </label>
                  <input
                    id="sprint-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`${inputClass} border-blue-200 bg-white font-semibold [color-scheme:light]`}
                    required
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
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
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={hasCriticalError}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isEditing ? 'Salvar Alterações' : 'Criar Sprint'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
