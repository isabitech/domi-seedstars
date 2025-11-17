import type { Prediction, ApiResponse } from '../types';

// Simulated backend data storage for predictions
const mockPredictionStorage: Record<string, Prediction[]> = {};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const predictionService = {
  // Submit Prediction data
  async submitPrediction(data: Partial<Prediction>): Promise<ApiResponse<Prediction>> {
    await delay(800);

    try {
      // Validate required fields
      if (!data.predictionNo || !data.predictionAmount || !data.branchId) {
        return {
          success: false,
          error: 'Prediction number, amount, and branch ID are required'
        };
      }

      // Create new prediction entry
      const newEntry: Prediction = {
        id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: data.date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow by default
        branchId: data.branchId,
        predictionNo: Number(data.predictionNo),
        predictionAmount: Number(data.predictionAmount),
        submittedBy: data.submittedBy || ''
      };

      // Store in mock storage
      if (!mockPredictionStorage[newEntry.branchId]) {
        mockPredictionStorage[newEntry.branchId] = [];
      }

      // Check if entry for the date already exists
      const existingIndex = mockPredictionStorage[newEntry.branchId].findIndex(
        entry => entry.date === newEntry.date
      );

      if (existingIndex >= 0) {
        // Update existing entry
        mockPredictionStorage[newEntry.branchId][existingIndex] = newEntry;
      } else {
        // Add new entry
        mockPredictionStorage[newEntry.branchId].push(newEntry);
      }

      return {
        success: true,
        data: newEntry,
        message: 'Prediction submitted successfully'
      };

    } catch {
      return {
        success: false,
        error: 'Failed to submit prediction'
      };
    }
  },

  // Get Prediction data for a specific date
  async getPrediction(branchId: string, date: string): Promise<ApiResponse<Prediction>> {
    await delay(400);

    try {
      const branchData = mockPredictionStorage[branchId] || [];
      const entry = branchData.find(item => item.date === date);

      if (entry) {
        return {
          success: true,
          data: entry
        };
      } else {
        return {
          success: false,
          message: 'No prediction found for the specified date'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve prediction data'
      };
    }
  },

  // Get all Prediction entries for a branch
  async getAllPredictions(branchId: string): Promise<ApiResponse<Prediction[]>> {
    await delay(500);

    try {
      const branchData = mockPredictionStorage[branchId] || [];
      
      return {
        success: true,
        data: branchData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve prediction data'
      };
    }
  },

  // Get predictions for multiple branches (HO view)
  async getAllBranchesPredictions(date: string): Promise<ApiResponse<Prediction[]>> {
    await delay(600);

    try {
      const allPredictions: Prediction[] = [];
      
      Object.keys(mockPredictionStorage).forEach(branchId => {
        const branchData = mockPredictionStorage[branchId];
        const dateEntry = branchData.find(entry => entry.date === date);
        if (dateEntry) {
          allPredictions.push(dateEntry);
        }
      });

      return {
        success: true,
        data: allPredictions
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve branch predictions'
      };
    }
  },

  // Delete a prediction
  async deletePrediction(branchId: string, date: string): Promise<ApiResponse<void>> {
    await delay(500);

    try {
      const branchData = mockPredictionStorage[branchId] || [];
      const entryIndex = branchData.findIndex(entry => entry.date === date);

      if (entryIndex >= 0) {
        mockPredictionStorage[branchId].splice(entryIndex, 1);
        return {
          success: true,
          message: 'Prediction deleted successfully'
        };
      } else {
        return {
          success: false,
          error: 'Prediction not found'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Failed to delete prediction'
      };
    }
  },

  // Get prediction summary for dashboard
  async getPredictionSummary(branchId: string): Promise<ApiResponse<{
    tomorrowPrediction: Prediction | null;
    totalPredictions: number;
    avgPredictionAmount: number;
    avgClientsPerDay: number;
  }>> {
    await delay(400);

    try {
      const branchData = mockPredictionStorage[branchId] || [];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const tomorrowPrediction = branchData.find(entry => entry.date === tomorrow);
      
      const totalPredictions = branchData.length;
      const avgPredictionAmount = totalPredictions > 0 
        ? branchData.reduce((sum, pred) => sum + pred.predictionAmount, 0) / totalPredictions
        : 0;
      const avgClientsPerDay = totalPredictions > 0
        ? branchData.reduce((sum, pred) => sum + pred.predictionNo, 0) / totalPredictions
        : 0;

      return {
        success: true,
        data: {
          tomorrowPrediction: tomorrowPrediction || null,
          totalPredictions,
          avgPredictionAmount,
          avgClientsPerDay
        }
      };
    } catch {
      return {
        success: false,
        error: 'Failed to retrieve prediction summary'
      };
    }
  },

  // Clear all mock data (for testing)
  clearMockData(): void {
    Object.keys(mockPredictionStorage).forEach(key => {
      delete mockPredictionStorage[key];
    });
  },

  // Get mock data (for debugging)
  getMockData(): Record<string, Prediction[]> {
    return mockPredictionStorage;
  }
};