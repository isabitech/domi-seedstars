export interface GetCashbookEntryResponse {
  success: boolean
  data: GetEntryData
  message: string
  timestamp: string
}

export interface GetEntryData {
  operations: Operations
}

export interface Operations {
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
