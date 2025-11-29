import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { ExportResponse } from './useGetDailyExport';

export interface ConsolidatedExportParams {
  startDate?: string;
  endDate?: string;
  format?: 'csv' | 'xlsx' | 'pdf';
}

const exportConsolidatedReport = async (params: ConsolidatedExportParams): Promise<ExportResponse> => {
  const { data } = await axiosInstance.get('/reports/consolidated/export', { 
    params,
    responseType: 'blob' 
  });
  
  // Create download URL
  const blob = new Blob([data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  
  const dateRange = params.startDate && params.endDate 
    ? `${params.startDate}_to_${params.endDate}`
    : 'all-time';
  
  return {
    success: true,
    data: {
      downloadUrl,
      filename: `consolidated-report-${dateRange}.${params.format || 'csv'}`,
      fileSize: blob.size
    },
    message: 'Export generated successfully'
  };
};

export const useGetConsolidatedExport = () => {
  return useMutation({
    mutationFn: exportConsolidatedReport,
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
      console.error('Consolidated export error:', error);
    }
  });
};
