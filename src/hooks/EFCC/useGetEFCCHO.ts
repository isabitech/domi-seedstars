import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";

export interface EFCCBranchSummary {
  branch: {
    _id: string;
    name: string;
    code: string;
  };
  previousAmountOwing: number;
  todayRemittance: number;
  amtRemittingNow: number;
  currentAmountOwing: number;
  submittedAt?: string;
  submittedBy?: {
    _id: string;
    username: string;
  };
  isSubmitted: boolean;
  hasRecord: boolean;
}

export interface EFCCHOSummary {
  date: string;
  branches: EFCCBranchSummary[];
  totals: {
    totalPreviousOwing: number;
    totalTodayRemittance: number;
    totalAmtRemittingNow: number;
    totalCurrentOwing: number;
  };
  summary: {
    totalBranches: number;
    submittedToday: number;
    pendingSubmission: number;
  };
}

const getEFCCHOSummary = async (date?: string): Promise<EFCCHOSummary> => {
    const params = date ? `?date=${date}` : '';
    const response = await axiosInstance.get(`/efcc/summary/all-branches${params}`);
    return response.data.data;
};

export const useGetEFCCHO = (date?: string) => {
    return useQuery({
        queryKey: ['efcc-ho-summary', date],
        queryFn: () => getEFCCHOSummary(date),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};