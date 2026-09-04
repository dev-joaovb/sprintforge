import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TechArea } from '../types';
import { api } from '../services/api';

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
  
  // Auth Operations Assíncronas
  registerUser: (data: RegisterParams) => Promise<{ success: boolean; message?: string }>;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // User lookup
  findUserByEmail: (email: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS = 'sprintforge_registered_users_v2';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erro ao carregar lista de usuários salvos:', e);
      }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedCurrent = localStorage.getItem(STORAGE_CURRENT_USER);
    if (savedCurrent) {
      try {
        return JSON.parse(savedCurrent);
      } catch (e) {
        console.error('Erro ao carregar usuário atual:', e);
      }
    }
    return null;
  });

  // MODIFICAÇÃO: Validação automática do Token e carregamento do perfil no início via Backend
  useEffect(() => {
    async function checkAuthSession() {
      const savedCurrent = localStorage.getItem(STORAGE_CURRENT_USER);
      if (!savedCurrent) return;

      const res = await api.auth.me();
      if (res.success && res.data?.user) {
        const updatedUser = {
          ...res.data.user,
          token: res.data.token || JSON.parse(savedCurrent).token,
        };
        setCurrentUser(updatedUser);
      }
    }

    checkAuthSession();
  }, []);

  // Persistência local do usuário autenticado e lista para fallbacks
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  // MODIFICAÇÃO: Registro integrado com a API
  const registerUser = async (data: RegisterParams) => {
    const res = await api.auth.register({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      techArea: data.techArea,
      password: data.password || '123456',
    });

    if (res.success && res.data?.user) {
      const newUser = {
        ...res.data.user,
        token: res.data.token,
      };
      setCurrentUser(newUser);
      setAllUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);
      return { success: true };
    }

    return {
      success: false,
      message: res.message || 'Erro ao realizar cadastro no servidor.',
    };
  };

  // MODIFICAÇÃO: Login autenticado diretamente no PostgreSQL
  const loginUser = async (email: string, pass: string) => {
    const res = await api.auth.login(email.trim().toLowerCase(), pass);

    if (res.success && res.data?.user) {
      const loggedUser = {
        ...res.data.user,
        token: res.data.token,
      };
      setCurrentUser(loggedUser);
      setAllUsers((prev) => [...prev.filter((u) => u.id !== loggedUser.id), loggedUser]);
      return { success: true };
    }

    return {
      success: false,
      message: res.message || 'Credenciais inválidas ou conta não encontrada.',
    };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_CURRENT_USER);
  };

  // MODIFICAÇÃO: Redefinição de Senha via API
  const resetPassword = async (email: string, newPassword: string) => {
    const res = await api.auth.resetPassword(email.trim().toLowerCase(), newPassword);

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      message: res.message || 'Erro ao redefinir senha no servidor.',
    };
  };

  // MODIFICAÇÃO: Atualização de Perfil síncrona com o Banco de Dados
  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;

    const res = await api.auth.updateProfile({
      name: data.name,
      phone: data.phone,
      techArea: data.techArea,
      avatarUrl: data.avatarUrl,
    });

    const updatedUser = {
      ...currentUser,
      ...data,
      ...(res.success && res.data?.user ? res.data.user : {}),
    };

    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};