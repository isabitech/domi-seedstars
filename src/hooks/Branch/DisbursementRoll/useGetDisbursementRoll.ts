import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";

export interface GetDisbursementRollResponse {
  success: boolean
  data: GetDisbursementRollData
  message: string
  timestamp: string
}

export interface GetDisbursementRollData {
  disbursementRoll: DisbursementRoll
}

export interface DisbursementRoll {
  _id: string
  branch: string
  month: number
  year: number
  previousDisbursement: number
  dailyDisbursement: number
  disbursementRoll: number
  createdAt: string
  updatedAt: string
  __v: number
  disNo: number
}


const getDisbursementRoll = async (month: string, year: string, branchId: string) => {
    const response = await axiosInstance.get(`/disbursement-roll?month=${month}&year=${year}&branchId=${branchId}`);
    return response.data;
}

export const useGetDisbursementRoll = (month: string, year: string, branchId: string) => useQuery({
    queryKey: ['disbursement-roll', month, year, branchId],
    queryFn: () => getDisbursementRoll(month, year, branchId),
    staleTime: 5 * 60 * 1000, // 5 minutes
})