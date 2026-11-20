import React from 'react';
import type { SlipData } from '../../types';

interface SlipGajiPrintProps {
  slips: SlipData[];
}

export const SlipGajiPrint: React.FC<SlipGajiPrintProps> = ({ slips }) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getBulanNama = (bulan: number) => {
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return namaBulan[bulan - 1] || '';
  };

  return (
    <div className="print-container">
      {slips.map((slip, idx) => (
        <div
          key={slip.id || idx}
          className="print-page bg-white p-8 max-w-3xl mx-auto border border-slate-300 shadow-sm mb-8 print:border-none print:shadow-none print:mb-0 print:p-0"
        >
          {/* KOP SURAT KEDINASAN */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center relative">
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-800">
              {slip.instansi?.namaSatuan || 'SATUAN KERJA KEDINASAN'}
            </h2>
            <h1 className="text-base font-extrabold tracking-wide uppercase text-slate-900 mt-0.5">
              {slip.instansi?.namaInstansi || 'MARKAS BESAR DINAS KEUANGAN'}
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {slip.instansi?.alamat || 'Jl. Protokol Kedinasan No. 1'}
              {slip.instansi?.telepon ? ` | Telp: ${slip.instansi.telepon}` : ''}
            </p>
          </div>

          {/* JUDUL SLIP */}
          <div className="text-center my-4">
            <h3 className="text-base font-black tracking-wider uppercase underline">
              SLIP GAJI BULANAN
            </h3>
            <p className="text-xs font-semibold uppercase text-slate-700 mt-1">
              PERIODE: {getBulanNama(slip.periode.bulan)} {slip.periode.tahun}
            </p>
          </div>

          {/* BIODATA PERSONEL */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-6 bg-slate-50 p-3.5 rounded border border-slate-200">
            <div className="flex">
              <span className="w-28 font-semibold text-slate-600">NRP / NIP</span>
              <span className="font-bold text-slate-900">: {slip.personel.nrp}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold text-slate-600">Nama</span>
              <span className="font-bold text-slate-900">: {slip.personel.nama}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold text-slate-600">Pangkat / Korp</span>
              <span className="text-slate-800">: {slip.personel.pangkat} {slip.personel.korp ? `(${slip.personel.korp})` : ''}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold text-slate-600">Jabatan</span>
              <span className="text-slate-800">: {slip.personel.jabatan || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold text-slate-600">No. Rekening</span>
              <span className="text-slate-800">: {slip.personel.noRekening || '-'}</span>
            </div>
          </div>

          {/* TABEL RINCIAN PENGHASILAN DAN POTONGAN */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6">
            {/* Kolom Penghasilan Kotor */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 font-bold px-3 py-2 border-b border-slate-300 text-slate-800">
                PENGHASILAN KOTOR
              </div>
              <div className="p-3">
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span>Gaji Kotor</span>
                  <span className="font-semibold">{formatRupiah(slip.gajiKotor || 0)}</span>
                </div>
                <div className="flex justify-between pt-4 font-bold text-slate-900">
                  <span>Total Penghasilan:</span>
                  <span>{formatRupiah(slip.gajiKotor || 0)}</span>
                </div>
              </div>
            </div>

            {/* Kolom Potongan */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 font-bold px-3 py-2 border-b border-slate-300 text-slate-800">
                POTONGAN GAJI
              </div>
              <div className="p-3">
                {slip.potongan && slip.potongan.length > 0 ? (
                  slip.potongan.map((pot) => (
                    <div
                      key={pot.id || pot.masterPotonganId}
                      className="flex justify-between py-1 border-b border-dashed border-slate-200"
                    >
                      <span className="text-slate-700">{pot.nama}</span>
                      <span className="font-medium">{formatRupiah(pot.nominal)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic py-1">Tidak ada potongan</p>
                )}
                <div className="flex justify-between pt-3 font-bold text-slate-900">
                  <span>Total Potongan:</span>
                  <span>{formatRupiah(slip.totalPotongan || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL BERSIH & TERBILANG */}
          <div className="bg-emerald-50 border border-emerald-300 rounded p-4 mb-8">
            <div className="flex justify-between items-center text-sm font-black text-emerald-950">
              <span className="uppercase tracking-wider">GAJI BERSIH DITERIMA:</span>
              <span className="text-base text-emerald-700 font-extrabold">
                {formatRupiah(slip.gajiBersih || 0)}
              </span>
            </div>
            <div className="mt-1 text-xs italic text-emerald-900">
              Terbilang: <span className="font-bold">{slip.terbilang}</span>
            </div>
          </div>

          {/* TANDA TANGAN KEDINASAN */}
          <div className="grid grid-cols-2 text-xs pt-4">
            <div className="text-center">
              <p className="text-slate-600 mb-16">Penerima,</p>
              <p className="font-bold underline text-slate-900">{slip.personel.nama}</p>
              <p className="text-slate-600">{slip.personel.pangkat} NRP {slip.personel.nrp}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 mb-1">
                {slip.instansi?.kotaTtd || 'Jakarta'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-slate-700 mb-14">{slip.instansi?.jabatanBendahara || 'Juru Bayar Pengeluaran'}</p>
              <p className="font-bold underline text-slate-900">{slip.instansi?.namaBendahara || 'BENDAHARA'}</p>
              <p className="text-slate-600">
                {slip.instansi?.pangkatBendahara} NRP {slip.instansi?.nrpBendahara}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
