import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { CashbookEntry } from './useCreateEntry';

export interface UpdateEntryStatusRequest {
  id: string;
  status: 'draft' | 'submitted' | 'approved';
}

export interface UpdateEntryStatusResponse {
  success: boolean;
  data: {
    entry: CashbookEntry;
  };
  message: string;
}

const updateEntryStatus = async ({ id, status }: UpdateEntryStatusRequest): Promise<UpdateEntryStatusResponse> => {
  const { data } = await axiosInstance.patch(`/cashbook/${id}/status`, { status });
  return data;
};

export const useUpdateEntryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEntryStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook', 'entry', variables.id] });
    },
    onError: (error) => {
      console.error('Update entry status error:', error);
    }
  });
};
