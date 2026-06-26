import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSkeleton } from '@/shared/components';
import { AppShell } from '@/shared/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { protectedRoutes } from './routes';

const CommandCenterPage = lazy(() => import('@/pages/CommandCenterPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6"><LoadingSkeleton variant="card" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          {protectedRoutes.map(({ path, element: Page, permission }) => <Route key={path} path={path} element={<ProtectedRoute permission={permission}><Page /></ProtectedRoute>} />)}
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
