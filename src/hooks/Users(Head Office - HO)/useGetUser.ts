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

const getUser = async (id: string): Promise<GetUserResponse> => {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data;
};

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
