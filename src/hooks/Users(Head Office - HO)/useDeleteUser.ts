import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  const { data } = await axiosInstance.delete(`/users/${id}`);
  return data;
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    }
  });
};
