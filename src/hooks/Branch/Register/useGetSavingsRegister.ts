import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"

export interface SavingsRegister {
  _id: string
  previousSavingsTotal: number
  savings: number
  savingsWithdrawal: number
  currentSavings: number
  date: string
  branch: string
  createdAt: string
  updatedAt: string
  __v: number
}

const getSavingsRegister = async (date:string, branchId: string) :Promise<SavingsRegister> => {
    const response = await axiosInstance.get(`operations/daily?date=${date}&branchId=${branchId}`);
    return response.data.data.operations.savingsRegister;
}


export const useGetSavingsRegister = (date:string, branchId: string) => useQuery({
    queryKey: ['savings-register', date, branchId],
    queryFn: () => getSavingsRegister(date, branchId),
    enabled: !!date && !!branchId,
})