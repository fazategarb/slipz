import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { periodeApi } from '../../api/periode.api';
import { laporanApi } from '../../api/laporan.api';
import { SlipGajiPrint } from '../../components/print/SlipGajiPrint';
import { SlipTunkinPrint } from '../../components/print/SlipTunkinPrint';
import { Printer } from 'lucide-react';

export const SlipSaya: React.FC = () => {
  const { user } = useAuth();
  const [slipType, setSlipType] = useState<'GAJI' | 'TUNKIN'>('GAJI');
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');

  const { data: periodes } = useQuery({
    queryKey: ['periodes-user'],
    queryFn: async () => {
      const res = await periodeApi.getAll();
      if (res && res.length > 0 && !selectedPeriodeId) {
        const active = res.find((p) => p.status === 'AKTIF') || res[0];
        setSelectedPeriodeId(active.id);
      }
      return res;
    },
  });

  const { data: slips, isLoading } = useQuery({
    queryKey: ['my-slips', slipType, selectedPeriodeId],
    queryFn: () => {
      if (slipType === 'GAJI') {
        return laporanApi.getSlipGaji(selectedPeriodeId);
      } else {
        return laporanApi.getSlipTunkin(selectedPeriodeId);
      }
    },
    enabled: !!selectedPeriodeId,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Slip Penghasilan Saya</h2>
          <p className="text-xs text-slate-500">
            Personel: <span className="font-bold text-slate-800">{user?.personel?.nama}</span> (NRP:{' '}
            {user?.personel?.nrp})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={slipType}
            onChange={(e) => setSlipType(e.target.value as 'GAJI' | 'TUNKIN')}
            className="p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            <option value="GAJI">Slip Gaji</option>
            <option value="TUNKIN">Slip Tunkin</option>
          </select>

          <select
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            {periodes?.map((p) => (
              <option key={p.id} value={p.id}>
                Bulan {p.bulan} / {p.tahun}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            disabled={!slips || slips.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-200/60 p-4 rounded-2xl print:bg-transparent print:p-0">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl">
            Memuat slip penghasilan Anda...
          </div>
        ) : slips && slips.length > 0 ? (
          slipType === 'GAJI' ? (
            <SlipGajiPrint slips={slips} />
          ) : (
            <SlipTunkinPrint slips={slips} />
          )
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl">
            Belum ada rincian penerimaan untuk Anda pada periode ini.
          </div>
        )}
      </div>
    </div>
  );
};
