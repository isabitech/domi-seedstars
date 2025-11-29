import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

 interface HODashboardParams {
  date?: string;
}

 interface GetHODashboardResponse {
  success: boolean
  data: GetHODashboardResponseData
  message: string
  timestamp: string
}

 interface GetHODashboardResponseData {
  dashboardData: DashboardData
}

export interface DashboardData {
  branches: Branch[]
  consolidatedSummary: ConsolidatedSummary
  branchPerformance: BranchPerformance[]
  todayStatus: TodayStatus[]
  trendData: TrendData[]
}

export interface Branch {
  _id: string
  name: string
  code: string
}

export interface ConsolidatedSummary {
  totalSavings: number
  totalLoanCollection: number
  totalCharges: number
  totalDisbursements: number
  totalWithdrawals: number
  totalOnlineCIH: number
  totalTSO: number
  activeBranches: string[]
  totalOperations: number
}

export interface BranchPerformance {
  _id: string
  branchName: string
  branchCode: string
  totalSavings: number
  totalLoanCollection: number
  totalDisbursements: number
  avgOnlineCIH: number
  totalTSO: number
  operationDays: number
  lastOperation: string
}

export interface TodayStatus {
  _id: string
  onlineCIH: number
  tso: number
  isCompleted: boolean
  branchName: string
  branchCode: string
}

export interface TrendData {
  date: string
  totalSavings: number
  totalDisbursements: number
  totalTSO: number
  operatingBranches: number
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
