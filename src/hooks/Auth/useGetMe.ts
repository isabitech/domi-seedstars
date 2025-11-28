import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';


export interface GetMeResponse {
  success: boolean
  data: User
  message: string
  timestamp: string
}

export interface User {
  id: string
  username: string
  email: string
  role: string
  branchId: string
  branchName: string
  permissions: string[]
  lastLogin: string
  isFirstLogin: boolean
}




const getCurrentUser = async (): Promise<GetMeResponse> => {
  const { data } = await axiosInstance.get('/auth/me');
  return data;
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    enabled: !!localStorage.getItem('token'),
  });
};
