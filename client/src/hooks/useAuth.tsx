import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  createGuestSession: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('cowrite_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cowrite_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('cowrite_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('cowrite_token');
        localStorage.removeItem('cowrite_user');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    localStorage.setItem('cowrite_token', token);
    localStorage.setItem('cowrite_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name: string, email: string, password: string): Promise<UserProfile> => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user, token } = res.data;
    localStorage.setItem('cowrite_token', token);
    localStorage.setItem('cowrite_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const createGuestSession = async (): Promise<UserProfile> => {
    const res = await api.post('/auth/guest');
    const { user, token } = res.data;
    localStorage.setItem('cowrite_token', token);
    localStorage.setItem('cowrite_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('cowrite_token');
    localStorage.removeItem('cowrite_user');
    setUser(null);
  };

  const updateUser = (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem('cowrite_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, createGuestSession, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
