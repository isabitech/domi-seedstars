import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface Client {
  _id: string;
  union: string;
  clientName: string;
  clientPhone: string;
  clientNickName?: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorNickName?: string;
  partnerReferrerName: string;
  partnerReferrerPhone: string;

  // Legacy optional fields kept for backward compatibility with existing records.
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  accountNumber?: string;
  clientCode?: string;
  status?: 'active' | 'inactive';
  branch?: {
    _id: string;
    name: string;
    code: string;
  };
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListClientsParams {
  page?: number;
  limit?: number;
  branchId?: string;
  search?: string;
  status?: 'active' | 'inactive';
}

export interface ListClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
    count: number;
    total: number;
    pagination?: {
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

const listClients = async (params: ListClientsParams = {}): Promise<ListClientsResponse> => {
  const { data } = await axiosInstance.get('/clients', { params });
  return data;
};

export const useListClients = (params: ListClientsParams = {}) => {
  return useQuery({
    queryKey: ['clients', 'list', params],
    queryFn: () => listClients(params),
    staleTime: 2 * 60 * 1000,
  });
};
