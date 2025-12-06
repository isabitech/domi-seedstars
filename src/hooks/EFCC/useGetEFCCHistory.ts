import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";
import type { Efcc } from './useGetEFCCBranch';

interface EFCCHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface EFCCHistoryResponse {
  records: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

const getEFCCHistory = async (params: EFCCHistoryParams = {}): Promise<EFCCHistoryResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    
    const response = await axiosInstance.get(`/efcc/history?${searchParams.toString()}`);
    return response.data.data;
};

export const useGetEFCCHistory = (params: EFCCHistoryParams = {}) => {
    return useQuery({
        queryKey: ['efcc-history', params],
        queryFn: () => getEFCCHistory(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};