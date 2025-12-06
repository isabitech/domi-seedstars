import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from "../../instance/axiosInstance";

export interface CreateEFCCPayload {
  previousAmountOwing?: number; // Only for first record
  todayRemittance: number;
  amtRemittingNow: number;
}

const createEFCC = async (payload: CreateEFCCPayload) => {
    const response = await axiosInstance.post('/efcc/today', payload);
    return response.data;
};

export const useCreateEFCC = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createEFCC,
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['efcc-branch-today'] });
            queryClient.invalidateQueries({ queryKey: ['efcc-ho-summary'] });
            message.success('EFCC record created successfully');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to create EFCC record');
        },
    });
};