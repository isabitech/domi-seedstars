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
    <Layout className="homepage-layout">
      {/* Header */}
      <Header className="bg-white shadow-md px-12 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-[#1890ff] text-lg font-bold">        
              Dominion Seedstars {" "}
            <Text type="secondary" className="text-xs">
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
      <Content className="p-0">
        <div className="bg-linear-to-br from-indigo-500 to-purple-700 text-white py-25 px-12 text-center">
          <Title level={1} className="text-white text-5xl mb-6">
            Modern Financial Management
          </Title>
          <Paragraph className="text-white text-xl mb-8 max-w-4xl mx-auto">
            Streamline your branch operations with our comprehensive financial management platform. 
            From daily cashbook entries to predictive analytics, manage all your financial operations in one place.
          </Paragraph>
          
          <Space size="large">
            <Button 
              size="large" 
              className="h-12 text-base px-8"
              onClick={handleLogin}
            >
              Get Started
            </Button>
            <Button 
              size="large" 
              type="text" 
              className="h-12 text-base px-8 text-white border-white"
            >
              Learn More
            </Button>
          </Space>
        </div>

        {/* Statistics Section */}
        <div className="py-20 px-12 bg-gray-100">
          <Title level={2} className="text-center mb-12">
            Trusted by Financial Institutions
          </Title>
          
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="text-center border-none shadow-lg">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: '#1890ff' }}
                    className="text-2xl"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Features Section */}
        <div className="py-20 px-12">
          <Title level={2} className="text-center mb-12">
            Comprehensive Financial Solutions
          </Title>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  hoverable
                  className="h-full text-center border-none shadow-lg"
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <Title level={4} className="mb-4">
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
        <div className="py-20 px-12 bg-gray-900 text-white text-center">
          <Title level={2} className="text-white mb-6">
            Ready to Transform Your Financial Operations?
          </Title>
          <Paragraph className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of financial professionals who trust our platform for their daily operations.
            Start managing your branch finances more efficiently today.
          </Paragraph>
          
          <Button 
            type="primary" 
            size="large"
            icon={<LoginOutlined />}
            className="h-12 text-base px-8"
            onClick={handleLogin}
          >
            Start Your Journey
          </Button>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="text-center bg-gray-100 py-6 px-12">
        <Divider />
        <Space direction="vertical" size="small">
          <Title level={4} className="m-0">
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