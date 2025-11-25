import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

const forgotPassword = async (email: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const { data } = await axiosInstance.post('/auth/forgot-password', email);
  return data;
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
      console.error('Forgot password error:', error);
    }
  });
};
