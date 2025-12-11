import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from "../../instance/axiosInstance";

const deleteAmountNeedTomorrow = async (id: string) => {
    const response = await axiosInstance.delete(`/amount-need-tomorrow/${id}`);
    return response.data;
};

export const useDeleteAmountNeedTomorrow = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteAmountNeedTomorrow,
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['amount-need-tomorrow-branch-today'] });
            queryClient.invalidateQueries({ queryKey: ['amount-need-tomorrow-ho-summary'] });
            queryClient.invalidateQueries({ queryKey: ['amount-need-tomorrow-history'] });
            message.success('Amount need tomorrow entry deleted successfully');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to delete amount need tomorrow entry');
        },
    });
};