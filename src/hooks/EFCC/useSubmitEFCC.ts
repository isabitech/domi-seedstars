import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import axiosInstance from "../../instance/axiosInstance";

const submitEFCC = async () => {
    const response = await axiosInstance.patch('/efcc/today/submit');
    return response.data;
};

export const useSubmitEFCC = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: submitEFCC,
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['efcc-branch-today'] });
            queryClient.invalidateQueries({ queryKey: ['efcc-ho-summary'] });
            message.success('EFCC record submitted successfully');
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to submit EFCC record');
        },
    });
};