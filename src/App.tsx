import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { PersonelList } from './pages/personel/PersonelList';
import { PotonganList } from './pages/potongan/PotonganList';
import { PeriodeList } from './pages/periode/PeriodeList';
import { GajiManagement } from './pages/gaji/GajiManagement';
import { TunkinManagement } from './pages/tunkin/TunkinManagement';
import { CetakSlip } from './pages/laporan/CetakSlip';
import { CetakRekapPotongan } from './pages/laporan/CetakRekapPotongan';
import { InstansiSettings } from './pages/settings/InstansiSettings';
import { SlipSaya } from './pages/personel-portal/SlipSaya';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes for Admin & Juru Bayar */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'JURU_BAYAR']} />}>
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/personel"
                element={
                  <AppLayout>
                    <PersonelList />
                  </AppLayout>
                }
              />
              <Route
                path="/potongan"
                element={
                  <AppLayout>
                    <PotonganList />
                  </AppLayout>
                }
              />
              <Route
                path="/periode"
                element={
                  <AppLayout>
                    <PeriodeList />
                  </AppLayout>
                }
              />
              <Route
                path="/potongan-gaji"
                element={
                  <AppLayout>
                    <GajiManagement />
                  </AppLayout>
                }
              />
              <Route
                path="/potongan-tunkin"
                element={
                  <AppLayout>
                    <TunkinManagement />
                  </AppLayout>
                }
              />
              <Route
                path="/laporan/slip"
                element={
                  <AppLayout>
                    <CetakSlip />
                  </AppLayout>
                }
              />
              <Route
                path="/laporan/rekap"
                element={
                  <AppLayout>
                    <CetakRekapPotongan />
                  </AppLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppLayout>
                    <InstansiSettings />
                  </AppLayout>
                }
              />
            </Route>

            {/* Protected Route for Personel Role */}
            <Route element={<ProtectedRoute allowedRoles={['PERSONEL', 'ADMIN', 'JURU_BAYAR']} />}>
              <Route
                path="/slip-saya"
                element={
                  <AppLayout>
                    <SlipSaya />
                  </AppLayout>
                }
              />
            </Route>

            {/* Default Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
