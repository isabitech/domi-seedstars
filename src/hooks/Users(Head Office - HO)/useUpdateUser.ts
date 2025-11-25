import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { User } from '../Auth/useGetMe';

export interface UpdateUserRequest {
  id: string;
  email?: string;
  status?: 'active' | 'inactive';
  username?: string;
  branchId?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}

const updateUser = async ({ id, ...updateData }: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const { data } = await axiosInstance.put(`/users/${id}`, updateData);
  return data;
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
    onError: (error) => {
      console.error('Update user error:', error);
    }
  });
};
