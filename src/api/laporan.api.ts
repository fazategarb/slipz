import { api } from './client';
import type { SlipData, RekapPotonganData } from '../types';

export const laporanApi = {
  getSlipGaji: async (periodeId: string, personelId?: string) => {
    const res = await api.get<SlipData[]>('/laporan/slip-gaji', {
      params: { periodeId, personelId },
    });
    return res.data;
  },

  getSlipTunkin: async (periodeId: string, personelId?: string) => {
    const res = await api.get<SlipData[]>('/laporan/slip-tunkin', {
      params: { periodeId, personelId },
    });
    return res.data;
  },

  getRekapPotongan: async (periodeId: string, masterPotonganId: string) => {
    const res = await api.get<RekapPotonganData>('/laporan/rekap-potongan', {
      params: { periodeId, masterPotonganId },
    });
    return res.data;
  },

  exportRekapExcel: async (periodeId: string, masterPotonganId: string) => {
    const res = await api.get('/laporan/rekap-potongan/export-excel', {
      params: { periodeId, masterPotonganId },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_potongan_${masterPotonganId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
