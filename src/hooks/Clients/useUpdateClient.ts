import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Client } from './useListClients';

export interface UpdateClientRequest {
  id: string;
  union?: string;
  clientName?: string;
  clientPhone?: string;
  clientNickName?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorNickName?: string;
  partnerReferrerName?: string;
  partnerReferrerPhone?: string;
  partnerReferrerNickName?: string;
  status?: 'active' | 'inactive';
  clientCategory?: 'loan_only' | 'savings_only' | 'loan_and_savings';
  disbursementDate?: string;
}

export interface UpdateClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
  message: string;
}

const updateClient = async ({ id, ...payload }: UpdateClientRequest): Promise<UpdateClientResponse> => {
  const { data } = await axiosInstance.put(`/clients/${id}`, payload);
  return data;
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['ho-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};
