import React from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar } from 'antd';
import { 
  DashboardOutlined,
  BankOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../store';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate 
}) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  // Menu items based on user role
  const getMenuItems = (): MenuProps['items'] => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => onNavigate('dashboard'),
      },
    ];

    if (user?.role === 'HO') {
      return [
        ...baseItems,
        {
          key: 'branches',
          icon: <BankOutlined />,
          label: 'Branch Management',
          onClick: () => onNavigate('branches'),
        },
        {
          key: 'ho-operations',
          icon: <HomeOutlined />,
          label: 'HO Operations',
          onClick: () => onNavigate('ho-operations'),
        },
        {
          key: 'reports',
          icon: <FileTextOutlined />,
          label: 'Reports',
          onClick: () => onNavigate('reports'),
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          onClick: () => onNavigate('settings'),
        },
      ];
    } else {
      // Branch user menu
      return [
        ...baseItems,
        {
          key: 'cashbook',
          icon: <FileTextOutlined />,
          label: 'Daily Cashbook',
          onClick: () => onNavigate('cashbook'),
        },
        {
          key: 'online-cih',
          icon: <DollarOutlined />,
          label: 'Online Cash in Hand',
          onClick: () => onNavigate('online-cih'),
        },
        {
          key: 'prediction',
          icon: <SettingOutlined />,
          label: 'Predictions',
          onClick: () => onNavigate('prediction'),
        },
      ];
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        theme="light"
        width={280}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ 
          padding: '16px', 
          textAlign: 'center', 
          borderBottom: '1px solid #f0f0f0' 
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Dominion
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Seedstars Nig LTD
          </Text>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={getMenuItems()}
          style={{ border: 'none', marginTop: '16px' }}
        />
        

      </Sider>
      
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {getPageTitle(currentPage, user?.role)}
            </Title>
          </div>
          
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Space direction="vertical" size={0}>
              <Text strong>{user?.username}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {user?.role === 'HO' ? 'Head Office' : 'Branch User'}
              </Text>
            </Space>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>
        
        <Content
          style={{
            padding: '24px',
            background: '#f5f5f5',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

function getPageTitle(page: string, role?: string): string {
  const titles: Record<string, string> = {
    dashboard: role === 'HO' ? 'Head Office Dashboard' : 'Branch Dashboard',
    branches: 'Branch Management',
    'ho-operations': 'HO Operations',
    cashbook: 'Daily Cashbook',
    'online-cih': 'Online Cash in Hand',
    prediction: 'Predictions',
    reports: 'Reports & Analytics',
    settings: 'System Settings',
  };
  
  return titles[page] || 'Dashboard';
}