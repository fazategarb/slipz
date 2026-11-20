import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { periodeApi } from '../../api/periode.api';
import { laporanApi } from '../../api/laporan.api';
import { personelApi } from '../../api/personel.api';
import { SlipGajiPrint } from '../../components/print/SlipGajiPrint';
import { SlipTunkinPrint } from '../../components/print/SlipTunkinPrint';
import { Printer } from 'lucide-react';

export const CetakSlip: React.FC = () => {
  const [slipType, setSlipType] = useState<'GAJI' | 'TUNKIN'>('GAJI');
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');
  const [selectedPersonelId, setSelectedPersonelId] = useState<string>(''); // Kosong = Cetak Semua (Massal)

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

  const { data: personels } = useQuery({
    queryKey: ['personels-list'],
    queryFn: () => personelApi.getAll({ limit: 500 }),
  });

  const { data: slips, isLoading } = useQuery({
    queryKey: ['slips', slipType, selectedPeriodeId, selectedPersonelId],
    queryFn: () => {
      if (slipType === 'GAJI') {
        return laporanApi.getSlipGaji(selectedPeriodeId, selectedPersonelId || undefined);
      } else {
        return laporanApi.getSlipTunkin(selectedPeriodeId, selectedPersonelId || undefined);
      }
    },
    enabled: !!selectedPeriodeId,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Kontrol & Filter (Disembunyikan saat cetak) */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">Cetak Lembar Slip Kedinasan</h2>
            <p className="text-xs text-slate-500">
              Cetak fisik lembar Slip Gaji atau Tunkin (Pilih Satuan per personel atau Cetak Massal sekaligus)
            </p>
          </div>

          <button
            onClick={handlePrint}
            disabled={!slips || slips.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Dokumen Sekarang ({slips?.length ?? 0} Lembar)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Jenis Slip *</label>
            <select
              value={slipType}
              onChange={(e) => setSlipType(e.target.value as 'GAJI' | 'TUNKIN')}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
            >
              <option value="GAJI">Slip Gaji Bulanan</option>
              <option value="TUNKIN">Slip Tunjangan Kinerja (Tunkin)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Periode Penggajian *</label>
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
            <label className="block font-bold text-slate-700 mb-1">Personel Penerima</label>
            <select
              value={selectedPersonelId}
              onChange={(e) => setSelectedPersonelId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
            >
              <option value="">-- Cetak Massal (Semua Personel) --</option>
              {personels?.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nrp} - {p.nama} ({p.pangkat})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pratinjau Tampilan Cetak */}
      <div className="bg-slate-200/60 p-4 rounded-2xl print:bg-transparent print:p-0">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl">
            Memuat data lembar slip...
          </div>
        ) : slips && slips.length > 0 ? (
          slipType === 'GAJI' ? (
            <SlipGajiPrint slips={slips} />
          ) : (
            <SlipTunkinPrint slips={slips} />
          )
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl">
            Tidak ada data slip gaji/tunkin ditemukan untuk periode yang dipilih.
          </div>
        )}
      </div>
    </div>
  );
};
