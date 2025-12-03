import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import { storeTokenToStorage, storeUserInfoToStorage } from '../../utils/helpers';

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
    onSuccess: async (data) => {
      try {
        // Store token and user in encrypted session storage
        await storeTokenToStorage(data.data.token);
        await storeUserInfoToStorage(data.data.user);
      } catch (error) {
        console.error('Error storing user data:', error);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      // Handle login error (show toast, etc.)
    }
  });
};
