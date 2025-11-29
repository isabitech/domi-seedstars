import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { User } from '../Auth/useGetMe';

export interface GetUserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message: string;
}

const getUser = async (): Promise<GetUserResponse> => {
  const { data } = await axiosInstance.get(`/users`);
  return data;
};

export const useGetUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
