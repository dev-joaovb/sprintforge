import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  ProjectStatus,
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
  isLoading: boolean;
  loadError: string | null;

  // Project Actions
  setActiveProjectId: (id: string) => void;
  createProject: (
    name: string,
    description: string,
    diagnosticAnswers?: DiagnosticAnswer[],
    manualMethodology?: Methodology,
    teamSize?: number,
    deadline?: string
  ) => Promise<Project>;
  updateProjectMethodology: (projectId: string, methodology: Methodology) => void;
  updateProjectWipLimits: (projectId: string, wipLimits: Record<KanbanColumnId, number>) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<{ success: boolean; message?: string }>;
  updateStatus: (projectId: string, status: ProjectStatus) => Promise<{ success: boolean; message?: string }>;
  deleteProject: (projectId: string) => Promise<{ success: boolean; message?: string }>;
  completeProject: (projectId: string, notes?: string) => Promise<{ success: boolean; message?: string }>;
  refreshProjects: () => Promise<void>;

  // Team & Invites Actions
  sendInvite: (projectId: string, invitedEmail: string) => Promise<{ success: boolean; message?: string }>;
  acceptInvite: (inviteCodeOrId: string) => Promise<{ success: boolean; message?: string }>;
  declineInvite: (inviteId: string) => { success: boolean; message?: string };
  removeMember: (projectId: string, memberId: string, justification: string) => Promise<{ success: boolean; message?: string }>;
  leaveProject: (projectId: string) => Promise<{ success: boolean; message?: string }>;

  // Chat Actions
  addChatMessage: (projectId: string, content: string) => Promise<void>;

  // PDF Export
  downloadProjectPdf: (projectId: string) => void;

  // Task Actions
  addTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  moveTaskStatus: (taskId: string, newStatus: KanbanColumnId, sprintId?: string | null) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // XP Actions
  addPairSession: (driverId: string, navigatorId: string, featureName: string, durationMinutes: number) => Promise<void>;
  updatePairStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED') => void;
  addTddTest: (featureName: string, testName: string, codeSnippet?: string) => void;
  toggleTddStatus: (id: string) => void;
  runTddSuiteSimulated: () => void;

  // Scrum Actions
  createSprint: (sprintData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    number?: number;
    totalPoints?: number;
    status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
    projectId?: string;
  }) => Promise<{ success: boolean; message?: string; sprint?: Sprint }>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<{ success: boolean; message?: string; }>;
  deleteSprint: (sprintId: string) => { success: boolean; message?: string };
  votePlanningPoker: (memberId: string, vote: number | string) => void;
  simulateTeamVotes: () => void;
  revealPlanningPoker: () => void;
  resetPlanningPoker: (taskId: string, taskTitle: string) => void;
  applyPokerEstimateToTask: (taskId: string, points: number) => void;
  addDailyNote: (yesterday: string, today: string, impediments: string, author: string, date?: string) => Promise<void>;
  deleteDailyNote: (id: string) => void;
  addRetroCard: (category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM', content: string, author: string, createdAt?: string) => Promise<void>;
  deleteRetroCard: (id: string) => void;
  voteRetroCard: (id: string, voterId?: string) => void;
  completeActiveSprint: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem('activeProjectId') || '';
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('activeProjectId', activeProjectId);
    }
  }, [activeProjectId]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [teamMembers] = useState<TeamMember[]>([]);
  const [pairSessions, setPairSessions] = useState<PairSession[]>([]);
  const [tddTests, setTddTests] = useState<TddTestCase[]>([]);
  const [ciBuilds] = useState<CiBuild[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [pokerSessions, setPokerSessions] = useState<PlanningPokerSession[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [retroCards, setRetroCards] = useState<RetroCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Synchronize Projects & Children from PostgreSQL via Prisma API
  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.projects.list();
      if (res.success && res.data?.projects) {
        const rawList = res.data.projects;
        const mappedList: Project[] = rawList.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          adminId: p.adminId,
          adminName: p.adminName,
          adminEmail: p.adminEmail,
          recommendedMethodology: (p.activeMethodology as Methodology) || 'XP',
          activeMethodology: (p.activeMethodology as Methodology) || 'XP',
          createdAt: new Date(p.createdAt || Date.now()).toISOString().split('T')[0],
          tags: p.tags || [p.activeMethodology, 'Projeto'],
          teamSize: p.teamSize || 6,
          status: p.status as ProjectStatus,
          deadline: p.deadline ? new Date(p.deadline).toISOString().split('T')[0] : undefined,
          completedAt: p.completedAt ? new Date(p.completedAt).toISOString().split('T')[0] : undefined,
          completedByUserId: p.completedByUserId,
          completionNotes: p.completionNotes,
          members: (p.members || []).map((m: any) => ({
            id: m.userId || m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            techArea: m.techArea || 'Engenharia Fullstack',
            joinedAt: new Date(m.joinedAt || Date.now()).toISOString().split('T')[0],
            avatar: m.avatarUrl,
          })),
          invites: (p.invites || []).map((i: any) => ({
            id: i.id,
            projectId: i.projectId,
            projectName: i.projectName,
            projectMethodology: i.projectMethodology,
            invitedByUserId: i.invitedByUserId,
            invitedByUserName: i.invitedByUserName,
            invitedEmail: i.invitedEmail,
            inviteCode: i.inviteCode,
            status: i.status,
            createdAt: new Date(i.createdAt || Date.now()).toISOString().split('T')[0],
          })),
          removalLogs: (p.removalLogs || []).map((l: any) => ({
            id: l.id,
            projectId: l.projectId,
            memberId: l.memberId,
            memberName: l.memberName,
            removedByUserId: l.removedByUserId,
            removedByUserName: l.removedByUserName,
            justification: l.justification,
            removedAt: new Date(l.removedAt || Date.now()).toISOString().split('T')[0],
          })),
          wipLimits: {
            backlog: 15,
            todo: 6,
            in_progress: 3,
            review: 3,
            done: 50,
          },
        }));

        setProjects(mappedList);

        // Aggregate tasks and sprints returned by backend
        const allTasks: Task[] = [];
        const allSprints: Sprint[] = [];
        rawList.forEach((p: any) => {
          if (Array.isArray(p.tasks)) {
            p.tasks.forEach((t: any) => {
              allTasks.push({
                id: t.id,
                projectId: t.projectId,
                title: t.title,
                description: t.description || '',
                status: t.status as KanbanColumnId,
                priority: (t.priority as any) || 'Média',
                storyPoints: t.storyPoints || 2,
                assignees: t.assignees || [],
                tags: t.tags || [],
                createdAt: new Date(t.createdAt || Date.now()).toISOString().split('T')[0],
                sprintId: t.sprintId,
                inBacklog: t.inBacklog,
              });
            });
          }
          if (Array.isArray(p.sprints)) {
            p.sprints.forEach((s: any, idx: number) => {
              // Se o status retornado do servidor não for 'COMPLETED', define como 'ACTIVE' para o frontend reconhecer
              const resolvedStatus = s.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE';

              allSprints.push({
                id: s.id,
                projectId: s.projectId,
                number: idx + 1,
                name: s.name,
                goal: s.goal || '',
                startDate: new Date(s.startDate).toISOString().split('T')[0],
                endDate: new Date(s.endDate).toISOString().split('T')[0],
                status: resolvedStatus,
                totalPoints: s.velocity || 0,
                completedPoints: 0,
              });
            });
          }
        });

        setTasks(allTasks);
        setSprints(allSprints);

        if (mappedList.length > 0) {
          setActiveProjectId((prev) => (prev && mappedList.some((m) => m.id === prev) ? prev : mappedList[0].id));
        } else {
          setActiveProjectId('');
        }
      } else if (!res.success) {
        setLoadError(res.message || 'Erro ao carregar dados do banco PostgreSQL.');
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setLoadError(err.message || 'Servidor backend inacessível.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects, currentUser]);

  // Load project chat and details whenever activeProjectId changes
  useEffect(() => {
    if (!activeProjectId) return;

    api.chat.getMessages(activeProjectId).then((res) => {
      if (res.success && res.data?.messages) {
        setChatMessages((prev) => [
          ...prev.filter((c) => c.projectId !== activeProjectId),
          ...res.data.messages.map((m: any) => ({
            id: m.id,
            projectId: m.projectId,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            senderTechArea: m.senderTechArea,
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isSystem: m.isSystem,
          })),
        ]);
      }
    });

    api.tasks.listByProject(activeProjectId).then((res) => {
      if (res.success && res.data?.tasks) {
        const projectTasks = res.data.tasks.map((t: any) => ({
          id: t.id,
          projectId: t.projectId,
          title: t.title,
          description: t.description || '',
          status: t.status as KanbanColumnId,
          priority: (t.priority as any) || 'Média',
          storyPoints: t.storyPoints || 2,
          assignees: t.assignees || [],
          tags: t.tags || [],
          createdAt: new Date(t.createdAt || Date.now()).toISOString().split('T')[0],
          sprintId: t.sprintId,
          inBacklog: t.inBacklog,
        }));

        setTasks((prev) => [
          ...prev.filter((t) => t.projectId !== activeProjectId),
          ...projectTasks,
        ]);
      }
    });

    api.scrum.getDailyNotes(activeProjectId).then((res) => {
      if (res.success && res.data?.notes) {
        setDailyNotes((prev) => [
          ...prev.filter((n) => n.projectId !== activeProjectId),
          ...res.data.notes.map((n: any) => ({
            id: n.id,
            projectId: n.projectId,
            date: new Date(n.date).toISOString().split('T')[0],
            author: n.author?.name || 'Membro',
            yesterday: n.yesterday,
            today: n.today,
            impediments: n.blockers || 'Nenhum',
          })),
        ]);
      }
    });

    api.scrum.getRetroCards(activeProjectId).then((res) => {
      if (res.success && res.data?.cards) {
        setRetroCards((prev) => [
          ...prev.filter((r) => r.projectId !== activeProjectId),
          ...res.data.cards.map((c: any) => ({
            id: c.id,
            projectId: c.projectId,
            category: c.type,
            content: c.content,
            author: c.author?.name || 'Membro',
            votes: c.votes || 0,
            createdAt: new Date(c.createdAt).toISOString().split('T')[0],
          })),
        ]);
      }
    });
  }, [activeProjectId]);

  // Filter projects accessible to current user (Owner or active Member)
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

  const completedProjects = useMemo(
    () => myProjects.filter((p) => p.status === 'COMPLETED'),
    [myProjects]
  );

  const activeProject = useMemo(() => {
    if (myProjects.length === 0) return null;
    return myProjects.find((p) => p.id === activeProjectId) || myProjects[0] || null;
  }, [myProjects, activeProjectId]);

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

  const activeProjectTasks = tasks.filter(
    (t) => t.projectId === (activeProject?.id || activeProjectId)
  );

  const activeProjectChat = chatMessages.filter(
    (c) => c.projectId === (activeProject?.id || activeProjectId)
  );

  const userPendingInvites: ProjectInvite[] = useMemo(() => {
    if (!currentUser) return [];
    const list: ProjectInvite[] = [];
    projects.forEach((proj) => {
      if (proj.invites) {
        proj.invites.forEach((inv) => {
          if (
            inv.status === 'PENDING' &&
            inv.invitedEmail.toLowerCase() === currentUser.email.toLowerCase()
          ) {
            list.push(inv);
          }
        });
      }
    });
    return list;
  }, [projects, currentUser]);

  const activeProjectMembers: TeamMember[] = useMemo(() => {
    if (activeProject && activeProject.members && activeProject.members.length > 0) {
      return activeProject.members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar:
          m.avatar ||
          (m.id === currentUser?.id ? currentUser?.avatarUrl : undefined) ||
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        role: m.techArea || (m.role === 'ADMIN' ? 'Tech Lead & Scrum Master' : 'Desenvolvedor(a)'),
      }));
    }
    if (currentUser) {
      return [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar:
            currentUser.avatarUrl ||
            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          role: currentUser.techArea || 'Desenvolvedor(a)',
        },
      ];
    }
    return [];
  }, [activeProject, currentUser]);

  const activeProjectPairSessions = pairSessions.filter(
    (p) => p.projectId === (activeProject?.id || activeProjectId)
  );
  const activeProjectTddTests = tddTests.filter(
    (t) => t.projectId === (activeProject?.id || activeProjectId)
  );
  const activeSprint =
    sprints.find(
      (s) => s.projectId === (activeProject?.id || activeProjectId) && s.status === 'ACTIVE'
    ) || null;

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

  // Project Creation via Backend API
  const createProject = async (
    name: string,
    description: string,
    diagnosticAnswers?: DiagnosticAnswer[],
    manualMethodology?: Methodology,
    teamSize: number = 5,
    deadline?: string
  ): Promise<Project> => {
    let result =
      diagnosticAnswers && diagnosticAnswers.length > 0
        ? calculateDiagnosticResult(diagnosticAnswers)
        : undefined;
    const recommended: Methodology = result ? result.recommended : manualMethodology || 'XP';
    const activeMeth: Methodology = manualMethodology || recommended;

    const res = await api.projects.create({
      name: name.trim(),
      description: description.trim(),
      activeMethodology: activeMeth,
      teamSize: Math.max(1, teamSize),
      tags: [activeMeth, 'Novo Projeto'],
      deadline: deadline || undefined,
    });

    if (!res.success || !res.data?.project) {
      throw new Error(res.message || 'Falha ao persistir o novo projeto no banco de dados PostgreSQL.');
    }

    const saved = res.data.project;
    const newProj: Project = {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      adminId: saved.adminId,
      adminName: saved.adminName,
      adminEmail: saved.adminEmail,
      recommendedMethodology: recommended,
      activeMethodology: saved.activeMethodology as Methodology,
      createdAt: new Date(saved.createdAt).toISOString().split('T')[0],
      tags: saved.tags || [activeMeth, 'Novo Projeto'],
      members: (saved.members || []).map((m: any) => ({
        id: m.userId || m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        techArea: m.techArea || 'Engenharia Fullstack',
        joinedAt: new Date(m.joinedAt || Date.now()).toISOString().split('T')[0],
        avatar: m.avatarUrl,
      })),
      teamSize: saved.teamSize,
      deadline: saved.deadline ? new Date(saved.deadline).toISOString().split('T')[0] : undefined,
      status: saved.status as ProjectStatus,
      invites: saved.invites || [],
      removalLogs: saved.removalLogs || [],
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

    if (activeMeth === 'SCRUM') {
      try {
        const sprintRes = await api.scrum.createSprint({
          projectId: newProj.id,
          name: 'Sprint 1',
          goal: 'Definir objetivos e adicionar estórias ao Backlog',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (sprintRes.success && sprintRes.data?.sprint) {
          const sp = sprintRes.data.sprint;
          setSprints((prev) => [
            {
              id: sp.id,
              projectId: newProj.id,
              number: 1,
              name: sp.name,
              goal: sp.goal,
              startDate: new Date(sp.startDate).toISOString().split('T')[0],
              endDate: new Date(sp.endDate).toISOString().split('T')[0],
              status: 'ACTIVE',
              totalPoints: 0,
              completedPoints: 0,
            },
            ...prev,
          ]);
        }
      } catch (e) {
        console.warn('Could not auto-create sprint in backend:', e);
      }
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

  // Asynchronous updateStatus persisted strictly via PostgreSQL Prisma API
  const updateStatus = async (
    projectId: string,
    status: ProjectStatus
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.projects.updateStatus(projectId, status);
      if (!res.success) {
        return {
          success: false,
          message: res.message || 'Erro ao atualizar o status do projeto no servidor PostgreSQL.',
        };
      }

      // Update React state strictly after successful backend confirmation
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status } : p))
      );

      return {
        success: true,
        message: res.message || `Status do projeto atualizado para ${status}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro inesperado na requisição de alteração de status.',
      };
    }
  };

  const updateProjectStatus = updateStatus;

  // Asynchronous deleteProject persisted strictly via PostgreSQL Prisma API
  const deleteProject = async (projectId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.projects.delete(projectId);
      if (!res.success) {
        return {
          success: false,
          message: res.message || 'Erro ao excluir o projeto no servidor PostgreSQL.',
        };
      }

      // Update React state strictly after successful backend confirmation
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
      setChatMessages((prev) => prev.filter((c) => c.projectId !== projectId));
      setSprints((prev) => prev.filter((s) => s.projectId !== projectId));
      setDailyNotes((prev) => prev.filter((d) => d.projectId !== projectId));
      setRetroCards((prev) => prev.filter((r) => r.projectId !== projectId));

      if (activeProjectId === projectId) {
        const remaining = projects.filter((p) => p.id !== projectId);
        setActiveProjectId(remaining[0]?.id || '');
      }

      return {
        success: true,
        message: res.message || 'Projeto excluído com sucesso.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro inesperado ao excluir projeto.',
      };
    }
  };

  // Complete project via PostgreSQL Prisma API
  const completeProject = async (
    projectId: string,
    notes?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.projects.complete(projectId, notes);
      if (!res.success) {
        return {
          success: false,
          message: res.message || 'Erro ao marcar projeto como concluído no servidor.',
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

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
      });

      return {
        success: true,
        message: res.message || 'Projeto concluído com sucesso!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Erro ao concluir projeto.',
      };
    }
  };

  // Send invite persisted via PostgreSQL Prisma API
  const sendInvite = async (
    projectId: string,
    invitedEmail: string
  ): Promise<{ success: boolean; message?: string }> => {
    const emailClean = invitedEmail.trim().toLowerCase();
    if (!emailClean) return { success: false, message: 'E-mail inválido.' };

    const res = await api.projects.sendInvite(projectId, emailClean);
    if (!res.success || !res.data?.invite) {
      return {
        success: false,
        message: res.message || 'Erro ao enviar convite pelo servidor.',
      };
    }

    const savedInvite = res.data.invite;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const newInv: ProjectInvite = {
            id: savedInvite.id,
            projectId: savedInvite.projectId,
            projectName: savedInvite.projectName,
            projectMethodology: savedInvite.projectMethodology,
            invitedByUserId: savedInvite.invitedByUserId,
            invitedByUserName: savedInvite.invitedByUserName,
            invitedEmail: savedInvite.invitedEmail,
            inviteCode: savedInvite.inviteCode,
            status: savedInvite.status,
            createdAt: new Date(savedInvite.createdAt).toISOString().split('T')[0],
          };
          return {
            ...p,
            invites: [...(p.invites || []), newInv],
          };
        }
        return p;
      })
    );

    return {
      success: true,
      message: res.message || `Convite enviado com sucesso para ${emailClean}!`,
    };
  };

  // Accept invite persisted via PostgreSQL Prisma API
  const acceptInvite = async (
    inviteCodeOrId: string
  ): Promise<{ success: boolean; message?: string }> => {
    let code = inviteCodeOrId;
    // If it's an invite id, look up its code
    projects.forEach((p) => {
      p.invites?.forEach((i) => {
        if (i.id === inviteCodeOrId) code = i.inviteCode;
      });
    });

    const res = await api.projects.acceptInvite(code);
    if (!res.success) {
      return {
        success: false,
        message: res.message || 'Erro ao aceitar convite no servidor.',
      };
    }

    await refreshProjects();
    if (res.data?.projectId) {
      setActiveProjectId(res.data.projectId);
    }

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    return {
      success: true,
      message: res.message || 'Você ingressou com sucesso no projeto!',
    };
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

  // Remove member persisted via PostgreSQL Prisma API
  const removeMember = async (
    projectId: string,
    memberId: string,
    justification: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await api.projects.removeMember(projectId, memberId, justification);
    if (!res.success) {
      return {
        success: false,
        message: res.message || 'Erro ao remover integrante no servidor.',
      };
    }

    await refreshProjects();
    return {
      success: true,
      message: res.message || 'Integrante removido com sucesso.',
    };
  };

  // Leave project persisted via PostgreSQL Prisma API
  const leaveProject = async (
    projectId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await api.projects.leave(projectId);
    if (!res.success) {
      return {
        success: false,
        message: res.message || 'Erro ao sair do projeto no servidor.',
      };
    }

    await refreshProjects();
    return {
      success: true,
      message: res.message || 'Você saiu do projeto com sucesso.',
    };
  };

  // Add chat message persisted via PostgreSQL Prisma API
  const addChatMessage = async (projectId: string, content: string) => {
    if (!content.trim()) return;

    const res = await api.chat.sendMessage(projectId, content.trim());
    if (res.success && res.data?.message) {
      const m = res.data.message;
      const newMsg: ChatMessage = {
        id: m.id,
        projectId: m.projectId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        senderTechArea: m.senderTechArea,
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: m.isSystem,
      };
      setChatMessages((prev) => [...prev, newMsg]);
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

  // Task Actions persisted via PostgreSQL Prisma API
  const addTask = async (taskData: Partial<Task>): Promise<Task> => {
    const isBacklog =
      taskData.inBacklog !== undefined
        ? taskData.inBacklog
        : taskData.status === 'backlog' || !taskData.sprintId;

    const targetProjectId = taskData.projectId || activeProjectId;

    const payload = {
      projectId: targetProjectId,
      title: taskData.title || 'Nova Tarefa',
      description: taskData.description || '',
      status: taskData.status || (isBacklog ? 'backlog' : 'todo'),
      priority: taskData.priority || 'Média',
      storyPoints: taskData.storyPoints || 2,
      assignees: taskData.assignees || (currentUser?.id ? [currentUser.id] : []),
      tags: taskData.tags && taskData.tags.length > 0 ? taskData.tags : ['Geral'],
      sprintId: isBacklog ? null : taskData.sprintId || null,
      inBacklog: isBacklog,
    };

    const res = await api.tasks.create(payload);
    if (res.success && res.data?.task) {
      const t = res.data.task;
      const newTask: Task = {
        id: t.id,
        projectId: t.projectId,
        title: t.title,
        description: t.description || '',
        status: t.status as KanbanColumnId,
        priority: (t.priority as any) || 'Média',
        storyPoints: t.storyPoints || 2,
        assignees: t.assignees || [],
        tags: t.tags || [],
        createdAt: new Date(t.createdAt).toISOString().split('T')[0],
        sprintId: t.sprintId,
        inBacklog: t.inBacklog,
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    }

    throw new Error(res.message || 'Erro ao criar tarefa no servidor PostgreSQL.');
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const res = await api.tasks.update(taskId, updates);
    if (res.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    }
  };

  const moveTaskStatus = async (
    taskId: string,
    newStatus: KanbanColumnId,
    sprintId?: string | null
  ) => {
    const isDone = newStatus === 'done';
    
    // Tratamento para garantir que "" vire null e previna erro de FK no Prisma
    let targetSprintId: string | null | undefined = sprintId;
    if (typeof sprintId === 'string') {
      targetSprintId = sprintId.trim() === '' ? null : sprintId;
    }

    const payload: any = {
      status: newStatus,
      sprintId: targetSprintId !== undefined ? targetSprintId : undefined,
    };
    const res = await api.tasks.update(taskId, payload);
    if (res.success) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
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
    }
  };

  const deleteTask = async (taskId: string) => {
    const res = await api.tasks.delete(taskId);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // XP Actions
  const addPairSession = async (
    driverId: string,
    navigatorId: string,
    featureName: string,
    durationMinutes: number
  ) => {
    const driver = teamMembers.find((m) => m.id === driverId);
    const navigator = teamMembers.find((m) => m.id === navigatorId);

    const res = await api.xp.createPairSession({
      projectId: activeProjectId,
      driverId,
      driverName: driver?.name || 'Driver',
      navigatorId,
      navigatorName: navigator?.name || 'Navigator',
      taskTitle: featureName,
      branchName: `feature/${featureName.toLowerCase().replace(/\s+/g, '-')}`,
    });

    if (res.success && res.data?.session) {
      const s = res.data.session;
      setPairSessions((prev) => [
        {
          id: s.id,
          projectId: s.projectId,
          driverId: s.driverId,
          navigatorId: s.navigatorId,
          featureName: s.taskTitle,
          startedAt: 'Agora mesmo',
          durationMinutes: s.durationMinutes || durationMinutes,
          status: 'ACTIVE',
        },
        ...prev,
      ]);
    }
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
    setPokerSessions((prev) => {
      const existing = prev.find((p) => p.projectId === activeProjectId);
      if (!existing) {
        const newVotes = activeProjectMembers.map((m) =>
          m.id === memberId
            ? { memberId: m.id, vote, hasVoted: true }
            : { memberId: m.id, vote: null, hasVoted: false }
        );
        const newSession: PlanningPokerSession = {
          id: `poker_${activeProjectId}`,
          projectId: activeProjectId,
          taskId: activeProjectTasks[0]?.id || `task_${activeProjectId}`,
          taskTitle: activeProjectTasks[0]?.title || 'Estória em Votação',
          votes: newVotes,
          revealed: false,
          consensusEstimate: null,
        };
        return [...prev, newSession];
      }
      return prev.map((p) => {
        if (p.projectId === activeProjectId) {
          const newVotes = p.votes.map((v) =>
            v.memberId === memberId ? { ...v, vote, hasVoted: true } : v
          );
          if (!newVotes.some((v) => v.memberId === memberId)) {
            newVotes.push({ memberId, vote, hasVoted: true });
          }
          return { ...p, votes: newVotes };
        }
        return p;
      });
    });
  };

  const simulateTeamVotes = () => {
    const fibChoices = [1, 2, 3, 5, 8, 13];
    setPokerSessions((prev) => {
      const existing = prev.find((p) => p.projectId === activeProjectId);
      const members = activeProjectMembers;
      if (!existing) {
        const newVotes = members.map((m) => {
          const randomVote = fibChoices[Math.floor(Math.random() * fibChoices.length)];
          return { memberId: m.id, vote: randomVote, hasVoted: true };
        });
        const newSession: PlanningPokerSession = {
          id: `poker_${activeProjectId}`,
          projectId: activeProjectId,
          taskId: activeProjectTasks[0]?.id || `task_${activeProjectId}`,
          taskTitle: activeProjectTasks[0]?.title || 'Estória em Votação',
          votes: newVotes,
          revealed: false,
          consensusEstimate: null,
        };
        return [...prev, newSession];
      }
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

      const existing = prev.find((p) => p.projectId === activeProjectId);
      if (!existing) {
        const newSession: PlanningPokerSession = {
          id: `poker_${activeProjectId}`,
          projectId: activeProjectId,
          taskId,
          taskTitle,
          votes: cleanVotes,
          revealed: false,
          consensusEstimate: null,
        };
        return [...prev, newSession];
      }

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

  const addDailyNote = async (
    yesterday: string,
    today: string,
    impediments: string,
    author: string,
    date?: string
  ) => {
    const res = await api.scrum.createDailyNote({
      projectId: activeProjectId,
      yesterday,
      today,
      blockers: impediments.trim() || 'Nenhum',
    });

    if (res.success && res.data?.note) {
      const n = res.data.note;
      const newNote: DailyNote = {
        id: n.id,
        projectId: n.projectId,
        date: date || new Date(n.date).toISOString().split('T')[0],
        author,
        yesterday: n.yesterday,
        today: n.today,
        impediments: n.blockers || 'Nenhum',
      };
      setDailyNotes((prev) => [newNote, ...prev]);
    }
  };

  const deleteDailyNote = (id: string) => {
    setDailyNotes((prev) => prev.filter((d) => d.id !== id));
  };

  const addRetroCard = async (
    category: 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEM',
    content: string,
    author: string,
    createdAt?: string
  ) => {
    const res = await api.scrum.createRetroCard({
      projectId: activeProjectId,
      type: category,
      content,
    });

    if (res.success && res.data?.card) {
      const c = res.data.card;
      const newCard: RetroCard = {
        id: c.id,
        projectId: c.projectId,
        category,
        content: c.content,
        author,
        votes: 0,
        voters: [],
        createdAt: createdAt || new Date().toISOString().split('T')[0],
      };
      setRetroCards((prev) => [newCard, ...prev]);
    }
  };

  const deleteRetroCard = (id: string) => {
    setRetroCards((prev) => prev.filter((r) => r.id !== id));
  };

  const voteRetroCard = (id: string, voterId?: string) => {
    const currentVoterId = voterId || currentUser?.id || currentUser?.email || 'user_member';
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

  const createSprint = async (sprintData: Partial<Sprint>) => {
    if (!activeProjectId) {
      return { success: false, message: 'Nenhum projeto ativo.' };
    }

    const highestNumber = sprints.reduce((max, s) => Math.max(max, s.number || 0), 0);
    const sprintNum = sprintData.number || highestNumber + 1;

    try {
      const res = await api.scrum.createSprint({
        projectId: activeProjectId,
        name: sprintData.name?.trim() || `Sprint ${sprintNum}`,
        goal: sprintData.goal?.trim() || 'Incremento de produto',
        startDate: sprintData.startDate ? new Date(sprintData.startDate).toISOString() : new Date().toISOString(),
        endDate: sprintData.endDate ? new Date(sprintData.endDate).toISOString() : new Date().toISOString(),
      });

      if (res.success && res.data?.sprint) {
        await refreshProjects(); // Sincroniza com a base PostgreSQL
        return { success: true, sprint: res.data.sprint };
      }

      return {
        success: false,
        message: res.message || 'Falha ao criar Sprint no banco de dados.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao comunicar com o servidor.' };
    }
  };

  const updateSprint = async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      // 1. Atualiza no backend via API
      const res = await api.scrum.updateSprint(sprintId, updates);

      if (!res.success) {
        return { success: false, message: res.message || 'Erro ao atualizar sprint.' };
      }

      // 2. Atualiza no estado local para reflexão imediata na UI
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? { ...s, ...updates } : s))
      );

      return { success: true };
    } catch (err: any) {
      console.error('Erro em updateSprint:', err);
      return { success: false, message: err.message || 'Falha ao atualizar a sprint.' };
    }
  };

  const deleteSprint = (sprintId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.sprintId === sprintId ? { ...t, sprintId: null, inBacklog: true, status: 'backlog' } : t
      )
    );
    setSprints((prev) => prev.filter((s) => s.id !== sprintId));
    return { success: true };
  };

  const completeActiveSprint = async () => {
    if (!activeSprint || !activeProjectId) return;

    const allSprintTasks = tasks.filter(
      (t) => t.projectId === activeProjectId && t.sprintId === activeSprint.id
    );
    const completedTasksInSprint = allSprintTasks.filter((t) => t.status === 'done');
    const incompleteTasksInSprint = allSprintTasks.filter((t) => t.status !== 'done');

    const completedPts = completedTasksInSprint.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      setIsLoading(true);

      // 1. Atualiza as tarefas incompletas no Banco de Dados para remover o sprintId e mandar pro Backlog
      await Promise.all(
        incompleteTasksInSprint.map((t) =>
          api.tasks.update(t.id, {
            sprintId: null,
            inBacklog: true,
            status: 'backlog',
          })
        )
      );

      // 2. Atualiza o status da Sprint atual para COMPLETED no backend
      await api.scrum.completeSprint(activeSprint.id);

      // 3. Cria a próxima Sprint no banco de dados
      const nextSprintNum = activeSprint.number + 1;
      const nextStartDate = todayStr;
      const nextEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await api.scrum.createSprint({
        projectId: activeProjectId,
        name: `Sprint ${nextSprintNum}`,
        goal: `Lançamento de funcionalidades e refinamento da iteração ${nextSprintNum}`,
        startDate: new Date(nextStartDate).toISOString(),
        endDate: new Date(nextEndDate).toISOString(),
      });

      // 4. Mensagem de Sistema no Chat
      await api.chat.sendMessage(
        activeProjectId,
        `🏆 SPRINT FINALIZADA! ${activeSprint.name} foi concluída com ${completedPts} Story Points entregues (${completedTasksInSprint.length} tarefas finalizadas). ${
          incompleteTasksInSprint.length > 0
            ? `${incompleteTasksInSprint.length} tarefa(s) não concluída(s) retornaram ao Product Backlog.`
            : ''
        } Nova Sprint ${nextSprintNum} já iniciada!`
      );

      // 5. Recarrega os dados completos do banco (sincronizando o frontend de forma limpa)
      await refreshProjects();

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'],
      });
    } catch (err: any) {
      console.error('Erro ao concluir sprint:', err);
      setLoadError(err.message || 'Erro ao concluir a sprint no servidor.');
    } finally {
      setIsLoading(false);
    }
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
        isLoading,
        loadError,
        setActiveProjectId,
        createProject,
        updateProjectMethodology,
        updateProjectWipLimits,
        updateProjectStatus,
        updateStatus,
        deleteProject,
        completeProject,
        refreshProjects,
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
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
