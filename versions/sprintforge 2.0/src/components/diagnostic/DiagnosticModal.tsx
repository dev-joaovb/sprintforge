import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProject } from '../../context/ProjectContext';
import { DIAGNOSTIC_QUESTIONS, calculateDiagnosticResult } from '../../data/diagnosticQuestions';
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
  HelpCircle,
  Sparkles,
  ArrowRight,
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
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Info, 1..5 = Questions, 6 = Result
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([]);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [selectedMethodologyOverride, setSelectedMethodologyOverride] = useState<Methodology | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const existing = answers.filter((a) => a.questionId !== questionId);
    const updated = [...existing, { questionId, selectedOptionIndex: optionIndex }];
    setAnswers(updated);

    // Auto advance to next question if not at end
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
    setCurrentStep(DIAGNOSTIC_QUESTIONS.length + 1); // Go to Result screen
  };

  const handleFinalSubmit = () => {
    if (!projectName.trim()) {
      alert('Por favor, informe um nome para o projeto.');
      return;
    }

    const finalMeth = selectedMethodologyOverride || result?.recommended || 'SCRUM';
    const newProj = createProject(
      projectName,
      projectDescription || 'Projeto criado via Diagnóstico Inteligente SprintForge.',
      answers,
      finalMeth,
      teamSize
    );

    if (onProjectCreated) {
      onProjectCreated(newProj.id);
    }
    onClose();
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

  const currentQuestion = currentStep >= 1 && currentStep <= DIAGNOSTIC_QUESTIONS.length
    ? DIAGNOSTIC_QUESTIONS[currentStep - 1]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-400 border border-purple-500/30">
              <Zap className="w-5 h-5 fill-current text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Diagnóstico Ágil Inteligente</h3>
              <p className="text-xs text-slate-400">Recomendação de Metodologia (XP vs. Scrum vs. Kanban)</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-1">
          <div
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-1 transition-all duration-300"
            style={{
              width: `${(currentStep / (DIAGNOSTIC_QUESTIONS.length + 1)) * 100}%`,
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
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
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex gap-3.5">
                  <Sparkles className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-200 space-y-1">
                    <p className="font-semibold text-sm text-purple-300">Como funciona o Diagnóstico SprintForge?</p>
                    <p>
                      Analisaremos 5 dimensões do seu projeto (frequência de mudanças, tamanho do time, ritmo de entregas, engajamento do cliente e foco de qualidade).
                      Nossos algoritmos calcularão a compatibilidade técnica com **XP (Extreme Programming)**, **Scrum** e **Kanban**.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nome do Projeto *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Plataforma Pix Realtime / Checkout Mobile"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Quantidade de Integrantes no Projeto / Tamanho da Equipe *
                    </label>
                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <Users className="w-5 h-5 text-purple-400 shrink-0" />
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={teamSize}
                        onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm text-center focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-xs text-slate-400">
                        {teamSize === 1 ? 'pessoa (desenvolvimento individual)' : `${teamSize} pessoas no time`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Descrição e Objetivos (Opcional)
                    </label>
                    <textarea
                      placeholder="Resuma os objetivos de negócio e escopo inicial..."
                      rows={3}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    disabled={!projectName.trim()}
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20"
                  >
                    Iniciar Diagnóstico <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1 to N: Diagnostic Questions */}
            {currentQuestion && (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Pergunta {currentStep} de {DIAGNOSTIC_QUESTIONS.length}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {Math.round((currentStep / DIAGNOSTIC_QUESTIONS.length) * 100)}% concluído
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{currentQuestion.title}</h4>
                  <p className="text-xs text-slate-400">{currentQuestion.description}</p>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers.find(
                      (a) => a.questionId === currentQuestion.id && a.selectedOptionIndex === idx
                    );

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestion.id, idx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'border-purple-400 bg-purple-500 text-white' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold mb-0.5">{opt.label}</div>
                          <div className="text-xs text-slate-400">{opt.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>

                  {currentStep < DIAGNOSTIC_QUESTIONS.length ? (
                    <button
                      disabled={!answers.some((a) => a.questionId === currentQuestion.id)}
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs disabled:opacity-50 transition-colors"
                    >
                      Próxima <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled={answers.length < DIAGNOSTIC_QUESTIONS.length}
                      onClick={handleCalculate}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
                    >
                      Ver Diagnóstico <Zap className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step Result: Recommended Methodology */}
            {currentStep > DIAGNOSTIC_QUESTIONS.length && result && (
              <motion.div
                key="step-result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Score Breakdown Cards */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-semibold mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Análise Concluída
                  </div>
                  <h4 className="text-xl font-extrabold text-white">Metodologia Recomendada: {result.recommended}</h4>
                  <p className="text-xs text-slate-400 max-w-xl mx-auto">{result.reasoning}</p>
                </div>

                {/* Score Comparison Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* XP */}
                  <div
                    onClick={() => setSelectedMethodologyOverride('XP')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedMethodologyOverride === 'XP'
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-bold text-white">XP</span>
                      </div>
                      <span className="text-sm font-extrabold text-cyan-400">{result.xpScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-2 rounded-full transition-all" style={{ width: `${result.xpScore}%` }} />
                    </div>
                    {result.recommended === 'XP' && (
                      <span className="mt-2 inline-block text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                        ★ Ideal para o seu perfil
                      </span>
                    )}
                  </div>

                  {/* Scrum */}
                  <div
                    onClick={() => setSelectedMethodologyOverride('SCRUM')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedMethodologyOverride === 'SCRUM'
                        ? 'bg-purple-500/10 border-purple-400 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-white">Scrum</span>
                      </div>
                      <span className="text-sm font-extrabold text-purple-400">{result.scrumScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-2 rounded-full transition-all" style={{ width: `${result.scrumScore}%` }} />
                    </div>
                    {result.recommended === 'SCRUM' && (
                      <span className="mt-2 inline-block text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        ★ Ideal para o seu perfil
                      </span>
                    )}
                  </div>

                  {/* Kanban */}
                  <div
                    onClick={() => setSelectedMethodologyOverride('KANBAN')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedMethodologyOverride === 'KANBAN'
                        ? 'bg-emerald-500/10 border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <KanbanIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white">Kanban</span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-400">{result.kanbanScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${result.kanbanScore}%` }} />
                    </div>
                    {result.recommended === 'KANBAN' && (
                      <span className="mt-2 inline-block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                        ★ Ideal para o seu perfil
                      </span>
                    )}
                  </div>
                </div>

                {/* Strengths & Considerations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Principais Vantagens
                    </h5>
                    <ul className="space-y-1.5">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Pontos de Atenção
                    </h5>
                    <ul className="space-y-1.5">
                      {result.considerations.map((c, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Manual Choice Option */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Deseja alterar manualmente a metodologia?</div>
                    <div className="text-[11px] text-slate-400">Você pode alternar entre XP, Scrum ou Kanban a qualquer momento no app.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['XP', 'SCRUM', 'KANBAN'] as Methodology[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMethodologyOverride(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedMethodologyOverride === m
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final Submit */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(DIAGNOSTIC_QUESTIONS.length)}
                    className="text-xs font-medium text-slate-400 hover:text-slate-200"
                  >
                    Rever Perguntas
                  </button>

                  <button
                    onClick={handleFinalSubmit}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105"
                  >
                    <FolderPlus className="w-4 h-4" /> Criar Projeto com {selectedMethodologyOverride}
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
