import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface ConsolidatedReportParams {
  startDate?: string;
  endDate?: string;
}

export interface Root {
  success: boolean
  data: Data
  message: string
  timestamp: string
}

export interface Data {
  reportData: ReportData
}

export interface ReportData {
  period: Period
  generatedAt: string
  generatedBy: string
  consolidatedData: ConsolidatedDaum[]
  grandTotals: GrandTotals
  currentRegisters: CurrentRegister[]
}

export interface Period {
  startDate: string
  endDate: string
  scope: string
}

export interface ConsolidatedDaum {
  _id: string
  branchName: string
  branchCode: string
  totalSavings: number
  totalLoanCollection: number
  totalCharges: number
  totalDisbursements: number
  totalWithdrawals: number
  totalTSO: number
  avgOnlineCIH: number
  operatingDays: number
  lastOperationDate: string
}

export interface GrandTotals {
  totalSavings: number
  totalLoanCollection: number
  totalCharges: number
  totalDisbursements: number
  totalWithdrawals: number
  totalTSO: number
  totalOnlineCIH: number
  activeBranches: string[]
  totalOperations: number
}

export interface CurrentRegister {
  _id: string
  name: string
  code: string
  currentLoanBalance: number
  currentSavingsBalance: number
}
export type GetConsolidatedReportResponse = Root;

const getConsolidatedReport = async (params: ConsolidatedReportParams): Promise<GetConsolidatedReportResponse> => {
  const { data } = await axiosInstance.get('/reports/consolidated', { params });
  return data;
};

export const useGetConsolidatedReport = (params: ConsolidatedReportParams = {}) => {
  return useQuery({
    queryKey: ['reports', 'consolidated', params],
    queryFn: () => getConsolidatedReport(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
