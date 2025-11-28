import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { Prediction } from './useGetPredictions';

export interface GetPredictionResponse {
	success: boolean;
	data: {
		prediction: Prediction;
	};
	message: string;
}

const getPrediction = async (branchId: string, date: string): Promise<GetPredictionResponse> => {
	const { data } = await axiosInstance.get(`/prediction/${branchId}/${date}`);
	return data;
};

export const useGetPrediction = (branchId: string, date: string, options?: any) => {
	return useQuery({
		queryKey: ['prediction', branchId, date],
		queryFn: () => getPrediction(branchId, date),
		staleTime: 2 * 60 * 1000,
		enabled: !!branchId && !!date,
		...options
	});
};