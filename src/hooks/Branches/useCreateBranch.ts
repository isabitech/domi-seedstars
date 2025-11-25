import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Branch } from './useListBranches';

export interface CreateBranchRequest {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export interface CreateBranchResponse {
  success: boolean;
  data: {
    branch: Branch;
  };
  message: string;
}

const createBranch = async (branchData: CreateBranchRequest): Promise<CreateBranchResponse> => {
  const { data } = await axiosInstance.post('/branches', branchData);
  return data;
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (error) => {
      console.error('Create branch error:', error);
    }
  });
};
