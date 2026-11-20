---
name: slipz-development
description: >-
  Standard development workflows, UI conventions, state management, printing layouts,
  and routing guidelines for the frontend application (slipz) built with Vite, React 19,
  TypeScript, Tailwind CSS v4, and TanStack Query.
---

# Panduan Pengembangan Frontend `slipz`

Repo `slipz` merupakan antarmuka web (frontend) untuk Aplikasi Slip Gaji & Tunkin Kedinasan yang dibangun dengan **Vite 8**, **React 19**, **TypeScript 5.7+**, dan **Tailwind CSS v4**.

---

## 1. Spesifikasi Tech Stack & Library

- **Framework & Bundler**: Vite 8 + React 19 + TypeScript 5.7+
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` (menggunakan `@import "tailwindcss";` di `src/index.css`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Server State & Data Fetching**: `@tanstack/react-query` v5 + `axios`
- **Ikonografi**: `lucide-react`
- **Olah Data Excel**: `xlsx` (browser preview) dan Axios Blob download

---

## 2. Struktur Direktori Lengkap

```text
src/
├── main.tsx
├── App.tsx                       # Router, QueryClientProvider, AuthProvider
├── index.css                     # Tailwind v4 import & print utilities (@media print)
├── types/
│   └── index.ts                  # Type-safe definisi entitas (User, Personel, SlipData, dll.)
├── api/
│   ├── client.ts                 # Axios instance (Bearer token interceptor & 401 redirect)
│   ├── auth.api.ts               # login, getMe
│   ├── personel.api.ts           # CRUD master personel
│   ├── potongan.api.ts           # CRUD master potongan (Gaji & Tunkin)
│   ├── periode.api.ts            # Kelola periode bulanan
│   ├── gaji.api.ts               # Download template (blob), preview Excel, import batch
│   ├── tunkin.api.ts             # Download template (blob), preview Excel, import batch
│   ├── laporan.api.ts            # Fetch data cetak slip & rekap potongan (blob export)
│   └── settings.api.ts           # Kop instansi & manajemen akun pengguna
├── contexts/
│   └── AuthContext.tsx           # State user, role, token, login, logout, hasRole()
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Sidebar responsif berbasis role, Topbar info
│   │   └── ProtectedRoute.tsx    # Route guard multi-role (ADMIN, JURU_BAYAR, PERSONEL)
│   ├── excel/
│   │   └── ExcelUploadModal.tsx  # Modal dropzone file, tabel preview & status validasi
│   └── print/
│       ├── SlipGajiPrint.tsx     # Template lembar Slip Gaji resmi A4/A5
│       ├── SlipTunkinPrint.tsx   # Template lembar Slip Tunkin resmi A4/A5
│       └── RekapPotonganPrint.tsx# Template lembar rekapitulasi potongan pihak ketiga
└── pages/
    ├── auth/Login.tsx            # Halaman masuk sistem
    ├── dashboard/Dashboard.tsx   # KPI cards, periode aktif, dan shortcut alur kerja
    ├── personel/PersonelList.tsx # Tabel personel, pencarian, dan aktivasi akun login
    ├── potongan/PotonganList.tsx # Master jenis potongan dinamis (Gaji & Tunkin)
    ├── periode/PeriodeList.tsx   # Buka periode baru & kunci periode
    ├── gaji/GajiManagement.tsx   # Rekapitulasi gaji bulanan, upload Excel, input manual
    ├── tunkin/TunkinManagement.tsx # Rekapitulasi tunkin bulanan, upload Excel, input manual
    ├── laporan/CetakSlip.tsx     # Cetak lembar slip satuan & massal (Gaji & Tunkin)
    ├── laporan/CetakRekapPotongan.tsx # Laporan rekap potongan per vendor (Print & Excel)
    ├── settings/InstansiSettings.tsx  # Konfigurasi Kop dinas & Pejabat penandatangan
    └── personel-portal/SlipSaya.tsx   # Portal mandiri personel untuk cek & cetak slip pribadi
```

---

## 3. Aturan Teknis Penting

### A. Konvensi `verbatimModuleSyntax: true`
Proyek menggunakan TypeScript `verbatimModuleSyntax: true`. Setiap import yang hanya berupa type/interface **wajib** menggunakan sintaks `import type`:
```typescript
import type { Personel, SlipData, Role } from '../types';
```

### B. Pola Unduh File Biner (Excel / Blob)
Untuk menghindari error `401 Unauthorized` pada endpoint unduhan file, **jangan gunakan** `window.open('/api/...')` secara langsung. Gunakan pattern Axios blob:
```typescript
const res = await api.get('/penggajian-gaji/template', { responseType: 'blob' });
const blob = new Blob([res.data], {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'nama_file.xlsx');
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
```

### C. Styling Cetak Resmi Kedinasan
- `.no-print`: Disembunyikan saat dialog cetak browser aktif (`@media print`).
- `.print-page`: Memaksa pemisah halaman antar personel (`page-break-after: always`).
- Format lembar cetak telah distandarisasi mencakup: Kop Surat resmi, biodata personel, rincian penghasilan kotor, rincian item potongan, penerimaan bersih, terbilang rupiah, dan blok tanda tangan resmi.

---

## 4. Perintah Pengembangan Utama

```bash
# Menjalankan server development (Port 3000, proxy /api ke port 4000)
npm run dev

# Memeriksa type TypeScript dan build untuk produksi
npm run build

# Menjalankan linter
npm run lint

# Pratinjau hasil build produksi
npm run preview
```
