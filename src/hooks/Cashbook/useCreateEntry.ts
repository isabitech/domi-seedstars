import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

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
  branchId: string;
  date: string;
  cashbook1: Partial<CashbookEntry['cashbook1']>;
  cashbook2: Partial<CashbookEntry['cashbook2']>;
}

export interface CreateCashbookEntryResponse {
  success: boolean;
  data: {
    entry: CashbookEntry;
  };
  message: string;
}

const createCashbookEntry = async (entryData: CreateCashbookEntryRequest): Promise<CreateCashbookEntryResponse> => {
  const { data } = await axiosInstance.post('/cashbook', entryData);
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
