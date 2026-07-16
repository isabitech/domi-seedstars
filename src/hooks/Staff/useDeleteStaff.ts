import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DeleteStaffResponse {
  success: boolean;
  message: string;
}

const deleteStaff = async (id: string): Promise<DeleteStaffResponse> => {
  const { data } = await axiosInstance.delete(`/staff/${id}`);
  return data;
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};
