import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * SprintForge API Service Client
 * Configured with Axios interceptors to automatically inject JWT Bearer Token
 * on ALL outbound requests and handle responses/errors cleanly.
 */

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

/**
 * Retrieves the stored JWT token from localStorage.
 */
export const getStoredToken = (): string | null => {
  try {
    const directToken = localStorage.getItem('sprintforge_token');
    if (directToken) return directToken;

    const rawUser = localStorage.getItem('sprintforge_current_user_v2');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      return parsed?.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Updates or clears the stored JWT token.
 */
export const setStoredToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem('sprintforge_token', token);
    } else {
      localStorage.removeItem('sprintforge_token');
    }
  } catch {
    // Ignore storage errors
  }
};

// Request Interceptor: Automatically injects JWT Bearer token into EVERY request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Extracts exact backend error messages (400, 401, 403, 404, 500)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro ao conectar com o servidor.';

    return Promise.reject({
      status: error.response?.status,
      message: serverMessage,
      data: error.response?.data,
    });
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Standardized wrapper around Axios calls returning typed ApiResponse.
 */
async function handle<T>(requestPromise: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro na comunicação com a API.',
      data: err.data,
    };
  }
}

export const api = {
  // 1. AUTH API
  auth: {
    login: (email: string, password: string) =>
      handle<{ user: any; token: string }>(
        apiClient.post('/auth/login', { email, password })
      ),

    register: (userData: { name: string; email: string; phone?: string; techArea: string; password: string }) =>
      handle<{ user: any; token: string }>(
        apiClient.post('/auth/register', userData)
      ),

    me: () =>
      handle<{ user: any }>(
        apiClient.get('/auth/me')
      ),

    resetPassword: (email: string, newPassword: string) =>
      handle<any>(
        apiClient.post('/auth/reset-password', { email, newPassword })
      ),

    updateProfile: (data: { name?: string; phone?: string; techArea?: string; avatarUrl?: string }) =>
      handle<{ user: any }>(
        apiClient.put('/auth/profile', data)
      ),
  },

  // 2. PROJECTS API
  projects: {
    list: () =>
      handle<{ projects: any[] }>(
        apiClient.get('/projects')
      ),

    getById: (id: string) =>
      handle<{ project: any }>(
        apiClient.get(`/projects/${id}`)
      ),

    create: (projectData: {
      name: string;
      description: string;
      activeMethodology: string;
      teamSize: number;
      tags?: string[];
      deadline?: string;
    }) =>
      handle<{ project: any }>(
        apiClient.post('/projects', projectData)
      ),

    updateStatus: (id: string, status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED') =>
      handle<{ project: any }>(
        apiClient.patch(`/projects/${id}/status`, { status })
      ),

    complete: (id: string, notes?: string) =>
      handle<{ project: any }>(
        apiClient.post(`/projects/${id}/complete`, { notes })
      ),

    delete: (id: string) =>
      handle<any>(
        apiClient.delete(`/projects/${id}`)
      ),

    sendInvite: (projectId: string, invitedEmail: string) =>
      handle<{ invite: any }>(
        apiClient.post(`/projects/${projectId}/invites`, { invitedEmail })
      ),

    acceptInvite: (inviteCode: string) =>
      handle<{ projectId: string }>(
        apiClient.post('/projects/invites/accept', { inviteCode })
      ),

    removeMember: (projectId: string, memberId: string, justification: string) =>
      handle<any>(
        apiClient.post(`/projects/${projectId}/members/remove`, { memberId, justification })
      ),

    leave: (projectId: string) =>
      handle<any>(
        apiClient.post(`/projects/${projectId}/leave`)
      ),

    listInvites: () =>
      handle<{ invites: any[] }>(
        apiClient.get('/projects/invites')
      ),
  },

  // 3. TASKS API
  tasks: {
    listByProject: (projectId: string) =>
      handle<{ tasks: any[] }>(
        apiClient.get(`/tasks/project/${projectId}`)
      ),

    create: (taskData: any) =>
      handle<{ task: any }>(
        apiClient.post('/tasks', taskData)
      ),

    update: (id: string, taskData: any) =>
      handle<{ task: any }>(
        apiClient.patch(`/tasks/${id}`, taskData)
      ),

    delete: (id: string) =>
      handle<any>(
        apiClient.delete(`/tasks/${id}`)
      ),
  },

  // 4. XP MODULE API
  xp: {
    getPairSessions: (projectId: string) =>
      handle<{ sessions: any[] }>(
        apiClient.get(`/xp/pair/${projectId}`)
      ),

    createPairSession: (sessionData: any) =>
      handle<{ session: any }>(
        apiClient.post('/xp/pair', sessionData)
      ),

    getTddTests: (projectId: string) =>
      handle<{ tests: any[] }>(
        apiClient.get(`/xp/tdd/${projectId}`)
      ),

    runTddTest: (id: string) =>
      handle<{ test: any }>(
        apiClient.post(`/xp/tdd/${id}/run`)
      ),

    getCiBuilds: (projectId: string) =>
      handle<{ builds: any[] }>(
        apiClient.get(`/xp/ci/${projectId}`)
      ),
  },

  // 5. SCRUM MODULE API
  scrum: {
    getSprints: (projectId: string) =>
      handle<{ sprints: any[] }>(
        apiClient.get(`/scrum/sprints/${projectId}`)
      ),

    createSprint: (sprintData: any) =>
      handle<{ sprint: any }>(
        apiClient.post('/scrum/sprints', sprintData)
      ),

    getDailyNotes: (projectId: string) =>
      handle<{ notes: any[] }>(
        apiClient.get(`/scrum/daily/${projectId}`)
      ),

    createDailyNote: (noteData: any) =>
      handle<{ note: any }>(
        apiClient.post('/scrum/daily', noteData)
      ),

    getRetroCards: (projectId: string) =>
      handle<{ cards: any[] }>(
        apiClient.get(`/scrum/retro/${projectId}`)
      ),

    createRetroCard: (cardData: any) =>
      handle<{ card: any }>(
        apiClient.post('/scrum/retro', cardData)
      ),

    // Rota de atualização completa dos campos da Sprint
    updateSprint: (sprintId: string, data: any) =>
      handle<{ sprint: any }>(
        apiClient.patch(`/scrum/sprints/${sprintId}`, data)
      ),

    // Rota exclusiva para concluir a Sprint
    completeSprint: (sprintId: string) =>
      handle<{ sprint: any }>(
        apiClient.patch(`/scrum/sprints/${sprintId}/complete`)
      ),    
    
  },

  // 6. ISOLATED PROJECT CHAT API
  chat: {
    getMessages: (projectId: string) =>
      handle<{ messages: any[] }>(
        apiClient.get(`/chat/${projectId}`)
      ),

    sendMessage: (projectId: string, content: string) =>
      handle<{ message: any }>(
        apiClient.post(`/chat/${projectId}`, { content })
      ),
  },
};

export default api;
