import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"

interface HODashboardParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface GetHODashboardResponse {
  success: boolean
  data: GetHODashboardData
  message: string
  timestamp: string
}

export interface GetHODashboardData {
  dashboardData: DashboardData
}

export interface DashboardData {
  branches: any[]
  consolidatedSummary: ConsolidatedSummary
  branchPerformance: any[]
  todayStatus: TodayStatu[]
  trendData: any[]
}

export interface ConsolidatedSummary {
  totalSavings: number
  totalLoanCollection: number
  totalCharges: number
  totalDisbursements: number
  totalWithdrawals: number
  totalOnlineCIH: number
  totalTSO: number
  activeBranches: any[]
  totalOperations: number
}

export interface TodayStatu {
  _id: string
  onlineCIH: number
  tso: number
  isCompleted: boolean
  branchName: string
  branchCode: string
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

