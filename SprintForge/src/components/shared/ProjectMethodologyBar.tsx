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
        return <Code2 className="w-4 h-4 text-cyan-400" />;
      case 'SCRUM':
        return <Repeat className="w-4 h-4 text-purple-400" />;
      case 'KANBAN':
        return <KanbanIcon className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <>
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Project & Scope info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
              {getMethodIcon(activeProject.activeMethodology)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                  <Lock className="w-3 h-3 text-purple-400" /> Isolado em {activeProject.activeMethodology}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                  <Users className="w-3 h-3 text-cyan-400" /> {teamCount} {teamCount === 1 ? 'pessoa' : 'integrantes'}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                  isCompleted
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : isInactive
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isCompleted ? 'bg-purple-400' : isInactive ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
                  }`} />
                  {isCompleted ? '🏆 CONCLUÍDO' : isInactive ? 'INATIVO' : 'ATIVO'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                {activeProject.name}
                <span className="text-xs font-normal text-slate-400">({activeProjectTasks.length} tarefas associadas)</span>
              </h3>
            </div>
          </div>

          {/* Action Buttons & Status Control */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Chat do Projeto - Visível apenas dentro do projeto selecionado */}
            {onToggleChat && (
              <button
                onClick={onToggleChat}
                className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 group relative ${
                  isCompleted
                    ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    : 'bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border-cyan-500/40 shadow-cyan-900/20'
                }`}
                title={isCompleted ? 'Abrir Histórico do Chat (Leitura)' : `Abrir Chat Isolado do Projeto "${activeProject.name}"`}
              >
                <MessageSquare className={`w-4 h-4 ${isCompleted ? 'text-slate-400' : 'text-cyan-400 group-hover:text-white'}`} />
                <span>{isCompleted ? 'Histórico do Chat' : 'Chat do Projeto'}</span>
                {!isCompleted && activeProjectChat.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            )}

            {/* + Nova Tarefa inside project */}
            {onOpenTaskModal && (
              <button
                onClick={isCompleted ? undefined : onOpenTaskModal}
                disabled={isCompleted}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                  isCompleted
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                }`}
                title={isCompleted ? 'Projeto Concluído: Criação de tarefas desativada' : 'Criar nova tarefa para este projeto'}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isCompleted ? 'Projeto Concluído' : '+ Tarefa no Projeto'}</span>
              </button>
            )}

            {/* How to use guide trigger */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Aprender sobre como aplicar esta metodologia no seu dia a dia"
            >
              <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="hidden sm:inline">Guia {currentModule}</span>
            </button>

            {/* Project Status Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800" title="Status do projeto">
              <span className="text-xs font-medium text-slate-400 hidden lg:inline">Status:</span>
              <button
                onClick={() => {
                  if (isCompleted) return;
                  const nextStatus = isInactive ? 'ACTIVE' : 'INACTIVE';
                  updateProjectStatus(activeProject.id, nextStatus);
                }}
                disabled={isCompleted}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                  isCompleted
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 cursor-default'
                    : isInactive
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                <Power className={`w-3 h-3 ${isCompleted ? 'text-purple-400' : isInactive ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span>{isCompleted ? 'Projeto Finalizado 🏆' : isInactive ? 'Projeto Inativo' : 'Projeto Ativo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informative Alert Banner when Completed */}
        {isCompleted && (
          <div className="text-xs text-purple-200 bg-purple-950/60 p-3.5 rounded-xl border border-purple-500/40 flex items-start gap-3 shadow-lg animate-in fade-in duration-200">
            <span className="text-lg">🏆</span>
            <div className="space-y-1">
              <div className="font-extrabold text-purple-300 flex items-center gap-2">
                <span>ESTE PROJETO FOI FINALIZADO / CONCLUÍDO</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Este projeto foi marcado como <strong>Concluído</strong>. O acesso está preservado em modo histórico através das abas de <strong>Sprints Finalizadas</strong> e <strong>Progresso & Relatórios</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Informative Alert Banner when Inactive */}
        {isInactive && (
          <div className="text-xs text-rose-200 bg-rose-950/60 p-3.5 rounded-xl border border-rose-500/40 flex items-start gap-3 shadow-lg animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold text-rose-300 flex items-center gap-2">
                <span>⚠️ ESTE PROJETO ESTÁ MARCADO COMO INATIVO</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Você definiu este projeto como <strong>Inativo</strong>. Agora ele pode ser <strong>excluído com segurança na Central de Projetos</strong>. Caso deseje continuar trabalhando nele, basta clicar no botão de status acima para torná-lo <strong>Ativo</strong> novamente.
              </p>
            </div>
          </div>
        )}

        {/* Layman quick tip explanation */}
        {!isInactive && (
          <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-200">
                📌 Projeto 100% Isolado em {activeProject.activeMethodology}:
              </p>
              <p className="text-[11px] text-slate-400">
                Todas as tarefas, reuniões e métricas nesta tela pertencem exclusivamente a <strong>"{activeProject.name}"</strong> ({teamCount} integrantes). Para permitir a exclusão deste projeto, clique no botão <strong>"Projeto Ativo"</strong> acima para alterá-lo para <strong>Inativo</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      <MethodologyGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialMethodology={currentModule}
      />
    </>
  );
};
