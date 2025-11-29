import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";


export interface BranchDashboardResponse {
  success: boolean
  data: BranchDashboardData
  message: string
  timestamp: string
}

export interface BranchDashboardData {
  dashboardData: DashboardData
}

export interface DashboardData {
  todayOperations: TodayOperations
  summary: Summary
  trendData: TrendDaum[]
  currentRegisters: CurrentRegisters
}

export interface TodayOperations {
  _id: string
  onlineCIH: number
  tso: number
  isCompleted: boolean
  date: string
  branch: string
  user: string
  cashbook1: Cashbook1
  cashbook2: Cashbook2
  prediction: string
  bankStatement1: string
  bankStatement2: string
  loanRegister: LoanRegister
  savingsRegister: SavingsRegister
  createdAt: string
  updatedAt: string
  __v: number
  submittedAt: string
}

export interface Cashbook1 {
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

export interface Cashbook2 {
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

export interface Summary {
  totalSavings: number
  totalLoanCollection: number
  totalCharges: number
  totalDisbursements: number
  totalWithdrawals: number
  avgOnlineCIH: number
  totalTSO: number
  operationDays: number
}

export interface TrendDaum {
  date: string
  savings: number
  disbursements: number
  onlineCIH: number
  tso: number
}

export interface CurrentRegisters {
  loanBalance: number
  savingsBalance: number
  monthlyDisbursement: number
}


const getBranchDashboard = async ():Promise<BranchDashboardResponse> => {
  const { data } = await axiosInstance.get(`/dashboard/branch`);
  return data;
}


export const useGetBranchDashboard = () => useQuery({
    queryKey: ['branch', 'dashboard'],
    queryFn: getBranchDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
})