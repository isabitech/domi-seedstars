import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { HeadOfficeDashboard } from '../pages/dashboard/HeadOfficeDashboard';
import { BranchDashboard } from '../pages/dashboard/BranchDashboard';
import { CombinedCashbookPage } from '../pages/cashbook/CombinedCashbookPage';
import { PredictionsPage } from '../pages/predictions/PredictionsPage';
import { BranchManagementPage } from '../pages/branches/BranchManagementPage';
import { BranchDailyReportPage } from '../pages/reports/BranchDailyReportPage';
import { BankStatementPage } from '../pages/bank-statements/BankStatementPage';
import { OnlineCIHPage } from '../pages/online-cih/OnlineCIHPage';
import { Homepage } from '../components/homepage';
import { HOOperationsPage } from '../pages/ho-operations/HOOperationsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import DailyReport from '../components/Branch/DailyReport';
import DailyOperations from '../components/Branch/DailyOperations';
import { SavingsRegisterPage } from '../pages/registers/SavingsRegisterPage';
import { LoanRegisterPage } from '../pages/registers/LoanRegisterPage';
import { DisbursementRollPage } from '../pages/disbursement-roll/DisbursementRollPage';
import BranchEFCCPage from '../pages/efcc/BranchEFCCPage';
import HOEFCCPage from '../pages/efcc/HOEFCCPage';
import BranchAmountNeedTomorrowPage from '../pages/amount-need-tomorrow/BranchAmountNeedTomorrowPage';
import HOAmountNeedTomorrowPage from '../pages/amount-need-tomorrow/HOAmountNeedTomorrowPage';
import BranchAbiyeReport from '../pages/abiye-report/BranchAbiyeReport';
import HOAbiyeReport from '../pages/abiye-report/HOAbiyeReport';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            element: <HeadOfficeDashboard />,
          },
          {
            path: 'branch',
            element: <BranchDashboard />,
          },
        ],
      },
      {
        path: 'cashbook',
        children: [
          {
            index: true,
            element: <CombinedCashbookPage />,
          },

        ],
      },
      {
        path: 'online-cih',
        element: <OnlineCIHPage />,
      },
      {
        path: 'predictions',
        element: <PredictionsPage />,
      },
      {
        path: 'daily-report',
        element: <DailyReport />,
      },
      {
        path: 'daily-operations',
        element: <DailyOperations />,
      },
      {
        path: 'bank-statements',
        element: <BankStatementPage />,
      },
      {
        path: 'branch-savings-register',
        element: <SavingsRegisterPage />,
      },
      {
        path: 'branch-loan-register',
        element: <LoanRegisterPage />,
      },
      {
        path: 'branch-disbursement-roll',
        element: <DisbursementRollPage />,
      },
      {
        path: 'branch-efcc',
        element: <BranchEFCCPage />,
      },
      // {
      //   path: 'branch-amount-need-tomorrow',
      //   element: <BranchAmountNeedTomorrowPage />,
      // },
      {
        path: 'ho-efcc',
        element: <HOEFCCPage />,
      },
      // {
      //   path: 'ho-amount-need-tomorrow',
      //   element: <HOAmountNeedTomorrowPage />,
      // },
      {
        path: 'branch-abiye-report',
        element: <BranchAbiyeReport />,
      },
      {
        path: 'ho-abiye-report',
        element: <HOAbiyeReport />,
      },
      {
        path: 'branches',
        element: <BranchManagementPage />,
      },
      {
        path: 'reports',
        children: [
          {
            index: true,
            element: <ReportsPage />,
          },
          {
            path: 'daily',
            element: <BranchDailyReportPage />,
          },
        ],
      },
      {
        path: 'ho-operations',
        element: <HOOperationsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);