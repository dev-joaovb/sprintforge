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
} from '../types';
import { calculateDiagnosticResult } from '../data/diagnosticQuestions';
import { generateProjectPdfReport } from '../utils/pdfGenerator';
import { api } from '../services/api';

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
    teamSize?: number,
    deadline?: string
  ) => Promise<Project | null>;
  updateProjectMethodology: (projectId: string, methodology: Methodology) => Promise<void>;
  updateProjectWipLimits: (projectId: string, wipLimits: Record<KanbanColumnId, number>) => Promise<void>;
  updateProjectStatus: (projectId: string, status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED') => Promise<void>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; message?: string }>;
  completeProject: (projectId: string, notes?: string) => Promise<{ success: boolean; message?: string }>;

  // Team & Invites Actions
  sendInvite: (projectId: string, invitedEmail: string) => Promise<{ success: boolean; message?: string }>;
  acceptInvite: (inviteCode: string) => Promise<{ success: boolean; message?: string }>;
  declineInvite: (inviteId: string) => { success: boolean; message?: string };
  removeMember: (projectId: string, memberId: string, justification: string) => Promise<{ success: boolean; message?: string }>;
  leaveProject: (projectId: string) => Promise<{ success: boolean; message?: string }>;

  // Chat Actions
  addChatMessage: (projectId: string, content: string) => Promise<void>;

  // PDF Export
  downloadProjectPdf: (projectId: string) => void;

  // Task Actions
  addTask: (taskData: Partial<Task>) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  moveTaskStatus: (taskId: string, newStatus: KanbanColumnId, sprintId?: string | null) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // XP Actions
  addPairSession: (driverId: string, navigatorId: string, featureName: string, durationMinutes: number) => Promise<void>;
  updatePairStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') => void;
  addTddTest: (featureName: string, testName: string, codeSnippet?: string) => Promise<void>;
  toggleTddStatus: (id: string) => void;
  runTddSuiteSimulated: () => void;

  // Scrum Actions
  createSprint: (sprintData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    number?: number;
  }) => Promise<{ success: boolean; message?: string; sprint?: Sprint }>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<{ success: boolean; message?: string }>;
  deleteSprint: (sprintId: string) => Promise<{ success: boolean; message?: string }>;
  votePlanningPoker: (memberId: string, vote: number | string) => void;
  simulateTeamVotes: () => void;
  revealPlanningPoker: () => void;
  resetPlanningPoker: (taskId: string, taskTitle: string) => void;
  applyPokerEstimateToTask: (taskId: string, points: number) => void;
  addDailyNote: (yesterday: string, today: string, impediments: string, author?: string, date?: string) => Promise<void>;
  deleteDailyNote: (id: string) => Promise<void>;
  addRetroCard: (category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM', content: string, author?: string, createdAt?: string) => Promise<void>;
  deleteRetroCard: (id: string) => Promise<void>;
  voteRetroCard: (id: string, voterId?: string) => Promise<void>;
  completeActiveSprint: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pairSessions, setPairSessions] = useState<PairSession[]>([]);
  const [tddTests, setTddTests] = useState<TddTestCase[]>([]);
  const [ciBuilds, setCiBuilds] = useState<CiBuild[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [pokerSessions, setPokerSessions] = useState<PlanningPokerSession[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [retroCards, setRetroCards] = useState<RetroCard[]>([]);

  // Carregamento inicial de projetos
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setActiveProjectId('');
      return;
    }

    async function loadProjects() {
      try {
        const res = await api.projects.list();
        if (res.success && res.data?.projects) {
          setProjects(res.data.projects);
          if (res.data.projects.length > 0 && !activeProjectId) {
            setActiveProjectId(res.data.projects[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao listar projetos:', error);
      }
    }

    loadProjects();
  }, [currentUser]);

  // Carregamento modular do projeto ativo
  useEffect(() => {
    if (!activeProjectId) return;

    async function loadActiveProjectData() {
      try {
        const [tasksRes, sprintsRes, dailyRes, retroRes, chatRes, pairRes, tddRes, ciRes] = await Promise.all([
          api.tasks.listByProject(activeProjectId),
          api.scrum.getSprints(activeProjectId),
          api.scrum.getDailyNotes(activeProjectId),
          api.scrum.getRetroCards(activeProjectId),
          api.chat.getMessages(activeProjectId),
          api.xp.getPairSessions(activeProjectId),
          api.xp.getTddTests(activeProjectId),
          api.xp.getCiBuilds(activeProjectId),
        ]);

        if (tasksRes.success && tasksRes.data?.tasks) setTasks(tasksRes.data.tasks);
        if (sprintsRes.success && sprintsRes.data?.sprints) setSprints(sprintsRes.data.sprints);
        if (dailyRes.success && dailyRes.data?.notes) setDailyNotes(dailyRes.data.notes);
        if (retroRes.success && retroRes.data?.cards) setRetroCards(retroRes.data.cards);
        if (chatRes.success && chatRes.data?.messages) setChatMessages(chatRes.data.messages);
        if (pairRes.success && pairRes.data?.sessions) setPairSessions(pairRes.data.sessions);
        if (tddRes.success && tddRes.data?.tests) setTddTests(tddRes.data.tests);
        if (ciRes.success && ciRes.data?.builds) setCiBuilds(ciRes.data.builds);
      } catch (error) {
        console.error('Erro ao carregar dados do projeto ativo:', error);
      }
    }

    loadActiveProjectData();
  }, [activeProjectId]);

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

  const completedProjects = myProjects.filter((p) => p.status === 'COMPLETED');

  const activeProject = useMemo(() => {
    if (myProjects.length === 0) return null;
    return myProjects.find((p) => p.id === activeProjectId) || myProjects[0] || null;
  }, [myProjects, activeProjectId]);

  const activeProjectTasks = tasks.filter((t) => t.projectId === (activeProject?.id || activeProjectId));

  const activeProjectChat = chatMessages.filter(
    (c) => c.projectId === (activeProject?.id || activeProjectId)
  );

  const userPendingInvites: ProjectInvite[] = useMemo(() => {
    if (!currentUser) return [];
    const invites: ProjectInvite[] = [];
    projects.forEach((proj) => {
      if (proj.invites) {
        proj.invites.forEach((inv) => {
          if (
            inv.status === 'PENDING' &&
            inv.invitedEmail.toLowerCase() === currentUser.email.toLowerCase()
          ) {
            invites.push(inv);
          }
        });
      }
    });
    return invites;
  }, [projects, currentUser]);

  const activeProjectMembers: TeamMember[] = useMemo(() => {
    if (activeProject && activeProject.members && activeProject.members.length > 0) {
      return activeProject.members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar || (m.id === currentUser?.id ? currentUser?.avatarUrl : undefined) || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        role: m.techArea || (m.role === 'ADMIN' ? 'Tech Lead & Scrum Master' : 'Desenvolvedor(a)'),
      }));
    }
    if (currentUser) {
      return [{
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        role: currentUser.techArea || 'Desenvolvedor(a)',
      }];
    }
    return [];
  }, [activeProject, currentUser]);

  const activeSprint = sprints.find((s) => s.projectId === (activeProject?.id || activeProjectId) && s.status === 'ACTIVE') || null;

  const activeProjectPoker = useMemo(() => {
    const existing = pokerSessions.find((p) => p.projectId === (activeProject?.id || activeProjectId));
    const currentMembers = activeProjectMembers;
    
    if (!existing) {
      return {
        id: `poker_${activeProjectId}`,
        projectId: activeProjectId,
        taskId: activeProjectTasks[0]?.id || `task_${activeProjectId}`,
        taskTitle: activeProjectTasks[0]?.title || 'Estória em Votação no Projeto',
        votes: currentMembers.map((m) => ({ memberId: m.id, vote: null, hasVoted: false })),
        revealed: false,
        consensusEstimate: null,
      };
    }

    const voteMap = new Map(existing.votes.map((v) => [v.memberId, v]));
    const synchronizedVotes = currentMembers.map((m) => {
      const v = voteMap.get(m.id);
      return v || { memberId: m.id, vote: null, hasVoted: false };
    });

    return {
      ...existing,
      votes: synchronizedVotes,
    };
  }, [pokerSessions, activeProjectId, activeProject?.id, activeProjectMembers, activeProjectTasks]);

  const createProject = async (
    name: string,
    description: string,
    diagnosticAnswers?: DiagnosticAnswer[],
    manualMethodology?: Methodology,
    teamSize: number = 5,
    deadline?: string
  ): Promise<Project | null> => {
    try {
      let result = diagnosticAnswers && diagnosticAnswers.length > 0 ? calculateDiagnosticResult(diagnosticAnswers) : undefined;
      const recommended: Methodology = result ? result.recommended : manualMethodology || 'SCRUM';
      const activeMeth: Methodology = manualMethodology || recommended;

      const res = await api.projects.create({
        name: name.trim(),
        description: description.trim(),
        activeMethodology: activeMeth,
        teamSize: Math.max(1, teamSize),
        tags: [activeMeth, 'Novo Projeto'],
        deadline,
      });

      if (res.success && res.data?.project) {
        const newProj = res.data.project;
        setProjects((prev) => [newProj, ...prev]);
        setActiveProjectId(newProj.id);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#3B82F6', '#10B981'],
        });

        return newProj;
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }

    return null;
  };

  const updateProjectMethodology = async (projectId: string, methodology: Methodology) => {
    try {
      if ((api.projects as any).updateMethodology) {
        await (api.projects as any).updateMethodology(projectId, methodology);
      }
    } catch (error) {
      console.error('Erro na API ao atualizar metodologia:', error);
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, activeMethodology: methodology } : p))
    );
  };

  const updateProjectWipLimits = async (projectId: string, wipLimits: Record<KanbanColumnId, number>) => {
    try {
      if ((api.projects as any).updateWipLimits) {
        await (api.projects as any).updateWipLimits(projectId, wipLimits);
      }
    } catch (error) {
      console.error('Erro na API ao atualizar limites de WIP:', error);
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, wipLimits } : p))
    );
  };

  const updateProjectStatus = async (projectId: string, status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED') => {
    try {
      const res = await api.projects.updateStatus(projectId, status === 'COMPLETED' ? 'INACTIVE' : status);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status } : p))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status do projeto:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const res = await api.projects.delete(projectId);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
        setChatMessages((prev) => prev.filter((c) => c.projectId !== projectId));
        return { success: true };
      }
      return { success: false, message: res.message || 'Erro ao deletar projeto.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro de conexão ao deletar projeto.' };
    }
  };

  const completeProject = async (projectId: string, notes?: string) => {
    try {
      const res = await api.projects.complete(projectId, notes);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: 'COMPLETED' } : p))
        );
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
        });
        return { success: true };
      }
      return { success: false, message: res.message || 'Erro ao concluir projeto.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao finalizar projeto.' };
    }
  };

  const sendInvite = async (projectId: string, invitedEmail: string) => {
    try {
      const res = await api.projects.sendInvite(projectId, invitedEmail);
      if (res.success) return { success: true };
      return { success: false, message: res.message || 'Erro ao enviar convite.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro de rede ao enviar convite.' };
    }
  };

  const acceptInvite = async (inviteCode: string) => {
    try {
      const res = await api.projects.acceptInvite(inviteCode);
      if (res.success) {
        const projRes = await api.projects.list();
        if (projRes.success && projRes.data?.projects) {
          setProjects(projRes.data.projects);
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Erro ao aceitar convite.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao aceitar convite no servidor.' };
    }
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

  const removeMember = async (projectId: string, memberId: string, justification: string) => {
    try {
      const res = await api.projects.removeMember(projectId, memberId, justification);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                members: p.members.filter((m) => m.id !== memberId),
              };
            }
            return p;
          })
        );
        return { success: true };
      }
      return { success: false, message: res.message || 'Erro ao remover integrante.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Falha de comunicação ao remover membro.' };
    }
  };

  const leaveProject = async (projectId: string) => {
    try {
      const res = await api.projects.leave(projectId);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        return { success: true };
      }
      return { success: false, message: res.message || 'Erro ao sair do projeto.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao comunicar saída do projeto.' };
    }
  };

  const addChatMessage = async (projectId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await api.chat.sendMessage(projectId, content);
      if (res.success && res.data?.message) {
        setChatMessages((prev) => [...prev, res.data.message]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem no chat:', error);
    }
  };

  const downloadProjectPdf = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const projTasks = tasks.filter((t) => t.projectId === projectId);
    const projChats = chatMessages.filter((c) => c.projectId === projectId);
    const projSprints = sprints.filter((s) => s.projectId === projectId);
    const projTdd = tddTests.filter((t) => t.projectId === projectId);

    generateProjectPdfReport(proj, projTasks, projChats, projSprints, projTdd);
  };

  const addTask = async (taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const isBacklog = taskData.inBacklog !== undefined
        ? taskData.inBacklog
        : (taskData.status === 'backlog' || !taskData.sprintId);

      const payload = {
        projectId: activeProjectId,
        title: taskData.title || 'Nova Tarefa',
        description: taskData.description || '',
        status: taskData.status || (isBacklog ? 'backlog' : 'todo'),
        priority: taskData.priority || 'Média',
        storyPoints: taskData.storyPoints || 2,
        sprintId: isBacklog ? null : (taskData.sprintId || null),
        tags: taskData.tags || ['Geral'],
      };

      const res = await api.tasks.create(payload);
      if (res.success && res.data?.task) {
        const newTask = res.data.task;
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
    return null;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await api.tasks.update(taskId, updates);
      if (res.success && res.data?.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data.task : t)));
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const moveTaskStatus = async (taskId: string, newStatus: KanbanColumnId, sprintId?: string | null) => {
    try {
      const res = await api.tasks.update(taskId, {
        status: newStatus,
        sprintId: sprintId !== undefined ? sprintId : undefined,
      });
      if (res.success && res.data?.task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data.task : t)));
      }
    } catch (error) {
      console.error('Erro ao mover status da tarefa:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await api.tasks.delete(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
    }
  };

  const addPairSession = async (driverId: string, navigatorId: string, featureName: string, durationMinutes: number) => {
    try {
      const res = await api.xp.createPairSession({
        projectId: activeProjectId,
        driverId,
        driverName: activeProjectMembers.find((m) => m.id === driverId)?.name || 'Driver',
        navigatorId,
        navigatorName: activeProjectMembers.find((m) => m.id === navigatorId)?.name || 'Navigator',
        taskTitle: featureName,
        branchName: `feature/${featureName.toLowerCase().replace(/\s+/g, '-')}`,
      });

      if (res.success && res.data?.session) {
        setPairSessions((prev) => [res.data.session, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao registrar sessão de Pair Programming:', error);
    }
  };

  const updatePairStatus = (id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') => {
    setPairSessions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const addTddTest = async (featureName: string, testName: string, codeSnippet?: string) => {
    try {
      if ((api.xp as any).createTddTest) {
        const res = await (api.xp as any).createTddTest({
          projectId: activeProjectId,
          featureName,
          testName,
          codeSnippet,
        });
        if (res.success && res.data?.test) {
          setTddTests((prev) => [res.data.test, ...prev]);
          return;
        }
      }
    } catch (error) {
      console.error('Erro na API ao criar teste TDD:', error);
    }

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
    api.xp.runTddTest(id).then((res) => {
      if (res.success && res.data?.test) {
        setTddTests((prev) => prev.map((t) => (t.id === id ? res.data.test : t)));
      }
    }).catch(err => console.error('Erro ao executar teste TDD:', err));
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

  const createSprint = async (sprintData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  }) => {
    try {
      const res = await api.scrum.createSprint({
        projectId: activeProjectId,
        ...sprintData,
      });

      if (res.success && res.data?.sprint) {
        setSprints((prev) => [res.data.sprint, ...prev]);
        return { success: true, sprint: res.data.sprint };
      }
      return { success: false, message: res.message || 'Erro ao criar Sprint.' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro no servidor ao criar Sprint.' };
    }
  };

  const updateSprint = async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      if ((api.scrum as any).updateSprint) {
        const res = await (api.scrum as any).updateSprint(sprintId, updates);
        if (res.success && res.data?.sprint) {
          setSprints((prev) => prev.map((s) => (s.id === sprintId ? res.data.sprint : s)));
          return { success: true };
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar Sprint via API:', error);
    }
    setSprints((prev) => prev.map((s) => (s.id === sprintId ? { ...s, ...updates } : s)));
    return { success: true };
  };

  const deleteSprint = async (sprintId: string) => {
    try {
      if ((api.scrum as any).deleteSprint) {
        const res = await (api.scrum as any).deleteSprint(sprintId);
        if (!res.success) {
          return { success: false, message: res.message || 'Erro ao excluir Sprint.' };
        }
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Falha ao excluir Sprint.' };
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.sprintId === sprintId ? { ...t, sprintId: null, inBacklog: true, status: 'backlog' } : t
      )
    );
    setSprints((prev) => prev.filter((s) => s.id !== sprintId));
    return { success: true };
  };

  const votePlanningPoker = (memberId: string, vote: number | string) => {
    setPokerSessions((prev) => {
      return prev.map((p) => {
        if (p.projectId === activeProjectId) {
          const newVotes = p.votes.map((v) =>
            v.memberId === memberId ? { ...v, vote, hasVoted: true } : v
          );
          return { ...p, votes: newVotes };
        }
        return p;
      });
    });
  };

  const simulateTeamVotes = () => {
    const fibChoices = [1, 2, 3, 5, 8, 13];
    setPokerSessions((prev) => {
      return prev.map((p) => {
        if (p.projectId === activeProjectId) {
          const newVotes = p.votes.map((v) => {
            if (v.hasVoted && v.vote !== null) return v;
            const randomVote = fibChoices[Math.floor(Math.random() * fibChoices.length)];
            return { ...v, vote: randomVote, hasVoted: true };
          });
          return { ...p, votes: newVotes };
        }
        return p;
      });
    });
  };

  const revealPlanningPoker = () => {
    setPokerSessions((prev) =>
      prev.map((p) => {
        if (p.projectId === activeProjectId) {
          const numericVotes = p.votes
            .map((v) => Number(v.vote))
            .filter((val) => !isNaN(val) && val > 0);
          
          if (numericVotes.length === 0) {
            return { ...p, revealed: true, consensusEstimate: 3 };
          }
          
          const rawAvg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
          const fibs = [1, 2, 3, 5, 8, 13, 21];
          const closestFib = fibs.reduce((prevFib, currFib) =>
            Math.abs(currFib - rawAvg) < Math.abs(prevFib - rawAvg) ? currFib : prevFib
          );

          return { ...p, revealed: true, consensusEstimate: closestFib };
        }
        return p;
      })
    );
  };

  const resetPlanningPoker = (taskId: string, taskTitle: string) => {
    setPokerSessions((prev) => {
      const cleanVotes = activeProjectMembers.map((m) => ({
        memberId: m.id,
        vote: null,
        hasVoted: false,
      }));

      return prev.map((p) => {
        if (p.projectId === activeProjectId) {
          return {
            ...p,
            taskId,
            taskTitle,
            votes: cleanVotes,
            revealed: false,
            consensusEstimate: null,
          };
        }
        return p;
      });
    });
  };

  const applyPokerEstimateToTask = (taskId: string, points: number) => {
    if (!taskId) return;
    updateTask(taskId, { storyPoints: points });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8B5CF6', '#10B981', '#3B82F6'],
    });
  };

  const addDailyNote = async (yesterday: string, today: string, impediments: string) => {
    try {
      const res = await api.scrum.createDailyNote({
        projectId: activeProjectId,
        yesterday,
        today,
        blockers: impediments,
      });

      if (res.success && res.data?.note) {
        setDailyNotes((prev) => [res.data.note, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar Daily Note:', error);
    }
  };

  const deleteDailyNote = async (id: string) => {
    try {
      if ((api.scrum as any).deleteDailyNote) {
        await (api.scrum as any).deleteDailyNote(id);
      }
    } catch (error) {
      console.error('Erro ao deletar Daily Note via API:', error);
    }
    setDailyNotes((prev) => prev.filter((d) => d.id !== id));
  };

  const addRetroCard = async (
    category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM',
    content: string
  ) => {
    try {
      const res = await api.scrum.createRetroCard({
        projectId: activeProjectId,
        type: category,
        content,
      });

      if (res.success && res.data?.card) {
        setRetroCards((prev) => [res.data.card, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar card da Retrospectiva:', error);
    }
  };

  const deleteRetroCard = async (id: string) => {
    try {
      if ((api.scrum as any).deleteRetroCard) {
        await (api.scrum as any).deleteRetroCard(id);
      }
    } catch (error) {
      console.error('Erro ao remover Retro Card via API:', error);
    }
    setRetroCards((prev) => prev.filter((r) => r.id !== id));
  };

  const voteRetroCard = async (id: string, voterId?: string) => {
    try {
      if ((api.scrum as any).voteRetroCard) {
        const res = await (api.scrum as any).voteRetroCard(id);
        if (res.success && res.data?.card) {
          setRetroCards((prev) => prev.map((r) => (r.id === id ? res.data.card : r)));
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao votar no Retro Card via API:', error);
    }

    const currentVoterId = voterId || currentUser?.id || 'user_member';
    setRetroCards((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const currentVoters = r.voters || [];
          const hasVoted = currentVoters.includes(currentVoterId);
          if (hasVoted) {
            return {
              ...r,
              votes: Math.max(0, (r.votes || 1) - 1),
              voters: currentVoters.filter((v) => v !== currentVoterId),
            };
          } else {
            return {
              ...r,
              votes: (r.votes || 0) + 1,
              voters: [...currentVoters, currentVoterId],
            };
          }
        }
        return r;
      })
    );
  };

  const completeActiveSprint = () => {
    if (!activeSprint) return;
    const allSprintTasks = tasks.filter(
      (t) => t.projectId === activeProjectId && t.sprintId === activeSprint.id
    );
    const completedTasksInSprint = allSprintTasks.filter((t) => t.status === 'done');
    const completedPts = completedTasksInSprint.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    setSprints((prev) =>
      prev.map((s) =>
        s.id === activeSprint.id
          ? {
              ...s,
              status: 'COMPLETED',
              completedPoints: completedPts,
            }
          : s
      )
    );

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'],
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
        teamMembers: activeProjectMembers,
        pairSessions,
        tddTests,
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
        simulateTeamVotes,
        revealPlanningPoker,
        resetPlanningPoker,
        applyPokerEstimateToTask,
        addDailyNote,
        deleteDailyNote,
        addRetroCard,
        deleteRetroCard,
        voteRetroCard,
        createSprint,
        updateSprint,
        deleteSprint,
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
    throw new Error('useProject deve ser usado dentro de um ProjectProvider');
  }
  return context;
};