import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { calculations } from '../../../utils/calculations';

export interface FinancialData {
  branchId: string;
  branchName: string;
  date: string;
  cashbook1Total: number;
  cashbook2Total: number;
  onlineCIH: number;
  savings: number;
  loanCollection: number;
  disbursements: number;
  charges: number;
  expenses: number;
  transferToSenate: number;
  frmHO: number;
  frmBR: number;
  netCashFlow: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalSavings: number;
  totalLoans: number;
  totalDisbursements: number;
  totalCharges: number;
  totalTransferToSenate: number;
  profitMargin: number;
  growthRate: number;
}

export interface BranchPerformanceData {
  branchId: string;
  branchName: string;
  branchCode: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  collectionEfficiency: number;
  disbursementVolume: number;
  customerCount: number;
  averageTransactionSize: number;
  growthRate: number;
  performanceScore: number;
  ranking: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  lastUpdated: string;
}

export interface TransactionData {
  id: string;
  date: string;
  time: string;
  branchId: string;
  branchName: string;
  type: 'savings' | 'loan_collection' | 'disbursement' | 'expense' | 'transfer';
  category: string;
  amount: number;
  description: string;
  referenceNo: string;
  userId: string;
  userName: string;
  status: 'completed' | 'pending' | 'failed';
  balanceBefore: number;
  balanceAfter: number;
}

// Mock data generators
export const generateMockFinancialData = (startDate: Dayjs, endDate: Dayjs, branchFilter: string): FinancialData[] => {
  const data: FinancialData[] = [];
  const branches = branchFilter === 'all' 
    ? [{ id: 'br-001', name: 'Lagos Branch' }, { id: 'br-002', name: 'Abuja Branch' }, { id: 'br-003', name: 'Kano Branch' }]
    : [{ id: branchFilter, name: branchFilter === 'br-001' ? 'Lagos Branch' : branchFilter === 'br-002' ? 'Abuja Branch' : 'Kano Branch' }];
  
  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    branches.forEach(branch => {
      const savings = Math.floor(Math.random() * 500000) + 200000;
      const loanCollection = Math.floor(Math.random() * 300000) + 100000;
      const charges = Math.floor(Math.random() * 50000) + 10000;
      const disbursements = Math.floor(Math.random() * 400000) + 150000;
      const expenses = Math.floor(Math.random() * 80000) + 20000;
      const frmHO = Math.floor(Math.random() * 100000);
      const frmBR = Math.floor(Math.random() * 50000);
      
      const cashbook1Total = savings + loanCollection + charges + frmHO + frmBR;
      const cashbook2Total = disbursements + expenses;
      const onlineCIH = cashbook1Total - cashbook2Total;
      const transferToSenate = Math.floor(onlineCIH * 0.1);
      const netCashFlow = (savings + loanCollection + charges) - (disbursements + expenses);
      
      data.push({
        branchId: branch.id,
        branchName: branch.name,
        date: currentDate.format('YYYY-MM-DD'),
        cashbook1Total,
        cashbook2Total,
        onlineCIH,
        savings,
        loanCollection,
        disbursements,
        charges,
        expenses,
        transferToSenate,
        frmHO,
        frmBR,
        netCashFlow
      });
    });
    currentDate = currentDate.add(1, 'day');
  }
  
  return data;
};

export const generateBranchPerformanceData = (startDate: Dayjs, endDate: Dayjs, branchFilter: string): BranchPerformanceData[] => {
  const allBranches = [
    { id: 'br-001', name: 'Lagos Branch', code: 'LG001' },
    { id: 'br-002', name: 'Abuja Branch', code: 'AB002' },
    { id: 'br-003', name: 'Kano Branch', code: 'KN003' },
    { id: 'br-004', name: 'Port Harcourt Branch', code: 'PH004' },
    { id: 'br-005', name: 'Ibadan Branch', code: 'IB005' }
  ];
  
  const branches = branchFilter === 'all' ? allBranches : allBranches.filter(b => b.id === branchFilter);
  
  return branches.map((branch, index) => {
    const totalIncome = Math.floor(Math.random() * 5000000) + 2000000;
    const totalExpenses = Math.floor(Math.random() * 3000000) + 1000000;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = (netProfit / totalIncome) * 100;
    const collectionEfficiency = Math.floor(Math.random() * 30) + 70;
    const disbursementVolume = Math.floor(Math.random() * 2000000) + 500000;
    const customerCount = Math.floor(Math.random() * 500) + 100;
    const averageTransactionSize = totalIncome / customerCount;
    const growthRate = Math.floor(Math.random() * 25) + 5;
    const performanceScore = Math.floor((profitMargin + collectionEfficiency + growthRate) / 3);
    
    let status: 'excellent' | 'good' | 'average' | 'poor' = 'average';
    if (performanceScore >= 80) status = 'excellent';
    else if (performanceScore >= 70) status = 'good';
    else if (performanceScore >= 60) status = 'average';
    else status = 'poor';
    
    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      collectionEfficiency,
      disbursementVolume,
      customerCount,
      averageTransactionSize,
      growthRate,
      performanceScore,
      ranking: index + 1,
      status,
      lastUpdated: dayjs().subtract(Math.floor(Math.random() * 60), 'minutes').toISOString()
    };
  }).sort((a, b) => b.performanceScore - a.performanceScore).map((item, index) => ({ ...item, ranking: index + 1 }));
};

export const generateTransactionData = (startDate: Dayjs, endDate: Dayjs, branchFilter: string): TransactionData[] => {
  const data: TransactionData[] = [];
  const branches = branchFilter === 'all' 
    ? [{ id: 'br-001', name: 'Lagos Branch' }, { id: 'br-002', name: 'Abuja Branch' }, { id: 'br-003', name: 'Kano Branch' }]
    : [{ id: branchFilter, name: branchFilter === 'br-001' ? 'Lagos Branch' : branchFilter === 'br-002' ? 'Abuja Branch' : 'Kano Branch' }];
  
  const transactionTypes = [
    { type: 'savings' as const, category: 'Customer Savings', weight: 30 },
    { type: 'loan_collection' as const, category: 'Loan Repayment', weight: 25 },
    { type: 'disbursement' as const, category: 'Loan Disbursement', weight: 20 },
    { type: 'expense' as const, category: 'Operational Expense', weight: 15 },
    { type: 'transfer' as const, category: 'Inter-branch Transfer', weight: 10 }
  ];
  
  let currentDate = startDate;
  let runningBalance = 1000000;
  let transactionId = 1000;
  
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    branches.forEach(branch => {
      const transactionsPerDay = Math.floor(Math.random() * 15) + 5;
      
      for (let i = 0; i < transactionsPerDay; i++) {
        const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const amount = Math.floor(Math.random() * 200000) + 10000;
        const balanceBefore = runningBalance;
        
        if (randomType.type === 'savings' || randomType.type === 'loan_collection') {
          runningBalance += amount;
        } else {
          runningBalance -= amount;
        }
        
        const hour = Math.floor(Math.random() * 9) + 8;
        const minute = Math.floor(Math.random() * 60);
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const statuses: Array<'completed' | 'pending' | 'failed'> = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        data.push({
          id: `TXN${transactionId++}`,
          date: currentDate.format('YYYY-MM-DD'),
          time,
          branchId: branch.id,
          branchName: branch.name,
          type: randomType.type,
          category: randomType.category,
          amount,
          description: generateTransactionDescription(randomType.type, amount),
          referenceNo: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
          userId: `USR${Math.floor(Math.random() * 100) + 1}`,
          userName: generateUserName(),
          status,
          balanceBefore,
          balanceAfter: runningBalance
        });
      }
    });
    currentDate = currentDate.add(1, 'day');
  }
  
  return data.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
};

const generateTransactionDescription = (type: string, amount: number): string => {
  const descriptions = {
    savings: [`Customer savings deposit`, `Monthly savings contribution`, `Emergency savings deposit`],
    loan_collection: [`Loan repayment - Principal`, `Loan repayment - Interest`, `Overdue payment collection`],
    disbursement: [`Personal loan disbursement`, `Business loan disbursement`, `Emergency loan disbursement`],
    expense: [`Office rent payment`, `Staff salary payment`, `Utility bills payment`, `Office supplies purchase`],
    transfer: [`Transfer to Head Office`, `Inter-branch fund transfer`, `Senate office transfer`]
  };
  
  const typeDescriptions = descriptions[type as keyof typeof descriptions] || ['General transaction'];
  const baseDesc = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  return `${baseDesc} - ${calculations.formatCurrency(amount)}`;
};

const generateUserName = (): string => {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Mary', 'James', 'Lisa', 'Robert', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};