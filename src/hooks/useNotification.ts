import { toast } from 'sonner';

/**
 * Custom hook to use Sonner toast notifications
 * This hook provides a consistent interface for showing notifications across the app
 * @returns Object containing toast methods
 */
export const useNotification = () => {
  return {
    // Main toast methods
    success: (content: string, options?: { duration?: number; description?: string }) => 
      toast.success(content, options),
    error: (content: string, options?: { duration?: number; description?: string }) => 
      toast.error(content, options),
    info: (content: string, options?: { duration?: number; description?: string }) => 
      toast.info(content, options),
    warning: (content: string, options?: { duration?: number; description?: string }) => 
      toast.warning(content, options),
    loading: (content: string, options?: { duration?: number; description?: string }) => 
      toast.loading(content, options),
    
    // Additional Sonner methods
    promise: toast.promise,
    dismiss: toast.dismiss,
    message: (content: string, options?: { duration?: number; description?: string }) => 
      toast.message(content, options),
  };
};