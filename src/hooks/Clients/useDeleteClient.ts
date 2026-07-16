import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DeleteClientResponse {
  success: boolean;
  message: string;
}

const deleteClient = async (id: string): Promise<DeleteClientResponse> => {
  const { data } = await axiosInstance.delete(`/clients/${id}`);
  return data;
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['ho-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};
