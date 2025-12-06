import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from "../../instance/axiosInstance";

export interface UpdateEFCCPayload {
  todayRemittance: number;
  amtRemittingNow: number;
  previousAmountOwing?: number; // Only for first record
}

const updateEFCC = async (payload: UpdateEFCCPayload) => {
    const response = await axiosInstance.post('/efcc/today', payload);
    return response.data;
};

export const useUpdateEFCC = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateEFCC,
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['efcc-branch-today'] });
            queryClient.invalidateQueries({ queryKey: ['efcc-ho-summary'] });
            message.success('EFCC record updated successfully');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to update EFCC record');
        },
    });
};