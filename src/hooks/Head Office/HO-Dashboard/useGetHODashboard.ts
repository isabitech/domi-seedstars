import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"

interface HODashboardParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}



export interface GetHODashboardResponse {
  success: boolean
  data: Data
  message: string
  timestamp: string
}

export interface Data {
  dashboardData: DashboardData
}

export interface DashboardData {
  branches: Branch[]
  consolidatedSummary: ConsolidatedSummary
  branchPerformance: BranchPerformance[]
  todayStatus: TodayStatu[]
  trendData: TrendDaum[]
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

export interface TodayStatu {
  _id: string
  onlineCIH: number
  tso: number
  isCompleted: boolean
  branchName: string
  branchCode: string
}

export interface TrendDaum {
  date: string
  totalSavings: number
  totalDisbursements: number
  totalTSO: number
  operatingBranches: number
}



const getHODashboard = async (params?: HODashboardParams): Promise<GetHODashboardResponse> => {
    let url = '/dashboard/ho';
    
    // Build query parameters conditionally
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
    }
    
    if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
    }
    
    if (params?.branchId) {
        queryParams.append('branchId', params.branchId);
    }
    
    // Only append query string if there are parameters
    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useGetHODashboard = (params?: HODashboardParams) => useQuery({
    queryKey: ['ho-dashboard', params?.startDate, params?.endDate, params?.branchId],
    queryFn: () => getHODashboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
})

