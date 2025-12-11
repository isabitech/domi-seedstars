import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";

export interface AmountNeedTomorrowBranchResponse {
  success: boolean;
  data: AmountNeedTomorrowData;
  message: string;
  timestamp: string;
}

export interface AmountNeedTomorrowData {
  amountNeedTomorrow: AmountNeedTomorrow;
}

export interface AmountNeedTomorrow {
  _id: string;
  branch: Branch;
  date: string;
  loanAmount: number;
  savingsWithdrawalAmount: number;
  expensesAmount: number;
  total: number;
  notes?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Branch {
  _id: string;
  name: string;
  code: string;
}

const getAmountNeedTomorrowToday = async (): Promise<AmountNeedTomorrowData | null> => {
    const response = await axiosInstance.get('/amount-need-tomorrow');
    return response.data.data;
};

export const useGetAmountNeedTomorrowBranch = () => {
    return useQuery({
        queryKey: ['amount-need-tomorrow-branch-today'],
        queryFn: getAmountNeedTomorrowToday,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};