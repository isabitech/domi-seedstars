import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';
import type { GetCashbookEntryResponse } from './get-daily-ops-types';



const getCashbookEntry = async (branchId: string, date: string): Promise<GetCashbookEntryResponse> => {
  const { data } = await axiosInstance.get(`/operations/daily?date=${date}&branchId=${branchId}`);
  return data;
};

export const useGetEntry = (branchId: string, date: string) => {
  return useQuery({
    queryKey: ['cashbook', 'entry', branchId, date],
    queryFn: () => getCashbookEntry(branchId, date),
    enabled: !!branchId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
