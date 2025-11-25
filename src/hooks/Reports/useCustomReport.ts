import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface CustomReportRequest {
  from: string;
  to: string;
  branchIds?: string[];
  metrics?: string[];
  groupBy?: 'date' | 'branch' | 'month';
  includeCharts?: boolean;
}

export interface CustomReportData {
  period: {
    from: string;
    to: string;
  };
  filters: {
    branchIds: string[];
    metrics: string[];
    groupBy: string;
  };
  data: Array<{
    [key: string]: string | number | boolean | null;
  }>;
  summary: {
    [metric: string]: {
      total: number;
      average: number;
      min: number;
      max: number;
    };
  };
  charts?: {
    [chartType: string]: {
      type: string;
      data: Array<{ [key: string]: string | number }>;
      options?: Record<string, unknown>;
    };
  };
}

export interface CustomReportResponse {
  success: boolean;
  data: {
    report: CustomReportData;
    generatedAt: string;
    exportUrl?: string;
  };
  message: string;
}

const generateCustomReport = async (reportParams: CustomReportRequest): Promise<CustomReportResponse> => {
  const { data } = await axiosInstance.post('/reports/custom', reportParams);
  return data;
};

export const useCustomReport = () => {
  return useMutation({
    mutationFn: generateCustomReport,
    onError: (error) => {
      console.error('Custom report generation error:', error);
    }
  });
};
