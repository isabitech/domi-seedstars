import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'HO' | 'BR';
  branchId?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: 'HO' | 'BR';
      branchId?: string;
    };
  };
  message: string;
}

const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await axiosInstance.post('/auth/register', userData);
  return data;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
    onError: (error) => {
      console.error('Registration error:', error);
    }
  });
};
