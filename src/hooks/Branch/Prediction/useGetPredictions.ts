import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';

export interface PredictionParams {
	branchId?: string;
	date?: string;
}

export interface GetPredictionsResponse {
  success: boolean
  data: PredictionData
  message: string
  timestamp: string
}

export interface PredictionData {
  prediction: Prediction
}

export interface Prediction {
  _id: string
  predictionNo: number
  predictionAmount: number
  date: string
  branch: string
  user: string
  predictionDate: string
  createdAt: string
  updatedAt: string
  __v: number
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
