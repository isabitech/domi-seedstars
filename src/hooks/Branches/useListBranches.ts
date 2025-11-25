import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ListBranchesResponse {
  success: boolean;
  data: {
    branches: Branch[];
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

const getBranches = async (): Promise<ListBranchesResponse> => {
  const { data } = await axiosInstance.get('/branches');
  return data;
};

export const useListBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
