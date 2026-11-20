import { api } from './client';
import type { PeriodePenggajian } from '../types';

export const periodeApi = {
  getAll: async () => {
    const res = await api.get<PeriodePenggajian[]>('/periode');
    return res.data;
  },

  getActive: async () => {
    const res = await api.get<PeriodePenggajian>('/periode/active');
    return res.data;
  },

  create: async (data: { bulan: number; tahun: number; keterangan?: string }) => {
    const res = await api.post<PeriodePenggajian>('/periode', data);
    return res.data;
  },

  update: async (id: string, data: { status?: string; keterangan?: string }) => {
    const res = await api.patch<PeriodePenggajian>(`/periode/${id}`, data);
    return res.data;
  },
};
