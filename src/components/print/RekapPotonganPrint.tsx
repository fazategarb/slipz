import React from 'react';
import type { RekapPotonganData } from '../../types';

interface RekapPotonganPrintProps {
  data: RekapPotonganData;
}

export const RekapPotonganPrint: React.FC<RekapPotonganPrintProps> = ({ data }) => {
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
    <div className="bg-white p-8 max-w-4xl mx-auto border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
      {/* KOP SURAT */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-800">
          {data.instansi?.namaSatuan}
        </h2>
        <h1 className="text-base font-extrabold tracking-wide uppercase text-slate-900">
          {data.instansi?.namaInstansi}
        </h1>
        <p className="text-xs text-slate-600">{data.instansi?.alamat}</p>
      </div>

      <div className="text-center my-4">
        <h3 className="text-base font-black tracking-wider uppercase underline">
          DAFTAR REKAPITULASI POTONGAN: {data.potongan.nama}
        </h3>
        <p className="text-xs font-semibold uppercase text-slate-700 mt-1">
          PERIODE: {getBulanNama(data.periode.bulan)} {data.periode.tahun} | KATEGORI:{' '}
          {data.potongan.kategori}
        </p>
      </div>

      {/* TABEL DATA REKAP */}
      <table className="w-full text-xs border border-slate-300 mt-4 border-collapse">
        <thead>
          <tr className="bg-slate-800 text-white font-bold">
            <th className="border border-slate-400 p-2 text-center w-10">NO</th>
            <th className="border border-slate-400 p-2 text-left w-28">NRP / NIP</th>
            <th className="border border-slate-400 p-2 text-left">NAMA PERSONEL</th>
            <th className="border border-slate-400 p-2 text-center w-28">PANGKAT</th>
            <th className="border border-slate-400 p-2 text-center w-36">NO. REKENING</th>
            <th className="border border-slate-400 p-2 text-right w-36">NOMINAL</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-200">
              <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
              <td className="border border-slate-300 p-2 font-mono font-medium">{row.nrp}</td>
              <td className="border border-slate-300 p-2 font-semibold text-slate-900">{row.nama}</td>
              <td className="border border-slate-300 p-2 text-center">{row.pangkat}</td>
              <td className="border border-slate-300 p-2 text-center font-mono">{row.noRekening}</td>
              <td className="border border-slate-300 p-2 text-right font-semibold">
                {formatRupiah(row.nominal)}
              </td>
            </tr>
          ))}
          {/* BARIS TOTAL */}
          <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
            <td colSpan={5} className="border border-slate-300 p-2.5 text-center uppercase tracking-wider">
              TOTAL KESELURUHAN ({data.summary.totalPersonel} Orang)
            </td>
            <td className="border border-slate-300 p-2.5 text-right text-emerald-700 text-sm">
              {formatRupiah(data.summary.totalNominal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TERBILANG */}
      <div className="mt-3 text-xs italic bg-slate-50 p-2.5 rounded border border-slate-200">
        Terbilang: <span className="font-bold">{data.summary.terbilangTotal}</span>
      </div>

      {/* TANDA TANGAN */}
      <div className="flex justify-end text-xs pt-8">
        <div className="text-center w-64">
          <p className="text-slate-600 mb-1">
            {data.instansi?.kotaTtd || 'Jakarta'},{' '}
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-slate-700 mb-16">{data.instansi?.jabatanBendahara}</p>
          <p className="font-bold underline text-slate-900">{data.instansi?.namaBendahara}</p>
          <p className="text-slate-600">
            {data.instansi?.pangkatBendahara} NRP {data.instansi?.nrpBendahara}
          </p>
        </div>
      </div>
    </div>
  );
};
