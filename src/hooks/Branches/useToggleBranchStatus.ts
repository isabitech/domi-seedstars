import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Branch } from './useListBranches';

export interface ToggleBranchStatusRequest {
  id: string;
  status: 'active' | 'inactive';
}

export interface ToggleBranchStatusResponse {
  success: boolean;
  data: {
    branch: Branch;
  };
  message: string;
}

const toggleBranchStatus = async ({ id, status }: ToggleBranchStatusRequest): Promise<ToggleBranchStatusResponse> => {
  const { data } = await axiosInstance.patch(`/branches/${id}/toggle-status`, { status });
  return data;
};

export const useToggleBranchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleBranchStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', variables.id] });
    },
    onError: (error) => {
      console.error('Toggle branch status error:', error);
    }
  });
};
