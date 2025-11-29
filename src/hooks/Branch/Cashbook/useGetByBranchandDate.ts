import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';
import type { CashbookEntry } from './useCreateEntry';

export interface GetCashbookByBranchAndDateResponse {
  success: boolean;
  data: {
    entry: CashbookEntry | null;
  };
  message: string;
}

const getCashbookByBranchAndDate = async (branchId: string, date: string): Promise<GetCashbookByBranchAndDateResponse> => {
  const { data } = await axiosInstance.get(`/cashbook/${branchId}/${date}`);
  return data;
};

export const useGetByBranchAndDate = (branchId: string, date: string) => {
  return useQuery({
    queryKey: ['cashbook', 'byBranchAndDate', branchId, date],
    queryFn: () => getCashbookByBranchAndDate(branchId, date),
    enabled: !!branchId && !!date,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
