import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { CashbookEntry } from './useCreateEntry';

export interface ListCashbookEntriesParams {
  page?: number;
  limit?: number;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListCashbookEntriesResponse {
  success: boolean;
  data: {
    entries: CashbookEntry[];
    count: number;
    total: number;
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

const getCashbookEntries = async (params: ListCashbookEntriesParams): Promise<ListCashbookEntriesResponse> => {
  const { data } = await axiosInstance.get('/cashbook', { params });
  return data;
};

export const useListEntries = (params: ListCashbookEntriesParams = {}) => {
  return useQuery({
    queryKey: ['cashbook', 'list', params],
    queryFn: () => getCashbookEntries(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
