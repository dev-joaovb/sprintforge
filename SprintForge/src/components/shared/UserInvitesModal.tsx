import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Mail,
  CheckCircle2,
  XCircle,
  FolderKanban,
  Users,
  Sparkles,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface UserInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserInvitesModal: React.FC<UserInvitesModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { userPendingInvites, acceptInvite, declineInvite } = useProject();

  const [inputCode, setInputCode] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleAccept = (inviteId: string) => {
    const res = acceptInvite(inviteId);
    if (res.success) {
      onClose();
    } else {
      alert(res.message || 'Erro ao aceitar convite.');
    }
  };

  const handleDecline = (inviteId: string) => {
    declineInvite(inviteId);
  };

  const handleAcceptByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    // Find invite with matching code
    let matchingInviteId: string | null = null;
    userPendingInvites.forEach((inv) => {
      if (inv.inviteCode.toLowerCase() === inputCode.trim().toLowerCase()) {
        matchingInviteId = inv.id;
      }
    });

    if (matchingInviteId) {
      const res = acceptInvite(matchingInviteId);
      if (res.success) {
        setCodeFeedback({ success: true, message: 'Convite aceito com sucesso! Você entrou no projeto.' });
        setInputCode('');
        setTimeout(() => onClose(), 1200);
      } else {
        setCodeFeedback({ success: false, message: res.message || 'Falha ao aceitar convite.' });
      }
    } else {
      setCodeFeedback({
        success: false,
        message: 'Código de convite não localizado para a sua conta. Verifique os caracteres.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Meus Convites de Projetos</h2>
            <p className="text-xs text-slate-400">
              {currentUser?.email} • {userPendingInvites.length} convite(s) pendente(s)
            </p>
          </div>
        </div>

        {/* Enter Code Option */}
        <form onSubmit={handleAcceptByCode} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" /> Entrar por Código de Convite
          </label>

          {codeFeedback && (
            <div
              className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                codeFeedback.success
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {codeFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{codeFeedback.message}</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ex: SF-INV-1234"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 shrink-0"
            >
              Validar
            </button>
          </div>
        </form>

        {/* Pending Invites List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Convites Recebidos ({userPendingInvites.length})
          </h3>

          {userPendingInvites.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl space-y-1 bg-slate-950/40">
              <span className="text-xs font-semibold text-slate-400 block">Nenhum convite pendente no momento</span>
              <p className="text-[11px] text-slate-500">
                Quando outros administradores enviarem um convite para o seu e-mail, ele será exibido nesta lista.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {userPendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-purple-400" />
                        {inv.projectName}
                      </h4>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        Convidado por <strong className="text-slate-300">{inv.invitedByUserName}</strong>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {inv.projectMethodology}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-900">
                    <button
                      onClick={() => handleDecline(inv.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Recusar
                    </button>
                    <button
                      onClick={() => handleAccept(inv.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aceitar & Entrar
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
