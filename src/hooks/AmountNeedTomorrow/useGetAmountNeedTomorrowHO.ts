import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";


export interface AmountNeedTomorrowHOSummary {
  success: boolean
  data: AmountNeedTomorrowBranchSummary[]
  count: number
}

export interface AmountNeedTomorrowBranchSummary {
  _id: string
  branch: string
  date: string
  loanAmount: number
  savingsWithdrawalAmount: number
  expensesAmount: number
  total: number
  notes: string
  submittedBy: string
  createdAt: string
  updatedAt: string
  __v: number
  branchName: string
  branchCode: string
  submittedByUser?: SubmittedByUser | null
}

export interface SubmittedByUser {
  username: string
  email: string
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