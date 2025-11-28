import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';
import type { CashbookEntry } from './useCreateEntry';

export interface UpdateCashbookEntryRequest {
  id: string;
  cashbook1?: Partial<CashbookEntry['cashbook1']>;
  cashbook2?: Partial<CashbookEntry['cashbook2']>;
}

export interface UpdateCashbookEntryResponse {
  success: boolean;
  data: {
    entry: CashbookEntry;
  };
  message: string;
}

const updateCashbookEntry = async ({ id, ...updateData }: UpdateCashbookEntryRequest): Promise<UpdateCashbookEntryResponse> => {
  const { data } = await axiosInstance.put(`/cashbook/${id}`, updateData);
  return data;
};

export const useUpdateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCashbookEntry,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook', 'entry', variables.id] });
    },
    onError: (error) => {
      console.error('Update cashbook entry error:', error);
    }
  });
};
