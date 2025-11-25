import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface GetFinancialReportParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export interface FinancialReportData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalLoans: number;
    totalSavings: number;
    totalCashInHand: number;
  };
  breakdown: {
    byBranch: Array<{
      branchId: string;
      branchName: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
    byDate: Array<{
      date: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
  };
}

export interface GetFinancialReportResponse {
  success: boolean;
  data: {
    report: FinancialReportData;
    generatedAt: string;
    period: {
      start: string;
      end: string;
    };
  };
  message: string;
}

const getFinancialReport = async (params: GetFinancialReportParams): Promise<GetFinancialReportResponse> => {
  const { data } = await axiosInstance.get('/reports/financial', { params });
  return data;
};

export const useGetFinancial = (params: GetFinancialReportParams = {}) => {
  return useQuery({
    queryKey: ['reports', 'financial', params],
    queryFn: () => getFinancialReport(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(params.startDate && params.endDate),
  });
};
