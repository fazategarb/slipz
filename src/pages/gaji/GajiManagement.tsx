import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { periodeApi } from '../../api/periode.api';
import { gajiApi } from '../../api/gaji.api';
import { potonganApi } from '../../api/potongan.api';
import { personelApi } from '../../api/personel.api';
import { ExcelUploadModal } from '../../components/excel/ExcelUploadModal';
import { Download, Upload, Plus, Trash2, Search, X } from 'lucide-react';

export const GajiManagement: React.FC = () => {
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const [manualPersonelId, setManualPersonelId] = useState('');
  const [manualGajiKotor, setManualGajiKotor] = useState(0);
  const [manualPotongan, setManualPotongan] = useState<Record<string, number>>({});

  const queryClient = useQueryClient();

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
    queryKey: ['potongan', 'GAJI'],
    queryFn: () => potonganApi.getAll('GAJI'),
  });

  const { data: personels } = useQuery({
    queryKey: ['personels-all'],
    queryFn: () => personelApi.getAll({ limit: 500 }),
  });

  const { data: gajiRecords, isLoading } = useQuery({
    queryKey: ['gaji-records', selectedPeriodeId, search],
    queryFn: () => gajiApi.getAllByPeriode(selectedPeriodeId, search),
    enabled: !!selectedPeriodeId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gajiApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaji-records', selectedPeriodeId] });
    },
  });

  const manualMutation = useMutation({
    mutationFn: (data: any) => gajiApi.createManual(selectedPeriodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaji-records', selectedPeriodeId] });
      setIsManualModalOpen(false);
      setManualPersonelId('');
      setManualGajiKotor(0);
      setManualPotongan({});
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal menyimpan data gaji');
    },
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalGajiKotor = gajiRecords?.reduce((acc, curr) => acc + Number(curr.gajiKotor), 0) ?? 0;
  const totalPotongan = gajiRecords?.reduce((acc, curr) => acc + Number(curr.totalPotongan), 0) ?? 0;
  const totalGajiBersih = gajiRecords?.reduce((acc, curr) => acc + Number(curr.gajiBersih), 0) ?? 0;

  return (
    <div className="space-y-5">
      {/* Page Header & Periode Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Kelola Potongan Gaji</h2>
          <p className="text-xs text-slate-500">
            Unggah file Excel rekap potongan gaji bulanan atau input manual per personel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600">Pilih Periode:</label>
          <select
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500"
          >
            {periodes?.map((p) => (
              <option key={p.id} value={p.id}>
                Bulan {p.bulan} / {p.tahun} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons & Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Total Personel Terdata</p>
          <p className="text-xl font-black text-slate-800 mt-1">{gajiRecords?.length ?? 0} Orang</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Total Gaji Kotor</p>
          <p className="text-base font-black text-slate-800 mt-1">{formatRupiah(totalGajiKotor)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Total Potongan</p>
          <p className="text-base font-black text-rose-600 mt-1">{formatRupiah(totalPotongan)}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-xs">
          <p className="text-xs text-emerald-800 font-semibold">Total Bersih Dibayarkan</p>
          <p className="text-base font-black text-emerald-700 mt-1">{formatRupiah(totalGajiBersih)}</p>
        </div>
      </div>

      {/* Toolbar Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NRP, atau pangkat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => gajiApi.downloadTemplate()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>Download Template</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload & Validasi Excel</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Input Manual</span>
          </button>
        </div>
      </div>

      {/* Table Gaji Records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">NRP / NIP</th>
                <th className="p-3.5">Nama Personel</th>
                <th className="p-3.5">Pangkat</th>
                <th className="p-3.5 text-right">Gaji Kotor</th>
                <th className="p-3.5 text-right">Total Potongan</th>
                <th className="p-3.5 text-right">Gaji Bersih</th>
                <th className="p-3.5">Rincian Potongan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Memuat data potongan gaji...
                  </td>
                </tr>
              ) : gajiRecords && gajiRecords.length > 0 ? (
                gajiRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-slate-900">{r.personel.nrp}</td>
                    <td className="p-3.5 font-bold text-slate-800">{r.personel.nama}</td>
                    <td className="p-3.5 text-slate-600">{r.personel.pangkat}</td>
                    <td className="p-3.5 text-right font-medium">{formatRupiah(Number(r.gajiKotor))}</td>
                    <td className="p-3.5 text-right font-medium text-rose-600">
                      {formatRupiah(Number(r.totalPotongan))}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-700">
                      {formatRupiah(Number(r.gajiBersih))}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {r.potongan && r.potongan.length > 0 ? (
                          r.potongan.map((p) => (
                            <span
                              key={p.id}
                              className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700"
                              title={`${p.masterPotongan.nama}: ${formatRupiah(Number(p.nominal))}`}
                            >
                              {p.masterPotongan.kode}: {Number(p.nominal).toLocaleString('id-ID')}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data gaji personel ${r.personel.nama}?`)) {
                            deleteMutation.mutate(r.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Belum ada data gaji pada periode ini. Klik "Upload & Validasi Excel" untuk memasukkan data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload & Validasi Modal */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Unggah File Excel Potongan Gaji"
        onPreview={(file) => gajiApi.previewExcel(file)}
        onImport={async (items) => {
          await gajiApi.importBatch(selectedPeriodeId, items);
          queryClient.invalidateQueries({ queryKey: ['gaji-records', selectedPeriodeId] });
        }}
      />

      {/* Modal Input Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Input Manual Potongan Gaji</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Personel *</label>
              <select
                value={manualPersonelId}
                onChange={(e) => setManualPersonelId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Pilih Personel --</option>
                {personels?.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nrp} - {p.nama} ({p.pangkat})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Gaji Kotor (Rp) *</label>
              <input
                type="number"
                value={manualGajiKotor}
                onChange={(e) => setManualGajiKotor(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">Rincian Nilai Potongan:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {potongans?.map((pot) => (
                  <div key={pot.id} className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-medium text-slate-700">{pot.nama} ({pot.kode}):</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualPotongan[pot.id] || ''}
                      onChange={(e) =>
                        setManualPotongan({
                          ...manualPotongan,
                          [pot.id]: Number(e.target.value) || 0,
                        })
                      }
                      className="w-32 p-1.5 text-right bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!manualPersonelId) return alert('Pilih personel terlebih dahulu');
                  manualMutation.mutate({
                    personelId: manualPersonelId,
                    gajiKotor: manualGajiKotor,
                    potongan: manualPotongan,
                  });
                }}
                disabled={manualMutation.isPending}
                className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Simpan Gaji
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
