import { api } from './client';
import type { PenggajianTunkin, ExcelPreviewResponse } from '../types';

export const tunkinApi = {
  getAllByPeriode: async (periodeId: string, search?: string) => {
    const res = await api.get<PenggajianTunkin[]>('/penggajian-tunkin', {
      params: { periodeId, search },
    });
    return res.data;
  },

  downloadTemplate: async () => {
    const res = await api.get('/penggajian-tunkin/template', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_potongan_tunkin.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  previewExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ExcelPreviewResponse>('/penggajian-tunkin/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  importBatch: async (periodeId: string, items: any[]) => {
    const res = await api.post('/penggajian-tunkin/import', { periodeId, items });
    return res.data;
  },

  createManual: async (periodeId: string, item: any) => {
    const res = await api.post('/penggajian-tunkin/manual', { periodeId, item });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/penggajian-tunkin/${id}`);
    return res.data;
  },
};
