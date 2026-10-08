import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, ROLE_PERMISSIONS } from './auth';

const AUTH_KEY = 'auth_state';
const USERS_KEY = 'platform_users';

interface AuthContextType {
  auth: AuthState;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo users
const defaultUsers: User[] = [
  {
    id: 'user-1',
    login: 'admin',
    password: 'admin123',
    name: 'Системный администратор',
    email: 'admin@company.ru',
    role: 'admin',
    createdAt: '2024-01-01',
  },
  {
    id: 'user-2',
    login: 'director',
    password: 'director123',
    name: 'Иванов А.С.',
    email: 'ivanov@company.ru',
    role: 'office_director',
    officeId: 'office-1',
    createdAt: '2024-01-15',
  },
  {
    id: 'user-3',
    login: 'pm',
    password: 'pm123',
    name: 'Петрова М.В.',
    email: 'petrova@company.ru',
    role: 'project_manager',
    officeId: 'office-1',
    projectIds: ['2', '5'],
    createdAt: '2024-02-01',
  },
  {
    id: 'user-4',
    login: 'member',
    password: 'member123',
    name: 'Козлов Д.И.',
    email: 'kozlov@company.ru',
    role: 'team_member',
    officeId: 'office-1',
    projectIds: ['1', '2'],
    createdAt: '2024-02-15',
  },
  {
    id: 'user-5',
    login: 'viewer',
    password: 'viewer123',
    name: 'Гость',
    email: 'guest@company.ru',
    role: 'viewer',
    createdAt: '2024-03-01',
  },
];

export function loadUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading users:', e);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Load auth state from localStorage
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.user) {
          setAuth({ user: parsed.user, isAuthenticated: true });
        }
      }
    } catch (e) {
      console.error('Error loading auth state:', e);
    }
  }, []);

  const login = (user: User) => {
    const newAuth: AuthState = { user, isAuthenticated: true };
    setAuth(newAuth);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newAuth));
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem(AUTH_KEY);
  };

  const hasPermission = (permission: string): boolean => {
    if (!auth.user) return false;
    const permissions = ROLE_PERMISSIONS[auth.user.role];
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
