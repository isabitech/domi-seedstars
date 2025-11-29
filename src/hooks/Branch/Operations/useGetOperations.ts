import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance"

export interface getMyBranchDailyOperationsResponse {
  success: boolean
  data: getMyBranchDailyOperationsData
  message: string
  timestamp: string
}

interface getMyBranchDailyOperationsData {
  operations: Operations
}

 interface Operations {
  _id: string
  onlineCIH: number
  tso: number
  isCompleted: boolean
  date: string
  branch: Branch
  user: User
  cashbook1: Cashbook1
  cashbook2: Cashbook2
  prediction: Prediction
  bankStatement1: BankStatement1
  bankStatement2: BankStatement2
  loanRegister: LoanRegister
  savingsRegister: SavingsRegister
  createdAt: string
  updatedAt: string
  __v: number
  submittedAt: string
}

 interface Branch {
  _id: string
  name: string
  code: string
}

 interface User {
  _id: string
  name: string
  email: string
}

 interface Cashbook1 {
  _id: string
  pcih: number
  savings: number
  loanCollection: number
  chargesCollection: number
  total: number
  frmHO: number
  frmBR: number
  cbTotal1: number
  isSubmitted: boolean
  date: string
  branch: string
  user: string
  createdAt: string
  updatedAt: string
  __v: number
  submittedAt: string
}

 interface Cashbook2 {
  _id: string
  disNo: number
  disAmt: number
  disWithInt: number
  savWith: number
  domiBank: number
  posT: number
  cbTotal2: number
  isSubmitted: boolean
  date: string
  branch: string
  user: string
  createdAt: string
  updatedAt: string
  __v: number
  submittedAt: string
}

 interface Prediction {
  _id: string
  predictionNo: number
  predictionAmount: number
  date: string
  branch: string
  user: string
  predictionDate: string
  createdAt: string
  updatedAt: string
  __v: number
}

 interface BankStatement1 {
  _id: string
  opening: number
  recHO: number
  recBO: number
  domi: number
  pa: number
  bs1Total: number
  date: string
  branch: string
  createdAt: string
  updatedAt: string
  __v: number
}

 interface BankStatement2 {
  _id: string
  withd: number
  tbo: number
  exAmt: number
  bs2Total: number
  date: string
  branch: string
  user: string
  exPurpose: string
  createdAt: string
  updatedAt: string
  __v: number
}

 interface LoanRegister {
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

 interface SavingsRegister {
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


const getMyBranchDailyOperations = async (date: string):Promise<getMyBranchDailyOperationsResponse> => {
    const response = await axiosInstance.get(`/operations/daily?date=${date}`);
    return response.data;
} 

export const useGetMyBranchDailyOperations = (date: string) => useQuery({
    queryKey: ['my-branch-daily-operations', date],
    queryFn: () => getMyBranchDailyOperations(date),
})