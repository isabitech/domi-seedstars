import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"

export interface LoanRegister {
  _id: string
  previousLoanTotal: number
  loanDisbursementWithInterest: number
  loanCollection: number
  currentLoanBalance: number
  date: string
  branch: string
  createdAt: string
  updatedAt: string
  __v: number
}

const getLoanRegister = async (date:string, branchId: string) :Promise<LoanRegister> => {
    const response = await axiosInstance.get(`operations/daily?date=${date}&branchId=${branchId}`);
    return response.data.data.operations.loanRegister;
}


export const useGetLoanRegister = (date:string, branchId: string) => useQuery({
    queryKey: ['loan-register', date, branchId],
    queryFn: () => getLoanRegister(date, branchId),
    enabled: !!date && !!branchId,
})