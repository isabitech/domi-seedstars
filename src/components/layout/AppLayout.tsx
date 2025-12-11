import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar, Drawer } from 'antd';
import type { MenuProps } from 'antd';
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
  DollarOutlined,
  CalendarOutlined,
  MenuOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useGetMe } from '../../hooks/Auth/useGetMe';
import { useLogout } from '../../hooks/Auth/useLogout';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AppLayout: React.FC = () => {
  const { data: currentUser } = useGetMe();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const user = currentUser?.data

  // State management for mobile responsiveness
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on tablet/small desktop screens
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setCollapsed(true);
      } else if (window.innerWidth > 1024) {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login');
    } catch {
      // Even if logout fails on server, clear local data and redirect
      navigate('/login');
    }
  };

  // Get current path for menu selection
  const getCurrentKey = (): string => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/cashbook')) return 'cashbook';
    if (path.includes('/predictions')) return 'predictions';
    if (path.includes('/online-cih')) return 'online-cih';
    if (path.includes('/bank-statements')) return 'bank-statements';
    if (path.includes('/branch-savings-register')) return 'savings-register';
    if (path.includes('/branch-loan-register')) return 'loan-register';
    if (path.includes('/branch-disbursement-roll')) return 'disbursement-roll';
    if (path.includes('/branches')) return 'branches';
    if (path.includes('/daily-report')) return 'daily-report';
    if (path.includes('/daily-operations')) return 'daily-operations';
    if (path.includes('/reports/daily')) return 'daily-report';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/ho-operations')) return 'ho-operations';
    if (path.includes('/ho-efcc')) return 'ho-efcc';
    if (path.includes('/branch-efcc')) return 'branch-efcc';
    if (path.includes('/ho-amount-need-tomorrow')) return 'ho-amount-need-tomorrow';
    if (path.includes('/branch-amount-need-tomorrow')) return 'branch-amount-need-tomorrow';
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
          } else if (user?.role === 'BR') {
            navigate('/app/dashboard/branch');
          } else{
            navigate('/app/dashboard');
          }
        },
      },
    ];

    if (user?.role === 'HO') {
      return [
        ...baseItems,
        {
          key: 'daily-report',
          icon: <FileTextOutlined />,
          label: 'Branch Daily Report',
          onClick: () => navigate('/app/reports/daily'),
        },
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
          key: 'reports-overview',
          icon: <FileTextOutlined />,
          label: 'Reports Overview',
          onClick: () => navigate('/app/reports'),
        },
        {
          key: 'ho-efcc',
          icon: <SafetyOutlined />,
          label: 'EFCC Dashboard',
          onClick: () => navigate('/app/ho-efcc'),
        },
        {
          key: 'ho-amount-need-tomorrow',
          icon: <DollarOutlined />,
          label: 'Amount Need Tomorrow',
          onClick: () => navigate('/app/ho-amount-need-tomorrow'),
        },
        
        // {
        //   key: 'settings',
        //   icon: <SettingOutlined />,
        //   label: 'Settings',
        //   onClick: () => navigate('/app/settings'),
        // },
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
          key: 'bank-statements',
          icon: <BankOutlined />,
          label: 'Bank Statements',
          onClick: () => navigate('/app/bank-statements'),
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
          key: 'daily-operations',
          icon: <CalendarOutlined />,
          label: 'Daily Operations',
          onClick: () => navigate('/app/daily-operations'),
        },
        {
          key: 'daily-report',
          icon: <FileTextOutlined />,
          label: 'Daily Report',
          onClick: () => navigate('/app/daily-report'),
        },
        {
          key: 'savings-register',
          icon: <FileTextOutlined />,
          label: 'Savings Register',
          onClick: () => navigate('/app/branch-savings-register'),
        },
        {
          key: 'loan-register',
          icon: <FileTextOutlined />,
          label: 'Loan Register',
          onClick: () => navigate('/app/branch-loan-register'),
        },
        {
          key: 'disbursement-roll',
          icon: <FileTextOutlined />,
          label: 'Disbursement Roll',
          onClick: () => navigate('/app/branch-disbursement-roll'),
        },
        {
          key: 'branch-efcc',
          icon: <SafetyOutlined />,
          label: 'Branch EFCC',
          onClick: () => navigate('/app/branch-efcc'),
        },
        {
          key: 'branch-amount-need-tomorrow',
          icon: <DollarOutlined />,
          label: 'Amount Need Tomorrow',
          onClick: () => navigate('/app/branch-amount-need-tomorrow'),
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
      '/app/daily-operations': 'Daily Operations',
      '/app/daily-report': ' Daily Branch Report',
      '/app/predictions': 'Predictions',
      '/app/online-cih': 'Online CIH',
      '/app/bank-statements': 'Bank Statements',
      '/app/branch-savings-register': 'Savings Register',
      '/app/branch-loan-register': 'Loan Register',
      '/app/branch-disbursement-roll': 'Disbursement Roll',
      '/app/branch-efcc': 'Branch EFCC',
      '/app/ho-efcc': 'EFCC Dashboard',
      '/app/branch-amount-need-tomorrow': 'Amount Need Tomorrow',
      '/app/ho-amount-need-tomorrow': 'Amount Need Tomorrow - HO Dashboard',
      '/app/reports': 'Reports & Analytics',
      '/app/reports/daily': 'Branch Daily Report',
      // '/app/settings': 'System Settings',
    };
    
    return titles[path] || 'Dashboard';
  };

  // Mobile menu handlers
  const showMobileDrawer = () => {
    setMobileDrawerVisible(true);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerVisible(false);
  };

  const handleMobileMenuClick = (clickHandler: () => void) => {
    return () => {
      clickHandler();
      closeMobileDrawer();
    };
  };

  // Mobile-optimized menu items
  const getMobileMenuItems = (): MenuProps['items'] => {
    const items = getMenuItems();
    return items?.map(item => {
      if (item && 'onClick' in item) {
        return {
          ...item,
          onClick: item.onClick ? handleMobileMenuClick(item.onClick as () => void) : undefined,
        };
      }
      return item;
    });
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="light"
          style={{
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            minHeight: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 80}
        >
          <div style={{ 
            padding: collapsed ? '8px' : '16px', 
            textAlign: 'center', 
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
          }}>
            {!collapsed ? (
              <>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  Dominion
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Seedstars Nig LTD
                </Text>
              </>
            ) : (
              <Title level={5} style={{ margin: 0, color: '#1890ff', fontSize: '14px' }}>
                D
              </Title>
            )}
          </div>
          
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingTop: '16px',
            marginBottom: '50px'
          }}>
            <Menu
              mode="inline"
              selectedKeys={[getCurrentKey()]}
              items={getMenuItems()}
              style={{ border: 'none', height: '100%' }}
              inlineCollapsed={collapsed}
            />
          </div>
        </Sider>
      )}

      {/* Mobile Drawer Sidebar */}
      <Drawer
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              Dominion
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Seedstars Nig LTD
            </Text>
          </div>
        }
        placement="left"
        onClose={closeMobileDrawer}
        open={mobileDrawerVisible}
        bodyStyle={{ 
          padding: 0,
          height: '100%',
          overflowY: 'auto'
        }}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[getCurrentKey()]}
          items={getMobileMenuItems()}
          style={{ border: 'none', height: '100%' }}
        />
      </Drawer>
      
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: isMobile ? '0 16px' : '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={showMobileDrawer}
                style={{ padding: '4px 8px' }}
              />
            )}
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              {isMobile ? `${user?.branchName || 'Branch'} Branch` : getPageTitle()}
            </Title>
          </div>
          
          <Space size={isMobile ? 'small' : 'middle'}>
            {!isMobile && <Avatar icon={<UserOutlined />} />}
            {!isMobile && (
              <Space direction="vertical" size={0}>
                <Text strong>{user?.username}</Text>
              </Space>
            )}
            {!isMobile && (
              <span className="text-black">
                <p>{user?.role === 'HO' ? 'Head Office' : `Branch: ${user?.branchName || 'Branch User'} `}</p>
              </span>
            )}
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size={isMobile ? 'small' : 'middle'}
            >
              {!isMobile && 'Logout'}
            </Button>
          </Space>
        </Header>
        
        <Content
          style={{
            padding: isMobile ? '16px' : '24px',
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