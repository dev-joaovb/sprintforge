import {
  Project,
  Task,
  PairSession,
  TddTestCase,
  CiBuild,
  Sprint,
  DailyNote,
  RetroCard,
  User,
} from '../types';

const API_BASE_URL = 'http://localhost:3002/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('sprintforge_current_user_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch {
    // Retorna null caso o localStorage falhe
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let result: any = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    }

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Erro na requisição ao servidor.',
      };
    }

    return result;
  } catch (error) {
    console.warn(`[API Client Warning]: Backend offline or unreachable at ${endpoint}. Using offline local state fallback.`, error);
    return {
      success: false,
      message: 'Servidor backend offline ou banco de dados ainda não configurado.',
    };
  }
}

export const api = {
  // 1. AUTH API
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (userData: { name: string; email: string; phone?: string; techArea: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    me: () => request<{ user: User }>('/auth/me'),

    resetPassword: (email: string, newPassword: string) =>
      request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      }),

    updateProfile: (data: { name?: string; phone?: string; techArea?: string; avatarUrl?: string }) =>
      request<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // 2. PROJECTS API
  projects: {
    list: () => request<{ projects: Project[] }>('/projects'),

    getById: (id: string) => request<{ project: Project }>(`/projects/${id}`),

    create: (projectData: { name: string; description: string; activeMethodology: string; teamSize: number; tags?: string[]; deadline?: string }) =>
      request<{ project: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),

    updateMethodology: (id: string, methodology: string) =>
      request<{ project: Project }>(`/projects/${id}/methodology`, {
        method: 'PATCH',
        body: JSON.stringify({ methodology }),
      }),

    updateWipLimits: (id: string, wipLimits: Record<string, number>) =>
      request<{ project: Project }>(`/projects/${id}/wip-limits`, {
        method: 'PATCH',
        body: JSON.stringify({ wipLimits }),
      }),

    updateStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
      request<{ project: Project }>(`/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    complete: (id: string, notes?: string) =>
      request<{ project: Project }>(`/projects/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/projects/${id}`, {
        method: 'DELETE',
      }),

    sendInvite: (projectId: string, invitedEmail: string) =>
      request<{ invite: any }>(`/projects/${projectId}/invites`, {
        method: 'POST',
        body: JSON.stringify({ invitedEmail }),
      }),

    acceptInvite: (inviteCode: string) =>
      request<{ projectId: string }>('/projects/invites/accept', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      }),

    removeMember: (projectId: string, memberId: string, justification: string) =>
      request<{ message: string }>(`/projects/${projectId}/members/remove`, {
        method: 'POST',
        body: JSON.stringify({ memberId, justification }),
      }),

    leave: (projectId: string) =>
      request<{ message: string }>(`/projects/${projectId}/leave`, {
        method: 'POST',
      }),

    listInvites: () => request<{ invites: any[] }>('/projects/invites'),
  },

  // 3. TASKS API
  tasks: {
    listByProject: (projectId: string) => request<{ tasks: Task[] }>(`/tasks/project/${projectId}`),

    create: (taskData: Partial<Task>) =>
      request<{ task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),

    update: (id: string, taskData: Partial<Task>) =>
      request<{ task: Task }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  // 4. XP MODULE API
  xp: {
    getPairSessions: (projectId: string) => request<{ sessions: PairSession[] }>(`/xp/pair/${projectId}`),

    createPairSession: (sessionData: Partial<PairSession>) =>
      request<{ session: PairSession }>('/xp/pair', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      }),

    getTddTests: (projectId: string) => request<{ tests: TddTestCase[] }>(`/xp/tdd/${projectId}`),

    createTddTest: (testData: Partial<TddTestCase>) =>
      request<{ test: TddTestCase }>('/xp/tdd', {
        method: 'POST',
        body: JSON.stringify(testData),
      }),

    runTddTest: (id: string) =>
      request<{ test: TddTestCase }>(`/xp/tdd/${id}/run`, {
        method: 'POST',
      }),

    getCiBuilds: (projectId: string) => request<{ builds: CiBuild[] }>(`/xp/ci/${projectId}`),
  },

  // 5. SCRUM MODULE API
  scrum: {
    getSprints: (projectId: string) => request<{ sprints: Sprint[] }>(`/scrum/sprints/${projectId}`),

    createSprint: (sprintData: Partial<Sprint>) =>
      request<{ sprint: Sprint }>('/scrum/sprints', {
        method: 'POST',
        body: JSON.stringify(sprintData),
      }),

    updateSprint: (id: string, updates: Partial<Sprint>) =>
      request<{ sprint: Sprint }>(`/scrum/sprints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    deleteSprint: (id: string) =>
      request<{ message: string }>(`/scrum/sprints/${id}`, {
        method: 'DELETE',
      }),

    getDailyNotes: (projectId: string) => request<{ notes: DailyNote[] }>(`/scrum/daily/${projectId}`),

    createDailyNote: (noteData: Partial<DailyNote>) =>
      request<{ note: DailyNote }>('/scrum/daily', {
        method: 'POST',
        body: JSON.stringify(noteData),
      }),

    deleteDailyNote: (id: string) =>
      request<{ message: string }>(`/scrum/daily/${id}`, {
        method: 'DELETE',
      }),

    getRetroCards: (projectId: string) => request<{ cards: RetroCard[] }>(`/scrum/retro/${projectId}`),

    createRetroCard: (cardData: Partial<RetroCard>) =>
      request<{ card: RetroCard }>('/scrum/retro', {
        method: 'POST',
        body: JSON.stringify(cardData),
      }),

    deleteRetroCard: (id: string) =>
      request<{ message: string }>(`/scrum/retro/${id}`, {
        method: 'DELETE',
      }),

    voteRetroCard: (id: string) =>
      request<{ card: RetroCard }>(`/scrum/retro/${id}/vote`, {
        method: 'POST',
      }),
  },

  // 6. ISOLATED PROJECT CHAT API
  chat: {
    getMessages: (projectId: string) => request<{ messages: any[] }>(`/chat/${projectId}`),

    sendMessage: (projectId: string, content: string) =>
      request<{ message: any }>(`/chat/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },
};

export default api;