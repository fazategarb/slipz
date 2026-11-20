export type Role = 'ADMIN' | 'JURU_BAYAR' | 'PERSONEL';
export type KategoriPotongan = 'GAJI' | 'TUNKIN';
export type StatusPeriode = 'DRAFT' | 'AKTIF' | 'TERKUNCI';

export interface User {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  personelId?: string | null;
  personel?: Personel | null;
  createdAt?: string;
}

export interface Personel {
  id: string;
  nrp: string;
  nama: string;
  pangkat: string;
  korp?: string | null;
  jabatan?: string | null;
  noRekening?: string | null;
  isActive: boolean;
  user?: {
    id: string;
    username: string;
    isActive: boolean;
    role: Role;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeriodePenggajian {
  id: string;
  bulan: number;
  tahun: number;
  status: StatusPeriode;
  keterangan?: string | null;
  createdAt?: string;
  _count?: {
    penggajianGaji: number;
    penggajianTunkin: number;
  };
}

export interface MasterPotongan {
  id: string;
  nama: string;
  kode: string;
  kategori: KategoriPotongan;
  deskripsi?: string | null;
  urutan: number;
  isActive: boolean;
}

export interface DetailPotongan {
  id: string;
  masterPotonganId: string;
  nominal: number;
  masterPotongan: MasterPotongan;
}

export interface PenggajianGaji {
  id: string;
  periodeId: string;
  personelId: string;
  gajiKotor: number;
  totalPotongan: number;
  gajiBersih: number;
  catatan?: string | null;
  personel: Personel;
  potongan: DetailPotongan[];
  createdAt: string;
}

export interface PenggajianTunkin {
  id: string;
  periodeId: string;
  personelId: string;
  tunkinKotor: number;
  totalPotongan: number;
  tunkinBersih: number;
  catatan?: string | null;
  personel: Personel;
  potongan: DetailPotongan[];
  createdAt: string;
}

export interface InstansiSetting {
  id: string;
  namaSatuan: string;
  namaInstansi: string;
  alamat?: string;
  telepon?: string;
  logoUrl?: string;
  kotaTtd: string;
  namaBendahara: string;
  pangkatBendahara: string;
  nrpBendahara: string;
  jabatanBendahara: string;
  updatedAt?: string;
}

export interface SlipData {
  id: string;
  periode: {
    id: string;
    bulan: number;
    tahun: number;
  };
  personel: {
    id: string;
    nrp: string;
    nama: string;
    pangkat: string;
    korp: string;
    jabatan: string;
    noRekening: string;
  };
  gajiKotor?: number;
  tunkinKotor?: number;
  potongan: Array<{
    id: string;
    masterPotonganId: string;
    nama: string;
    kode: string;
    nominal: number;
  }>;
  totalPotongan: number;
  gajiBersih?: number;
  tunkinBersih?: number;
  terbilang: string;
  instansi: InstansiSetting;
}

export interface RekapPotonganData {
  instansi: InstansiSetting;
  periode: PeriodePenggajian;
  potongan: MasterPotongan;
  rows: Array<{
    nrp: string;
    nama: string;
    pangkat: string;
    noRekening: string;
    nominal: number;
  }>;
  summary: {
    totalPersonel: number;
    totalNominal: number;
    terbilangTotal: string;
  };
}

export interface ExcelPreviewRow {
  rowNumber: number;
  nrp: string;
  nama: string;
  pangkat?: string;
  noRekening?: string;
  personelId: string | null;
  gajiKotor?: number;
  tunkinKotor?: number;
  potongan: Record<string, { nama: string; nominal: number }>;
  totalPotongan: number;
  gajiBersih?: number;
  tunkinBersih?: number;
  isValid: boolean;
  errors: string[];
}

export interface ExcelPreviewResponse {
  summary: {
    totalRows: number;
    validCount: number;
    errorCount: number;
    detectedPotonganColumns: string[];
  };
  rows: ExcelPreviewRow[];
}
