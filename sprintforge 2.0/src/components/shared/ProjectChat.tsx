import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import {
  MessageSquare,
  Send,
  Crown,
  User as UserIcon,
  Sparkles,
  X,
  Info,
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Chat do Projeto</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
              {activeProject.name} (Isolado)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Info Notice Banner */}
      <div className="px-4 py-2 bg-purple-950/30 border-b border-purple-500/20 flex items-center gap-2 text-[11px] text-purple-300">
        <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Canal de chat exclusivo para membros deste projeto.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {activeProjectChat.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
            <MessageSquare className="w-10 h-10 stroke-1 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">Nenhuma mensagem enviada ainda</p>
            <p className="text-[11px]">Seja o primeiro a enviar uma mensagem para a equipe!</p>
          </div>
        ) : (
          activeProjectChat.map((msg) => {
            if (msg.isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] space-y-1 my-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Evento do Sistema</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p>{msg.content}</p>
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
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    {msg.senderName}
                    {isAdminSender && <Crown className="w-3 h-3 text-amber-400" />}
                  </span>
                  {msg.senderTechArea && (
                    <span className="text-slate-500">• {msg.senderTechArea}</span>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                    isSelf
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
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
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Digite sua mensagem para a equipe..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
