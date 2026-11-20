import { api } from './client';
import type { Personel } from '../types';

export interface QueryPersonelParams {
  search?: string;
  pangkat?: string;
  page?: number;
  limit?: number;
}

export const personelApi = {
  getAll: async (params?: QueryPersonelParams) => {
    const res = await api.get<{ data: Personel[]; meta: any }>('/personel', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Personel>(`/personel/${id}`);
    return res.data;
  },

  create: async (data: Partial<Personel>) => {
    const res = await api.post<Personel>('/personel', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Personel>) => {
    const res = await api.patch<Personel>(`/personel/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/personel/${id}`);
    return res.data;
  },
};
