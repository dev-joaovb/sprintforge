
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Mail,
  CheckCircle2,
  XCircle,
  FolderKanban,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface UserInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserInvitesModal: React.FC<UserInvitesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { userPendingInvites, acceptInvite, declineInvite } = useProject();

  const [inputCode, setInputCode] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAccept = async (inviteCode: string) => {
    const res = await acceptInvite(inviteCode);
    if (res.success) {
      onClose();
    } else {
      alert(res.message || 'Erro ao aceitar convite.');
    }
  };

  const handleDecline = (inviteId: string) => {
    declineInvite(inviteId);
  };

  const handleAcceptByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = await acceptInvite(inputCode.trim());

    if (res.success) {
      setCodeFeedback({
        success: true,
        message: 'Convite aceito com sucesso! Você entrou no projeto.',
      });
      setInputCode('');
      setTimeout(() => onClose(), 1200);
    } else {
      setCodeFeedback({
        success: false,
        message: res.message || 'Falha ao aceitar convite.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl shadow-slate-950/20 space-y-5 text-[#0F172A]">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar meus convites"
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 pr-9">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 shrink-0">
            <Mail className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#0F172A]">
              Meus Convites de Projetos
            </h2>
            <p className="text-xs text-slate-600 break-all">
              {currentUser?.email} • {userPendingInvites.length} convite(s) pendente(s)
            </p>
          </div>
        </div>

        {/* Enter Code Option */}
        <form
          onSubmit={handleAcceptByCode}
          className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3"
        >
          <label className="block text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            Entrar por Código de Convite
          </label>

          {codeFeedback && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                codeFeedback.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {codeFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{codeFeedback.message}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ex: SF-INV-1234"
              className="w-full min-w-0 flex-1 px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 uppercase placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />

            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm shrink-0 transition-colors"
            >
              Validar
            </button>
          </div>
        </form>

        {/* Pending Invites List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Convites Recebidos ({userPendingInvites.length})
          </h3>

          {userPendingInvites.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-300 rounded-xl space-y-2 bg-slate-50">
              <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400">
                <Mail className="w-5 h-5" />
              </div>

              <span className="text-xs font-semibold text-slate-700 block">
                Nenhum convite pendente no momento
              </span>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Quando outros administradores enviarem um convite para o seu
                e-mail, ele será exibido nesta lista.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {userPendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col gap-3 hover:border-blue-200 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 flex items-start gap-1.5 break-words">
                        <FolderKanban className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {inv.projectName}
                      </h4>

                      <p className="text-[11px] text-slate-600 pt-1">
                        Convidado por{' '}
                        <strong className="text-slate-800">
                          {inv.invitedByUserName}
                        </strong>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {inv.projectMethodology}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleDecline(inv.id)}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Recusar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAccept(inv.inviteCode)}
                      className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Entrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
