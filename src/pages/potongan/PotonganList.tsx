import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { potonganApi } from '../../api/potongan.api';
import type { MasterPotongan, KategoriPotongan } from '../../types';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const PotonganList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KategoriPotongan>('GAJI');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPotongan, setSelectedPotongan] = useState<MasterPotongan | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    kategori: 'GAJI' as KategoriPotongan,
    deskripsi: '',
    urutan: 0,
  });

  const queryClient = useQueryClient();

  const { data: potongans, isLoading } = useQuery({
    queryKey: ['potongan', activeTab],
    queryFn: () => potonganApi.getAll(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => potonganApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potongan'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => potonganApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potongan'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => potonganApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['potongan'] });
    },
  });

  const resetForm = () => {
    setSelectedPotongan(null);
    setFormData({
      nama: '',
      kode: '',
      kategori: activeTab,
      deskripsi: '',
      urutan: 0,
    });
  };

  const handleEdit = (p: MasterPotongan) => {
    setSelectedPotongan(p);
    setFormData({
      nama: p.nama,
      kode: p.kode,
      kategori: p.kategori,
      deskripsi: p.deskripsi || '',
      urutan: p.urutan || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (p: MasterPotongan) => {
    if (confirm(`Yakin ingin menonaktifkan potongan ${p.nama}?`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPotongan) {
      updateMutation.mutate({ id: selectedPotongan.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Kelola Data Potongan</h2>
          <p className="text-xs text-slate-500">
            Daftar master jenis potongan dinamis untuk Gaji & Tunjangan Kinerja (Koperasi, BRI, TWP, dll.)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Potongan</span>
        </button>
      </div>

      {/* Tabs Kategori */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('GAJI')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'GAJI'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Potongan Gaji
        </button>
        <button
          onClick={() => setActiveTab('TUNKIN')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'TUNKIN'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Potongan Tunkin
        </button>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5 w-16 text-center">Urutan</th>
              <th className="p-3.5 w-28">Kode</th>
              <th className="p-3.5">Nama Jenis Potongan</th>
              <th className="p-3.5">Kategori</th>
              <th className="p-3.5">Deskripsi</th>
              <th className="p-3.5 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Memuat data potongan...
                </td>
              </tr>
            ) : potongans && potongans.length > 0 ? (
              potongans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center font-bold text-slate-500">{p.urutan}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700 bg-emerald-50/40">{p.kode}</td>
                  <td className="p-3.5 font-bold text-slate-800 text-sm">{p.nama}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.kategori === 'GAJI'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {p.kategori}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{p.deskripsi || '-'}</td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Belum ada data potongan pada kategori ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedPotongan ? 'Edit Potongan' : 'Tambah Jenis Potongan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Potongan *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Koperasi Mandiri / Bank BRI"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Unik *</label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                    placeholder="Contoh: KOP / BRI"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriPotongan })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="GAJI">Potongan Gaji</option>
                    <option value="TUNKIN">Potongan Tunkin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Urutan Tampil</label>
                <input
                  type="number"
                  value={formData.urutan}
                  onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={2}
                  placeholder="Keterangan pihak penerima potongan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
