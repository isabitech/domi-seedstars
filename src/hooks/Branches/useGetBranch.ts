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

const getBranch = async (branchId: string): Promise<GetBranchResponse> => {
  const { data } = await axiosInstance.get(`/branches/${branchId}`);
  return data;
};

export const useGetBranch = (branchId: string) => {
  return useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => getBranch(branchId),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
