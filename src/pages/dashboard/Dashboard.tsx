import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { periodeApi } from '../../api/periode.api';
import { personelApi } from '../../api/personel.api';
import { potonganApi } from '../../api/potongan.api';
import { settingsApi } from '../../api/settings.api';
import { Users, CalendarDays, Coins, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: activePeriode } = useQuery({
    queryKey: ['active-periode'],
    queryFn: () => periodeApi.getActive(),
  });

  const { data: personelData } = useQuery({
    queryKey: ['personel-count'],
    queryFn: () => personelApi.getAll({ limit: 1 }),
  });

  const { data: potongans } = useQuery({
    queryKey: ['potongan-all'],
    queryFn: () => potonganApi.getAll(),
  });

  const { data: instansi } = useQuery({
    queryKey: ['instansi-setting'],
    queryFn: () => settingsApi.getSetting(),
  });

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              Sistem Aktif
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              {instansi?.namaSatuan || 'Satuan Kerja Kedinasan'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {instansi?.namaInstansi || 'Dinas Keuangan'} • Bendahara: {instansi?.namaBendahara || '-'}
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-xs rounded-xl p-3.5 border border-slate-700/80 text-right">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Periode Penggajian Aktif</p>
            <p className="text-base font-extrabold text-emerald-400 mt-0.5">
              {activePeriode
                ? `${namaBulan[activePeriode.bulan - 1]} ${activePeriode.tahun}`
                : 'Belum ada periode aktif'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Personel</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">
              {personelData?.meta?.total ?? 0} <span className="text-xs font-normal text-slate-400">Orang</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Status Periode</p>
            <p className="text-sm font-black text-emerald-600 mt-0.5 uppercase">
              {activePeriode?.status || 'NON-AKTIF'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Master Potongan</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">
              {potongans?.length ?? 0} <span className="text-xs font-normal text-slate-400">Jenis</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pekas / Juru Bayar</p>
            <p className="text-sm font-black text-slate-800 mt-0.5 truncate max-w-[140px]">
              {instansi?.namaBendahara?.split(',')[0] || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/potongan-gaji"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              1
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-4">Kelola Potongan Gaji</h3>
          <p className="text-xs text-slate-500 mt-1">
            Download template Excel dinamis, unggah file rekap, validasi, dan simpan data gaji bulanan.
          </p>
        </Link>

        <Link
          to="/potongan-tunkin"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              2
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-4">Kelola Potongan Tunkin</h3>
          <p className="text-xs text-slate-500 mt-1">
            Input atau impor potongan tunjangan kinerja bulanan dan verifikasi kecocokan nomor rekening.
          </p>
        </Link>

        <Link
          to="/laporan/slip"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              3
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mt-4">Cetak Slip & Laporan</h3>
          <p className="text-xs text-slate-500 mt-1">
            Cetak lembar slip gaji atau tunkin resmi satuan/massal, serta ekspor rekapitulasi ke Excel/PDF.
          </p>
        </Link>
      </div>
    </div>
  );
};
