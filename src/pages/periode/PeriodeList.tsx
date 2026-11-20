import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { periodeApi } from '../../api/periode.api';
import { Plus, Lock, Unlock, X } from 'lucide-react';

export const PeriodeList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    keterangan: '',
  });

  const queryClient = useQueryClient();

  const { data: periodes, isLoading } = useQuery({
    queryKey: ['periodes'],
    queryFn: () => periodeApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => periodeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodes'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal membuat periode baru');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      periodeApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periodes'] });
    },
  });

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Periode Penggajian</h2>
          <p className="text-xs text-slate-500">
            Kelola siklus bulanan penggajian, status aktif, dan kunci periode untuk pengarsipan
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buka Periode Baru</span>
        </button>
      </div>

      {/* Grid Periode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-xs text-slate-400 col-span-3">Memuat periode...</p>
        ) : periodes && periodes.length > 0 ? (
          periodes.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border transition-all ${
                p.status === 'AKTIF'
                  ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'AKTIF'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.status}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {namaBulan[p.bulan - 1]} {p.tahun}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.keterangan || 'Periode Penggajian Reguler'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  <span className="font-bold text-slate-800">{p._count?.penggajianGaji ?? 0}</span> Slip Gaji •{' '}
                  <span className="font-bold text-slate-800">{p._count?.penggajianTunkin ?? 0}</span> Slip Tunkin
                </div>

                {p.status === 'AKTIF' ? (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'TERKUNCI' })}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Kunci Periode"
                  >
                    <Lock className="h-3.5 w-3.5" /> Kunci
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: p.id, status: 'AKTIF' })}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-600 px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Aktifkan Kembali"
                  >
                    <Unlock className="h-3.5 w-3.5" /> Buka
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 col-span-3">Belum ada periode penggajian.</p>
        )}
      </div>

      {/* Modal Buka Periode */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Buka Periode Penggajian Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bulan *</label>
              <select
                value={formData.bulan}
                onChange={(e) => setFormData({ ...formData, bulan: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {namaBulan.map((nama, idx) => (
                  <option key={idx} value={idx + 1}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun *</label>
              <input
                type="number"
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
              <input
                type="text"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Misal: Gaji Induk November 2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
                className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Buka Periode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
