import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { User } from '../Auth/useGetMe';

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'HO' | 'BR' | 'admin';
  branchId?: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}

const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  const { data } = await axiosInstance.post('/users', userData);
  return data;
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Create user error:', error);
    }
  });
};
