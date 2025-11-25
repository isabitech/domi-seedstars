import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface LogoutResponse {
  success: boolean;
  message: string;
}

const logoutUser = async (): Promise<LogoutResponse> => {
  const { data } = await axiosInstance.post('/auth/logout');
  return data;
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear authorization header
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });
};
