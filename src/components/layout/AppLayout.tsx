import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Coins,
  CalendarDays,
  FileSpreadsheet,
  BadgeDollarSign,
  Printer,
  FileBarChart2,
  Settings,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Master Personel',
      icon: Users,
      path: '/personel',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Data Potongan',
      icon: Coins,
      path: '/potongan',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Periode Penggajian',
      icon: CalendarDays,
      path: '/periode',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Potongan Gaji',
      icon: FileSpreadsheet,
      path: '/potongan-gaji',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Potongan Tunkin',
      icon: BadgeDollarSign,
      path: '/potongan-tunkin',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Cetak Slip Gaji & Tunkin',
      icon: Printer,
      path: '/laporan/slip',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Rekapitulasi Potongan',
      icon: FileBarChart2,
      path: '/laporan/rekap',
      roles: ['ADMIN', 'JURU_BAYAR'],
    },
    {
      title: 'Pengaturan Instansi',
      icon: Settings,
      path: '/settings',
      roles: ['ADMIN'],
    },
    {
      title: 'Slip Saya',
      icon: UserCheck,
      path: '/slip-saya',
      roles: ['PERSONEL'],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => user?.role === 'ADMIN' || item.roles.includes(user?.role || ''),
  );

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar Nav (Disembunyikan saat cetak) */}
      <aside className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* App Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            S
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">SLIPZ APP</h1>
            <p className="text-xs text-slate-400">Penggajian Kedinasan</p>
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-emerald-400">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header (Disembunyikan saat cetak) */}
        <header className="no-print h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Aplikasi Slip Gaji & Tunkin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-600">Masuk sebagai</p>
              <p className="text-sm font-bold text-slate-800 capitalize">
                {user?.personel?.nama || user?.username}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
