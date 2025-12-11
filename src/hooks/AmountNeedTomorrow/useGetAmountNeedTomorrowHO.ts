import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";

export interface AmountNeedTomorrowBranchSummary {
  _id: string;
  branch: string;
  branchName: string;
  branchCode: string;
  date: string;
  loanAmount: number;
  savingsWithdrawalAmount: number;
  expensesAmount: number;
  total: number;
  notes?: string;
  submittedByUser: {
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AmountNeedTomorrowHOSummary {
  data: AmountNeedTomorrowBranchSummary[];
  count: number;
}

const getAmountNeedTomorrowHOSummary = async (date?: string): Promise<AmountNeedTomorrowHOSummary> => {
    const params = date ? `?date=${date}` : '';
    const response = await axiosInstance.get(`/amount-need-tomorrow/all${params}`);
    return response.data;
};

export const useGetAmountNeedTomorrowHO = (date?: string) => {
    return useQuery({
        queryKey: ['amount-need-tomorrow-ho-summary', date],
        queryFn: () => getAmountNeedTomorrowHOSummary(date),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};