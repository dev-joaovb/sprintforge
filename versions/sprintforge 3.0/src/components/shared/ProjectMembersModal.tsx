import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Users,
  UserPlus,
  Crown,
  UserMinus,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldAlert,
  Copy,
  Check,
  Briefcase,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const {
    activeProject,
    sendInvite,
    removeMember,
    leaveProject,
  } = useProject();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Member removal modal state (Admin removing member)
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [justification, setJustification] = useState('');
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Leave project modal state (Self leaving project)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // Copy code state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen || !activeProject) return null;

  const isAdmin =
    Boolean(currentUser) &&
    (currentUser?.id === activeProject.adminId ||
      Boolean(activeProject.adminEmail && currentUser?.email.toLowerCase() === activeProject.adminEmail.toLowerCase()));

  const currentMembers = activeProject.members || [];
  const pendingInvites = (activeProject.invites || []).filter((i) => i.status === 'PENDING');
  const availableSlots = Math.max(0, activeProject.teamSize - currentMembers.length);

  const isCurrentUserMember = currentMembers.some(
    (m) =>
      currentUser &&
      (m.id === currentUser.id ||
        Boolean(m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()))
  );

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    if (!inviteEmail.trim()) {
      setInviteError('Informe o e-mail do integrante.');
      return;
    }

    const res = sendInvite(activeProject.id, inviteEmail);
    if (res.success) {
      setInviteSuccess(`Convite enviado com sucesso para ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(null), 3000);
    } else {
      setInviteError(res.message || 'Erro ao enviar convite.');
    }
  };

  const handleConfirmRemoveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToRemove) return;
    setRemoveError(null);

    if (!justification.trim()) {
      setRemoveError('A justificativa é obrigatória para remover o integrante.');
      return;
    }

    const res = removeMember(activeProject.id, memberToRemove.id, justification);
    if (res.success) {
      setMemberToRemove(null);
      setJustification('');
    } else {
      setRemoveError(res.message || 'Erro ao remover membro.');
    }
  };

  const handleConfirmLeaveProject = () => {
    setLeaveError(null);
    const res = leaveProject(activeProject.id);
    if (res.success) {
      setIsLeaveModalOpen(false);
      onClose();
    } else {
      setLeaveError(res.message || 'Não foi possível sair do projeto.');
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Equipe & Convites do Projeto</h2>
              <p className="text-xs text-slate-400">
                {activeProject.name} • {currentMembers.length} de {activeProject.teamSize} vagas preenchidas
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Indicator Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Capacidade do Projeto: <strong className="text-purple-300">{activeProject.teamSize} integrantes</strong>
            </span>
            <p className="text-[11px] text-slate-400">
              {availableSlots > 0
                ? `Resta(m) ${availableSlots} vaga(s) para convidar novos membros.`
                : 'Todas as vagas do projeto foram preenchidas.'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-white">{currentMembers.length} / {activeProject.teamSize}</span>
          </div>
        </div>

        {/* Admin Invite Form */}
        {isAdmin && availableSlots > 0 && (
          <form onSubmit={handleSendInvite} className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-3">
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-purple-400" /> Enviar Novo Convite de Integrante
            </h3>

            {inviteError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="E-mail do novo participante..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all shrink-0 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" /> Enviar Convite
              </button>
            </div>
          </form>
        )}

        {/* Current Members List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Integrantes Ativos ({currentMembers.length})
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {currentMembers.map((member) => {
              const isMemberAdmin =
                member.role === 'ADMIN' ||
                member.id === activeProject.adminId ||
                (activeProject.adminEmail && member.email?.toLowerCase() === activeProject.adminEmail.toLowerCase());

              const isSelf =
                Boolean(currentUser) &&
                (currentUser?.id === member.id ||
                  Boolean(currentUser?.email && member.email && currentUser.email.toLowerCase() === member.email.toLowerCase()));

              return (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                      {member.name ? member.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{member.name}</span>
                        {isMemberAdmin ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" /> Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Participante
                          </span>
                        )}
                        {isSelf && <span className="text-[10px] text-purple-400 font-bold">(Você)</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-500" /> {member.techArea || 'Geral'}</span>
                        <span>• {member.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions per member row */}
                  <div className="flex items-center gap-2">
                    {isAdmin && !isMemberAdmin && !isSelf && (
                      <button
                        onClick={() => {
                          setMemberToRemove({ id: member.id, name: member.name });
                          setJustification('');
                          setRemoveError(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                        title="Remover participante alegando justificativa"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Remover
                      </button>
                    )}

                    {!isAdmin && isSelf && (
                      <button
                        onClick={() => {
                          setLeaveError(null);
                          setIsLeaveModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        title="Sair deste grupo de trabalho"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sair do Grupo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel for Leaving / Project Ownership Guidance */}
        {!isAdmin && isCurrentUserMember && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-rose-400" /> Sair do Grupo do Projeto
              </div>
              <p className="text-[11px] text-slate-400">
                Você é participante deste projeto. Se desejar deixar de fazer parte da equipe, clique no botão ao lado.
              </p>
            </div>
            <button
              onClick={() => {
                setLeaveError(null);
                setIsLeaveModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Sair do Grupo
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Você é o <strong>Administrador / Criador</strong> deste projeto. Para encerrá-lo ou excluí-lo, utilize a <strong>Central de Projetos</strong> ou marque o status do projeto como <strong>Inativo</strong>.
            </p>
          </div>
        )}

        {/* Pending Invites List */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Convites Pendentes ({pendingInvites.length})
            </h3>
            <div className="space-y-2">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">{inv.invitedEmail}</span>
                    <div className="text-[10px] text-slate-500">
                      Código: <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300 font-mono">{inv.inviteCode}</code> • Enviado em {inv.createdAt}
                    </div>
                  </div>
                  <button
                    onClick={() => copyInviteCode(inv.inviteCode)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {copiedCode === inv.inviteCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Código
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Self Leave Project Confirmation Modal */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-400">
                <LogOut className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-white">Sair do Projeto "{activeProject.name}"?</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Tem certeza de que deseja sair desta equipe? Você deixará de ter acesso ao quadro de tarefas e chat isolado deste projeto. Para retornar no futuro, será necessário receber um novo convite do administrador.
              </p>

              {leaveError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{leaveError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLeaveModalOpen(false);
                    setLeaveError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeaveProject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Confirmar e Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Remove Member Justification Modal */}
        {memberToRemove && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-white">Remover Integrante: {memberToRemove.name}</h3>
              </div>

              <p className="text-xs text-slate-300">
                O administrador deve alegar obrigatoriamente uma justificativa para a remoção deste participante do projeto.
              </p>

              {removeError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{removeError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmRemoveMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Justificativa de Remoção *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Ex: Reorganização interna de papéis / Solicitação de desligamento..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMemberToRemove(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                  >
                    <UserMinus className="w-3.5 h-3.5" /> Confirmar Remoção
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
