import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Header } from './components/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { XPModule } from './components/xp/XPModule';
import { ScrumModule } from './components/scrum/ScrumModule';
import { KanbanModule } from './components/kanban/KanbanModule';
import { DiagnosticModal } from './components/diagnostic/DiagnosticModal';
import { NewProjectModal } from './components/shared/NewProjectModal';
import { TaskModal } from './components/shared/TaskModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ProjectMembersModal } from './components/shared/ProjectMembersModal';
import { UserInvitesModal } from './components/shared/UserInvitesModal';
import { ProjectChat } from './components/shared/ProjectChat';
import { startOnboardingTour } from './utils/onboardingTour';
import { Task } from './types';
import { MessageSquare } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { activeProject, activeProjectChat, myProjects } = useProject();

  // Landing / Login screen flow for unauthenticated visitors
  const [unauthView, setUnauthView] = useState<'landing' | 'login' | 'register'>('landing');

  const [currentTab, setCurrentTab] = useState<'XP' | 'SCRUM' | 'KANBAN' | 'DIAGNOSTIC'>('DIAGNOSTIC');

  // Modals state
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Profile & Collaboration Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInvitesModalOpen, setIsInvitesModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Sync tab with active project's activeMethodology or default to DIAGNOSTIC
  useEffect(() => {
    if (activeProject && myProjects.length > 0) {
      if (currentTab !== 'DIAGNOSTIC') {
        setCurrentTab(activeProject.activeMethodology);
      }
    } else {
      setCurrentTab('DIAGNOSTIC');
    }
  }, [activeProject?.id, activeProject?.activeMethodology, myProjects.length]);

  // Automatic onboarding tour for new users (triggers smoothly once per user)
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const timer = setTimeout(() => {
        startOnboardingTour(currentUser.id, false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentUser?.id]);

  const handleOpenTaskModalForEdit = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  // If user is not logged in: show Landing Page by default, with option to enter Login / Register
  if (!isAuthenticated || !currentUser) {
    if (unauthView === 'landing') {
      return (
        <LandingPage
          onOpenLogin={() => setUnauthView('login')}
          onOpenRegister={() => setUnauthView('register')}
        />
      );
    }

    return (
      <LoginScreen
        initialMode={unauthView === 'register' ? 'register' : 'login'}
        onBackToLanding={() => setUnauthView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white relative">
      
      {/* Header Bar */}
      <Header
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
        onOpenNewTaskModal={() => handleOpenTaskModalForEdit(undefined)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenInvitesModal={() => setIsInvitesModalOpen(true)}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Active Tab View Rendering */}
        {currentTab === 'XP' && (
          <XPModule
            onOpenTaskModal={() => handleOpenTaskModalForEdit()}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />
        )}
        {currentTab === 'SCRUM' && (
          <ScrumModule
            onOpenTaskModal={() => handleOpenTaskModalForEdit()}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />
        )}
        {currentTab === 'KANBAN' && (
          <KanbanModule
            onOpenTaskModal={handleOpenTaskModalForEdit}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />
        )}
        {currentTab === 'DIAGNOSTIC' && (
          <DashboardOverview
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

      </main>

      {/* Floating Project Chat Button - only when a specific project is selected & viewed */}
      {currentTab !== 'DIAGNOSTIC' && activeProject && (
        <div className="fixed bottom-6 right-6 z-30 animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-2xl shadow-cyan-950/90 border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all group"
            title={`Abrir Chat Isolado do Projeto "${activeProject.name}"`}
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              {activeProjectChat.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <span className="hidden sm:inline">Chat:</span>
            <span className="max-w-[140px] truncate font-bold text-cyan-100">{activeProject.name}</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> SprintForge Agile Platform
          </div>
          <div>XP (Extreme Programming) • Scrum Iterations • Kanban Continuous Flow</div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onProjectCreated={() => {
          setIsDiagnosticOpen(false);
        }}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Project Members & Invites Modal */}
      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />

      {/* User Received Invites Modal */}
      <UserInvitesModal
        isOpen={isInvitesModalOpen}
        onClose={() => setIsInvitesModalOpen(false)}
      />

      {/* Isolated Project Chat Drawer */}
      <ProjectChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainAppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}
