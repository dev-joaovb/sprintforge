
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../../context/ProjectContext';
import {
  DIAGNOSTIC_QUESTIONS,
  calculateDiagnosticResult,
} from '../../data/diagnosticQuestions';
import { DiagnosticAnswer, DiagnosticResult, Methodology } from '../../types';
import {
  Zap,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  Code2,
  Repeat,
  Kanban as KanbanIcon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FolderPlus,
  Users,
} from 'lucide-react';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (projectId: string) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { createProject } = useProject();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamSize, setTeamSize] = useState<number>(5);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [selectedMethodologyOverride, setSelectedMethodologyOverride] =
    useState<Methodology | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const existing = answers.filter((a) => a.questionId !== questionId);
    const updated = [
      ...existing,
      { questionId, selectedOptionIndex: optionIndex },
    ];

    setAnswers(updated);

    if (currentStep < DIAGNOSTIC_QUESTIONS.length) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 250);
    }
  };

  const handleCalculate = () => {
    const calculated = calculateDiagnosticResult(answers);
    setResult(calculated);
    setSelectedMethodologyOverride(calculated.recommended);
    setCurrentStep(DIAGNOSTIC_QUESTIONS.length + 1);
  };

  const handleFinalSubmit = async () => {
    if (!projectName.trim()) {
      alert('Por favor, informe um nome para o projeto.');
      return;
    }

    const finalMeth =
      selectedMethodologyOverride || result?.recommended || 'SCRUM';

    try {
      const newProj = await createProject(
        projectName,
        projectDescription ||
          'Projeto criado via Diagnóstico Inteligente SprintForge.',
        answers,
        finalMeth,
        teamSize
      );

      if (onProjectCreated && newProj) {
        onProjectCreated(newProj.id);
      }

      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar projeto.');
    }
  };

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setTeamSize(5);
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
    setSelectedMethodologyOverride(null);
  };

  const currentQuestion =
    currentStep >= 1 && currentStep <= DIAGNOSTIC_QUESTIONS.length
      ? DIAGNOSTIC_QUESTIONS[currentStep - 1]
      : null;

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10';

  const primaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50';

  const secondaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50';

  const scoreCards = result
    ? [
        {
          methodology: 'XP' as Methodology,
          label: 'XP',
          score: result.xpScore,
          icon: Code2,
        },
        {
          methodology: 'SCRUM' as Methodology,
          label: 'Scrum',
          score: result.scrumScore,
          icon: Repeat,
        },
        {
          methodology: 'KANBAN' as Methodology,
          label: 'Kanban',
          score: result.kanbanScore,
          icon: KanbanIcon,
        },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostic-modal-title"
        className="relative my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h3
                id="diagnostic-modal-title"
                className="text-base font-bold text-slate-900 sm:text-lg"
              >
                Diagnóstico Ágil Inteligente
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Recomendação de Metodologia (XP vs. Scrum vs. Kanban)
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fechar diagnóstico"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 shrink-0 bg-slate-100">
          <div
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{
              width: `${
                (currentStep / (DIAGNOSTIC_QUESTIONS.length + 1)) * 100
              }%`,
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-5 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Initial Details */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Como funciona o Diagnóstico SprintForge?
                    </h4>

                    <p className="text-sm leading-relaxed text-slate-600">
                      Analisaremos 5 dimensões do seu projeto
                      (frequência de mudanças, tamanho do time,
                      ritmo de entregas, engajamento do cliente e
                      foco de qualidade). Nossos algoritmos calcularão
                      a compatibilidade técnica com XP (Extreme
                      Programming), Scrum e Kanban.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                  <div>
                    <label
                      htmlFor="diagnostic-project-name"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Nome do Projeto *
                    </label>

                    <input
                      id="diagnostic-project-name"
                      type="text"
                      placeholder="Ex: Plataforma Pix Realtime / Checkout Mobile"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="diagnostic-team-size"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Quantidade de Integrantes no Projeto / Tamanho da Equipe *
                    </label>

                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <Users className="h-5 w-5 shrink-0 text-blue-600" />

                      <input
                        id="diagnostic-team-size"
                        type="number"
                        min={1}
                        max={50}
                        value={teamSize}
                        onChange={(e) =>
                          setTeamSize(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 text-center text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                      />

                      <span className="text-xs text-slate-600">
                        {teamSize === 1
                          ? 'pessoa (desenvolvimento individual)'
                          : `${teamSize} pessoas no time`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="diagnostic-description"
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                      Descrição e Objetivos (Opcional)
                    </label>

                    <textarea
                      id="diagnostic-description"
                      placeholder="Resuma os objetivos de negócio e escopo inicial..."
                      rows={3}
                      value={projectDescription}
                      onChange={(e) =>
                        setProjectDescription(e.target.value)
                      }
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!projectName.trim()}
                    onClick={() => setCurrentStep(1)}
                    className={primaryButtonClass}
                  >
                    Iniciar Diagnóstico
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Questions */}
            {currentQuestion && (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    Pergunta {currentStep} de {DIAGNOSTIC_QUESTIONS.length}
                  </span>

                  <span className="text-xs font-medium text-slate-500">
                    {Math.round(
                      (currentStep / DIAGNOSTIC_QUESTIONS.length) * 100
                    )}
                    % concluído
                  </span>
                </div>

                <div>
                  <h4 className="mb-2 text-xl font-bold leading-snug text-slate-900">
                    {currentQuestion.title}
                  </h4>

                  <p className="text-sm leading-relaxed text-slate-600">
                    {currentQuestion.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers.find(
                      (a) =>
                        a.questionId === currentQuestion.id &&
                        a.selectedOptionIndex === idx
                    );

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          handleSelectOption(currentQuestion.id, idx)
                        }
                        aria-pressed={Boolean(isSelected)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </span>

                        <span className="min-w-0">
                          <span className="mb-1 block text-sm font-semibold text-slate-900">
                            {opt.label}
                          </span>

                          <span className="block text-xs leading-relaxed text-slate-500">
                            {opt.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep((prev) => Math.max(0, prev - 1))
                    }
                    className={secondaryButtonClass}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                  </button>

                  {currentStep < DIAGNOSTIC_QUESTIONS.length ? (
                    <button
                      type="button"
                      disabled={
                        !answers.some(
                          (a) => a.questionId === currentQuestion.id
                        )
                      }
                      onClick={() =>
                        setCurrentStep((prev) => prev + 1)
                      }
                      className={primaryButtonClass}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        answers.length < DIAGNOSTIC_QUESTIONS.length
                      }
                      onClick={handleCalculate}
                      className={primaryButtonClass}
                    >
                      Ver Diagnóstico
                      <Zap className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Result */}
            {currentStep > DIAGNOSTIC_QUESTIONS.length && result && (
              <motion.div
                key="step-result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Análise Concluída
                  </div>

                  <h4 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Metodologia Recomendada:{' '}
                    <span className="text-blue-700">
                      {result.recommended}
                    </span>
                  </h4>

                  <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
                    {result.reasoning}
                  </p>
                </div>

                {/* Score Comparison */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {scoreCards.map(
                    ({ methodology, label, score, icon: Icon }) => {
                      const isSelected =
                        selectedMethodologyOverride === methodology;

                      const isRecommended =
                        result.recommended === methodology;

                      return (
                        <button
                          key={methodology}
                          type="button"
                          onClick={() =>
                            setSelectedMethodologyOverride(methodology)
                          }
                          aria-pressed={isSelected}
                          className={`rounded-xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/20'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                              <Icon className="h-4 w-4 text-blue-600" />
                              {label}
                            </span>

                            <span className="text-sm font-extrabold text-blue-700">
                              {score}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#2563EB] transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>

                          {isRecommended && (
                            <span className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-blue-700">
                              ★ Ideal para o seu perfil
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Strengths & Considerations */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h5 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      Principais Vantagens
                    </h5>

                    <ul className="space-y-2">
                      {result.strengths.map((strength, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                        >
                          <span className="font-bold text-emerald-600">
                            •
                          </span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h5 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                      <AlertCircle className="h-4 w-4" />
                      Pontos de Atenção
                    </h5>

                    <ul className="space-y-2">
                      {result.considerations.map(
                        (consideration, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                          >
                            <span className="font-bold text-amber-600">
                              •
                            </span>
                            <span>{consideration}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Manual Methodology Selection */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">
                      Deseja alterar manualmente a metodologia?
                    </h5>

                    <p className="mt-1 text-xs text-slate-500">
                      Você pode alternar entre XP, Scrum ou Kanban
                      a qualquer momento no app.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(
                      ['XP', 'SCRUM', 'KANBAN'] as Methodology[]
                    ).map((methodology) => (
                      <button
                        key={methodology}
                        type="button"
                        onClick={() =>
                          setSelectedMethodologyOverride(methodology)
                        }
                        aria-pressed={
                          selectedMethodologyOverride === methodology
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                          selectedMethodologyOverride === methodology
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {methodology}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep(DIAGNOSTIC_QUESTIONS.length)
                    }
                    className={secondaryButtonClass}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Rever Perguntas
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className={primaryButtonClass}
                  >
                    <FolderPlus className="h-4 w-4" />
                    Criar Projeto com {selectedMethodologyOverride}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
