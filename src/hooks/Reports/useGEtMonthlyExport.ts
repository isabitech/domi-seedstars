import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { ExportResponse } from './useGetDailyExport';

export interface MonthlyExportParams {
  month?: string; // YYYY-MM format
  format?: 'csv' | 'xlsx' | 'pdf';
  branchId?: string;
}

const exportMonthlyReport = async (params: MonthlyExportParams): Promise<ExportResponse> => {
  const { data } = await axiosInstance.get('/reports/monthly/export', { 
    params,
    responseType: 'blob' 
  });
  
  // Create download URL
  const blob = new Blob([data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  
  return {
    success: true,
    data: {
      downloadUrl,
      filename: `monthly-report-${params.month || 'current'}.${params.format || 'csv'}`,
      fileSize: blob.size
    },
    message: 'Export generated successfully'
  };
};

export const useGetMonthlyExport = () => {
  return useMutation({
    mutationFn: exportMonthlyReport,
    onSuccess: (data) => {
      // Automatically download the file
      const link = document.createElement('a');
      link.href = data.data.downloadUrl;
      link.download = data.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => {
        window.URL.revokeObjectURL(data.data.downloadUrl);
      }, 100);
    },
    onError: (error) => {
      console.error('Monthly export error:', error);
    }
  });
};
