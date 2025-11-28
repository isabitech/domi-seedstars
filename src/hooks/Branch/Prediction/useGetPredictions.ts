import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';

export interface PredictionParams {
	branchId?: string;
	date?: string;
}

export interface Prediction {
	id: string;
	branchId: string;
	date: string;
	predictionNo: number;
	predictionAmount: number;
	submittedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface GetPredictionsResponse {
	success: boolean;
	data: {
		predictions: Prediction[];
	};
	message: string;
}

const getPredictions = async (params: PredictionParams): Promise<GetPredictionsResponse> => {
	const { data } = await axiosInstance.get('/prediction', { params });
	return data;
};

export const useGetPredictions = (params: PredictionParams = {}) => {
	return useQuery({
		queryKey: ['prediction', params],
		queryFn: () => getPredictions(params),
		staleTime: 2 * 60 * 1000,
	});
};
