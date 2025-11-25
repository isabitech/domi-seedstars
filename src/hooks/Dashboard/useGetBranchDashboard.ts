import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface BranchDashboardParams {
  branchId?: string;
  date?: string;
}

export interface BranchDashboardData {
  branchInfo: {
    id: string;
    name: string;
    code: string;
    status: 'active' | 'inactive';
  };
  dailySummary: {
    date: string;
    cashbook1Total: number;
    cashbook2Total: number;
    onlineCIH: number;
    tso: number;
    status: 'submitted' | 'pending' | 'draft';
  };
  weeklyTrends: {
    dates: string[];
    cashbook1: number[];
    cashbook2: number[];
    onlineCIH: number[];
    tso: number[];
  };
  currentRegisters: {
    loanBalance: number;
    savingsBalance: number;
    previousLoanTotal: number;
    previousSavingsTotal: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'entry_created' | 'entry_updated' | 'entry_submitted';
    description: string;
    timestamp: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export interface GetBranchDashboardResponse {
  success: boolean;
  data: {
    dashboard: BranchDashboardData;
  };
  message: string;
}

const getBranchDashboard = async (params: BranchDashboardParams): Promise<GetBranchDashboardResponse> => {
  const { data } = await axiosInstance.get('/dashboard/branch', { params });
  return data;
};

export const useGetBranchDashboard = (params: BranchDashboardParams = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'branch', params],
    queryFn: () => getBranchDashboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};
