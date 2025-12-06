import { useQuery } from '@tanstack/react-query';
import axiosInstance from "../../instance/axiosInstance";

export interface EFCCBranchResponse {
  success: boolean
  data: Data
  message: string
  timestamp: string
}

export interface Data {
  efcc: Efcc
}

export interface Efcc {
  _id: string
  branch: Branch
  date: string
  previousAmountOwing: number
  todayRemittance: number
  amtRemittingNow: number
  currentAmountOwing: number
  submittedAt: any
  submittedBy: string
  isSubmitted: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Branch {
  _id: string
  name: string
  code: string
}

const getEFCCToday = async (): Promise<Data | null> => {
    const response = await axiosInstance.get('/efcc/today');
    return response.data.data;
};

export const useGetEFCCBranch = () => {
    return useQuery({
        queryKey: ['efcc-branch-today'],
        queryFn: getEFCCToday,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};