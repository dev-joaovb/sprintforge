/**
 * SprintForge API Service Client
 * Persistência de token no localStorage para evitar perda em F5 / navegação.
 */

const API_BASE_URL = '/api';

// Inicializa lendo o token salvo anteriormente no navegador (se existir)
let inMemoryAuthToken: string | null = typeof window !== 'undefined' 
  ? localStorage.getItem('sprintforge_token') 
  : null;

export function setAuthToken(token: string | null) {
  inMemoryAuthToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('sprintforge_token', token);
    } else {
      localStorage.removeItem('sprintforge_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (!inMemoryAuthToken && typeof window !== 'undefined') {
    inMemoryAuthToken = localStorage.getItem('sprintforge_token');
  }
  return inMemoryAuthToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
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

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Erro na requisição ao servidor.',
      };
    }

    return result;
  } catch (error: any) {
    console.error(`[API Client Error at ${endpoint}]:`, error);
    return {
      success: false,
      message: 'Não foi possível conectar ao servidor backend.',
    };
  }
}

export const api = {
  // 1. AUTH API
  auth: {
    login: async (email: string, password: string) => {
      const res = await request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },

    register: async (userData: { name: string; email: string; phone?: string; techArea: string; password?: string }) => {
      const res = await request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },

    session: () => request<{ user: any; token: string }>('/auth/session'),

    me: () => request<{ user: any }>('/auth/me'),

    listUsers: () => request<{ users: any[] }>('/auth/users'),

    resetPassword: (email: string, newPassword: string) =>
      request<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      }),

    updateProfile: (data: { name?: string; phone?: string; techArea?: string; avatarUrl?: string }) =>
      request<{ user: any }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    logout: () => {
      setAuthToken(null);
    },
  },

  // 2. PROJECTS API
  projects: {
    list: () => request<{ projects: any[] }>('/projects'),

    getById: (id: string) => request<{ project: any }>(`/projects/${id}`),

    create: (projectData: {
      name: string;
      description?: string;
      activeMethodology?: string;
      recommendedMethodology?: string;
      teamSize?: number;
      tags?: string[];
      deadline?: string | null;
    }) =>
      request<{ project: any }>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),

    updateStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
      request<{ project: any }>(`/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    updateMethodology: (id: string, activeMethodology: string) =>
      request<{ project: any }>(`/projects/${id}/methodology`, {
        method: 'PATCH',
        body: JSON.stringify({ activeMethodology }),
      }),

    complete: (id: string, notes?: string) =>
      request<{ project: any }>(`/projects/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),

    delete: (id: string) =>
      request<any>(`/projects/${id}`, {
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
      request<any>(`/projects/${projectId}/members/remove`, {
        method: 'POST',
        body: JSON.stringify({ memberId, justification }),
      }),

    leave: (projectId: string) =>
      request<any>(`/projects/${projectId}/leave`, {
        method: 'POST',
      }),

    listInvites: () => request<{ invites: any[] }>('/projects/invites'),
  },

  // 3. TASKS API
  tasks: {
    listByProject: (projectId: string) => {
      const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
      return request<{ tasks: any[] }>(url);
    },

    create: (taskData: any) =>
      request<{ task: any }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),

    update: (id: string, taskData: any) =>
      request<{ task: any }>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
      }),

    delete: (id: string) =>
      request<any>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  // 4. XP MODULE API
  xp: {
    getPairSessions: (projectId: string) => request<{ sessions: any[] }>(`/xp/pair/${projectId}`),

    createPairSession: (sessionData: any) =>
      request<{ session: any }>('/xp/pair', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      }),

    getTddTests: (projectId: string) => request<{ tests: any[] }>(`/xp/tdd/${projectId}`),

    runTddTest: (id: string) =>
      request<{ test: any }>(`/xp/tdd/${id}/run`, {
        method: 'POST',
      }),

    getCiBuilds: (projectId: string) => request<{ builds: any[] }>(`/xp/ci/${projectId}`),

    triggerCiBuild: (projectId: string, commitMessage?: string, branch?: string) =>
      request<{ build: any }>('/xp/ci/trigger', {
        method: 'POST',
        body: JSON.stringify({ projectId, commitMessage, branch }),
      }),
  },

  // 5. SCRUM MODULE API
  scrum: {
    getSprints: (projectId: string) => request<{ sprints: any[] }>(`/scrum/sprints/${projectId}`),

    createSprint: (sprintData: any) =>
      request<{ sprint: any }>('/scrum/sprints', {
        method: 'POST',
        body: JSON.stringify(sprintData),
      }),

    completeSprint: (id: string) =>
      request<{ sprint: any }>(`/scrum/sprints/${id}/complete`, {
        method: 'PATCH',
      }),

    getDailyNotes: (projectId: string) => request<{ notes: any[] }>(`/scrum/daily/${projectId}`),

    createDailyNote: (noteData: any) =>
      request<{ note: any }>('/scrum/daily', {
        method: 'POST',
        body: JSON.stringify(noteData),
      }),

    deleteDailyNote: (id: string) =>
      request<any>(`/scrum/daily/${id}`, {
        method: 'DELETE',
      }),

    getPlanningPoker: (projectId: string) => request<{ session: any }>(`/scrum/poker/${projectId}`),

    votePoker: (projectId: string, storyPoints: number) =>
      request<{ session: any }>('/scrum/poker/vote', {
        method: 'POST',
        body: JSON.stringify({ projectId, storyPoints }),
      }),

    revealPoker: (projectId: string) =>
      request<{ session: any }>('/scrum/poker/reveal', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      }),

    resetPoker: (projectId: string) =>
      request<{ session: any }>('/scrum/poker/reset', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      }),

    getRetroCards: (projectId: string) => request<{ cards: any[] }>(`/scrum/retro/${projectId}`),

    createRetroCard: (cardData: any) =>
      request<{ card: any }>('/scrum/retro', {
        method: 'POST',
        body: JSON.stringify(cardData),
      }),

    deleteRetroCard: (id: string) =>
      request<any>(`/scrum/retro/${id}`, {
        method: 'DELETE',
      }),

    voteRetroCard: (cardId: string) =>
      request<{ card: any }>('/scrum/retro/vote', {
        method: 'POST',
        body: JSON.stringify({ cardId }),
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