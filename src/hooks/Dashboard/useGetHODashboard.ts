import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface HODashboardParams {
  date?: string;
}

export interface HODashboardData {
  systemOverview: {
    totalBranches: number;
    activeBranches: number;
    totalUsers: number;
    activeUsers: number;
    todaySubmissions: number;
    pendingSubmissions: number;
  };
  dailyConsolidation: {
    date: string;
    totalCashbook1: number;
    totalCashbook2: number;
    totalOnlineCIH: number;
    totalTSO: number;
    totalLoanCollection: number;
    totalSavingsDeposit: number;
  };
  branchPerformance: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    status: 'submitted' | 'pending' | 'overdue';
    onlineCIH: number;
    tso: number;
    submissionTime?: string;
    efficiency: number; // percentage
  }>;
  trends: {
    last30Days: {
      dates: string[];
      totalCashflow: number[];
      activeBranches: number[];
    };
    monthlyGrowth: {
      months: string[];
      totalOperations: number[];
      avgCashflow: number[];
    };
  };
  topMetrics: {
    highestPerformingBranch: {
      branchId: string;
      branchName: string;
      performance: number;
    };
    totalSystemCashflow: number;
    averageBranchCashflow: number;
    systemEfficiency: number;
  };
  recentAlerts: Array<{
    id: string;
    branchId: string;
    branchName: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export interface GetHODashboardResponse {
  success: boolean;
  data: {
    dashboard: HODashboardData;
  };
  message: string;
}

const getHODashboard = async (params: HODashboardParams): Promise<GetHODashboardResponse> => {
  const { data } = await axiosInstance.get('/dashboard/ho', { params });
  return data;
};

export const useGetHODashboard = (params: HODashboardParams = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'ho', params],
    queryFn: () => getHODashboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
  });
};
