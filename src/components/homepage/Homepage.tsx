import React from 'react';
import { 
  Layout, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Card, 
  Statistic,
  Divider 
} from 'antd';
import { 
  LoginOutlined, 
  DollarOutlined, 
  BankOutlined, 
  CalculatorOutlined,
  RiseOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: 'Daily Cashbook Management',
      description: 'Comprehensive daily cashbook entry system with automated calculations for all branch operations.'
    },
    {
      icon: <BankOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'Bank Statement Integration',
      description: 'Automated bank statement generation with real-time data synchronization from cashbook entries.'
    },
    {
      icon: <DollarOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      title: 'Online Cash in Hand',
      description: 'Real-time monitoring of cash positions with instant calculations and status indicators.'
    },
    {
      icon: <RiseOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: 'Prediction Analytics',
      description: 'Smart prediction tools for tomorrow\'s disbursements to optimize cash flow and resource planning.'
    },
    {
      icon: <CalculatorOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
      title: 'Automated Calculations',
      description: 'All financial calculations are automated including disbursement rolls and branch registers.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '32px', color: '#13c2c2' }} />,
      title: 'Role-based Security',
      description: 'Secure access control with different permissions for Head Office and Branch users.'
    }
  ];

  const stats = [
    { title: 'Branches Served', value: 50, prefix: <BankOutlined /> },
    { title: 'Daily Transactions', value: 1250, prefix: <FileTextOutlined /> },
    { title: 'Active Users', value: 200, prefix: <CheckCircleOutlined /> },
    { title: 'Uptime', value: 99.9, suffix: '%', prefix: <SafetyOutlined /> }
  ];

  return (
    <Layout className="homepage-layout" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header 
        style={{ 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '0 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DollarOutlined style={{ fontSize: '32px', color: '#1890ff', marginRight: '12px' }} />
          <div>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              Dominion Seedstars
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Financial Management System
            </Text>
          </div>
        </div>
        
        <Button 
          type="primary" 
          size="large"
          icon={<LoginOutlined />}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Header>

      {/* Hero Section */}
      <Content style={{ padding: '0' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '100px 50px',
          textAlign: 'center'
        }}>
          <Title level={1} style={{ color: 'white', fontSize: '48px', marginBottom: '24px' }}>
            Modern Financial Management
          </Title>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: '20px', 
            marginBottom: '32px',
            maxWidth: '800px',
            margin: '0 auto 32px auto'
          }}>
            Streamline your branch operations with our comprehensive financial management platform. 
            From daily cashbook entries to predictive analytics, manage all your financial operations in one place.
          </Paragraph>
          
          <Space size="large">
            <Button 
              size="large" 
              style={{ height: '50px', fontSize: '16px', padding: '0 32px' }}
              onClick={handleLogin}
            >
              Get Started
            </Button>
            <Button 
              size="large" 
              type="text" 
              style={{ 
                height: '50px', 
                fontSize: '16px', 
                padding: '0 32px',
                color: 'white',
                borderColor: 'white'
              }}
            >
              Learn More
            </Button>
          </Space>
        </div>

        {/* Statistics Section */}
        <div style={{ padding: '80px 50px', background: '#f5f5f5' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Trusted by Financial Institutions
          </Title>
          
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: '#1890ff', fontSize: '28px' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Features Section */}
        <div style={{ padding: '80px 50px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Comprehensive Financial Solutions
          </Title>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  hoverable
                  style={{ 
                    height: '100%',
                    textAlign: 'center',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: '16px' }}>
                    {feature.title}
                  </Title>
                  <Paragraph type="secondary">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Call to Action Section */}
        <div style={{ 
          padding: '80px 50px',
          background: '#001529',
          color: 'white',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
            Ready to Transform Your Financial Operations?
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '18px',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
          }}>
            Join thousands of financial professionals who trust our platform for their daily operations.
            Start managing your branch finances more efficiently today.
          </Paragraph>
          
          <Button 
            type="primary" 
            size="large"
            icon={<LoginOutlined />}
            style={{ height: '50px', fontSize: '16px', padding: '0 32px' }}
            onClick={handleLogin}
          >
            Start Your Journey
          </Button>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', background: '#f5f5f5', padding: '24px 50px' }}>
        <Divider />
        <Space direction="vertical" size="small">
          <Title level={4} style={{ margin: 0 }}>
            Dominion Seedstars Nigeria LTD
          </Title>
          <Text type="secondary">
            © 2025 Dominion Seedstars. All rights reserved. | Built with modern technology for financial excellence.
          </Text>
          <Space>
            <Text type="secondary">Privacy Policy</Text>
            <Divider type="vertical" />
            <Text type="secondary">Terms of Service</Text>
            <Divider type="vertical" />
            <Text type="secondary">Support</Text>
          </Space>
        </Space>
      </Footer>
    </Layout>
  );
};