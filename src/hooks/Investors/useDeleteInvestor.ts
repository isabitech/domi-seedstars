import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DeleteInvestorResponse {
  success: boolean;
  message: string;
}

const deleteInvestor = async (id: string): Promise<DeleteInvestorResponse> => {
  const { data } = await axiosInstance.delete(`/investors/${id}`);
  return data;
};

export const useDeleteInvestor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvestor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
};