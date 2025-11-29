// User and Authentication Types
export type UserRole = 'HO' | 'BR';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  branchId?: string; // Only for BR users
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  users: User[];
}

// Cashbook Types
export interface Cashbook1 {
  id: string;
  date: string;
  branchId?: string;
  pcih: number; // Previous Cash in Hand
  savings: number;
  loanCollection: number;
  charges: number;
  total: number; // Auto-calculated
  frmHO: number; // Fund from HO (HO only)
  frmBR: number; // Fund from BR (HO only)
  cbTotal1: number; // Auto-calculated
  submittedBy?: string;
  submittedAt?: string;
}

export interface Cashbook2 {
  id: string;
  date: string;
  branchId: string;
  disNo: number; // Disbursement Number
  disAmt: number; // Disbursement Amount
  disWithInt: number; // Disbursement with Interest
  savWith: number; // Savings Withdrawal
  domiBank: number; // Total available cash at branch
  posT: number; // POS transfers
  cbTotal2: number; // Auto-calculated
  submittedBy: string;
  submittedAt: string;
}

// Calculation Types
export interface OnlineCIH {
  date: string;
  branchId: string;
  amount: number; // CB TOTAL 1 - CB TOTAL 2
}

export interface LoanRegister {
  id: string;
  branchId: string;
  currentLoanBalance: number;
  previousLoanTotal: number; // HO input
  date: string;
}

export interface SavingsRegister {
  id: string;
  branchId: string;
  currentSavings: number;
  previousSavingsTotal: number; // HO input
  date: string;
}

// Prediction Types
export interface Prediction {
  id: string;
  date: string;
  branchId: string;
  predictionNo: number;
  predictionAmount: number;
  submittedBy: string;
}

// Bank Statement Types
export interface BankStatement1 {
  id: string;
  date: string;
  branchId: string;
  opening: number; // Always 0
  recHO: number; // From FRM HO
  recBO: number; // From FRM BR
  domi: number; // From DOMI BANK
  pa: number; // From POS/T
  bs1Total: number; // Auto-calculated
}

export interface BankStatement2 {
  id: string;
  date: string;
  branchId: string;
  withd: number; // From FRM HO
  tbo: number; // Transfer between offices (HO only)
  exAmt: number; // Expense amount
  exPurpose: string; // Expense purpose
  bs2Total: number; // Auto-calculated
  submittedBy: string;
}

export interface TransferToSenate {
  date: string;
  branchId: string;
  amount: number; // BS1 - BS2
}

export interface DisbursementRoll {
  id: string;
  branchId: string;
  month: string;
  previousDisbursement: number; // HO input
  currentDisbursement: number; // From daily DIS AMT
  total: number;
}

export interface CurrentBranchRegisterSavings {
  branchId: string;
  date: string;
  savings: number; // From Cashbook1 SAVINGS field
  previousTotalSavings: number; // HO input
  savingsWithdrawal: number; // From Cashbook2 SAV WITH field
  total: number; // savings + previousTotalSavings - savingsWithdrawal
}

export interface CurrentBranchRegisterLoan {
  branchId: string;
  date: string;
  previousTotalLoanDisbursed: number; // HO input
  loanDisbursementWithInterest: number; // From Cashbook2 DIS WIT INT field
  loanCollection: number; // From Cashbook1 Loan collection field
  total: number; // previousTotalLoanDisbursed + loanDisbursementWithInterest - loanCollection
}

export interface BranchDailyReportData {
  branchId: string;
  branchName: string;
  date: string;
  
  // Cashbook 1 data
  cashbook1: {
    pcih: number;
    savings: number;
    loanCollection: number;
    charges: number;
    collectionTotal: number; // savings + loanCollection + charges
    frmHO: number;
    frmBR: number;
    cbTotal1: number; // PCIH + savings + loan + charges + frmHO + frmBR
  };
  
  // Cashbook 2 data
  cashbook2: {
    disNo: number;
    disAmt: number;
    disWithInt: number;
    savWith: number;
    domiBank: number;
    posT: number;
    cbTotal2: number; // disAmt + savWith + domiBank + posT
  };
  
  // Online CIH
  onlineCIH: number; // cbTotal1 - cbTotal2
  
  // Bank Statement 1
  bankStatement1: {
    opening: number;
    recHO: number; // from frmHO
    recBO: number; // from frmBR
    domi: number; // from domiBank
    pa: number; // from posT
    bs1Total: number; // opening + recHO + recBO + domi + pa
  };
  
  // Bank Statement 2
  bankStatement2: {
    withd: number; // from frmHO
    tbo: number; // HO input
    tboToBranch?: string; // branch name for transfer
    exAmt: number;
    exPurpose?: string;
    bs2Total: number; // withd + tbo + exAmt
  };
  
  // TSO
  tso: number; // bs1Total - bs2Total
  
  // Current Branch Register
  cbrSavings: number;
  cbrLoan: number;
  
  // Disbursement Roll
  disbursementRoll: number;
}

// Dashboard Types
export interface DashboardData {
  branch: Branch;
  cashbook1: Cashbook1 | null;
  cashbook2: Cashbook2 | null;
  onlineCIH: OnlineCIH | null;
  loanRegister: LoanRegister | null;
  savingsRegister: SavingsRegister | null;
  prediction: Prediction | null;
  bankStatement1: BankStatement1 | null;
  bankStatement2: BankStatement2 | null;
  transferToSenate: TransferToSenate | null;
}

// Report Types
export interface DailyReport {
  date: string;
  branchId: string;
  branchName: string;
  cashbook1: Cashbook1;
  cashbook2: Cashbook2;
  calculations: {
    onlineCIH: number;
    transferToSenate: number;
  };
}

export interface MonthlyReport {
  month: string;
  branchId: string;
  branchName: string;
  totalSavings: number;
  totalLoans: number;
  totalDisbursements: number;
  totalCollections: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface BranchForm {
  name: string;
  code: string;
  location: string;
  email: string;
  password: string;
}

export interface UserForm {
  username: string;
  password: string;
  role: UserRole;
  branchId?: string;
}