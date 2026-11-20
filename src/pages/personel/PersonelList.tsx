import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personelApi } from '../../api/personel.api';
import { settingsApi } from '../../api/settings.api';
import type { Personel } from '../../types';
import { Search, Plus, Edit, Trash2, KeyRound, Check, X } from 'lucide-react';

export const PersonelList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedPersonel, setSelectedPersonel] = useState<Personel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [formData, setFormData] = useState({
    nrp: '',
    nama: '',
    pangkat: '',
    korp: '',
    jabatan: '',
    noRekening: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['personels', search],
    queryFn: () => personelApi.getAll({ search, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => personelApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personels'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => personelApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personels'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => personelApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personels'] });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: ({ personelId, password }: { personelId: string; password?: string }) =>
      settingsApi.createForPersonel(personelId, password),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['personels'] });
      alert(`Akun login berhasil dibuat!\nUsername: ${res.user.username}\nPassword Awal: ${res.initialPassword}`);
      setIsAccountModalOpen(false);
      setTempPassword('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal membuat akun');
    },
  });

  const resetForm = () => {
    setSelectedPersonel(null);
    setFormData({
      nrp: '',
      nama: '',
      pangkat: '',
      korp: '',
      jabatan: '',
      noRekening: '',
    });
  };

  const handleEdit = (p: Personel) => {
    setSelectedPersonel(p);
    setFormData({
      nrp: p.nrp,
      nama: p.nama,
      pangkat: p.pangkat,
      korp: p.korp || '',
      jabatan: p.jabatan || '',
      noRekening: p.noRekening || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (p: Personel) => {
    if (confirm(`Yakin ingin menonaktifkan personel ${p.nama} (${p.nrp})?`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPersonel) {
      updateMutation.mutate({ id: selectedPersonel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Master Data Personel</h2>
          <p className="text-xs text-slate-500">Kelola informasi personel kedinasan, pangkat, jabatan, dan nomor rekening</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Personel</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NRP, jabatan, atau nomor rekening..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">NRP / NIP</th>
                <th className="p-3.5">Nama Personel</th>
                <th className="p-3.5">Pangkat / Korp</th>
                <th className="p-3.5">Jabatan</th>
                <th className="p-3.5">No. Rekening</th>
                <th className="p-3.5 text-center">Akun Login</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Memuat data personel...
                  </td>
                </tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-slate-900">{p.nrp}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p.nama}</td>
                    <td className="p-3.5 text-slate-700">
                      {p.pangkat} {p.korp ? `(${p.korp})` : ''}
                    </td>
                    <td className="p-3.5 text-slate-600">{p.jabatan || '-'}</td>
                    <td className="p-3.5 font-mono text-slate-700">{p.noRekening || '-'}</td>
                    <td className="p-3.5 text-center">
                      {p.user ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="h-3 w-3" /> Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPersonel(p);
                            setIsAccountModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          <KeyRound className="h-3 w-3" /> Buat Akun
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Hapus / Nonaktifkan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data personel ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedPersonel ? 'Edit Data Personel' : 'Tambah Personel Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NRP / NIP *</label>
                <input
                  type="text"
                  required
                  value={formData.nrp}
                  onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                  placeholder="Contoh: 11020034560181"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap beserta gelar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pangkat *</label>
                  <input
                    type="text"
                    required
                    value={formData.pangkat}
                    onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
                    placeholder="Contoh: KAPTEN"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Korp</label>
                  <input
                    type="text"
                    value={formData.korp}
                    onChange={(e) => setFormData({ ...formData, korp: e.target.value })}
                    placeholder="Contoh: CKU / INF"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Jabatan dinas personel"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening Bank</label>
                <input
                  type="text"
                  value={formData.noRekening}
                  onChange={(e) => setFormData({ ...formData, noRekening: e.target.value })}
                  placeholder="Nomor rekening bank payroll"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
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

      {/* Modal Buat Akun Personel */}
      {isAccountModalOpen && selectedPersonel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Aktivasi Akun Login Personel</h3>
            <p className="text-slate-500">
              Buatkan akun mandiri untuk <span className="font-bold text-slate-800">{selectedPersonel.nama}</span>.
              Username otomatis menggunakan NRP ({selectedPersonel.nrp}).
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password Awal (Opsional)</label>
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Kosongkan untuk memakai default (NRP)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() =>
                  createAccountMutation.mutate({
                    personelId: selectedPersonel.id,
                    password: tempPassword || undefined,
                  })
                }
                disabled={createAccountMutation.isPending}
                className="px-4 py-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
              >
                Aktifkan Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
