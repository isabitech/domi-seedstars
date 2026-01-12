import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from "../../instance/axiosInstance";
import type { CreateAmountNeedTomorrowPayload } from './useCreateAmountNeedTomorrow';

const updateAmountNeedTomorrow = async (payload: CreateAmountNeedTomorrowPayload) => {
    const response = await axiosInstance.post('/amount-need-tomorrow', payload);
    return response.data;
};

export const useUpdateAmountNeedTomorrow = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateAmountNeedTomorrow,
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['amount-need-tomorrow-branch-today'] });
            queryClient.invalidateQueries({ queryKey: ['amount-need-tomorrow-ho-summary'] });
            queryClient.invalidateQueries({ queryKey: ['amount-need-tomorrow-history'] });
            message.success('Senate Planning updated successfully');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to update Senate Planning');
        },
    });
};