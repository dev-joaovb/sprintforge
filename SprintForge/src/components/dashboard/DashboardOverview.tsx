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
  CheckCircle2,
  Crown,
  Download,
  FileText,
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Code2 className="w-3.5 h-3.5" /> XP Engine
          </span>
        );
      case 'SCRUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-800 border border-violet-200">
            <Repeat className="w-3.5 h-3.5" /> Scrum Sprints
          </span>
        );
      case 'KANBAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <KanbanIcon className="w-3.5 h-3.5" /> Kanban Continuous
          </span>
        );
    }
  };

  const handleExecuteComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCompleteProject) return;
    setCompleteError(null);
    const res = await completeProject(confirmCompleteProject.id, completionNotes);
    if (res.success) {
      setConfirmCompleteProject(null);
      setCompletionNotes('');
    } else {
      setCompleteError(res.message || 'Erro ao concluir o projeto.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-slate-900">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-[#2563EB] border border-blue-600 shadow-sm">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white border border-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Central de Projetos SprintForge
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Gestão Isolada de Projetos & Equipes Ágeis
          </h2>

          <p className="max-w-2xl text-sm sm:text-base text-blue-50 leading-7">
            Cada projeto possui isolamento total de dados, chat e integrantes. Crie seu projeto definindo a quantidade de participantes para liberar os convites, gerencie papéis de Administrador e Membro e baixe relatórios em PDF ao concluir.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenDiagnostic}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm shadow-sm transition-colors duration-200 flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              Diagnóstico Inteligente
            </button>

            <button
              onClick={onOpenNewProjectModal}
              className="px-5 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm border border-blue-400/50 transition-colors duration-200 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto Rápido
            </button>
          </div>
        </div>
      </div>

      {/* Quick Layman Guide */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Como Funciona a Gestão de Projetos e Convites</h3>
            <p className="text-xs text-slate-500">Regras de negócio do sistema para administradores e membros</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
              <Crown className="w-4 h-4 text-amber-600" /> 1. Administrador (Criador)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quem cria o projeto é o Administrador responsável. Apenas o Admin pode convidar integrantes, excluir o projeto, concluir o projeto e remover participantes com justificativa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-800">
              <Users className="w-4 h-4" /> 2. Convites & Participantes
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A quantidade de integrantes configurada no projeto define a capacidade de convites. Quando o convidado aceita, passa a interagir e pode também criar seus próprios projetos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <FileText className="w-4 h-4" /> 3. Conclusão & Relatório PDF
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ao concluir o projeto, é gerado automaticamente um relatório PDF completo contendo métricas de tarefas, histórico de chat e lista de participantes.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-700" /> Meus Projetos ({myProjects.length})
          </h3>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-700" /> Dados Totalmente Isolados
          </span>
        </div>

        {myProjects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 mx-auto flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-base font-bold text-slate-900">Nenhum projeto ativo no seu perfil</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você não está participando de nenhum projeto no momento. Você pode criar um novo projeto com metodologia recomendada ou aguardar um convite por e-mail de um administrador.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={onOpenDiagnostic}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> Fazer Diagnóstico
              </button>
              <button
                onClick={onOpenNewProjectModal}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors"
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
                  className={`relative p-6 rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1 hover:shadow-lg ${
                    isSelected
                      ? 'border-blue-500 shadow-lg shadow-blue-900/10 ring-1 ring-blue-200'
                      : 'border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug break-words">{proj.name}</h4>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-600" /> Admin
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {getMethodologyBadge(proj.activeMethodology)}

                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <Users className="w-3 h-3 text-cyan-700" /> {activeMembersCount}/{proj.teamSize} vagas
                          </span>

                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Concluído
                            </span>
                          ) : isInactive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
                              Inativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" /> Ativo
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
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-rose-200'
                              : 'bg-slate-50 text-slate-500 hover:text-slate-700 border-slate-200 cursor-pointer'
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

                    <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <p>Admin Responsável: <strong className="text-slate-700">{proj.adminName}</strong></p>
                      <p>Data de Criação: {proj.createdAt}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs font-semibold text-slate-500">
                      {completedTasks}/{projTasks.length} Concluídas
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Conclude Button for Admin */}
                      {isAdmin && !isCompleted && (
                        <button
                          onClick={() => {
                            setConfirmCompleteProject(proj);
                            setCompletionNotes('');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1"
                          title="Concluir Projeto e gerar Relatório PDF"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                        </button>
                      )}

                      {/* PDF Export for Completed */}
                      {isCompleted && (
                        <button
                          onClick={() => downloadProjectPdf(proj.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-700 text-violet-800 hover:text-white border border-violet-200 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> Relatório PDF
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveProjectId(proj.id);
                          onNavigateTab(proj.activeMethodology);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-700 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-700 text-xs font-bold transition-all flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-slate-900/20 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-2">
                <Lock className="w-6 h-6" />
              </div>
              <button
                onClick={() => setBlockedDeleteProject(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Exclusão Bloqueada — Projeto Ativo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O projeto <strong className="text-blue-800">"{blockedDeleteProject.name}"</strong> está atualmente <strong>ATIVO</strong>. Para excluí-lo de forma segura, altere seu status para <strong>INATIVO</strong> dentro das configurações do projeto.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setBlockedDeleteProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Entendido
              </button>
              <button
                onClick={() => {
                  setActiveProjectId(blockedDeleteProject.id);
                  onNavigateTab(blockedDeleteProject.activeMethodology);
                  setBlockedDeleteProject(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                Abrir Módulo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirm Deletion */}
      {confirmDeleteProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-slate-900/20 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setConfirmDeleteProject(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Excluir Projeto Permanentemente?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apenas o Administrador pode excluir este projeto. Tem certeza de que deseja remover <strong className="text-rose-700">"{confirmDeleteProject.name}"</strong>?
              </p>
              {deleteError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setConfirmDeleteProject(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const res = await deleteProject(confirmDeleteProject.id);
                  if (res.success) {
                    setConfirmDeleteProject(null);
                    setDeleteError(null);
                  } else {
                    setDeleteError(res.message || 'Erro ao excluir o projeto.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Sim, Excluir Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Complete Project Modal */}
      {confirmCompleteProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-slate-900/20 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setConfirmCompleteProject(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Concluir Projeto & Gerar Relatório</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você está finalizando o projeto <strong className="text-emerald-800">"{confirmCompleteProject.name}"</strong>. Um relatório completo em PDF estará disponível para download imediato.
              </p>
              {completeError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {completeError}
                </div>
              )}
            </div>

            <form onSubmit={handleExecuteComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Encerramento (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Ex: Todas as entregas foram homologadas pelo PO com 100% de cobertura de testes."
                  className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed transition-colors focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConfirmCompleteProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
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
