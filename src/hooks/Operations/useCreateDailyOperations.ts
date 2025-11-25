import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { DailyOperations } from './useGetDailyOperations';

export interface CreateDailyOperationsRequest {
  date: string;
  branchId: string;
  tsoData: DailyOperations['tsoData'];
}

export interface CreateDailyOperationsResponse {
  success: boolean;
  data: {
    operations: DailyOperations;
  };
  message: string;
}

const createDailyOperations = async (operationsData: CreateDailyOperationsRequest): Promise<CreateDailyOperationsResponse> => {
  const { data } = await axiosInstance.post('/operations/daily', operationsData);
  return data;
};

export const useCreateDailyOperations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDailyOperations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
    onError: (error) => {
      console.error('Create daily operations error:', error);
    }
  });
};
