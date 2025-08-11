import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { login as apiLogin, register as apiRegister, type LoginDto, type RegisterDto } from '../services/authService';

type User = { id: string; email: string; fullName?: string; roles?: string[] } | null;
interface AuthContextType {
  user: User;
  token: string | null;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (data: LoginDto) => {
    const res = await apiLogin(data);
    setToken(res.token); localStorage.setItem('token', res.token);
    setUser(res.user); localStorage.setItem('user', JSON.stringify(res.user));
  };
  const register = async (data: RegisterDto) => {
    const res = await apiRegister(data);
    setToken(res.token); localStorage.setItem('token', res.token);
    setUser(res.user); localStorage.setItem('user', JSON.stringify(res.user));
  };
  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); };

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


