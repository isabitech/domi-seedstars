import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

const resetPassword = async ({ token, password }: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const { data } = await axiosInstance.put(`/auth/reset-password/${token}`, { password });
  return data;
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onError: (error) => {
      console.error('Reset password error:', error);
    }
  });
};
