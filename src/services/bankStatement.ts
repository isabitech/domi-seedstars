export interface BankStatement1Data {
  id: string;
  branchId: string;
  date: string;
  opening: number;
  recHO: number;
  recBO: number;
  domi: number;
  pa: number;
  total: number;
}

export interface BankStatement1Input {
  branchId: string;
  date: string;
  opening: number;
}

export interface BankStatement2Data {
  id: string;
  branchId: string;
  date: string;
  withd: number;
  tbo: number;
  tboToBranch?: string; // Name of branch transferred to
  exAmt: number;
  exPurpose?: string; // Reasons for expenses
  total: number;
  enteredBy: string;
  enteredAt: string;
}

export interface BankStatement2Input {
  branchId: string;
  date: string;
  tbo: number;
  tboToBranch?: string;
  exAmt: number;
  exPurpose?: string;
}

// Mock storage for bank statements
let bankStatements: BankStatement1Data[] = [];
let bankStatements2: BankStatement2Data[] = [];

// Helper function to format date consistently
const formatDate = (date: string): string => {
  return new Date(date).toISOString().split('T')[0];
};

// Get bank statement for a specific date
export const getBankStatement1 = async (branchId: string, date: string): Promise<BankStatement1Data | null> => {
  const formattedDate = formatDate(date);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const statement = bankStatements.find(
        bs => bs.branchId === branchId && bs.date === formattedDate
      );
      resolve(statement || null);
    }, 300);
  });
};

// Calculate bank statement totals from cashbook data
export const calculateBankStatement1 = async (
  branchId: string, 
  date: string, 
  opening: number = 0
): Promise<BankStatement1Data> => {
  const formattedDate = formatDate(date);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Import cashbook service to get data
      const { cashbookService } = await import('./cashbook');
      
      // Get data from both cashbooks
      const cashbook1Response = await cashbookService.getCashbook1(branchId, formattedDate);
      const cashbook2Response = await cashbookService.getCashbook2(branchId, formattedDate);
      
      // Extract values from cashbook data
      const cashbook1 = cashbook1Response.success ? cashbook1Response.data : null;
      const cashbook2 = cashbook2Response.success ? cashbook2Response.data : null;
      
      const recHO = cashbook1?.frmHO || 0;
      const recBO = cashbook1?.frmBR || 0;
      const domiValue = cashbook2?.domiBank || 0;
      const paValue = cashbook2?.posT || 0;
      
      // Calculate total
      const total = opening + recHO + recBO + domiValue + paValue;
      
      const statement: BankStatement1Data = {
        id: `${branchId}-${formattedDate}`,
        branchId,
        date: formattedDate,
        opening,
        recHO,
        recBO,
        domi: domiValue,
        pa: paValue,
        total
      };
      
      resolve(statement);
    }, 300);
  });
};

// Save or update bank statement
export const saveBankStatement1 = async (data: BankStatement1Input): Promise<BankStatement1Data> => {
  const formattedDate = formatDate(data.date);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Calculate the statement with current opening value
      const statement = await calculateBankStatement1(data.branchId, data.date, data.opening);
      
      // Remove existing statement for the same date
      bankStatements = bankStatements.filter(
        bs => !(bs.branchId === data.branchId && bs.date === formattedDate)
      );
      
      // Add new statement
      bankStatements.push(statement);
      
      resolve(statement);
    }, 500);
  });
};

// Get all bank statements for a branch
export const getAllBankStatements1 = async (branchId: string): Promise<BankStatement1Data[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const statements = bankStatements.filter(bs => bs.branchId === branchId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(statements);
    }, 300);
  });
};

// Delete bank statement
export const deleteBankStatement1 = async (branchId: string, date: string): Promise<boolean> => {
  const formattedDate = formatDate(date);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = bankStatements.length;
      bankStatements = bankStatements.filter(
        bs => !(bs.branchId === branchId && bs.date === formattedDate)
      );
      resolve(bankStatements.length < initialLength);
    }, 300);
  });
};

// ============================================
// BANK STATEMENT 2 FUNCTIONS
// ============================================

// Get bank statement 2 for a specific date
export const getBankStatement2 = async (branchId: string, date: string): Promise<BankStatement2Data | null> => {
  const formattedDate = formatDate(date);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const statement = bankStatements2.find(
        bs => bs.branchId === branchId && bs.date === formattedDate
      );
      resolve(statement || null);
    }, 300);
  });
};

// Calculate bank statement 2 totals from cashbook data
export const calculateBankStatement2 = async (
  branchId: string, 
  date: string, 
  tbo: number = 0,
  tboToBranch: string = '',
  exAmt: number = 0,
  exPurpose: string = ''
): Promise<BankStatement2Data> => {
  const formattedDate = formatDate(date);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Import cashbook service to get WITHD data
      const { cashbookService } = await import('./cashbook');
      
      // Get data from cashbook 1 to get WITHD (FRM HO field)
      const cashbook1Response = await cashbookService.getCashbook1(branchId, formattedDate);
      
      // Extract WITHD value from cashbook data
      const cashbook1 = cashbook1Response.success ? cashbook1Response.data : null;
      const withd = cashbook1?.frmHO || 0;
      
      // Calculate total
      const total = withd + tbo + exAmt;
      
      const statement: BankStatement2Data = {
        id: `${branchId}-${formattedDate}-bs2`,
        branchId,
        date: formattedDate,
        withd,
        tbo,
        tboToBranch,
        exAmt,
        exPurpose,
        total,
        enteredBy: branchId, // Will be replaced with actual user info
        enteredAt: new Date().toISOString()
      };
      
      resolve(statement);
    }, 300);
  });
};

// Save or update bank statement 2
export const saveBankStatement2 = async (data: BankStatement2Input): Promise<BankStatement2Data> => {
  const formattedDate = formatDate(data.date);
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Calculate the statement with current values
      const statement = await calculateBankStatement2(
        data.branchId, 
        data.date, 
        data.tbo,
        data.tboToBranch,
        data.exAmt,
        data.exPurpose
      );
      
      // Remove existing statement for the same date
      bankStatements2 = bankStatements2.filter(
        bs => !(bs.branchId === data.branchId && bs.date === formattedDate)
      );
      
      // Add new statement
      bankStatements2.push(statement);
      
      resolve(statement);
    }, 500);
  });
};

// Get all bank statements 2 for a branch
export const getAllBankStatements2 = async (branchId: string): Promise<BankStatement2Data[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const statements = bankStatements2.filter(bs => bs.branchId === branchId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(statements);
    }, 300);
  });
};

// Delete bank statement 2
export const deleteBankStatement2 = async (branchId: string, date: string): Promise<boolean> => {
  const formattedDate = formatDate(date);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = bankStatements2.length;
      bankStatements2 = bankStatements2.filter(
        bs => !(bs.branchId === branchId && bs.date === formattedDate)
      );
      resolve(bankStatements2.length < initialLength);
    }, 300);
  });
};