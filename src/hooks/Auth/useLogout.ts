import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import { ACCESS_TOKEN_KEYWORD, USER_INFORMATION } from '../../utils/constants';

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
      // Clear session storage
      sessionStorage.removeItem(ACCESS_TOKEN_KEYWORD);
      sessionStorage.removeItem(USER_INFORMATION);
      
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });
};
