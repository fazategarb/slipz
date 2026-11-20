import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api';
import { Save, UserPlus } from 'lucide-react';

export const InstansiSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'KOP' | 'USERS'>('KOP');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'JURU_BAYAR',
  });

  const queryClient = useQueryClient();

  const { data: setting } = useQuery({
    queryKey: ['instansi-setting'],
    queryFn: () => settingsApi.getSetting(),
  });

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => settingsApi.getUsers(),
    enabled: activeTab === 'USERS',
  });

  const [formData, setFormData] = useState({
    namaSatuan: '',
    namaInstansi: '',
    alamat: '',
    telepon: '',
    kotaTtd: '',
    namaBendahara: '',
    pangkatBendahara: '',
    nrpBendahara: '',
    jabatanBendahara: '',
  });

  React.useEffect(() => {
    if (setting) {
      setFormData({
        namaSatuan: setting.namaSatuan || '',
        namaInstansi: setting.namaInstansi || '',
        alamat: setting.alamat || '',
        telepon: setting.telepon || '',
        kotaTtd: setting.kotaTtd || '',
        namaBendahara: setting.namaBendahara || '',
        pangkatBendahara: setting.pangkatBendahara || '',
        nrpBendahara: setting.nrpBendahara || '',
        jabatanBendahara: setting.jabatanBendahara || '',
      });
    }
  }, [setting]);

  const updateSettingMutation = useMutation({
    mutationFn: (data: any) => settingsApi.updateSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instansi-setting'] });
      alert('Pengaturan kop surat & instansi berhasil disimpan!');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => settingsApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setIsUserModalOpen(false);
      setNewUser({ username: '', password: '', role: 'JURU_BAYAR' });
      alert('Pengguna baru berhasil ditambahkan!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Gagal membuat pengguna');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => settingsApi.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
  });

  const handleSubmitSetting = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800">Pengaturan Sistem</h2>
          <p className="text-xs text-slate-500">
            Konfigurasi identitas kop surat kedinasan, pejabat penandatangan, dan akun pengguna
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('KOP')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'KOP'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kop Surat & Pejabat Penandatangan
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'USERS'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manajemen Akun Pengguna
        </button>
      </div>

      {activeTab === 'KOP' ? (
        <form onSubmit={handleSubmitSetting} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs max-w-2xl">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Identitas Satuan Kerja (Kop Surat)
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Satuan Kerja</label>
              <input
                type="text"
                required
                value={formData.namaSatuan}
                onChange={(e) => setFormData({ ...formData, namaSatuan: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Instansi / Komando Atas</label>
              <input
                type="text"
                required
                value={formData.namaInstansi}
                onChange={(e) => setFormData({ ...formData, namaInstansi: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Satuan</label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kota Penandatanganan</label>
                <input
                  type="text"
                  required
                  value={formData.kotaTtd}
                  onChange={(e) => setFormData({ ...formData, kotaTtd: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Pejabat Penandatangan Slip (Pekas / Juru Bayar)
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pejabat Penandatangan</label>
              <input
                type="text"
                required
                value={formData.namaBendahara}
                onChange={(e) => setFormData({ ...formData, namaBendahara: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pangkat</label>
                <input
                  type="text"
                  required
                  value={formData.pangkatBendahara}
                  onChange={(e) => setFormData({ ...formData, pangkatBendahara: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">NRP Pejabat</label>
                <input
                  type="text"
                  required
                  value={formData.nrpBendahara}
                  onChange={(e) => setFormData({ ...formData, nrpBendahara: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jabatan Resmi</label>
              <input
                type="text"
                required
                value={formData.jabatanBendahara}
                onChange={(e) => setFormData({ ...formData, jabatanBendahara: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateSettingMutation.isPending}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">Daftar akun login aplikasi (Admin, Juru Bayar, dan Personel)</p>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah User Operator</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Nama Personel Tertaut</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-800">{u.username}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {u.personel ? `${u.personel.nama} (${u.personel.nrp})` : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => toggleStatusMutation.mutate(u.id)}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline"
                        >
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Tambah User Baru</h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Peran (Role) *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="JURU_BAYAR">Juru Bayar (Operator Keuangan)</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => createUserMutation.mutate(newUser)}
                className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
