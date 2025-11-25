import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { DailyOperations } from './useGetDailyOperations';

export interface GetOperationsHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  status?: 'draft' | 'submitted' | 'approved';
}

export interface GetOperationsHistoryResponse {
  success: boolean;
  data: {
    operations: DailyOperations[];
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
    range: {
      start: string;
      end: string;
    };
  };
  message: string;
}

const getOperationsHistory = async (params: GetOperationsHistoryParams): Promise<GetOperationsHistoryResponse> => {
  const { data } = await axiosInstance.get('/operations/history', { params });
  return data;
};

export const useGetOperationsHistory = (params: GetOperationsHistoryParams = {}) => {
  return useQuery({
    queryKey: ['operations', 'history', params],
    queryFn: () => getOperationsHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
