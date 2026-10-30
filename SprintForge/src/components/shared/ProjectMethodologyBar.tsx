import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Methodology } from '../../types';
import {
  Code2,
  Repeat,
  Kanban as KanbanIcon,
  HelpCircle,
  Users,
  Lock,
  Info,
  Plus,
  AlertTriangle,
  Power,
  MessageSquare,
} from 'lucide-react';
import { MethodologyGuideModal } from './MethodologyGuideModal';

interface ProjectMethodologyBarProps {
  currentModule: Methodology;
  onOpenTaskModal?: () => void;
  onToggleChat?: () => void;
}

export const ProjectMethodologyBar: React.FC<ProjectMethodologyBarProps> = ({
  currentModule,
  onOpenTaskModal,
  onToggleChat,
}) => {
  const { activeProject, updateProjectStatus, activeProjectTasks, activeProjectChat } = useProject();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (!activeProject) return null;

  const teamCount = activeProject.teamSize || activeProject.members.length;
  const isInactive = activeProject.status === 'INACTIVE';
  const isCompleted = activeProject.status === 'COMPLETED';

  const getMethodIcon = (meth: Methodology) => {
    switch (meth) {
      case 'XP':
        return <Code2 className="w-5 h-5 text-cyan-700" />;
      case 'SCRUM':
        return <Repeat className="w-5 h-5 text-violet-700" />;
      case 'KANBAN':
        return <KanbanIcon className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          {/* Identificação do projeto e escopo */}
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              {getMethodIcon(activeProject.activeMethodology)}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  <Lock className="h-3 w-3" /> Isolado em {activeProject.activeMethodology}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600">
                  <Users className="h-3 w-3 text-slate-500" /> {teamCount} {teamCount === 1 ? 'pessoa' : 'integrantes'}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-extrabold ${
                  isCompleted
                    ? 'border-violet-200 bg-violet-50 text-violet-700'
                    : isInactive
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    isCompleted ? 'bg-violet-500' : isInactive ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                  {isCompleted ? '🏆 CONCLUÍDO' : isInactive ? 'INATIVO' : 'ATIVO'}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="break-words text-lg font-extrabold leading-snug text-slate-900">
                  {activeProject.name}
                </h3>
                <span className="text-xs font-medium text-slate-500">
                  ({activeProjectTasks.length} tarefas associadas)
                </span>
              </div>
            </div>
          </div>

          {/* Ações e controle de status */}
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {onToggleChat && (
              <button
                type="button"
                onClick={onToggleChat}
                className={`group relative inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isCompleted
                    ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'
                }`}
                title={isCompleted ? 'Abrir Histórico do Chat (Leitura)' : `Abrir Chat Isolado do Projeto "${activeProject.name}"`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{isCompleted ? 'Histórico do Chat' : 'Chat do Projeto'}</span>
                {!isCompleted && activeProjectChat.length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>
            )}

            {onOpenTaskModal && (
              <button
                type="button"
                onClick={isCompleted ? undefined : onOpenTaskModal}
                disabled={isCompleted}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-extrabold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isCompleted
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : 'border-blue-600 bg-[#2563EB] text-white hover:border-blue-700 hover:bg-[#1D4ED8]'
                }`}
                title={isCompleted ? 'Projeto Concluído: Criação de tarefas desativada' : 'Criar nova tarefa para este projeto'}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>{isCompleted ? 'Projeto Concluído' : '+ Tarefa no Projeto'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              title="Aprender sobre como aplicar esta metodologia no seu dia a dia"
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="hidden sm:inline">Guia {currentModule}</span>
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5" title="Status do projeto">
              <span className="hidden text-xs font-medium text-slate-500 lg:inline">Status:</span>
              <button
                type="button"
                onClick={async () => {
                  if (isCompleted) return;
                  const nextStatus = isInactive ? 'ACTIVE' : 'INACTIVE';
                  const res = await updateProjectStatus(activeProject.id, nextStatus);
                  if (!res.success && res.message) {
                    alert(res.message);
                  }
                }}
                disabled={isCompleted}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isCompleted
                    ? 'cursor-default border-violet-200 bg-violet-50 text-violet-700'
                    : isInactive
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{isCompleted ? 'Projeto Finalizado 🏆' : isInactive ? 'Projeto Inativo' : 'Projeto Ativo'}</span>
              </button>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3.5 text-xs text-violet-900">
            <span className="text-lg" aria-hidden="true">🏆</span>
            <div className="space-y-1">
              <p className="font-extrabold text-violet-800">ESTE PROJETO FOI FINALIZADO / CONCLUÍDO</p>
              <p className="leading-relaxed text-slate-700">
                Este projeto foi marcado como <strong>Concluído</strong>. O acesso está preservado em modo histórico através das abas de <strong>Sprints Finalizadas</strong> e <strong>Progresso & Relatórios</strong>.
              </p>
            </div>
          </div>
        )}

        {isInactive && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="space-y-1">
              <p className="font-extrabold text-rose-800">⚠️ ESTE PROJETO ESTÁ MARCADO COMO INATIVO</p>
              <p className="leading-relaxed text-slate-700">
                Você definiu este projeto como <strong>Inativo</strong>. Agora ele pode ser <strong>excluído com segurança na Central de Projetos</strong>. Caso deseje continuar trabalhando nele, basta clicar no botão de status acima para torná-lo <strong>Ativo</strong> novamente.
              </p>
            </div>
          </div>
        )}

        {!isInactive && (
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-slate-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div className="space-y-1">
              <p className="font-bold text-slate-800">
                📌 Projeto 100% Isolado em {activeProject.activeMethodology}:
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Todas as tarefas, reuniões e métricas nesta tela pertencem exclusivamente a <strong>"{activeProject.name}"</strong> ({teamCount} integrantes). Para permitir a exclusão deste projeto, clique no botão <strong>"Projeto Ativo"</strong> acima para alterá-lo para <strong>Inativo</strong>.
              </p>
            </div>
          </div>
        )}
      </section>

      <MethodologyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialMethodology={currentModule}
      />
    </>
  );
};
