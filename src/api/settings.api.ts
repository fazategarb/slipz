import { api } from './client';
import type { InstansiSetting, User } from '../types';

export const settingsApi = {
  getSetting: async () => {
    const res = await api.get<InstansiSetting>('/instansi-setting');
    return res.data;
  },

  updateSetting: async (data: Partial<InstansiSetting>) => {
    const res = await api.patch<InstansiSetting>('/instansi-setting', data);
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },

  createUser: async (data: any) => {
    const res = await api.post('/users', data);
    return res.data;
  },

  createForPersonel: async (personelId: string, password?: string) => {
    const res = await api.post('/users/create-for-personel', { personelId, password });
    return res.data;
  },

  toggleUserStatus: async (id: string) => {
    const res = await api.patch(`/users/${id}/toggle-status`);
    return res.data;
  },

  resetUserPassword: async (id: string, newPassword: string) => {
    const res = await api.patch(`/users/${id}/reset-password`, { newPassword });
    return res.data;
  },
};
