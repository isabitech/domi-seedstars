import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
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

const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post('/auth/login', credentials);
  return data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store token in localStorage or your preferred storage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Set default authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
    },
    onError: (error) => {
      console.error('Login error:', error);
      // Handle login error (show toast, etc.)
    }
  });
};
