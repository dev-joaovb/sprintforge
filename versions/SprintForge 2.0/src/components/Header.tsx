import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { Methodology } from '../types';
import { startOnboardingTour } from '../utils/onboardingTour';
import {
  Flame,
  Plus,
  ChevronDown,
  Layers,
  Zap,
  Repeat,
  Kanban as KanbanIcon,
  Code2,
  Users,
  Lock,
  Mail,
  User as UserIcon,
  LogOut,
  LogIn,
  ShieldCheck,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenDiagnostic: () => void;
  onOpenNewProjectModal: () => void;
  onOpenNewTaskModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenInvitesModal: () => void;
  onOpenMembersModal: () => void;
  currentTab: 'XP' | 'SCRUM' | 'KANBAN' | 'DIAGNOSTIC';
  setCurrentTab: (tab: 'XP' | 'SCRUM' | 'KANBAN' | 'DIAGNOSTIC') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDiagnostic,
  onOpenNewProjectModal,
  onOpenNewTaskModal,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenInvitesModal,
  onOpenMembersModal,
  currentTab,
  setCurrentTab,
}) => {
  const { currentUser, logoutUser, isAuthenticated } = useAuth();
  const { myProjects, activeProject, setActiveProjectId, userPendingInvites } = useProject();
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartTour = () => {
    startOnboardingTour(currentUser?.id || 'guest', true);
  };

  const getMethodologyBadge = (method: Methodology) => {
    switch (method) {
      case 'XP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Code2 className="w-3 h-3" /> XP
          </span>
        );
      case 'SCRUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Repeat className="w-3 h-3" /> Scrum
          </span>
        );
      case 'KANBAN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <KanbanIcon className="w-3 h-3" /> Kanban
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Project Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div id="tour-brand" className="flex items-center gap-2 group cursor-pointer" onClick={() => setCurrentTab('DIAGNOSTIC')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Flame className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
                  SprintForge
                </h1>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Agile Platform</p>
              </div>
            </div>

            {/* Active Project Dropdown */}
            {activeProject && myProjects.length > 0 && (
              <div id="tour-project-selector" className="relative" ref={projectMenuRef}>
                <button
                  onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="max-w-[130px] sm:max-w-[170px] truncate">
                    <span className="text-xs font-bold text-slate-100 block truncate">{activeProject.name}</span>
                  </div>
                  {getMethodologyBadge(activeProject.activeMethodology)}
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {isProjectMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Meus Projetos ({myProjects.length})
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                      {myProjects.map((p) => {
                        const isCurrent = p.id === activeProject.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveProjectId(p.id);
                              setCurrentTab(p.activeMethodology);
                              setIsProjectMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                              isCurrent
                                ? 'bg-purple-500/10 text-white font-bold border border-purple-500/30'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="text-xs block truncate">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {p.members?.length || 1} membros • {p.deadline ? `Prazo: ${p.deadline}` : 'Sem prazo'}
                              </span>
                            </div>
                            {getMethodologyBadge(p.activeMethodology)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setIsProjectMenuOpen(false);
                          onOpenNewProjectModal();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Criar Outro Projeto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav id="tour-methodology-tabs" className="hidden md:flex items-center gap-1">
            <button
              id="tour-diagnostic-btn"
              onClick={() => setCurrentTab('DIAGNOSTIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'DIAGNOSTIC'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Central de Projetos
            </button>

            {activeProject && myProjects.length > 0 && (
              <button
                onClick={() => setCurrentTab(activeProject.activeMethodology)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                  currentTab !== 'DIAGNOSTIC'
                    ? activeProject.activeMethodology === 'XP'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                      : activeProject.activeMethodology === 'SCRUM'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                    : 'text-slate-300 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                {activeProject.activeMethodology === 'XP' && <Code2 className="w-3.5 h-3.5 text-cyan-400" />}
                {activeProject.activeMethodology === 'SCRUM' && <Repeat className="w-3.5 h-3.5 text-purple-400" />}
                {activeProject.activeMethodology === 'KANBAN' && <KanbanIcon className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Módulo: {activeProject.activeMethodology}</span>
              </button>
            )}
          </nav>

          {/* Header Action Buttons (Tour Guide, Members, Invites, New Project, Profile Dropdown) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Tour Guide Button */}
            <button
              id="tour-help-btn"
              onClick={handleStartTour}
              className="p-2 rounded-xl bg-slate-900 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 text-slate-400 hover:text-purple-300 transition-all"
              title="Guia Interativo da Plataforma (Tour com driver.js)"
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </button>

            {/* Members Modal Trigger */}
            {activeProject && myProjects.length > 0 && (
              <button
                onClick={onOpenMembersModal}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors relative"
                title="Integrantes e Convites do Projeto Selecionado"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center border border-slate-950">
                  {activeProject.members?.length || 1}
                </span>
              </button>
            )}

            {/* Invites Notification Bell */}
            <button
              onClick={onOpenInvitesModal}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors relative"
              title="Meus Convites Recebidos"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
              {userPendingInvites.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold text-white border border-slate-950 animate-bounce">
                  {userPendingInvites.length}
                </span>
              )}
            </button>

            {/* New Project Quick Trigger */}
            <button
              id="tour-new-project-btn"
              onClick={onOpenNewProjectModal}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>+ Projeto</span>
            </button>

            {/* User Profile / Auth Toggle with Logout option */}
            {isAuthenticated && currentUser ? (
              <div id="tour-profile-btn" className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
                  title="Minha Conta & Opções"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-purple-500/40"
                  />
                  <span className="text-xs font-bold truncate max-w-[80px] hidden sm:block">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown with Profile & Logout */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    
                    {/* User Summary Header */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-1 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-full object-cover border border-purple-500/40"
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          <Briefcase className="w-3 h-3" /> {currentUser.techArea}
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      <span>Meu Perfil & Relatórios</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleStartTour();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Reiniciar Tour Guiado</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenInvitesModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-indigo-400" />
                        <span>Meus Convites</span>
                      </div>
                      {userPendingInvites.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                          {userPendingInvites.length}
                        </span>
                      )}
                    </button>

                    <div className="pt-1 border-t border-slate-800 my-1" />

                    {/* Sair do Login Button */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logoutUser();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sair do Login</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" /> Entrar
              </button>
            )}

          </div>

        </div>

        {/* Mobile Subheader Nav */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => setCurrentTab('DIAGNOSTIC')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentTab === 'DIAGNOSTIC' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" /> Central de Projetos
          </button>
          {activeProject && myProjects.length > 0 && (
            <button
              onClick={() => setCurrentTab(activeProject.activeMethodology)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs whitespace-nowrap font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40`}
            >
              <Lock className="w-3 h-3 text-purple-400" /> Módulo Ativo: {activeProject.activeMethodology}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
