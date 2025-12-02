
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';


export interface ListAllDailyOperationsResponse {
  success: boolean
  data: Data
  message: string
  timestamp: string
}

export interface Data {
  operations: Operation[]
  total: number
  totals: Totals
}

export interface Operation {
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
  disbursementRoll: DisbursementRoll
  createdAt: string
  updatedAt: string
  __v: number
  predictions: Predictions
}

export interface Branch {
  _id: string
  name: string
  code: string
}

export interface User {
  _id: string
  name: string
  email: string
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
}

export interface Prediction {
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

export interface BankStatement1 {
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

export interface BankStatement2 {
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

export interface Predictions {
  predictionNo: number
  predictionAmount: number
}

export interface Totals {
  totalCollections: number
  totalDisbursementNumber: number
  totalDisbursementAmount: number
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
  previousDisbursementRollNo?: number
  disNo?: number
  disAmt?: number
}

const listAllDailyOperations = async (date: string) :Promise<ListAllDailyOperationsResponse> => {
    const response = await axiosInstance.get(`/operations/all?date=${date}`);
    return response.data;
}

export const useListAllDailyOperations = (date: string) => useQuery({
    queryKey: ['all-daily-operations', date],
    queryFn: () => listAllDailyOperations(date),
    enabled: !!date,
})