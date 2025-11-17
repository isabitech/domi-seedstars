import type { Cashbook1, Cashbook2, ApiResponse } from '../types';
import { calculations } from '../utils/calculations';

// Simulated backend data storage
const mockCashbook1Storage: Record<string, Cashbook1[]> = {};
const mockCashbook2Storage: Record<string, Cashbook2[]> = {};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const cashbookService = {
  // Submit Cashbook 1 data
  async submitCashbook1(data: Partial<Cashbook1>): Promise<ApiResponse<Cashbook1>> {
    await delay(1000); // Simulate network delay

    try {
      // Validate required fields
      if (!data.pcih || !data.savings || !data.loanCollection || !data.charges) {
        return {
          success: false,
          error: 'All required fields must be provided'
        };
      }

      // Calculate totals
      const total = calculations.calculateCashbook1Total(data);
      const cbTotal1 = calculations.calculateCashbook1CBTotal(data);

      // Create new entry
      const newEntry: Cashbook1 = {
        id: `cb1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: data.date || new Date().toISOString().split('T')[0],
        branchId: data.branchId || '',
        pcih: Number(data.pcih),
        savings: Number(data.savings),
        loanCollection: Number(data.loanCollection),
        charges: Number(data.charges),
        total,
        frmHO: Number(data.frmHO || 0),
        frmBR: Number(data.frmBR || 0),
        cbTotal1,
        submittedBy: data.submittedBy || '',
        submittedAt: data.submittedAt || new Date().toISOString()
      };

      // Store in mock storage
      if (!mockCashbook1Storage[newEntry.branchId]) {
        mockCashbook1Storage[newEntry.branchId] = [];
      }

      // Check if entry for today already exists
      const existingIndex = mockCashbook1Storage[newEntry.branchId].findIndex(
        entry => entry.date === newEntry.date
      );

      if (existingIndex >= 0) {
        // Update existing entry
        mockCashbook1Storage[newEntry.branchId][existingIndex] = newEntry;
      } else {
        // Add new entry
        mockCashbook1Storage[newEntry.branchId].push(newEntry);
      }

      return {
        success: true,
        data: newEntry,
        message: 'Cashbook 1 data submitted successfully'
      };

    } catch {
      return {
        success: false,
        error: 'Failed to submit cashbook data'
      };
    }
  },

  // Get Cashbook 1 data for a specific date
  async getCashbook1(branchId: string, date: string): Promise<ApiResponse<Cashbook1>> {
    await delay(500);

    try {
      const branchData = mockCashbook1Storage[branchId] || [];
      const entry = branchData.find(item => item.date === date);

      if (entry) {
        return {
          success: true,
          data: entry
        };
      } else {
        return {
          success: false,
          message: 'No data found for the specified date'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve cashbook data'
      };
    }
  },

  // Get all Cashbook 1 entries for a branch
  async getAllCashbook1(branchId: string): Promise<ApiResponse<Cashbook1[]>> {
    await delay(500);

    try {
      const branchData = mockCashbook1Storage[branchId] || [];
      
      return {
        success: true,
        data: branchData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve cashbook data'
      };
    }
  },

  // Update FRM HO and FRM BR fields (HO only)
  async updateHOFields(
    branchId: string, 
    date: string, 
    frmHO: number, 
    frmBR: number,
    userRole: string
  ): Promise<ApiResponse<Cashbook1>> {
    await delay(800);

    try {
      // Check if user is Head Office
      if (userRole !== 'HO') {
        return {
          success: false,
          error: 'Only Head Office users can update these fields'
        };
      }

      const branchData = mockCashbook1Storage[branchId] || [];
      const entryIndex = branchData.findIndex(item => item.date === date);

      if (entryIndex < 0) {
        return {
          success: false,
          error: 'No cashbook entry found for the specified date'
        };
      }

      // Update the entry
      const updatedEntry = {
        ...branchData[entryIndex],
        frmHO: Number(frmHO),
        frmBR: Number(frmBR)
      };

      // Recalculate CB TOTAL 1
      updatedEntry.cbTotal1 = calculations.calculateCashbook1CBTotal(updatedEntry);

      // Update in storage
      mockCashbook1Storage[branchId][entryIndex] = updatedEntry;

      return {
        success: true,
        data: updatedEntry,
        message: 'HO fields updated successfully'
      };

    } catch {
      return {
        success: false,
        error: 'Failed to update HO fields'
      };
    }
  },

  // Get dashboard summary for today
  async getTodaysSummary(branchId: string): Promise<ApiResponse<{
    cashbook1: Cashbook1 | null;
    collectionTotal: number;
    cbTotal1: number;
  }>> {
    await delay(600);

    try {
      const today = new Date().toISOString().split('T')[0];
      const branchData = mockCashbook1Storage[branchId] || [];
      const todaysEntry = branchData.find(item => item.date === today);

      const summary = {
        cashbook1: todaysEntry || null,
        collectionTotal: todaysEntry ? todaysEntry.total : 0,
        cbTotal1: todaysEntry ? todaysEntry.cbTotal1 : 0
      };

      return {
        success: true,
        data: summary
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve summary data'
      };
    }
  },

  // Clear all mock data (for testing)
  clearMockData(): void {
    Object.keys(mockCashbook1Storage).forEach(key => {
      delete mockCashbook1Storage[key];
    });
  },

  // Get mock data (for debugging)
  getMockData(): Record<string, Cashbook1[]> {
    return mockCashbook1Storage;
  },

  // ===== CASHBOOK 2 SERVICES =====

  // Submit Cashbook 2 data
  async submitCashbook2(data: Partial<Cashbook2>): Promise<ApiResponse<Cashbook2>> {
    await delay(1000);

    try {
      // Validate required fields
      if (!data.disNo || !data.disAmt || !data.savWith || !data.domiBank || !data.posT) {
        return {
          success: false,
          error: 'All required fields must be provided'
        };
      }

      // Calculate CB TOTAL 2
      const cbTotal2 = calculations.calculateCashbook2CBTotal(data);

      // Create new entry
      const newEntry: Cashbook2 = {
        id: `cb2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: data.date || new Date().toISOString().split('T')[0],
        branchId: data.branchId || '',
        disNo: Number(data.disNo),
        disAmt: Number(data.disAmt),
        disWithInt: Number(data.disWithInt || 0),
        savWith: Number(data.savWith),
        domiBank: Number(data.domiBank),
        posT: Number(data.posT),
        cbTotal2,
        submittedBy: data.submittedBy || '',
        submittedAt: data.submittedAt || new Date().toISOString()
      };

      // Store in mock storage
      if (!mockCashbook2Storage[newEntry.branchId]) {
        mockCashbook2Storage[newEntry.branchId] = [];
      }

      // Check if entry for today already exists
      const existingIndex = mockCashbook2Storage[newEntry.branchId].findIndex(
        entry => entry.date === newEntry.date
      );

      if (existingIndex >= 0) {
        // Update existing entry
        mockCashbook2Storage[newEntry.branchId][existingIndex] = newEntry;
      } else {
        // Add new entry
        mockCashbook2Storage[newEntry.branchId].push(newEntry);
      }

      return {
        success: true,
        data: newEntry,
        message: 'Cashbook 2 data submitted successfully'
      };

    } catch {
      return {
        success: false,
        error: 'Failed to submit cashbook 2 data'
      };
    }
  },

  // Get Cashbook 2 data for a specific date
  async getCashbook2(branchId: string, date: string): Promise<ApiResponse<Cashbook2>> {
    await delay(500);

    try {
      const branchData = mockCashbook2Storage[branchId] || [];
      const entry = branchData.find(item => item.date === date);

      if (entry) {
        return {
          success: true,
          data: entry
        };
      } else {
        return {
          success: false,
          message: 'No Cashbook 2 data found for the specified date'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve Cashbook 2 data'
      };
    }
  },

  // Get all Cashbook 2 entries for a branch
  async getAllCashbook2(branchId: string): Promise<ApiResponse<Cashbook2[]>> {
    await delay(500);

    try {
      const branchData = mockCashbook2Storage[branchId] || [];
      
      return {
        success: true,
        data: branchData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve Cashbook 2 data'
      };
    }
  },

  // Get combined dashboard summary for today
  async getTodaysCombinedSummary(branchId: string): Promise<ApiResponse<{
    cashbook1: Cashbook1 | null;
    cashbook2: Cashbook2 | null;
    collectionTotal: number;
    cbTotal1: number;
    cbTotal2: number;
    onlineCIH: number;
  }>> {
    await delay(600);

    try {
      const today = new Date().toISOString().split('T')[0];
      const cb1Data = mockCashbook1Storage[branchId] || [];
      const cb2Data = mockCashbook2Storage[branchId] || [];
      
      const todaysCB1 = cb1Data.find(item => item.date === today);
      const todaysCB2 = cb2Data.find(item => item.date === today);
      
      const cb1Total = todaysCB1 ? todaysCB1.cbTotal1 : 0;
      const cb2Total = todaysCB2 ? todaysCB2.cbTotal2 : 0;
      const onlineCIH = calculations.calculateOnlineCIH(cb1Total, cb2Total);

      const summary = {
        cashbook1: todaysCB1 || null,
        cashbook2: todaysCB2 || null,
        collectionTotal: todaysCB1 ? todaysCB1.total : 0,
        cbTotal1: cb1Total,
        cbTotal2: cb2Total,
        onlineCIH
      };

      return {
        success: true,
        data: summary
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve combined summary data'
      };
    }
  },

  // Clear all Cashbook 2 mock data (for testing)
  clearCashbook2MockData(): void {
    Object.keys(mockCashbook2Storage).forEach(key => {
      delete mockCashbook2Storage[key];
    });
  },

  // Get Cashbook 2 mock data (for debugging)
  getCashbook2MockData(): Record<string, Cashbook2[]> {
    return mockCashbook2Storage;
  }
};