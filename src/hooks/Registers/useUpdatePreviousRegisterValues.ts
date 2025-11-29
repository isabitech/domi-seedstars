import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface UpdatePreviousRegisterValuesRequest {
	previous: number;
	type: 'loan' | 'savings';
	branchId: string;
}

export interface UpdatePreviousRegisterValuesResponse {
	success: boolean;
	data: {
		register: {
			id: string;
			branchId: string;
			previous: number;
			type: 'loan' | 'savings';
			updatedAt: string;
		};
	};
	message: string;
}

const updatePreviousRegisterValues = async (updateData: UpdatePreviousRegisterValuesRequest): Promise<UpdatePreviousRegisterValuesResponse> => {
	const { data } = await axiosInstance.patch('/registers/previous', updateData);
	return data;
};

export const useUpdatePreviousRegisterValues = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updatePreviousRegisterValues,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['registers'] });
		},
		onError: (error) => {
			console.error('Update previous register values error:', error);
		}
	});
};
