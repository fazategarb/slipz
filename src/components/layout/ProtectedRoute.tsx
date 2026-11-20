import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm font-medium text-slate-600">Memuat sesi pengguna...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role PERSONEL mengakses route admin, redirect ke portal slip saya
  if (user.role === 'PERSONEL' && allowedRoles && !allowedRoles.includes('PERSONEL')) {
    return <Navigate to="/slip-saya" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = user.role === 'ADMIN' || allowedRoles.includes(user.role);
    if (!hasPermission) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-100">
          <div className="rounded-xl bg-white p-8 shadow-md text-center max-w-md">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-800">Akses Ditolak</h2>
            <p className="mt-2 text-sm text-slate-600">
              Anda tidak memiliki izin untuk membuka halaman ini.
            </p>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
};
