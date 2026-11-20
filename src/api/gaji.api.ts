import { api } from './client';
import type { PenggajianGaji, ExcelPreviewResponse } from '../types';

export const gajiApi = {
  getAllByPeriode: async (periodeId: string, search?: string) => {
    const res = await api.get<PenggajianGaji[]>('/penggajian-gaji', {
      params: { periodeId, search },
    });
    return res.data;
  },

  downloadTemplate: async () => {
    const res = await api.get('/penggajian-gaji/template', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_potongan_gaji.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  previewExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ExcelPreviewResponse>('/penggajian-gaji/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  importBatch: async (periodeId: string, items: any[]) => {
    const res = await api.post('/penggajian-gaji/import', { periodeId, items });
    return res.data;
  },

  createManual: async (periodeId: string, item: any) => {
    const res = await api.post('/penggajian-gaji/manual', { periodeId, item });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/penggajian-gaji/${id}`);
    return res.data;
  },
};
