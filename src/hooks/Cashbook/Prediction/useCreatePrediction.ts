import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';

export interface CreatePredictionRequest {
	branchId: string;
	date: string;
	predictionNo: number;
	predictionAmount: number;
}

export interface CreatePredictionResponse {
	success: boolean;
	data: {
		prediction: {
			id: string;
			branchId: string;
			date: string;
			predictionNo: number;
			predictionAmount: number;
			submittedBy: string;
			createdAt: string;
			updatedAt: string;
		};
	};
	message: string;
}

const createPrediction = async (predictionData: CreatePredictionRequest): Promise<CreatePredictionResponse> => {
	const { data } = await axiosInstance.post('/operations/daily', predictionData);
	return data;
};

export const useCreatePrediction = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPrediction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['prediction'] });
		},
		onError: (error) => {
			console.error('Create prediction error:', error);
		}
	});
};
