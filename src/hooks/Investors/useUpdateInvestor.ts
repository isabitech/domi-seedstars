import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Investor, InvestorStatus } from './useListInvestors';

export interface UpdateInvestorRequest {
  id: string;
  investorName?: string;
  gender?: 'male' | 'female';
  phone?: string;
  rioDate?: string;
  status?: InvestorStatus;
}

export interface UpdateInvestorResponse {
  success: boolean;
  data: {
    investor: Investor;
  };
  message: string;
}

const updateInvestor = async ({ id, ...payload }: UpdateInvestorRequest): Promise<UpdateInvestorResponse> => {
  const { data } = await axiosInstance.put(`/investors/${id}`, payload);
  return data;
};

export const useUpdateInvestor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvestor,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      queryClient.invalidateQueries({ queryKey: ['investors', variables.id] });
    },
  });
};