/**
 * SprintForge API Service Client
 * Centralizes all data fetching and mutations between Frontend and the Node.js/PostgreSQL Backend.
 */

const API_BASE_URL = '/api';

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('sprintforge_current_user_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch {
    // Ignore error
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string }> {
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
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (userData: { name: string; email: string; phone?: string; techArea: string; password: string }) =>
      request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    me: () => request<any>('/auth/me'),

    resetPassword: (email: string, newPassword: string) =>
      request<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      }),

    updateProfile: (data: { name?: string; phone?: string; techArea?: string; avatarUrl?: string }) =>
      request<any>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // 2. PROJECTS API
  projects: {
    list: () => request<{ projects: any[] }>('/projects'),

    getById: (id: string) => request<{ project: any }>(`/projects/${id}`),

    create: (projectData: { name: string; description: string; activeMethodology: string; teamSize: number; tags?: string[]; deadline?: string }) =>
      request<{ project: any }>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),

    updateStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
      request<{ project: any }>(`/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
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
    listByProject: (projectId: string) => request<{ tasks: any[] }>(`/tasks/project/${projectId}`),

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
  },

  // 5. SCRUM MODULE API
  scrum: {
    getSprints: (projectId: string) => request<{ sprints: any[] }>(`/scrum/sprints/${projectId}`),

    createSprint: (sprintData: any) =>
      request<{ sprint: any }>('/scrum/sprints', {
        method: 'POST',
        body: JSON.stringify(sprintData),
      }),

    getDailyNotes: (projectId: string) => request<{ notes: any[] }>(`/scrum/daily/${projectId}`),

    createDailyNote: (noteData: any) =>
      request<{ note: any }>('/scrum/daily', {
        method: 'POST',
        body: JSON.stringify(noteData),
      }),

    getRetroCards: (projectId: string) => request<{ cards: any[] }>(`/scrum/retro/${projectId}`),

    createRetroCard: (cardData: any) =>
      request<{ card: any }>('/scrum/retro', {
        method: 'POST',
        body: JSON.stringify(cardData),
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
