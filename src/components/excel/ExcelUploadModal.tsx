import React, { useState } from 'react';
import type { ExcelPreviewResponse } from '../../types';
import { Upload, CheckCircle2, AlertTriangle, X, Check } from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onPreview: (file: File) => Promise<ExcelPreviewResponse>;
  onImport: (items: any[]) => Promise<void>;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  onPreview,
  onImport,
}) => {
  const [, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage(null);
    setIsParsing(true);

    try {
      const result = await onPreview(selectedFile);
      setPreviewData(result);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Gagal memproses file Excel.');
      setPreviewData(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    // Filter baris yang valid saja
    const validItems = previewData.rows
      .filter((r) => r.isValid)
      .map((r) => {
        const potonganMap: Record<string, number> = {};
        Object.entries(r.potongan).forEach(([masterId, p]) => {
          potonganMap[masterId] = p.nominal;
        });

        return {
          nrp: r.nrp,
          gajiKotor: r.gajiKotor,
          tunkinKotor: r.tunkinKotor,
          potongan: potonganMap,
        };
      });

    if (validItems.length === 0) {
      alert('Tidak ada baris data valid yang dapat disimpan');
      return;
    }

    setIsSubmitting(true);
    try {
      await onImport(validItems);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">Unggah dan validasi file Excel sebelum data disimpan ke database</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* File Picker */}
          {!previewData && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Pilih file template Excel (.xlsx) yang telah diisi</p>
              <p className="text-xs text-slate-500 mt-1">Sistem akan membaca kolom dan baris berdasarkan template resmi</p>

              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 cursor-pointer shadow-sm">
                <span>Pilih File Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isParsing}
                />
              </label>

              {isParsing && (
                <p className="mt-3 text-xs text-emerald-600 font-semibold animate-pulse">
                  Sedang membaca dan memvalidasi baris data...
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pratinjau & Validasi Tabel */}
          {previewData && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">Total Baris Terbaca</p>
                  <p className="text-lg font-bold text-slate-800">{previewData.summary.totalRows}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700">Baris Valid (Siap Simpan)</p>
                  <p className="text-lg font-bold text-emerald-700">{previewData.summary.validCount}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <p className="text-xs text-rose-700">Baris Tidak Valid</p>
                  <p className="text-lg font-bold text-rose-700">{previewData.summary.errorCount}</p>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-80">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">NRP</th>
                      <th className="p-2.5">Nama</th>
                      <th className="p-2.5 text-right">Penghasilan Kotor</th>
                      <th className="p-2.5 text-right">Total Potongan</th>
                      <th className="p-2.5 text-right">Penerimaan Bersih</th>
                      <th className="p-2.5">Keterangan / Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewData.rows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                              <AlertTriangle className="h-3 w-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono font-medium">{row.nrp}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{row.nama}</td>
                        <td className="p-2.5 text-right font-medium">
                          {(row.gajiKotor ?? row.tunkinKotor ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-right text-rose-600 font-medium">
                          {row.totalPotongan.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-right text-emerald-700 font-bold">
                          {(row.gajiBersih ?? row.tunkinBersih ?? 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {row.errors.length > 0 ? (
                            <span className="text-rose-600 font-medium">{row.errors.join(', ')}</span>
                          ) : (
                            <span className="text-slate-400">Siap diimpor</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setPreviewData(null);
              setFile(null);
              setErrorMessage(null);
            }}
            disabled={!previewData || isSubmitting}
            className="text-xs text-slate-600 hover:text-slate-800 font-medium underline disabled:opacity-40"
          >
            Pilih File Lain
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            {previewData && (
              <button
                onClick={handleConfirmImport}
                disabled={isSubmitting || previewData.summary.validCount === 0}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? 'Menyimpan...' : `Simpan ${previewData.summary.validCount} Data Valid`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
