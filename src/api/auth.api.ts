import { api } from './client';
import type { User } from '../types';

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await api.post<{ message: string; accessToken: string; user: User }>('/auth/login', {
      username,
      password,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};
