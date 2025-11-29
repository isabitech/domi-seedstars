import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DeleteBranchResponse {
  success: boolean;
  message: string;
}

const deleteBranch = async (id: string): Promise<DeleteBranchResponse> => {
  const { data } = await axiosInstance.delete(`/branches/${id}`);
  return data;
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (error) => {
      console.error('Delete branch error:', error);
    }
  });
};
