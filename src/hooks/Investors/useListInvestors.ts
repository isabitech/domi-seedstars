import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export type InvestorStatus = 'paid' | 'update' | 'withdrawal';

export interface Investor {
  _id: string;
  investorName: string;
  gender: 'male' | 'female';
  phone: string;
  rioDate: string;
  status: InvestorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ListInvestorsParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: 'male' | 'female';
  status?: InvestorStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListInvestorsResponse {
  success: boolean;
  data: {
    investors: Investor[];
    count: number;
    total: number;
    pagination?: {
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

const listInvestors = async (params: ListInvestorsParams = {}): Promise<ListInvestorsResponse> => {
  const { data } = await axiosInstance.get('/investors', { params });
  return data;
};

export const useListInvestors = (params: ListInvestorsParams = {}) => {
  return useQuery({
    queryKey: ['investors', 'list', params],
    queryFn: () => listInvestors(params),
    staleTime: 2 * 60 * 1000,
  });
};