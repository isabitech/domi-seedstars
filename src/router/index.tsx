import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { RoleGuard } from '../guards/RoleGuard';
import { HeadOfficeDashboard } from '../pages/dashboard/HeadOfficeDashboard';
import { BranchDashboard } from '../pages/dashboard/BranchDashboard';
import { CashbookPage } from '../pages/cashbook/CashbookPage';
import { PredictionsPage } from '../pages/predictions/PredictionsPage';
import { BranchManagementPage } from '../pages/branches/BranchManagementPage';
import { ReportsPage } from '../pages/reports/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            element: (
              <RoleGuard allowedRoles={['HO']}>
                <HeadOfficeDashboard />
              </RoleGuard>
            ),
          },
          {
            path: 'branch',
            element: (
              <RoleGuard allowedRoles={['BR']}>
                <BranchDashboard />
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: 'cashbook',
        element: (
          <RoleGuard allowedRoles={['BR']}>
            <CashbookPage />
          </RoleGuard>
        ),
      },
      {
        path: 'predictions',
        element: (
          <RoleGuard allowedRoles={['BR']}>
            <PredictionsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'branches',
        element: (
          <RoleGuard allowedRoles={['HO']}>
            <BranchManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RoleGuard allowedRoles={['HO']}>
            <ReportsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'ho-operations',
        element: (
          <RoleGuard allowedRoles={['HO']}>
            <div style={{ padding: '20px' }}>
              <h2>HO Operations</h2>
              <p>Head Office operations interface coming soon.</p>
            </div>
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleGuard allowedRoles={['HO']}>
            <div style={{ padding: '20px' }}>
              <h2>System Settings</h2>
              <p>System configuration interface coming soon.</p>
            </div>
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);