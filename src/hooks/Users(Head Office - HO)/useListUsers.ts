import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { User } from '../Auth/useGetMe';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: 'HO' | 'BR';
  status?: 'active' | 'inactive';
  branchId?: string;
}

export interface ListUsersResponse {
  success: boolean;
  data: {
    users: User[];
    count: number;
    total: number;
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
}

const getUsers = async (params: ListUsersParams): Promise<ListUsersResponse> => {
  const { data } = await axiosInstance.get('/users', { params });
  return data;
};

export const useListUsers = (params: ListUsersParams = {}) => {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
