import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface MonthlyReportParams {
  month?: string; // YYYY-MM format
  branchId?: string;
}

export interface MonthlyReportData {
  month: string;
  branchSummaries: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    totalDays: number;
    avgCashbook1: number;
    avgCashbook2: number;
    avgOnlineCIH: number;
    avgTSO: number;
    totalLoanCollection: number;
    totalSavingsDeposit: number;
    totalDisbursement: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }>;
  totals: {
    totalAvgCashbook1: number;
    totalAvgCashbook2: number;
    totalAvgOnlineCIH: number;
    totalAvgTSO: number;
    totalLoanCollection: number;
    totalSavingsDeposit: number;
    totalDisbursement: number;
  };
  trends: {
    cashflowTrend: 'increasing' | 'decreasing' | 'stable';
    loanTrend: 'increasing' | 'decreasing' | 'stable';
    savingsTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface GetMonthlyReportResponse {
  success: boolean;
  data: {
    report: MonthlyReportData;
    generatedAt: string;
  };
  message: string;
}

const getMonthlyReport = async (params: MonthlyReportParams): Promise<GetMonthlyReportResponse> => {
  const { data } = await axiosInstance.get('/reports/monthly', { params });
  return data;
};

export const useGetMonthlyReport = (params: MonthlyReportParams = {}) => {
  return useQuery({
    queryKey: ['reports', 'monthly', params],
    queryFn: () => getMonthlyReport(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
