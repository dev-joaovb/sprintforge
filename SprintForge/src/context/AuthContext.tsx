import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TechArea, ProjectInvite } from '../types';
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
  
  // Auth Operations
  registerUser: (data: RegisterParams) => { success: boolean; message?: string };
  loginUser: (email: string, pass: string) => { success: boolean; message?: string };
  logoutUser: () => void;
  resetPassword: (email: string, newPassword: string) => { success: boolean; message?: string };
  updateProfile: (data: Partial<User>) => void;
  
  // User lookup
  findUserByEmail: (email: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USERS = 'sprintforge_registered_users_v2';
const STORAGE_CURRENT_USER = 'sprintforge_current_user_v2';

export const DEMO_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'João Victor',
    email: 'joao@sprintforge.com',
    phone: '(11) 98888-7777',
    techArea: 'Engenharia Fullstack',
    password: '123',
    createdAt: '2026-01-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_ana_2',
    name: 'Ana Silva',
    email: 'ana@sprintforge.com',
    phone: '(11) 97777-6666',
    techArea: 'Scrum Master / Agile Coach',
    password: '123',
    createdAt: '2026-01-02',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_carlos_3',
    name: 'Carlos Mendes',
    email: 'carlos@sprintforge.com',
    phone: '(11) 96666-5555',
    techArea: 'DevOps / Cloud Infrastructure',
    password: '123',
    createdAt: '2026-01-03',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_mariana_4',
    name: 'Mariana Costa',
    email: 'mariana@sprintforge.com',
    phone: '(11) 95555-4444',
    techArea: 'QA / Testes & Qualidade',
    password: '123',
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
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading users:', e);
      }
    }
    return DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedCurrent = localStorage.getItem(STORAGE_CURRENT_USER);
    if (savedCurrent) {
      try {
        return JSON.parse(savedCurrent);
      } catch (e) {
        console.error('Error loading current user:', e);
      }
    }
    return DEMO_USERS[0]; // Default logged in as João Victor
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  // Sync currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  }, [currentUser]);

  const registerUser = (data: RegisterParams) => {
    // Check if email already exists
    const existing = allUsers.find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'Já existe uma conta cadastrada com este e-mail.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      techArea: data.techArea,
      password: data.password || '123456',
      createdAt: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const loginUser = (email: string, pass: string) => {
    const user = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Nenhuma conta encontrada com este e-mail.' };
    }

    if (user.password && user.password !== pass) {
      return { success: false, message: 'Senha incorreta. Tente novamente.' };
    }

    setCurrentUser(user);
    return { success: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const resetPassword = (email: string, newPassword: string) => {
    const userIndex = allUsers.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (userIndex === -1) {
      return { success: false, message: 'E-mail não cadastrado no sistema.' };
    }

    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword,
    };

    setAllUsers(updatedUsers);
    if (currentUser && currentUser.email.toLowerCase() === email.trim().toLowerCase()) {
      setCurrentUser(updatedUsers[userIndex]);
    }
    return { success: true };
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Synchronize with PostgreSQL Backend
    api.auth.updateProfile({
      name: data.name,
      phone: data.phone,
      techArea: data.techArea,
      avatarUrl: data.avatarUrl,
    }).catch((err) => console.warn('[Backend Auth]: offline profile sync', err));
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
