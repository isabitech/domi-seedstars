import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Branch } from './useListBranches';

export interface UpdateBranchRequest {
  id: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface UpdateBranchResponse {
  success: boolean;
  data: {
    branch: Branch;
  };
  message: string;
}

const updateBranch = async ({ id, ...updateData }: UpdateBranchRequest): Promise<UpdateBranchResponse> => {
  const { data } = await axiosInstance.put(`/branches/${id}`, updateData);
  return data;
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBranch,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.id] });
    },
    onError: (error) => {
      console.error('Update branch error:', error);
    }
  });
};
