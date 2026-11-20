import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { periodeApi } from '../../api/periode.api';
import { potonganApi } from '../../api/potongan.api';
import { laporanApi } from '../../api/laporan.api';
import { RekapPotonganPrint } from '../../components/print/RekapPotonganPrint';
import { Printer, Download } from 'lucide-react';

export const CetakRekapPotongan: React.FC = () => {
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');
  const [selectedPotonganId, setSelectedPotonganId] = useState<string>('');

  const { data: periodes } = useQuery({
    queryKey: ['periodes'],
    queryFn: async () => {
      const res = await periodeApi.getAll();
      if (res && res.length > 0 && !selectedPeriodeId) {
        const active = res.find((p) => p.status === 'AKTIF') || res[0];
        setSelectedPeriodeId(active.id);
      }
      return res;
    },
  });

  const { data: potongans } = useQuery({
    queryKey: ['potongan-all-rekap'],
    queryFn: async () => {
      const res = await potonganApi.getAll();
      if (res && res.length > 0 && !selectedPotonganId) {
        setSelectedPotonganId(res[0].id);
      }
      return res;
    },
  });

  const { data: rekapData, isLoading } = useQuery({
    queryKey: ['rekap-potongan-data', selectedPeriodeId, selectedPotonganId],
    queryFn: () => laporanApi.getRekapPotongan(selectedPeriodeId, selectedPotonganId),
    enabled: !!selectedPeriodeId && !!selectedPotonganId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!selectedPeriodeId || !selectedPotonganId) return;
    laporanApi.exportRekapExcel(selectedPeriodeId, selectedPotonganId);
  };

  return (
    <div className="space-y-6">
      {/* Kontrol & Filter */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">Rekapitulasi Potongan per Pihak Ketiga</h2>
            <p className="text-xs text-slate-500">
              Laporan tagihan potongan bulanan untuk diserahkan ke Bank, Koperasi, atau TWP
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportExcel}
              disabled={!rekapData || rekapData.rows.length === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Export ke Excel</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!rekapData || rekapData.rows.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak PDF / Print</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Periode *</label>
            <select
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
            >
              {periodes?.map((p) => (
                <option key={p.id} value={p.id}>
                  Bulan {p.bulan} / {p.tahun} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Jenis Potongan *</label>
            <select
              value={selectedPotonganId}
              onChange={(e) => setSelectedPotonganId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
            >
              {potongans?.map((pot) => (
                <option key={pot.id} value={pot.id}>
                  {pot.nama} ({pot.kode}) - Kategori: {pot.kategori}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pratinjau Rekap */}
      <div className="bg-slate-200/60 p-4 rounded-2xl print:bg-transparent print:p-0">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl">
            Memuat data rekapitulasi potongan...
          </div>
        ) : rekapData ? (
          <RekapPotonganPrint data={rekapData} />
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl">
            Tidak ada data potongan untuk jenis dan periode yang dipilih.
          </div>
        )}
      </div>
    </div>
  );
};
