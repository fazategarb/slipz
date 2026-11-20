import { api } from './client';
import type { MasterPotongan, KategoriPotongan } from '../types';

export const potonganApi = {
  getAll: async (kategori?: KategoriPotongan) => {
    const res = await api.get<MasterPotongan[]>('/master-potongan', {
      params: { kategori },
    });
    return res.data;
  },

  create: async (data: Partial<MasterPotongan>) => {
    const res = await api.post<MasterPotongan>('/master-potongan', data);
    return res.data;
  },

  update: async (id: string, data: Partial<MasterPotongan>) => {
    const res = await api.patch<MasterPotongan>(`/master-potongan/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/master-potongan/${id}`);
    return res.data;
  },
};
