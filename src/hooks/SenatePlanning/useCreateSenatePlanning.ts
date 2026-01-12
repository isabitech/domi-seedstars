import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '../../instance/axiosInstance';

export interface CreateSenatePlanningPayload {
  noOfDisbursement: number;
  disbursementAmount: number;
  amountToClients: number;
  notes?: string;
}

const createSenatePlanning = async (payload: CreateSenatePlanningPayload) => {
  const { data } = await axiosInstance.post('/senate-planning', payload);
  return data;
};

export const useCreateSenatePlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSenatePlanning,
    onSuccess: () => {
      // Invalidate and refetch senate planning data
      queryClient.invalidateQueries({ queryKey: ['senate-planning'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create Senate Planning record';
      toast.error(errorMessage);
      throw error;
    },
  });
};