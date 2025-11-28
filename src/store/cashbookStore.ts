import { create } from 'zustand';

// Define types for our cashbook data
export interface CB1Type {
  pcih: number;
  savings: number;
  loanCollection: number;
  chargesCollection: number;
  total: number;
  frmHO: number;
  frmBR: number;
  cbTotal1: number;
}

export interface CB2Type {
  disNo: number;
  disAmt: number;
  disWithInt: number;
  savWith: number;
  domiBank: number;
  posT: number;
  cbTotal2: number;
}

interface CashbookStore {
  cashbook1: CB1Type | null;
  cashbook2: CB2Type | null;
  
  // Actions
  setCashbook1: (data: CB1Type) => void;
  setCashbook2: (data: CB2Type) => void;
  clearCashbookData: () => void;
}

export const useCashbookStore = create<CashbookStore>((set) => ({
  cashbook1: null,
  cashbook2: null,
  
  setCashbook1: (data: CB1Type) => {
    console.log('Setting Cashbook 1 data in Zustand store:', data);
    set({ cashbook1: data });
  },
  
  setCashbook2: (data: CB2Type) => {
    console.log('Setting Cashbook 2 data in Zustand store:', data);
    set({ cashbook2: data });
  },
  
  clearCashbookData: () => {
    console.log('Clearing all cashbook data from Zustand store');
    set({ cashbook1: null, cashbook2: null });
  },
}));