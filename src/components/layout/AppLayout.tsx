import React from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined,
  BankOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  RiseOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get current path for menu selection
  const getCurrentKey = (): string => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/cashbook')) return 'cashbook';
    if (path.includes('/predictions')) return 'predictions';
    if (path.includes('/online-cih')) return 'online-cih';
    if (path.includes('/bank-statements')) return 'bank-statements';
    if (path.includes('/branches')) return 'branches';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/ho-operations')) return 'ho-operations';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  // Menu items based on user role
  const getMenuItems = (): MenuProps['items'] => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => {
          if (user?.role === 'HO') {
            navigate('/app/dashboard');
          } else {
            navigate('/app/dashboard/branch');
          }
        },
      },
    ];

    if (user?.role === 'HO') {
      return [
        ...baseItems,
        {
          key: 'branches',
          icon: <BankOutlined />,
          label: 'Branch Management',
          onClick: () => navigate('/app/branches'),
        },
        {
          key: 'ho-operations',
          icon: <HomeOutlined />,
          label: 'HO Operations',
          onClick: () => navigate('/app/ho-operations'),
        },
        {
          key: 'reports',
          icon: <FileTextOutlined />,
          label: 'Reports',
          onClick: () => navigate('/app/reports'),
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          onClick: () => navigate('/app/settings'),
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
          onClick: () => navigate('/app/cashbook'),
        },
        {
          key: 'predictions',
          icon: <RiseOutlined />,
          label: 'Predictions',
          onClick: () => navigate('/app/predictions'),
        },
        {
          key: 'online-cih',
          icon: <DollarOutlined />,
          label: 'Online CIH',
          onClick: () => navigate('/app/online-cih'),
        },
        {
          key: 'bank-statements',
          icon: <BankOutlined />,
          label: 'Bank Statements',
          onClick: () => navigate('/app/bank-statements'),
        },
      ];
    }
  };

  const getPageTitle = (): string => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/app/dashboard': user?.role === 'HO' ? 'Head Office Dashboard' : 'Branch Dashboard',
      '/app/dashboard/branch': 'Branch Dashboard',
      '/app/branches': 'Branch Management',
      '/app/ho-operations': 'HO Operations',
      '/app/cashbook': 'Daily Cashbook',
      '/app/predictions': 'Predictions',
      '/app/online-cih': 'Online CIH',
      '/app/bank-statements': 'Bank Statements',
      '/app/reports': 'Reports & Analytics',
      '/app/settings': 'System Settings',
    };
    
    return titles[path] || 'Dashboard';
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        theme="light"
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
          selectedKeys={[getCurrentKey()]}
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
            width: '100%',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {getPageTitle()}
            </Title>
          </div>
          
          <Space >
            <Avatar icon={<UserOutlined />} />
            <Space direction="vertical" size={0}>
              <Text strong>{user?.username}</Text>
              
            </Space>
            <span className=' text-black'>
                <p>{user?.role === 'HO' ? 'Head Office' : 'Branch User'}</p>
                <p>{user?.branchId && ` • ${user.branchId}`}</p>
            </span>
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
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};