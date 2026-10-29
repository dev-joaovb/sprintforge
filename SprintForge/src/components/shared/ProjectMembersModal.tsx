
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
      Boolean(
        activeProject.adminEmail &&
        currentUser?.email.toLowerCase() === activeProject.adminEmail.toLowerCase()
      ));

  const currentMembers = activeProject.members || [];
  const pendingInvites = (activeProject.invites || []).filter(
    (i) => i.status === 'PENDING'
  );
  const availableSlots = Math.max(
    0,
    activeProject.teamSize - currentMembers.length
  );

  const isCurrentUserMember = currentMembers.some(
    (m) =>
      currentUser &&
      (m.id === currentUser.id ||
        Boolean(
          m.email &&
          currentUser.email &&
          m.email.toLowerCase() === currentUser.email.toLowerCase()
        ))
  );

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);

    if (!inviteEmail.trim()) {
      setInviteError('Informe o e-mail do integrante.');
      return;
    }

    const res = await sendInvite(activeProject.id, inviteEmail);
    if (res.success) {
      setInviteSuccess(`Convite enviado com sucesso para ${inviteEmail}!`);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(null), 3000);
    } else {
      setInviteError(res.message || 'Erro ao enviar convite.');
    }
  };

  const handleConfirmRemoveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToRemove) return;
    setRemoveError(null);

    if (!justification.trim()) {
      setRemoveError('A justificativa é obrigatória para remover o integrante.');
      return;
    }

    const res = await removeMember(
      activeProject.id,
      memberToRemove.id,
      justification
    );

    if (res.success) {
      setMemberToRemove(null);
      setJustification('');
    } else {
      setRemoveError(res.message || 'Erro ao remover membro.');
    }
  };

  const handleConfirmLeaveProject = async () => {
    setLeaveError(null);
    const res = await leaveProject(activeProject.id);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-2xl shadow-slate-950/20 space-y-6 text-[#0F172A]">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar equipe e convites"
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 border-b border-slate-200 pb-4 pr-9">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 shrink-0">
              <Users className="w-5 h-5" />
            </span>

            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
                Equipe & Convites do Projeto
              </h2>
              <p className="text-xs text-slate-600 break-words">
                {activeProject.name} • {currentMembers.length} de{' '}
                {activeProject.teamSize} vagas preenchidas
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Indicator Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 flex flex-wrap items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Capacidade do Projeto:
              <strong className="text-blue-700">
                {activeProject.teamSize} integrantes
              </strong>
            </span>

            <p className="text-[11px] text-slate-600">
              {availableSlots > 0
                ? `Resta(m) ${availableSlots} vaga(s) para convidar novos membros.`
                : 'Todas as vagas do projeto foram preenchidas.'}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-lg font-extrabold text-[#0F172A]">
              {currentMembers.length} / {activeProject.teamSize}
            </span>
          </div>
        </div>

        {/* Admin Invite Form */}
        {isAdmin && availableSlots > 0 && (
          <form
            onSubmit={handleSendInvite}
            className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3"
          >
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Enviar Novo Convite de Integrante
            </h3>

            {inviteError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="E-mail do novo participante..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Enviar Convite
              </button>
            </div>
          </form>
        )}

        {/* Current Members List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Integrantes Ativos ({currentMembers.length})
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {currentMembers.map((member) => {
              const isMemberAdmin =
                member.role === 'ADMIN' ||
                member.id === activeProject.adminId ||
                (activeProject.adminEmail &&
                  member.email?.toLowerCase() ===
                    activeProject.adminEmail.toLowerCase());

              const isSelf =
                Boolean(currentUser) &&
                (currentUser?.id === member.id ||
                  Boolean(
                    currentUser?.email &&
                    member.email &&
                    currentUser.email.toLowerCase() ===
                      member.email.toLowerCase()
                  ));

              return (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-700 shrink-0">
                      {member.name
                        ? member.name.substring(0, 2).toUpperCase()
                        : 'US'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 break-words">
                          {member.name}
                        </span>

                        {isMemberAdmin ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Participante
                          </span>
                        )}

                        {isSelf && (
                          <span className="text-[10px] text-blue-700 font-bold">
                            (Você)
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          {member.techArea || 'Geral'}
                        </span>
                        <span className="break-all">
                          • {member.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions per member row */}
                  <div className="flex items-center gap-2 sm:shrink-0 pl-12 sm:pl-0">
                    {isAdmin && !isMemberAdmin && !isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberToRemove({
                            id: member.id,
                            name: member.name,
                          });
                          setJustification('');
                          setRemoveError(null);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Remover participante alegando justificativa"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    )}

                    {!isAdmin && isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          setLeaveError(null);
                          setIsLeaveModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Sair deste grupo de trabalho"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair do Grupo
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
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-rose-600" />
                Sair do Grupo do Projeto
              </div>

              <p className="text-[11px] text-slate-600">
                Você é participante deste projeto. Se desejar deixar de fazer
                parte da equipe, clique no botão ao lado.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setLeaveError(null);
                setIsLeaveModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Sair do Grupo
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Você é o <strong>Administrador / Criador</strong> deste projeto.
              Para encerrá-lo ou excluí-lo, utilize a{' '}
              <strong>Central de Projetos</strong> ou marque o status do
              projeto como <strong>Inativo</strong>.
            </p>
          </div>
        )}

        {/* Pending Invites List */}
        {pendingInvites.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Convites Pendentes ({pendingInvites.length})
            </h3>

            <div className="space-y-2">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="font-semibold text-slate-800 break-all">
                      {inv.invitedEmail}
                    </span>

                    <div className="text-[10px] text-slate-600 flex flex-wrap items-center gap-1">
                      <span>Código:</span>
                      <code className="bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-mono break-all">
                        {inv.inviteCode}
                      </code>
                      <span>• Enviado em {inv.createdAt}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyInviteCode(inv.inviteCode)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 transition-colors flex items-center justify-center gap-1.5 text-[11px] shrink-0 self-start sm:self-auto"
                  >
                    {copiedCode === inv.inviteCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Código
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
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-rose-200 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-start gap-2 text-rose-700">
                <LogOut className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Sair do Projeto "{activeProject.name}"?
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza de que deseja sair desta equipe? Você deixará de
                ter acesso ao quadro de tarefas e chat isolado deste projeto.
                Para retornar no futuro, será necessário receber um novo
                convite do administrador.
              </p>

              {leaveError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{leaveError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLeaveModalOpen(false);
                    setLeaveError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmLeaveProject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Confirmar e Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Remove Member Justification Modal */}
        {memberToRemove && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-rose-200 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-start gap-2 text-rose-700">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Remover Integrante: {memberToRemove.name}
                </h3>
              </div>

              <p className="text-xs text-slate-600">
                O administrador deve alegar obrigatoriamente uma justificativa
                para a remoção deste participante do projeto.
              </p>

              {removeError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{removeError}</span>
                </div>
              )}

              <form
                onSubmit={handleConfirmRemoveMember}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Justificativa de Remoção *
                  </label>

                  <textarea
                    required
                    rows={3}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Ex: Reorganização interna de papéis / Solicitação de desligamento..."
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMemberToRemove(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    Confirmar Remoção
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
