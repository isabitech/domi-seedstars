import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';
import type { ExportResponse } from './useGetDailyExport';

export interface CustomExportParams {
  from?: string;
  to?: string;
  format?: 'csv' | 'xlsx' | 'pdf';
  branchIds?: string[];
  metrics?: string[];
}

const exportCustomReport = async (params: CustomExportParams): Promise<ExportResponse> => {
  const { data } = await axiosInstance.get('/reports/custom/export', { 
    params,
    responseType: 'blob' 
  });
  
  // Create download URL
  const blob = new Blob([data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  
  const dateRange = params.from && params.to 
    ? `${params.from}_to_${params.to}`
    : 'custom';
  
  return {
    success: true,
    data: {
      downloadUrl,
      filename: `custom-report-${dateRange}.${params.format || 'csv'}`,
      fileSize: blob.size
    },
    message: 'Export generated successfully'
  };
};

export const useGetCustomExport = () => {
  return useMutation({
    mutationFn: exportCustomReport,
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
      console.error('Custom export error:', error);
    }
  });
};
