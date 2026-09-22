import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TechArea } from '../types';
import { api, setAuthToken } from '../services/api';

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
  isLoading: boolean;

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

export const DEMO_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'João Victor',
    email: 'joao@sprintforge.com',
    phone: '(11) 98888-7777',
    techArea: 'Engenharia Fullstack',
    createdAt: '2026-01-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_ana_2',
    name: 'Ana Silva',
    email: 'ana@sprintforge.com',
    phone: '(11) 97777-6666',
    techArea: 'Scrum Master / Agile Coach',
    createdAt: '2026-01-02',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_carlos_3',
    name: 'Carlos Mendes',
    email: 'carlos@sprintforge.com',
    phone: '(11) 96666-5555',
    techArea: 'DevOps / Cloud Infrastructure',
    createdAt: '2026-01-03',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_mariana_4',
    name: 'Mariana Costa',
    email: 'mariana@sprintforge.com',
    phone: '(11) 95555-4444',
    techArea: 'QA / Testes & Qualidade',
    createdAt: '2026-01-04',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
];

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from Backend REST API (Zero LocalStorage)
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const sessionRes = await api.auth.session();
        if (isMounted && sessionRes.success && sessionRes.data) {
          if (sessionRes.data.token) {
            setAuthToken(sessionRes.data.token);
          }
          if (sessionRes.data.user) {
            setCurrentUser(sessionRes.data.user);
          }
        }

        const usersRes = await api.auth.listUsers();
        if (isMounted && usersRes.success && usersRes.data?.users) {
          setAllUsers(usersRes.data.users);
        }
      } catch (err) {
        console.error('[AuthContext initSession error]:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
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

      if (!res.success || !res.data) {
        return { success: false, message: res.message || 'Erro ao realizar cadastro.' };
      }

      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);

      // Refresh users list from API
      const usersRes = await api.auth.listUsers();
      if (usersRes.success && usersRes.data?.users) {
        setAllUsers(usersRes.data.users);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro de conexão ao servidor.' };
    }
  };

  const loginUser = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.login(email.trim().toLowerCase(), pass);
      if (!res.success || !res.data) {
        return { success: false, message: res.message || 'E-mail ou senha incorretos.' };
      }

      setAuthToken(res.data.token);
      setCurrentUser(res.data.user);

      // Refresh users list
      const usersRes = await api.auth.listUsers();
      if (usersRes.success && usersRes.data?.users) {
        setAllUsers(usersRes.data.users);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro de conexão ao servidor.' };
    }
  };

  const logoutUser = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.resetPassword(email.trim().toLowerCase(), newPassword);
      if (!res.success) {
        return { success: false, message: res.message || 'Erro ao redefinir senha.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Erro de conexão ao servidor.' };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const optimistic = { ...currentUser, ...data };
    setCurrentUser(optimistic);

    try {
      const res = await api.auth.updateProfile({
        name: data.name,
        phone: data.phone,
        techArea: data.techArea,
        avatarUrl: data.avatarUrl,
      });

      if (res.success && res.data?.user) {
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      console.error('[AuthContext updateProfile error]:', err);
    }
  };

  const findUserByEmail = (email: string) => {
    return allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated: !!currentUser,
        isLoading,
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
export default AuthProvider;
