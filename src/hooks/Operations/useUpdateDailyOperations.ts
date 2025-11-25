import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { DailyOperations } from './useGetDailyOperations';

export interface UpdateDailyOperationsRequest {
  id: string;
  tsoData?: Partial<DailyOperations['tsoData']>;
  submittedBy?: string;
}

export interface UpdateDailyOperationsResponse {
  success: boolean;
  data: {
    operations: DailyOperations;
  };
  message: string;
}

const updateDailyOperations = async ({ id, ...updateData }: UpdateDailyOperationsRequest): Promise<UpdateDailyOperationsResponse> => {
  const { data } = await axiosInstance.patch(`/operations/daily/${id}/submit`, updateData);
  return data;
};

export const useUpdateDailyOperations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDailyOperations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
    onError: (error) => {
      console.error('Update daily operations error:', error);
    }
  });
};
