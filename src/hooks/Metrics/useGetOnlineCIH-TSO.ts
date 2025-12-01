import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface OnlineCIHTSOParams {
  date?: string; // YYYY-MM-DD format
}

export interface OnlineCIHTSOMetric {
  branch: {
    id: string;
    name: string;
    code: string;
  };
  onlineCIH: number;
  tso: number;
  date: string;
}

export interface OnlineCIHTSOData {
  date: string;
  generatedAt: string;
  generatedBy: string;
  metrics: OnlineCIHTSOMetric[];
  totals: {
    totalOnlineCIH: number;
    totalTSO: number;
    branchCount: number;
  };
  raw: OnlineCIHTSOMetric[];
}

export interface GetOnlineCIHTSOResponse {
  success: boolean;
  data: OnlineCIHTSOData;
  message: string;
}

const getOnlineCIHTSO = async (params: OnlineCIHTSOParams): Promise<GetOnlineCIHTSOResponse> => {
  const { data } = await axiosInstance.get('/metrics/online-cih-tso', { params });
  return data;
};

export const useGetOnlineCIHTSO = (params: OnlineCIHTSOParams = {}) => {
  return useQuery({
    queryKey: ['metrics', 'online-cih-tso', params],
    queryFn: () => getOnlineCIHTSO(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
