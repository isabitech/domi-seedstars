import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Investor, InvestorStatus } from './useListInvestors';

export interface CreateInvestorRequest {
  investorName: string;
  gender: 'male' | 'female';
  phone: string;
  rioDate: string;
  status: InvestorStatus;
}

export interface CreateInvestorResponse {
  success: boolean;
  data: {
    investor: Investor;
  };
  message: string;
}

const createInvestor = async (payload: CreateInvestorRequest): Promise<CreateInvestorResponse> => {
  const { data } = await axiosInstance.post('/investors', payload);
  return data;
};

export const useCreateInvestor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvestor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};