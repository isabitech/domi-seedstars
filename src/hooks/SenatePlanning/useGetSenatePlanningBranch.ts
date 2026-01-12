import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface SenatePlanningRecord {
  id: string;
  branchId: string;
  noOfDisbursement: number;
  disbursementAmount: number;
  amountToClients: number;
  loanAmount?: number; // for backward compatibility
  savingsWithdrawalAmount?: number; // for backward compatibility
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SenatePlanningBranchResponse {
  senatePlanning: SenatePlanningRecord | null;
}

const getSenatePlanningBranch = async (): Promise<SenatePlanningBranchResponse> => {
  const { data } = await axiosInstance.get('/senate-planning/branch');
  return data;
};

export const useGetSenatePlanningBranch = () => {
  return useQuery({
    queryKey: ['senate-planning', 'branch'],
    queryFn: getSenatePlanningBranch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};