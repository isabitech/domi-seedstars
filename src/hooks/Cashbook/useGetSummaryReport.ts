import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface CashbookSummaryParams {
  branchId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export interface CashbookSummaryResponse {
  success: boolean;
  data: {
    summary: {
      totalEntries: number;
      totalCashbook1: number;
      totalCashbook2: number;
      totalOnlineCIH: number;
      averages: {
        avgCashbook1: number;
        avgCashbook2: number;
        avgOnlineCIH: number;
      };
      byStatus: {
        draft: number;
        submitted: number;
        approved: number;
      };
    };
  };
  message: string;
}

const getCashbookSummary = async (params: CashbookSummaryParams): Promise<CashbookSummaryResponse> => {
  const { data } = await axiosInstance.get('/cashbook/reports/summary', { params });
  return data;
};

export const useGetSummaryReport = (params: CashbookSummaryParams = {}) => {
  return useQuery({
    queryKey: ['cashbook', 'summary', params],
    queryFn: () => getCashbookSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
