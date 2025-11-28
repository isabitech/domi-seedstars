import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Prediction } from './useGetPredictions';

export interface UpdatePredictionRequest {
	predictionId: string;
	branchId: string;
	date: string;
	predictionNo: number;
	predictionAmount: number;
}

export interface UpdatePredictionResponse {
	success: boolean;
	data: {
		prediction: Prediction;
	};
	message: string;
}

const updatePrediction = async (predictionData: UpdatePredictionRequest): Promise<UpdatePredictionResponse> => {
	const { predictionId, ...updateData } = predictionData;
	const { data } = await axiosInstance.put(`/prediction/${predictionId}`, updateData);
	return data;
};

export const useUpdatePrediction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updatePrediction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['prediction'] });
		},
		onError: (error) => {
			console.error('Update prediction error:', error);
		}
	});
};