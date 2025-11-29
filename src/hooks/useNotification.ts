import { App } from 'antd';

/**
 * Custom hook to use Ant Design notifications
 * This hook provides access to message, notification, and modal from Ant Design App context
 * @returns Object containing message, notification, and modal instances
 */
export const useNotification = () => {
  const { message, notification, modal } = App.useApp();
  
  return {
    message,
    notification,
    modal,
    // Convenience methods
    success: (content: string, duration?: number) => message.success(content, duration),
    error: (content: string, duration?: number) => message.error(content, duration),
    info: (content: string, duration?: number) => message.info(content, duration),
    warning: (content: string, duration?: number) => message.warning(content, duration),
    loading: (content: string, duration?: number) => message.loading(content, duration),
  };
};