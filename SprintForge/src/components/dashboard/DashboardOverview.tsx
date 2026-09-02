import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Methodology, Project } from '../../types';
import {
  Zap,
  Code2,
  Repeat,
  Kanban as KanbanIcon,
  Plus,
  ArrowRight,
  Users,
  Trash2,
  Layers,
  Sparkles,
  Lock,
  BookOpen,
  AlertTriangle,
  X,
  Info,
  CheckCircle2,
  Crown,
  Download,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface DashboardOverviewProps {
  onOpenDiagnostic: () => void;
  onOpenNewProjectModal: () => void;
  onNavigateTab: (tab: 'XP' | 'SCRUM' | 'KANBAN' | 'DIAGNOSTIC') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenDiagnostic,
  onOpenNewProjectModal,
  onNavigateTab,
}) => {
  const { currentUser } = useAuth();
  const {
    myProjects,
    activeProjectId,
    setActiveProjectId,
    deleteProject,
    completeProject,
    downloadProjectPdf,
    tasks,
  } = useProject();

  // Modals state
  const [blockedDeleteProject, setBlockedDeleteProject] = useState<Project | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<Project | null>(null);
  const [confirmCompleteProject, setConfirmCompleteProject] = useState<Project | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getMethodologyBadge = (method: Methodology) => {
    switch (method) {
      case 'XP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Code2 className="w-3.5 h-3.5" /> XP Engine
          </span>
        );
      case 'SCRUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Repeat className="w-3.5 h-3.5" /> Scrum Sprints
          </span>
        );
      case 'KANBAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <KanbanIcon className="w-3.5 h-3.5" /> Kanban Continuous
          </span>
        );
    }
  };

  const handleExecuteComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCompleteProject) return;
    setCompleteError(null);
    const res = completeProject(confirmCompleteProject.id, completionNotes);
    if (res.success) {
      setConfirmCompleteProject(null);
      setCompletionNotes('');
    } else {
      setCompleteError(res.message || 'Erro ao concluir o projeto.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Central de Projetos SprintForge
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Gestão Isolada de Projetos & Equipes Ágeis
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Cada projeto possui isolamento total de dados, chat e integrantes. Crie seu projeto definindo a quantidade de participantes para liberar os convites, gerencie papéis de Administrador e Membro e baixe relatórios em PDF ao concluir.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDiagnostic}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-purple-900/40 hover:shadow-purple-700/50 transition-all flex items-center gap-2 group"
            >
              <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              Diagnóstico Inteligente
            </button>

            <button
              onClick={onOpenNewProjectModal}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Projeto Rápido
            </button>
          </div>
        </div>
      </div>

      {/* Quick Layman Guide */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-purple-500/20 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Como Funciona a Gestão de Projetos e Convites</h3>
            <p className="text-xs text-slate-400">Regras de negócio do sistema para administradores e membros</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Crown className="w-4 h-4 text-amber-400" /> 1. Administrador (Criador)
            </div>
            <p className="text-xs text-slate-300">
              Quem cria o projeto é o Administrador responsável. Apenas o Admin pode convidar integrantes, excluir o projeto, concluir o projeto e remover participantes com justificativa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <Users className="w-4 h-4" /> 2. Convites & Participantes
            </div>
            <p className="text-xs text-slate-300">
              A quantidade de integrantes configurada no projeto define a capacidade de convites. Quando o convidado aceita, passa a interagir e pode também criar seus próprios projetos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <FileText className="w-4 h-4" /> 3. Conclusão & Relatório PDF
            </div>
            <p className="text-xs text-slate-300">
              Ao concluir o projeto, é gerado automaticamente um relatório PDF completo contendo métricas de tarefas, histórico de chat e lista de participantes.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> Meus Projetos ({myProjects.length})
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-purple-400" /> Dados Totalmente Isolados
          </span>
        </div>

        {myProjects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-base font-bold text-white">Nenhum projeto ativo no seu perfil</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Você não está participando de nenhum projeto no momento. Você pode criar um novo projeto com metodologia recomendada ou aguardar um convite por e-mail de um administrador.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onOpenDiagnostic}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Fazer Diagnóstico
              </button>
              <button
                onClick={onOpenNewProjectModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Criar Projeto
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const completedTasks = projTasks.filter((t) => t.status === 'done').length;
              const isSelected = proj.id === activeProjectId;
              const isCompleted = proj.status === 'COMPLETED';
              const isInactive = proj.status === 'INACTIVE';
              const isAdmin = currentUser?.id === proj.adminId;
              const activeMembersCount = proj.members?.length || 1;

              return (
                <div
                  key={proj.id}
                  className={`p-6 rounded-2xl bg-slate-900 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-purple-500/80 bg-slate-900/90 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/50'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-white">{proj.name}</h4>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-400" /> Admin
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {getMethodologyBadge(proj.activeMethodology)}
                          
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                            <Users className="w-3 h-3 text-cyan-400" /> {activeMembersCount}/{proj.teamSize} vagas
                          </span>

                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Concluído
                            </span>
                          ) : isInactive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Inativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Ativo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Project Button - Admin authorization check */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (isInactive || isCompleted) {
                              setConfirmDeleteProject(proj);
                            } else {
                              setBlockedDeleteProject(proj);
                            }
                          }}
                          className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold border ${
                            isInactive || isCompleted
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/40 shadow-sm'
                              : 'bg-slate-950 text-slate-500 hover:text-slate-400 border-slate-800/80 cursor-pointer'
                          }`}
                          title={
                            isInactive || isCompleted
                              ? 'Excluir Projeto'
                              : 'Projeto Ativo — Mude o status para Inativo para liberar a exclusão'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <p>Admin Responsável: <strong className="text-slate-300">{proj.adminName}</strong></p>
                      <p>Data de Criação: {proj.createdAt}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-400">
                      {completedTasks}/{projTasks.length} Concluídas
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Conclude Button for Admin */}
                      {isAdmin && !isCompleted && (
                        <button
                          onClick={() => {
                            setConfirmCompleteProject(proj);
                            setCompletionNotes('');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1"
                          title="Concluir Projeto e gerar Relatório PDF"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                        </button>
                      )}

                      {/* PDF Export for Completed */}
                      {isCompleted && (
                        <button
                          onClick={() => downloadProjectPdf(proj.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Relatório PDF
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveProjectId(proj.id);
                          onNavigateTab(proj.activeMethodology);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                      >
                        Abrir <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Blocked Deletion (Active Project Warning) */}
      {blockedDeleteProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-2">
                <Lock className="w-6 h-6" />
              </div>
              <button
                onClick={() => setBlockedDeleteProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Exclusão Bloqueada — Projeto Ativo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                O projeto <strong className="text-purple-300">"{blockedDeleteProject.name}"</strong> está atualmente <strong>ATIVO</strong>. Para excluí-lo de forma segura, altere seu status para <strong>INATIVO</strong> dentro das configurações do projeto.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setBlockedDeleteProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Entendido
              </button>
              <button
                onClick={() => {
                  setActiveProjectId(blockedDeleteProject.id);
                  onNavigateTab(blockedDeleteProject.activeMethodology);
                  setBlockedDeleteProject(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                Abrir Módulo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirm Deletion */}
      {confirmDeleteProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setConfirmDeleteProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Excluir Projeto Permanentemente?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apenas o Administrador pode excluir este projeto. Tem certeza de que deseja remover <strong className="text-rose-300">"{confirmDeleteProject.name}"</strong>?
              </p>
              {deleteError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setConfirmDeleteProject(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const res = deleteProject(confirmDeleteProject.id);
                  if (res.success) {
                    setConfirmDeleteProject(null);
                    setDeleteError(null);
                  } else {
                    setDeleteError(res.message || 'Erro ao excluir o projeto.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Sim, Excluir Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Complete Project Modal */}
      {confirmCompleteProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setConfirmCompleteProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Concluir Projeto & Gerar Relatório</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você está finalizando o projeto <strong className="text-emerald-300">"{confirmCompleteProject.name}"</strong>. Um relatório completo em PDF estará disponível para download imediato.
              </p>
              {completeError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {completeError}
                </div>
              )}
            </div>

            <form onSubmit={handleExecuteComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas de Encerramento (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Ex: Todas as entregas foram homologadas pelo PO com 100% de cobertura de testes."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmCompleteProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Concluir Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
