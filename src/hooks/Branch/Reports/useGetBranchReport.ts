import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../instance/axiosInstance";



export interface GetBranchReportResponse {
  success: boolean
  message: string
  data: GetBranchReportData
}

export interface GetBranchReportData {
  reportData: ReportData
}

export interface GetMonthlyBranchReportResponse {
  success: boolean
  message: string
  data: GetMonthlyBranchReportData
}

export interface GetMonthlyBranchReportData {
  month: number
  year: number
  generatedAt: string
  generatedBy: string
  monthlySummary: MonthlySummary[]
  disbursementRolls: DisbursementRoll[]
  registerMovement: RegisterMovement[]
  reportData?: any
}

export interface ReportData {
  reportDate: string
  generatedAt: string
  generatedBy: string
  operations: Operation[]
}

export interface Operation {
  branch: Branch
  user: User
  cashbook1: Cashbook1
  cashbook2: Cashbook2
  prediction: Prediction
  bankStatements: BankStatements
  registers: Registers
  calculated: Calculated
  status: Status
}

export interface Branch {
  name: string
  code: string
}

export interface User {
  name: string
  email: string
}

export interface Cashbook1 {
  pcih: number
  savings: number
  loanCollection: number
  chargesCollection: number
  total: number
  frmHO: number
  frmBR: number
  cbTotal1: number
}

export interface Cashbook2 {
  disNo: number
  disAmt: number
  disWithInt: number
  savWith: number
  domiBank: number
  posT: number
  cbTotal2: number
}

export interface Prediction {
  predictionNo: number
  predictionAmount: number
}

export interface BankStatements {
  bs1Total: number
  bs2Total: number
}

export interface Registers {
  currentLoanBalance: number
  currentSavings: number
}

export interface Calculated {
  onlineCIH: number
  tso: number
}

export interface Status {
  isCompleted: boolean
  submittedAt: string
}

export interface MonthlySummary {
  branchId: string
  branchName: string
  branchCode: string
  totalSavings: number
  totalLoanCollection: number
  totalCharges: number
  totalDisbursements: number
  totalWithdrawals: number
  totalTSO: number
  operatingDays: number
  avgOnlineCIH: number
}

export interface DisbursementRoll {
  _id: string
  branch: BranchWithId
  month: number
  year: number
  previousDisbursement: number
  dailyDisbursement: number
  disbursementRoll: number
  createdAt: string
  updatedAt: string
}

export interface BranchWithId {
  _id: string
  name: string
  code: string
}

export interface RegisterMovement {
  branchId: string
  branchName: string
  openingLoanBalance: number
  closingLoanBalance: number
  openingSavingsBalance: number
  closingSavingsBalance: number
}

// Type guards for discriminating between response types
export function isDailyReportResponse(
  response: GetBranchReportResponseOptions
): response is GetBranchReportResponse {
  return 'reportData' in response.data;
}

export function isMonthlyReportResponse(
  response: GetBranchReportResponseOptions
): response is GetMonthlyBranchReportResponse {
  return 'monthlySummary' in response.data;
}

export type GetBranchReportResponseOptions = GetBranchReportResponse | GetMonthlyBranchReportResponse;



const getBranchReport = async (
  branchId: string,
  reportType: string,
  date?: string,
  year?: string,
  month?: string
): Promise<GetBranchReportResponseOptions> => {
  const response = await axiosInstance.get(
    `/reports/${reportType}?${
      reportType === "daily" ? `date=${date}` : `month=${month}&year=${year}`
    }&branchId=${branchId}`
  );
  return response.data;
};

export const useGetBranchReport = (
  branchId: string,
  reportType: string,
  date?: string,
  year?: string,
  month?: string
) =>
  useQuery({
    queryKey: ["branch-report"],
    queryFn: () => getBranchReport(branchId, reportType, date, year, month),
  });
