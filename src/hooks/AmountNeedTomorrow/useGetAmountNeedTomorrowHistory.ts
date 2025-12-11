import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";
import type { AmountNeedTomorrow } from './useGetAmountNeedTomorrowBranch';

interface AmountNeedTomorrowHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface AmountNeedTomorrowHistoryResponse {
  data: AmountNeedTomorrow[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

const getAmountNeedTomorrowHistory = async (params: AmountNeedTomorrowHistoryParams = {}): Promise<AmountNeedTomorrowHistoryResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    
    const response = await axiosInstance.get(`/amount-need-tomorrow/history?${searchParams.toString()}`);
    return response.data;
};

export const useGetAmountNeedTomorrowHistory = (params: AmountNeedTomorrowHistoryParams = {}) => {
    return useQuery({
        queryKey: ['amount-need-tomorrow-history', params],
        queryFn: () => getAmountNeedTomorrowHistory(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};