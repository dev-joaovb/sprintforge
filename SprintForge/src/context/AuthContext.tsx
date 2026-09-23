import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TechArea } from '../types';
import { api, setStoredToken, getStoredToken } from '../services/api';

interface RegisterParams {
  name: string;
  email: string;
  phone: string;
  techArea: string;
  password?: string;
}

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  
  // Auth Operations
  registerUser: (data: RegisterParams) => Promise<{ success: boolean; message?: string }>;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // User lookup
  findUserByEmail: (email: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_CURRENT_USER = 'sprintforge_current_user_v2';

export const TECH_AREAS_OPTIONS: TechArea[] = [
  'Desenvolvimento Frontend',
  'Desenvolvimento Backend',
  'Engenharia Fullstack',
  'DevOps / Cloud Infrastructure',
  'QA / Testes & Qualidade',
  'UI/UX Design & Product Design',
  'Data Science, BI & Inteligência Artificial',
  'Product Owner / PM',
  'Scrum Master / Agile Coach',
  'Desenvolvimento Mobile',
  'Segurança da Informação / CyberSecurity',
];

export const DEMO_USERS: User[] = [
  {
    id: 'user_ana_silva',
    name: 'Ana Silva',
    email: 'ana.silva@sprintforge.dev',
    phone: '(11) 98765-4321',
    techArea: 'Product Owner / PM',
    createdAt: '2025-01-10',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_carlos_souza',
    name: 'Carlos Souza',
    email: 'carlos.souza@sprintforge.dev',
    phone: '(21) 99887-1122',
    techArea: 'Engenharia Fullstack',
    createdAt: '2025-01-12',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_beatriz_lima',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@sprintforge.dev',
    phone: '(31) 97654-9988',
    techArea: 'Scrum Master / Agile Coach',
    createdAt: '2025-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_rodrigo_melo',
    name: 'Rodrigo Melo',
    email: 'rodrigo.melo@sprintforge.dev',
    phone: '(41) 98112-3344',
    techArea: 'DevOps / Cloud Infrastructure',
    createdAt: '2025-01-18',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(DEMO_USERS);

  // Validate session on mount with /api/auth/me
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.auth.me().then((res) => {
        if (res.success && res.data?.user) {
          const u = res.data.user;
          const userObj: User = {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            techArea: u.techArea || 'Engenharia Fullstack',
            createdAt: new Date(u.createdAt).toISOString().split('T')[0],
            avatarUrl: u.avatarUrl,
          };
          setCurrentUser(userObj);
          try {
            localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify({ ...userObj, token }));
          } catch {
            // Ignore
          }
        }
      }).catch(() => {
        // keep offline user
      });
    }
  }, []);

  const registerUser = async (data: RegisterParams): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        techArea: data.techArea,
        password: data.password || '123456',
      });

      if (res.success && res.data?.token) {
        setStoredToken(res.data.token);
        const u = res.data.user;
        const newUser: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          techArea: u.techArea || 'Engenharia Fullstack',
          createdAt: new Date(u.createdAt).toISOString().split('T')[0],
          avatarUrl: u.avatarUrl,
        };
        setCurrentUser(newUser);
        setAllUsers((prev) => [...prev, newUser]);
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify({ ...newUser, token: res.data.token }));
        return { success: true };
      }

      return { success: false, message: res.message || 'Erro ao registrar usuário.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro na comunicação com o servidor.' };
    }
  };

  const loginUser = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.login(email.trim().toLowerCase(), pass);

      if (res.success && res.data?.token) {
        setStoredToken(res.data.token);
        const u = res.data.user;
        const loggedUser: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          techArea: u.techArea || 'Engenharia Fullstack',
          createdAt: new Date(u.createdAt).toISOString().split('T')[0],
          avatarUrl: u.avatarUrl,
        };
        setCurrentUser(loggedUser);
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify({ ...loggedUser, token: res.data.token }));
        return { success: true };
      }

      return { success: false, message: res.message || 'E-mail ou senha inválidos.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Falha ao conectar com o servidor.' };
    }
  };

  const logoutUser = () => {
    setStoredToken(null);
    localStorage.removeItem(STORAGE_CURRENT_USER);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.resetPassword(email.trim().toLowerCase(), newPassword);
      if (res.success) {
        return { success: true, message: res.message || 'Senha redefinida com sucesso!' };
      }
      return { success: false, message: res.message || 'Falha ao redefinir senha.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro ao redefinir senha.' };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedUser));

    // Persist to PostgreSQL backend via Prisma
    await api.auth.updateProfile({
      name: data.name,
      phone: data.phone,
      techArea: data.techArea,
      avatarUrl: data.avatarUrl,
    });
  };

  const findUserByEmail = (email: string): User | undefined => {
    return allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated: !!currentUser,
        registerUser,
        loginUser,
        logoutUser,
        resetPassword,
        updateProfile,
        findUserByEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
