import { ConfigProvider, App as AntdApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntdApp>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          richColors
          expand
          closeButton
        />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
