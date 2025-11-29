import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../instance/axiosInstance';

export interface CashbookEntry {
  id: string;
  branchId: string;
  date: string;
  cashbook1: {
    pcih: number;
    savings: number;
    loanCollection: number;
    chargesCollection: number;
    total: number;
    frmHO: number;
    frmBR: number;
    cbTotal1: number;
  };
  cashbook2: {
    disNo: number;
    disAmt: number;
    disWitInt: number;
    savWith: number;
    domiBank: number;
    posT: number;
    cbTotal2: number;
  };
  onlineCIH: number;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCashbookEntryRequest {
  date: string;
  pcih: number;
  // Cashbook 1 fields
    savings: number;
    loanCollection: number;
    chargesCollection: number;
    total: number;
    frmHO: number;
    frmBR: number;
    cbTotal1: number;
    // Cashbook 2 fields
  disNo: number;
    disAmt: number;
    disWithInt: number;
    savWith: number;
    domiBank: number;
    posT: number;
    cbTotal2: number;
    // onlinecih
    onlineCIH: number;

}



export interface CreateCashbookEntryResponse {
  success: boolean
  data: Data
  message: string
  timestamp: string
}

export interface Data {
  dailyOps: DailyOps
}

export interface DailyOps {
  onlineCIH: number
  tso: number
  isCompleted: boolean
  _id: string
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


const createCashbookEntry = async (entryData: CreateCashbookEntryRequest): Promise<CreateCashbookEntryResponse> => {
  const { data } = await axiosInstance.post('/operations/daily', entryData);
  return data;
};

export const useCreateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashbookEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
    },
    onError: (error) => {
      console.error('Create cashbook entry error:', error);
    }
  });
};
