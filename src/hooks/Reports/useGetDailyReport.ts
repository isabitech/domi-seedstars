import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DailyReportParams {
  date?: string;
  branchId?: string;
}

export interface DailyReportData {
  date: string;
  branchSummaries: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    cashbook1Total: number;
    cashbook2Total: number;
    onlineCIH: number;
    tso: number;
    loanCollection: number;
    savingsDeposit: number;
    status: 'submitted' | 'pending';
  }>;
  totals: {
    totalCashbook1: number;
    totalCashbook2: number;
    totalOnlineCIH: number;
    totalTSO: number;
    totalLoanCollection: number;
    totalSavingsDeposit: number;
  };
}

export interface GetDailyReportResponse {
  success: boolean;
  data: {
    report: DailyReportData;
    generatedAt: string;
  };
  message: string;
}

const getDailyReport = async (params: DailyReportParams): Promise<GetDailyReportResponse> => {
  const { data } = await axiosInstance.get('/reports/daily', { params });
  return data;
};

export const useGetDailyReport = (params: DailyReportParams = {}) => {
  return useQuery({
    queryKey: ['reports', 'daily', params],
    queryFn: () => getDailyReport(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
