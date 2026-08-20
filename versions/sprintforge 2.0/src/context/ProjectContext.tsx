import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import {
  Project,
  Task,
  Methodology,
  KanbanColumnId,
  PairSession,
  TddTestCase,
  CiBuild,
  Sprint,
  PlanningPokerSession,
  DailyNote,
  RetroCard,
  DiagnosticAnswer,
  TeamMember,
  ProjectInvite,
  ChatMessage,
  MemberRemovalLog,
  ProjectMember,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_MEMBERS,
  MOCK_PAIR_SESSIONS,
  MOCK_TDD_TESTS,
  MOCK_CI_BUILDS,
  INITIAL_SPRINTS,
  INITIAL_POKER_SESSIONS,
  MOCK_DAILY_NOTES,
  MOCK_RETRO_CARDS,
  INITIAL_CHAT_MESSAGES,
} from '../data/mockData';
import { calculateDiagnosticResult } from '../data/diagnosticQuestions';
import { generateProjectPdfReport } from '../utils/pdfGenerator';

interface ProjectContextType {
  projects: Project[];
  myProjects: Project[];
  completedProjects: Project[];
  activeProjectId: string;
  activeProject: Project | null;
  tasks: Task[];
  activeProjectTasks: Task[];
  teamMembers: TeamMember[];
  pairSessions: PairSession[];
  tddTests: TddTestCase[];
  ciBuilds: CiBuild[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  planningPoker: PlanningPokerSession;
  dailyNotes: DailyNote[];
  retroCards: RetroCard[];
  
  // Chat & Invites
  chatMessages: ChatMessage[];
  activeProjectChat: ChatMessage[];
  userPendingInvites: ProjectInvite[];

  // Project Actions
  setActiveProjectId: (id: string) => void;
  createProject: (
    name: string,
    description: string,
    diagnosticAnswers?: DiagnosticAnswer[],
    manualMethodology?: Methodology,
    teamSize?: number
  ) => Project;
  updateProjectMethodology: (projectId: string, methodology: Methodology) => void;
  updateProjectWipLimits: (projectId: string, wipLimits: Record<KanbanColumnId, number>) => void;
  updateProjectStatus: (projectId: string, status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED') => void;
  deleteProject: (projectId: string) => { success: boolean; message?: string };
  completeProject: (projectId: string, notes?: string) => { success: boolean; message?: string };

  // Team & Invites Actions
  sendInvite: (projectId: string, invitedEmail: string) => { success: boolean; message?: string };
  acceptInvite: (inviteId: string) => { success: boolean; message?: string };
  declineInvite: (inviteId: string) => { success: boolean; message?: string };
  removeMember: (projectId: string, memberId: string, justification: string) => { success: boolean; message?: string };
  leaveProject: (projectId: string) => { success: boolean; message?: string };

  // Chat Actions
  addChatMessage: (projectId: string, content: string) => void;

  // PDF Export
  downloadProjectPdf: (projectId: string) => void;

  // Task Actions
  addTask: (taskData: Partial<Task>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTaskStatus: (taskId: string, newStatus: KanbanColumnId, sprintId?: string | null) => void;
  deleteTask: (taskId: string) => void;

  // XP Actions
  addPairSession: (driverId: string, navigatorId: string, featureName: string, durationMinutes: number) => void;
  updatePairStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') => void;
  addTddTest: (featureName: string, testName: string, codeSnippet?: string) => void;
  toggleTddStatus: (id: string) => void;
  runTddSuiteSimulated: () => void;

  // Scrum Actions
  votePlanningPoker: (memberId: string, vote: number | string) => void;
  revealPlanningPoker: () => void;
  resetPlanningPoker: (taskId: string, taskTitle: string) => void;
  addDailyNote: (yesterday: string, today: string, impediments: string, author: string) => void;
  addRetroCard: (category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM', content: string, author: string) => void;
  voteRetroCard: (id: string) => void;
  completeActiveSprint: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY_PROJECTS = 'sprintforge_projects_v2';
const STORAGE_KEY_TASKS = 'sprintforge_tasks_v2';
const STORAGE_KEY_CHAT = 'sprintforge_chat_messages_v2';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, findUserByEmail } = useAuth();

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to load saved projects:', e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || 'proj_xp_1';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TASKS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TASKS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHAT);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [teamMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [pairSessions, setPairSessions] = useState<PairSession[]>(MOCK_PAIR_SESSIONS);
  const [tddTests, setTddTests] = useState<TddTestCase[]>(MOCK_TDD_TESTS);
  const [ciBuilds, setCiBuilds] = useState<CiBuild[]>(MOCK_CI_BUILDS);
  const [sprints, setSprints] = useState<Sprint[]>(INITIAL_SPRINTS);
  const [pokerSessions, setPokerSessions] = useState<PlanningPokerSession[]>(INITIAL_POKER_SESSIONS);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>(MOCK_DAILY_NOTES);
  const [retroCards, setRetroCards] = useState<RetroCard[]>(MOCK_RETRO_CARDS);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Filter projects accessible to the current user (Owner or active Member)
  const myProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter((p) => {
      const isOwner =
        p.adminId === currentUser.id ||
        Boolean(p.adminEmail && currentUser.email && p.adminEmail.toLowerCase() === currentUser.email.toLowerCase());
      const isMember = p.members?.some(
        (m) =>
          m.id === currentUser.id ||
          Boolean(m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      return isOwner || isMember;
    });
  }, [projects, currentUser]);

  // Completed projects count for user profile
  const completedProjects = myProjects.filter((p) => p.status === 'COMPLETED');

  // Currently active project selection (strictly from myProjects)
  const activeProject = useMemo(() => {
    if (myProjects.length === 0) return null;
    return myProjects.find((p) => p.id === activeProjectId) || myProjects[0] || null;
  }, [myProjects, activeProjectId]);

  // Auto-synchronize activeProjectId whenever myProjects changes
  useEffect(() => {
    if (myProjects.length > 0) {
      const isCurrentActiveValid = myProjects.some((p) => p.id === activeProjectId);
      if (!isCurrentActiveValid) {
        setActiveProjectId(myProjects[0].id);
      }
    } else {
      if (activeProjectId !== '') {
        setActiveProjectId('');
      }
    }
  }, [myProjects, activeProjectId]);

  const activeProjectTasks = tasks.filter((t) => t.projectId === (activeProject?.id || activeProjectId));

  // Chat for active project
  const activeProjectChat = chatMessages.filter(
    (c) => c.projectId === (activeProject?.id || activeProjectId)
  );

  // Pending invitations for current logged in user
  const userPendingInvites: ProjectInvite[] = [];
  if (currentUser) {
    projects.forEach((proj) => {
      if (proj.invites) {
        proj.invites.forEach((inv) => {
          if (
            inv.status === 'PENDING' &&
            inv.invitedEmail.toLowerCase() === currentUser.email.toLowerCase()
          ) {
            userPendingInvites.push(inv);
          }
        });
      }
    });
  }

  // Active project metrics
  const activeProjectPairSessions = pairSessions.filter((p) => p.projectId === (activeProject?.id || activeProjectId));
  const activeProjectTddTests = tddTests.filter((t) => t.projectId === (activeProject?.id || activeProjectId));
  const activeSprint = sprints.find((s) => s.projectId === (activeProject?.id || activeProjectId) && s.status === 'ACTIVE') || null;

  const defaultPokerForProject: PlanningPokerSession = {
    id: `poker_${activeProjectId}`,
    projectId: activeProjectId,
    taskId: activeProjectTasks[0]?.id || `task_${activeProjectId}`,
    taskTitle: activeProjectTasks[0]?.title || 'Ajuste de Requisitos do Projeto',
    votes: teamMembers.map((m) => ({ memberId: m.id, vote: null, hasVoted: false })),
    revealed: false,
    consensusEstimate: null,
  };

  const activeProjectPoker = pokerSessions.find((p) => p.projectId === (activeProject?.id || activeProjectId)) || defaultPokerForProject;

  // Project Creation (Current User becomes Admin)
  const createProject = (
    name: string,
    description: string,
    diagnosticAnswers?: DiagnosticAnswer[],
    manualMethodology?: Methodology,
    teamSize: number = 5
  ): Project => {
    let result = diagnosticAnswers && diagnosticAnswers.length > 0 ? calculateDiagnosticResult(diagnosticAnswers) : undefined;
    const recommended: Methodology = result ? result.recommended : manualMethodology || 'SCRUM';
    const activeMeth: Methodology = manualMethodology || recommended;

    const adminUser: ProjectMember = currentUser
      ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'ADMIN',
          techArea: currentUser.techArea,
          joinedAt: new Date().toISOString().split('T')[0],
          avatar: currentUser.avatarUrl,
        }
      : {
          id: 'user_admin_1',
          name: 'João Victor',
          email: 'joao@sprintforge.com',
          role: 'ADMIN',
          techArea: 'Engenharia Fullstack',
          joinedAt: new Date().toISOString().split('T')[0],
        };

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      adminId: adminUser.id,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
      recommendedMethodology: recommended,
      activeMethodology: activeMeth,
      createdAt: new Date().toISOString().split('T')[0],
      tags: [activeMeth, 'Novo Projeto'],
      members: [adminUser],
      teamSize: Math.max(1, teamSize),
      status: 'ACTIVE',
      invites: [],
      removalLogs: [],
      wipLimits: {
        backlog: 15,
        todo: 6,
        in_progress: 3,
        review: 3,
        done: 50,
      },
      diagnosticAnswers,
      diagnosticResult: result,
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);

    // Add initial system chat message
    const systemMsg: ChatMessage = {
      id: `sys_msg_${Date.now()}`,
      projectId: newProj.id,
      senderId: adminUser.id,
      senderName: adminUser.name,
      senderRole: 'ADMIN',
      senderTechArea: adminUser.techArea,
      content: `📌 Projeto criado por ${adminUser.name}. Vagas configuradas para ${newProj.teamSize} integrantes.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, systemMsg]);

    // Create Sprint 1 if Scrum
    if (activeMeth === 'SCRUM') {
      const newSprint: Sprint = {
        id: `sprint_${Date.now()}`,
        projectId: newProj.id,
        number: 1,
        name: 'Sprint 1',
        goal: 'Definir objetivos e adicionar estórias ao Backlog',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'ACTIVE',
        totalPoints: 0,
        completedPoints: 0,
      };
      setSprints((prev) => [newSprint, ...prev]);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#3B82F6', '#10B981'],
    });

    return newProj;
  };

  const updateProjectMethodology = (projectId: string, methodology: Methodology) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, activeMethodology: methodology } : p))
    );
  };

  const updateProjectWipLimits = (projectId: string, wipLimits: Record<KanbanColumnId, number>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, wipLimits } : p))
    );
  };

  const updateProjectStatus = (projectId: string, status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED') => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status } : p))
    );
  };

  // Only Admin can delete project
  const deleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return { success: false, message: 'Projeto não encontrado.' };

    if (currentUser && proj.adminId !== currentUser.id) {
      return {
        success: false,
        message: 'Apenas o Administrador criador do projeto possui permissão para excluí-lo.',
      };
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    setChatMessages((prev) => prev.filter((c) => c.projectId !== projectId));

    return { success: true };
  };

  // Only Admin can conclude project
  const completeProject = (projectId: string, notes?: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return { success: false, message: 'Projeto não encontrado.' };

    if (currentUser && proj.adminId !== currentUser.id) {
      return {
        success: false,
        message: 'Apenas o Administrador criador do projeto pode marcar o projeto como concluído.',
      };
    }

    const nowStr = new Date().toISOString().split('T')[0];

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'COMPLETED',
            completedAt: nowStr,
            completedByUserId: currentUser?.id || p.adminId,
            completionNotes: notes || 'Projeto concluído com sucesso.',
          };
        }
        return p;
      })
    );

    // System chat log
    const systemMsg: ChatMessage = {
      id: `sys_msg_${Date.now()}`,
      projectId,
      senderId: currentUser?.id || proj.adminId,
      senderName: currentUser?.name || proj.adminName || 'Admin',
      senderRole: 'ADMIN',
      content: `🎉 PROJETO CONCLUÍDO! O administrador ${currentUser?.name || proj.adminName} finalizou este projeto com sucesso.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, systemMsg]);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
    });

    return { success: true };
  };

  // Invite System
  const sendInvite = (projectId: string, invitedEmail: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return { success: false, message: 'Projeto não encontrado.' };

    const emailClean = invitedEmail.trim().toLowerCase();
    if (!emailClean) return { success: false, message: 'E-mail inválido.' };

    // Check if user is already a member
    const alreadyMember = proj.members?.some((m) => m.email.toLowerCase() === emailClean);
    if (alreadyMember) {
      return { success: false, message: 'Este e-mail já faz parte do projeto.' };
    }

    // Check capacity limit
    const activeMembersCount = proj.members?.length || 1;
    const pendingInvitesCount = proj.invites?.filter((i) => i.status === 'PENDING').length || 0;
    if (activeMembersCount + pendingInvitesCount >= proj.teamSize) {
      return {
        success: false,
        message: `Limite de integrantes/convites para este projeto (${proj.teamSize} vagas) foi atingido.`,
      };
    }

    // Check existing invite
    const existingInvite = proj.invites?.find(
      (i) => i.invitedEmail.toLowerCase() === emailClean && i.status === 'PENDING'
    );
    if (existingInvite) {
      return { success: false, message: 'Já existe um convite pendente para este e-mail.' };
    }

    const inviteCode = `SF-INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvite: ProjectInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      projectId: proj.id,
      projectName: proj.name,
      projectMethodology: proj.activeMethodology,
      invitedByUserId: currentUser?.id || proj.adminId,
      invitedByUserName: currentUser?.name || proj.adminName || 'Administrador',
      invitedEmail: emailClean,
      inviteCode,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            invites: [...(p.invites || []), newInvite],
          };
        }
        return p;
      })
    );

    // Chat notice
    const sysMsg: ChatMessage = {
      id: `sys_msg_${Date.now()}`,
      projectId: proj.id,
      senderId: currentUser?.id || proj.adminId,
      senderName: currentUser?.name || 'Admin',
      senderRole: 'ADMIN',
      content: `✉️ Convite enviado para ${emailClean} (Código: ${inviteCode}).`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);

    return { success: true };
  };

  const acceptInvite = (inviteId: string) => {
    if (!currentUser) {
      return { success: false, message: 'Você precisa estar logado para aceitar convites.' };
    }

    let targetProject: Project | undefined;
    let targetInvite: ProjectInvite | undefined;

    projects.forEach((p) => {
      if (p.invites) {
        const found = p.invites.find((i) => i.id === inviteId);
        if (found) {
          targetProject = p;
          targetInvite = found;
        }
      }
    });

    if (!targetProject || !targetInvite) {
      return { success: false, message: 'Convite não encontrado.' };
    }

    // Check capacity
    if (targetProject.members.length >= targetProject.teamSize) {
      return { success: false, message: 'Infelizmente o projeto já atingiu a capacidade máxima de integrantes.' };
    }

    // Add user as member
    const newMember: ProjectMember = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: 'MEMBER',
      techArea: currentUser.techArea,
      joinedAt: new Date().toISOString().split('T')[0],
      avatar: currentUser.avatarUrl,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === targetProject!.id) {
          const updatedInvites = (p.invites || []).map((i) =>
            i.id === inviteId ? { ...i, status: 'ACCEPTED' as const } : i
          );
          return {
            ...p,
            members: [...p.members, newMember],
            invites: updatedInvites,
          };
        }
        return p;
      })
    );

    setActiveProjectId(targetProject.id);

    // System chat welcome message
    const sysMsg: ChatMessage = {
      id: `sys_msg_${Date.now()}`,
      projectId: targetProject.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'MEMBER',
      senderTechArea: currentUser.techArea,
      content: `👋 ${currentUser.name} (${currentUser.techArea}) aceitou o convite e agora é integrante ativo do projeto!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    return { success: true };
  };

  const declineInvite = (inviteId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.invites?.some((i) => i.id === inviteId)) {
          return {
            ...p,
            invites: p.invites.map((i) => (i.id === inviteId ? { ...i, status: 'DECLINED' as const } : i)),
          };
        }
        return p;
      })
    );
    return { success: true };
  };

  // Admin Removes Member with Justification
  const removeMember = (projectId: string, memberId: string, justification: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return { success: false, message: 'Projeto não encontrado.' };

    if (currentUser && proj.adminId !== currentUser.id) {
      return { success: false, message: 'Apenas o Administrador do projeto pode remover integrantes.' };
    }

    const memberToRemove = proj.members.find((m) => m.id === memberId);
    if (!memberToRemove) return { success: false, message: 'Membro não encontrado no projeto.' };

    if (memberToRemove.role === 'ADMIN' || memberToRemove.id === proj.adminId) {
      return { success: false, message: 'O Administrador do projeto não pode ser removido.' };
    }

    if (!justification.trim()) {
      return { success: false, message: 'Por favor, informe uma justificativa para remover o integrante.' };
    }

    const log: MemberRemovalLog = {
      id: `log_${Date.now()}`,
      projectId,
      memberId,
      memberName: memberToRemove.name,
      removedByUserId: currentUser?.id || proj.adminId,
      removedByUserName: currentUser?.name || proj.adminName || 'Administrador',
      justification: justification.trim(),
      removedAt: new Date().toISOString().split('T')[0],
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            members: p.members.filter((m) => m.id !== memberId),
            removalLogs: [...(p.removalLogs || []), log],
          };
        }
        return p;
      })
    );

    // System chat notice
    const sysMsg: ChatMessage = {
      id: `sys_msg_${Date.now()}`,
      projectId,
      senderId: currentUser?.id || proj.adminId,
      senderName: currentUser?.name || 'Admin',
      senderRole: 'ADMIN',
      content: `⚠️ Integrante ${memberToRemove.name} foi removido do projeto pelo Administrador. Justificativa: "${justification.trim()}"`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);

    return { success: true };
  };

  // Member Voluntarily Leaves Project
  const leaveProject = (projectId: string) => {
    if (!currentUser) return { success: false, message: 'Usuário não autenticado.' };

    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return { success: false, message: 'Projeto não encontrado.' };

    const isCreatorAdmin =
      proj.adminId === currentUser.id ||
      (proj.adminEmail && proj.adminEmail.toLowerCase() === currentUser.email.toLowerCase());

    if (isCreatorAdmin) {
      return {
        success: false,
        message: 'Você é o Administrador responsável deste projeto. Para encerrar suas atividades, você pode Concluir ou Excluir o projeto na Central de Projetos.',
      };
    }

    const updatedProjects = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          members: (p.members || []).filter(
            (m) =>
              m.id !== currentUser.id &&
              m.email.toLowerCase() !== currentUser.email.toLowerCase()
          ),
        };
      }
      return p;
    });

    setProjects(updatedProjects);

    // If leaving the active project, switch to another available project
    if (activeProjectId === projectId) {
      const remainingMyProjects = updatedProjects.filter((p) => {
        if (p.id === projectId) return false;
        const isOwner =
          p.adminId === currentUser.id ||
          (p.adminEmail && p.adminEmail.toLowerCase() === currentUser.email.toLowerCase());
        const isMember = p.members?.some(
          (m) =>
            m.id === currentUser.id ||
            m.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        return isOwner || isMember;
      });

      if (remainingMyProjects.length > 0) {
        setActiveProjectId(remainingMyProjects[0].id);
      } else {
        setActiveProjectId('');
      }
    }

    // System chat notice
    const sysMsg: ChatMessage = {
      id: `sys_msg_${Date.now()}`,
      projectId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'MEMBER',
      content: `🚪 ${currentUser.name} saiu do projeto voluntariamente.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages((prev) => [...prev, sysMsg]);

    return { success: true };
  };

  // Project Chat Message
  const addChatMessage = (projectId: string, content: string) => {
    if (!content.trim() || !currentUser) return;

    const proj = projects.find((p) => p.id === projectId);
    const isAdmin = proj?.adminId === currentUser.id;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      projectId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: isAdmin ? 'ADMIN' : 'MEMBER',
      senderTechArea: currentUser.techArea,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Download PDF Report
  const downloadProjectPdf = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const projTasks = tasks.filter((t) => t.projectId === projectId);
    const projChats = chatMessages.filter((c) => c.projectId === projectId);
    const projSprints = sprints.filter((s) => s.projectId === projectId);
    const projTdd = tddTests.filter((t) => t.projectId === projectId);

    generateProjectPdfReport(proj, projTasks, projChats, projSprints, projTdd);
  };

  // Task Actions
  const addTask = (taskData: Partial<Task>): Task => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      projectId: activeProjectId,
      title: taskData.title || 'Nova Tarefa',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'Média',
      storyPoints: taskData.storyPoints || 2,
      assignees: taskData.assignees || [currentUser?.id || INITIAL_MEMBERS[0].id],
      tags: taskData.tags || ['A Fazer'],
      createdAt: new Date().toISOString().split('T')[0],
      sprintId: taskData.sprintId || activeSprint?.id || null,
      inBacklog: taskData.inBacklog ?? false,
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  const moveTaskStatus = (taskId: string, newStatus: KanbanColumnId, sprintId?: string | null) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = newStatus === 'done';
          return {
            ...t,
            status: newStatus,
            completedAt: isDone ? new Date().toISOString().split('T')[0] : t.completedAt,
            sprintId: sprintId !== undefined ? sprintId : t.sprintId,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // XP Actions
  const addPairSession = (driverId: string, navigatorId: string, featureName: string, durationMinutes: number) => {
    const newSession: PairSession = {
      id: `pair_${Date.now()}`,
      projectId: activeProjectId,
      driverId,
      navigatorId,
      featureName,
      startedAt: 'Agora mesmo',
      durationMinutes,
      status: 'ACTIVE',
    };
    setPairSessions((prev) => [newSession, ...prev]);
  };

  const updatePairStatus = (id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') => {
    setPairSessions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const addTddTest = (featureName: string, testName: string, codeSnippet?: string) => {
    const newTest: TddTestCase = {
      id: `tdd_${Date.now()}`,
      projectId: activeProjectId,
      featureName,
      testName,
      status: 'RED',
      codeSnippet,
      lastRunAt: 'Não executado',
    };
    setTddTests((prev) => [newTest, ...prev]);
  };

  const toggleTddStatus = (id: string) => {
    setTddTests((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'RED' ? 'GREEN' : t.status === 'GREEN' ? 'REFACTORED' : 'RED';
          return {
            ...t,
            status: nextStatus,
            lastRunAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return t;
      })
    );
  };

  const runTddSuiteSimulated = () => {
    setTddTests((prev) =>
      prev.map((t) =>
        t.projectId === activeProjectId
          ? {
              ...t,
              status: 'GREEN',
              lastRunAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );
  };

  // Scrum Actions
  const votePlanningPoker = (memberId: string, vote: number | string) => {
    setPokerSessions((prev) =>
      prev.map((p) => {
        if (p.projectId === activeProjectId) {
          const newVotes = p.votes.map((v) => (v.memberId === memberId ? { ...v, vote, hasVoted: true } : v));
          return { ...p, votes: newVotes };
        }
        return p;
      })
    );
  };

  const revealPlanningPoker = () => {
    setPokerSessions((prev) =>
      prev.map((p) => {
        if (p.projectId === activeProjectId) {
          const numericVotes = p.votes
            .map((v) => Number(v.vote))
            .filter((val) => !isNaN(val) && val > 0);
          const avg = numericVotes.length ? Math.round(numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length) : 3;
          return { ...p, revealed: true, consensusEstimate: avg };
        }
        return p;
      })
    );
  };

  const resetPlanningPoker = (taskId: string, taskTitle: string) => {
    setPokerSessions((prev) =>
      prev.map((p) => {
        if (p.projectId === activeProjectId) {
          return {
            ...p,
            taskId,
            taskTitle,
            votes: teamMembers.map((m) => ({ memberId: m.id, vote: null, hasVoted: false })),
            revealed: false,
            consensusEstimate: null,
          };
        }
        return p;
      })
    );
  };

  const addDailyNote = (yesterday: string, today: string, impediments: string, author: string) => {
    const newNote: DailyNote = {
      id: `daily_${Date.now()}`,
      projectId: activeProjectId,
      date: new Date().toISOString().split('T')[0],
      author,
      yesterday,
      today,
      impediments,
    };
    setDailyNotes((prev) => [newNote, ...prev]);
  };

  const addRetroCard = (category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM', content: string, author: string) => {
    const newCard: RetroCard = {
      id: `retro_${Date.now()}`,
      projectId: activeProjectId,
      category,
      content,
      author,
      votes: 1,
    };
    setRetroCards((prev) => [newCard, ...prev]);
  };

  const voteRetroCard = (id: string) => {
    setRetroCards((prev) => prev.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r)));
  };

  const completeActiveSprint = () => {
    if (!activeSprint) return;
    const completedTasksInSprint = activeProjectTasks.filter(
      (t) => t.sprintId === activeSprint.id && t.status === 'done'
    );
    const completedPts = completedTasksInSprint.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    setSprints((prev) =>
      prev.map((s) => (s.id === activeSprint.id ? { ...s, status: 'COMPLETED', completedPoints: completedPts } : s))
    );

    // Create next sprint automatically
    const nextSprintNum = activeSprint.number + 1;
    const nextSprint: Sprint = {
      id: `sprint_${Date.now()}`,
      projectId: activeProjectId,
      number: nextSprintNum,
      name: `Sprint ${nextSprintNum}`,
      goal: `Lançamento de funcionalidades e refinamento da iteração ${nextSprintNum}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      totalPoints: 0,
      completedPoints: 0,
    };

    setSprints((prev) => [nextSprint, ...prev]);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        myProjects,
        completedProjects,
        activeProjectId,
        activeProject,
        tasks,
        activeProjectTasks,
        teamMembers,
        pairSessions: activeProjectPairSessions,
        tddTests: activeProjectTddTests,
        ciBuilds,
        sprints,
        activeSprint,
        planningPoker: activeProjectPoker,
        dailyNotes: dailyNotes.filter((d) => d.projectId === (activeProject?.id || activeProjectId)),
        retroCards: retroCards.filter((r) => r.projectId === (activeProject?.id || activeProjectId)),
        chatMessages,
        activeProjectChat,
        userPendingInvites,
        setActiveProjectId,
        createProject,
        updateProjectMethodology,
        updateProjectWipLimits,
        updateProjectStatus,
        deleteProject,
        completeProject,
        sendInvite,
        acceptInvite,
        declineInvite,
        removeMember,
        leaveProject,
        addChatMessage,
        downloadProjectPdf,
        addTask,
        updateTask,
        moveTaskStatus,
        deleteTask,
        addPairSession,
        updatePairStatus,
        addTddTest,
        toggleTddStatus,
        runTddSuiteSimulated,
        votePlanningPoker,
        revealPlanningPoker,
        resetPlanningPoker,
        addDailyNote,
        addRetroCard,
        voteRetroCard,
        completeActiveSprint,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
