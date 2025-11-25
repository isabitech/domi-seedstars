import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Branch } from './useListBranches';

export interface GetBranchResponse {
  success: boolean;
  data: {
    branch: Branch;
  };
  message: string;
}

const getBranch = async (id: string): Promise<GetBranchResponse> => {
  const { data } = await axiosInstance.get(`/branches/${id}`);
  return data;
};

export const useGetBranch = (id: string) => {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: () => getBranch(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
