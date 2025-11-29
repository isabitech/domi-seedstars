import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DailyOperations {
  id: string;
  date: string;
  branchId: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  tsoData: {
    onlineCIH: number;
    tso: number;
    prediction: {
      predictionNo: number;
      predictionAmount: number;
    };
    loanRegister: {
      currentBalance: number;
      previousTotal: number;
    };
    savingsRegister: {
      currentSavings: number;
      previousTotal: number;
    };
    bankStatement1: {
      opening: number;
      recHO: number;
      recBO: number;
      domi: number;
      pa: number;
      bs1Total: number;
    };
    bankStatement2: {
      withd: number;
      tbo: number;
      exAmt: number;
      exPurpose: string;
      bs2Total: number;
    };
    disbursementRoll: {
      previousDisbursement: number;
      dailyDisbursement: number;
      total: number;
    };
  };
  status: 'draft' | 'submitted' | 'approved';
  submittedBy?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetDailyOperationsParams {
  date?: string;
  branchId?: string;
}

export interface GetDailyOperationsResponse {
  success: boolean;
  data: {
    operations: DailyOperations[];
  };
  message: string;
}

const getDailyOperations = async (params: GetDailyOperationsParams): Promise<GetDailyOperationsResponse> => {
  const { data } = await axiosInstance.get('/operations/daily', { params });
  return data;
};

export const useGetDailyOperations = (params: GetDailyOperationsParams = {}) => {
  return useQuery({
    queryKey: ['operations', 'daily', params],
    queryFn: () => getDailyOperations(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
