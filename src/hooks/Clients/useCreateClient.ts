import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Client } from './useListClients';

export interface CreateClientRequest {
  union: string;
  clientName: string;
  clientPhone: string;
  clientNickName?: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorNickName?: string;
  partnerReferrerName: string;
  partnerReferrerPhone: string;
  status?: 'active' | 'inactive';
  branchId?: string;
}

export interface CreateClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
  message: string;
}

const createClient = async (payload: CreateClientRequest): Promise<CreateClientResponse> => {
  const { data } = await axiosInstance.post('/clients', payload);
  return data;
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['ho-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};
