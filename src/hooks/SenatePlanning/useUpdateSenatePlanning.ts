import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdateSenatePlanningPayload {
  noOfDisbursement: number;
  disbursementAmount: number;
  amountToClients: number;
  notes?: string;
}

const updateSenatePlanning = async (payload: UpdateSenatePlanningPayload) => {
  const { data } = await axiosInstance.put('/senate-planning', payload);
  return data;
};

export const useUpdateSenatePlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSenatePlanning,
    onSuccess: () => {
      // Invalidate and refetch senate planning data
      queryClient.invalidateQueries({ queryKey: ['senate-planning'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to update Senate Planning record';
      toast.error(errorMessage);
      throw error;
    },
  });
};