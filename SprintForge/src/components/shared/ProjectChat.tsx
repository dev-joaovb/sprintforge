import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  MessageSquare,
  Send,
  Crown,
  Sparkles,
  X,
  Lock,
} from 'lucide-react';

interface ProjectChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectChat: React.FC<ProjectChatProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { activeProject, activeProjectChat, addChatMessage } = useProject();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, activeProjectChat.length]);

  if (!isOpen || !activeProject) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    addChatMessage(activeProject.id, inputMessage);
    setInputMessage('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chat do Projeto"
      className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:w-96 animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span>Chat do Projeto</span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-label="Chat disponível" />
            </h3>
            <p className="max-w-[200px] truncate text-xs text-slate-500" title={activeProject.name}>
              {activeProject.name} (Isolado)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar chat do projeto"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-start gap-2 border-b border-blue-100 bg-blue-50/70 px-5 py-3 text-xs leading-relaxed text-blue-800">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <span>Canal de chat exclusivo para membros deste projeto.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-5 sm:px-5">
        {activeProjectChat.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <MessageSquare className="h-7 w-7 text-blue-500" strokeWidth={1.6} />
            </div>
            <p className="text-sm font-semibold text-slate-800">Nenhuma mensagem enviada ainda</p>
            <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-slate-500">
              Seja o primeiro a enviar uma mensagem para a equipe!
            </p>
          </div>
        ) : (
          activeProjectChat.map((msg) => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="my-3 space-y-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3.5 py-3 text-xs leading-relaxed text-indigo-900"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-indigo-700">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Evento do Sistema
                    </span>
                    <span className="shrink-0 font-normal text-indigo-500">{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              );
            }

            const isSelf = currentUser?.id === msg.senderId;
            const isAdminSender = msg.senderRole === 'ADMIN';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className={`mb-1.5 flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 px-1 text-[11px] text-slate-500 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    {msg.senderName}
                    {isAdminSender && <Crown className="h-3.5 w-3.5 text-amber-500" aria-label="Administrador" />}
                  </span>
                  {msg.senderTechArea && (
                    <span className="text-slate-500">• {msg.senderTechArea}</span>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-3 text-xs leading-relaxed shadow-sm ${
                    isSelf
                      ? 'rounded-tr-sm bg-blue-600 text-white'
                      : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:px-5"
      >
        {activeProject.status === 'COMPLETED' ? (
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs italic leading-relaxed text-slate-500">
            <Lock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
            O chat está desativado pois este projeto foi concluído.
          </div>
        ) : (
          <>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem para a equipe..."
              aria-label="Mensagem para a equipe"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              aria-label="Enviar mensagem"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </>
        )}
      </form>
    </div>
  );
};
