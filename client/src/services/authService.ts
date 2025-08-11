import api from './api';

export interface RegisterDto { fullName: string; email: string; password: string; }
export interface LoginDto { email: string; password: string; }

export const register = async (data: RegisterDto) => {
  const res = await api.post('/auth/register', data);
  return res.data as { token: string; user: any };
};

export const login = async (data: LoginDto) => {
  const res = await api.post('/auth/login', data);
  return res.data as { token: string; user: any };
};


