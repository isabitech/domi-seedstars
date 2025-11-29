import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../instance/axiosInstance';

export interface DailyExportParams {
  date?: string;
  format?: 'csv' | 'xlsx' | 'pdf';
  branchId?: string;
}

export interface ExportResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    filename: string;
    fileSize: number;
  };
  message: string;
}

const exportDailyReport = async (params: DailyExportParams): Promise<ExportResponse> => {
  const { data } = await axiosInstance.get('/reports/daily/export', { 
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
      filename: `daily-report-${params.date || 'today'}.${params.format || 'csv'}`,
      fileSize: blob.size
    },
    message: 'Export generated successfully'
  };
};

export const useGetDailyExport = () => {
  return useMutation({
    mutationFn: exportDailyReport,
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
      console.error('Daily export error:', error);
    }
  });
};
