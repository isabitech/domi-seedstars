import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DeleteCashbookEntryResponse {
  success: boolean;
  message: string;
}

const deleteCashbookEntry = async (id: string): Promise<DeleteCashbookEntryResponse> => {
  const { data } = await axiosInstance.delete(`/cashbook/${id}`);
  return data;
};

export const useDeleteEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCashbookEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
    },
    onError: (error) => {
      console.error('Delete cashbook entry error:', error);
    }
  });
};
