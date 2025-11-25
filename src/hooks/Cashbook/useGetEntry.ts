import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { CashbookEntry } from './useCreateEntry';

export interface GetCashbookEntryResponse {
  success: boolean;
  data: {
    entry: CashbookEntry;
  };
  message: string;
}

const getCashbookEntry = async (id: string): Promise<GetCashbookEntryResponse> => {
  const { data } = await axiosInstance.get(`/cashbook/${id}`);
  return data;
};

export const useGetEntry = (id: string) => {
  return useQuery({
    queryKey: ['cashbook', 'entry', id],
    queryFn: () => getCashbookEntry(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
