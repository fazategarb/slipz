import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { periodeApi } from '../../api/periode.api';
import { tunkinApi } from '../../api/tunkin.api';
import { potonganApi } from '../../api/potongan.api';
import { personelApi } from '../../api/personel.api';
import { ExcelUploadModal } from '../../components/excel/ExcelUploadModal';
import { Download, Upload, Plus, Trash2, Search, X } from 'lucide-react';

export const TunkinManagement: React.FC = () => {
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const [manualPersonelId, setManualPersonelId] = useState('');
  const [manualTunkinKotor, setManualTunkinKotor] = useState(0);
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
    queryKey: ['potongan', 'TUNKIN'],
    queryFn: () => potonganApi.getAll('TUNKIN'),
  });

  const { data: personels } = useQuery({
    queryKey: ['personels-all'],
    queryFn: () => personelApi.getAll({ limit: 500 }),
  });

  const { data: tunkinRecords, isLoading } = useQuery({
    queryKey: ['tunkin-records', selectedPeriodeId, search],
    queryFn: () => tunkinApi.getAllByPeriode(selectedPeriodeId, search),
    enabled: !!selectedPeriodeId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tunkinApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tunkin-records', selectedPeriodeId] });
    },
  });

  const manualMutation = useMutation({
    mutationFn: (data: any) => tunkinApi.createManual(selectedPeriodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tunkin-records', selectedPeriodeId] });
      setIsManualModalOpen(false);
      setManualPersonelId('');
      setManualTunkinKotor(0);
      setManualPotongan({});
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal menyimpan data tunkin');
    },
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalTunkinKotor = tunkinRecords?.reduce((acc, curr) => acc + Number(curr.tunkinKotor), 0) ?? 0;
  const totalPotongan = tunkinRecords?.reduce((acc, curr) => acc + Number(curr.totalPotongan), 0) ?? 0;
  const totalTunkinBersih = tunkinRecords?.reduce((acc, curr) => acc + Number(curr.tunkinBersih), 0) ?? 0;

  return (
    <div className="space-y-5">
      {/* Header & Periode Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Kelola Potongan Tunkin</h2>
          <p className="text-xs text-slate-500">
            Unggah file Excel rekap potongan tunjangan kinerja bulanan atau input manual
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600">Pilih Periode:</label>
          <select
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)}
            className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500"
          >
            {periodes?.map((p) => (
              <option key={p.id} value={p.id}>
                Bulan {p.bulan} / {p.tahun} ({p.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Personel Menerima</p>
          <p className="text-xl font-black text-slate-800 mt-1">{tunkinRecords?.length ?? 0} Orang</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Total Tunkin Kotor</p>
          <p className="text-base font-black text-slate-800 mt-1">{formatRupiah(totalTunkinKotor)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500">Total Potongan Tunkin</p>
          <p className="text-base font-black text-rose-600 mt-1">{formatRupiah(totalPotongan)}</p>
        </div>
        <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 shadow-xs">
          <p className="text-xs text-teal-800 font-semibold">Total Bersih Tunkin</p>
          <p className="text-base font-black text-teal-700 mt-1">{formatRupiah(totalTunkinBersih)}</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NRP, atau nomor rekening..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => tunkinApi.downloadTemplate()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>Download Template</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
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

      {/* Table Records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">NRP / NIP</th>
                <th className="p-3.5">Nama Personel</th>
                <th className="p-3.5">No. Rekening</th>
                <th className="p-3.5 text-right">Tunkin Kotor</th>
                <th className="p-3.5 text-right">Total Potongan</th>
                <th className="p-3.5 text-right">Tunkin Bersih</th>
                <th className="p-3.5">Rincian Potongan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Memuat data potongan tunkin...
                  </td>
                </tr>
              ) : tunkinRecords && tunkinRecords.length > 0 ? (
                tunkinRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-slate-900">{r.personel.nrp}</td>
                    <td className="p-3.5 font-bold text-slate-800">{r.personel.nama}</td>
                    <td className="p-3.5 font-mono text-slate-700">{r.personel.noRekening || '-'}</td>
                    <td className="p-3.5 text-right font-medium">{formatRupiah(Number(r.tunkinKotor))}</td>
                    <td className="p-3.5 text-right font-medium text-rose-600">
                      {formatRupiah(Number(r.totalPotongan))}
                    </td>
                    <td className="p-3.5 text-right font-bold text-teal-700">
                      {formatRupiah(Number(r.tunkinBersih))}
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
                          if (confirm(`Hapus data tunkin personel ${r.personel.nama}?`)) {
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
                    Belum ada data tunkin pada periode ini. Klik "Upload & Validasi Excel" untuk memasukkan data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Unggah File Excel Potongan Tunkin"
        onPreview={(file) => tunkinApi.previewExcel(file)}
        onImport={async (items) => {
          await tunkinApi.importBatch(selectedPeriodeId, items);
          queryClient.invalidateQueries({ queryKey: ['tunkin-records', selectedPeriodeId] });
        }}
      />

      {/* Modal Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Input Manual Potongan Tunkin</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Personel *</label>
              <select
                value={manualPersonelId}
                onChange={(e) => setManualPersonelId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Pilih Personel --</option>
                {personels?.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nrp} - {p.nama} (Rek: {p.noRekening || '-'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tunkin Kotor (Rp) *</label>
              <input
                type="number"
                value={manualTunkinKotor}
                onChange={(e) => setManualTunkinKotor(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-2">Rincian Nilai Potongan Tunkin:</label>
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
                      className="w-32 p-1.5 text-right bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
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
                    tunkinKotor: manualTunkinKotor,
                    potongan: manualPotongan,
                  });
                }}
                disabled={manualMutation.isPending}
                className="px-5 py-2 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
              >
                Simpan Tunkin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
