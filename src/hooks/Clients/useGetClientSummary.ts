import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface BranchClientSummaryItem {
  branchId: string;
  branchName: string;
  branchCode?: string;
  totalClients: number;
}

export interface ClientSummaryResponse {
  success: boolean;
  data: {
    totalClients: number;
    branches: BranchClientSummaryItem[];
  };
  message: string;
}

const getClientSummary = async (): Promise<ClientSummaryResponse> => {
  const { data } = await axiosInstance.get('/clients/summary');
  return data;
};

export const useGetClientSummary = () => {
  return useQuery({
    queryKey: ['clients', 'summary'],
    queryFn: getClientSummary,
    staleTime: 2 * 60 * 1000,
  });
};
