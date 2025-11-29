import type {
  Cashbook1,
  Cashbook2,
  BankStatement1,
  BankStatement2,
} from '../types';

export const calculations = {
  // Cashbook 1 calculations
  calculateCashbook1Total(cashbook1: Partial<Cashbook1>): number {
    const { savings = 0, loanCollection = 0, charges = 0 } = cashbook1;
    return savings + loanCollection + charges;
  },

  calculateCashbook1CBTotal(cashbook1: Partial<Cashbook1>): number {
    const { pcih = 0, savings = 0, loanCollection = 0, charges = 0, frmHO = 0, frmBR = 0 } = cashbook1;
    return pcih + savings + loanCollection + charges + frmHO + frmBR;
  },

  // Cashbook 2 calculations
  calculateCashbook2CBTotal(cashbook2: Partial<Cashbook2>): number {
    const { disAmt = 0, savWith = 0, domiBank = 0, posT = 0 } = cashbook2;
    return disAmt + savWith + domiBank + posT;
  },

  // Online Cash in Hand calculation
  calculateOnlineCIH(cbTotal1: number, cbTotal2: number): number {
    return cbTotal1 - cbTotal2;
  },

  // Loan Register calculation
  calculateCurrentLoanBalance(
    previousLoanTotal: number,
    disbursementWithInterest: number,
    loanCollection: number,
    hoMultiplier: number = 1
  ): number {
    return (previousLoanTotal * hoMultiplier) + disbursementWithInterest - loanCollection;
  },

  // Savings Register calculation
  calculateCurrentSavings(
    previousSavingsTotal: number,
    newSavings: number,
    savingsWithdrawal: number
  ): number {
    return previousSavingsTotal + newSavings - savingsWithdrawal;
  },

  // Current Loan calculation
  calculateCurrentLoan(
    previousTotalLoan: number,
    disbursementWithInterest: number,
    loanCollection: number
  ): number {
    return previousTotalLoan + disbursementWithInterest - loanCollection;
  },

  // Bank Statement 1 calculation
  calculateBS1Total(bs1: Partial<BankStatement1>): number {
    const { opening = 0, recHO = 0, recBO = 0, domi = 0, pa = 0 } = bs1;
    return opening + recHO + recBO + domi + pa;
  },

  // Bank Statement 2 calculation
  calculateBS2Total(bs2: Partial<BankStatement2>): number {
    const { withd = 0, tbo = 0, exAmt = 0 } = bs2;
    return withd + tbo + exAmt;
  },

  // Transfer to Senate Office calculation
  calculateTSO(bs1Total: number, bs2Total: number): number {
    return bs1Total - bs2Total;
  },

  // Disbursement Roll calculation
  calculateDisbursementRoll(
    previousDisbursement: number,
    dailyDisbursement: number
  ): number {
    return previousDisbursement + dailyDisbursement;
  },

  // Generate Bank Statement 1 from Cashbook data
  generateBS1FromCashbooks(
    cashbook1: Cashbook1,
    cashbook2: Cashbook2
  ): Omit<BankStatement1, 'id' | 'submittedBy'> {
    return {
      date: cashbook1.date,
      branchId: cashbook1.branchId,
      opening: 0, // Always starts at 0
      recHO: cashbook1.frmHO,
      recBO: cashbook1.frmBR,
      domi: cashbook2.domiBank,
      pa: cashbook2.posT,
      bs1Total: this.calculateBS1Total({
        opening: 0,
        recHO: cashbook1.frmHO,
        recBO: cashbook1.frmBR,
        domi: cashbook2.domiBank,
        pa: cashbook2.posT,
      }),
    };
  },

  // Generate Bank Statement 2 with withdrawal data
  generateBS2Base(
    cashbook1: Cashbook1,
    exAmt: number = 0,
    exPurpose: string = '',
    tbo: number = 0
  ): Omit<BankStatement2, 'id' | 'submittedBy'> {
    return {
      date: cashbook1.date,
      branchId: cashbook1.branchId,
      withd: cashbook1.frmHO,
      tbo,
      exAmt,
      exPurpose,
      bs2Total: this.calculateBS2Total({
        withd: cashbook1.frmHO,
        tbo,
        exAmt,
      }),
    };
  },

  // Validate cashbook entries
  validateCashbook1(cashbook1: Partial<Cashbook1>): string[] {
    const errors: string[] = [];
    
    if (!cashbook1.pcih || cashbook1.pcih < 0) {
      errors.push('Previous Cash in Hand must be a positive number');
    }
    
    if (!cashbook1.savings || cashbook1.savings < 0) {
      errors.push('Savings must be a positive number');
    }
    
    if (!cashbook1.loanCollection || cashbook1.loanCollection < 0) {
      errors.push('Loan Collection must be a positive number');
    }
    
    if (!cashbook1.charges || cashbook1.charges < 0) {
      errors.push('Charges must be a positive number');
    }
    
    return errors;
  },

  validateCashbook2(cashbook2: Partial<Cashbook2>): string[] {
    const errors: string[] = [];
    
    if (!cashbook2.disNo || cashbook2.disNo < 0) {
      errors.push('Disbursement Number must be a positive number');
    }
    
    if (!cashbook2.disAmt || cashbook2.disAmt < 0) {
      errors.push('Disbursement Amount must be a positive number');
    }
    
    return errors;
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  },

  // Calculate percentage change
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
};