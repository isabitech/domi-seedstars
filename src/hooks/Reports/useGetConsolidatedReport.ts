import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface ConsolidatedReportParams {
  startDate?: string;
  endDate?: string;
}

export interface ConsolidatedReportData {
  period: {
    start: string;
    end: string;
  };
  systemSummary: {
    totalBranches: number;
    activeBranches: number;
    totalUsers: number;
    totalOperationalDays: number;
  };
  financialSummary: {
    grandTotalCashbook1: number;
    grandTotalCashbook2: number;
    grandTotalOnlineCIH: number;
    grandTotalTSO: number;
    totalLoanDisbursed: number;
    totalLoanCollected: number;
    totalSavingsDeposit: number;
    totalSavingsWithdrawal: number;
    netCashFlow: number;
  };
  branchPerformance: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    operationalDays: number;
    avgDailyCashflow: number;
    totalLoanCollection: number;
    totalSavingsDeposit: number;
    efficiency: number; // percentage
    ranking: number;
  }>;
  trends: {
    dailyCashflowTrend: Array<{
      date: string;
      totalCashflow: number;
    }>;
    branchGrowthTrend: Array<{
      month: string;
      activeBranches: number;
      totalOperations: number;
    }>;
  };
}

export interface GetConsolidatedReportResponse {
  success: boolean;
  data: {
    report: ConsolidatedReportData;
    generatedAt: string;
  };
  message: string;
}

const getConsolidatedReport = async (params: ConsolidatedReportParams): Promise<GetConsolidatedReportResponse> => {
  const { data } = await axiosInstance.get('/reports/consolidated', { params });
  return data;
};

export const useGetConsolidatedReport = (params: ConsolidatedReportParams = {}) => {
  return useQuery({
    queryKey: ['reports', 'consolidated', params],
    queryFn: () => getConsolidatedReport(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
