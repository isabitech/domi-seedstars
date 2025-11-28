import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLogin } from '../../hooks/Auth/useLogin';
import { useGetMe } from '../../hooks/Auth/useGetMe';

const { Title, Text } = Typography;

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const { data: currentUser, isSuccess: isAuthenticated } = useGetMe();
  
  const [form] = Form.useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const loginResponse = await loginMutation.mutateAsync(values);
      
      message.success('Login successful!');
      
      // Get user role from response or current user data
      const user = loginResponse?.data?.user || currentUser?.data;
      
      // Navigate based on user role
      if (user?.role === 'HO') {
        navigate('/app/dashboard');
      } else if (user?.role === 'BR') {
        navigate('/app/dashboard/branch');
      } else {
        // Fallback navigation
        const state = location.state as LocationState;
        const from = state?.from?.pathname;
        if (from && from !== '/') {
          navigate(from, { replace: true });
        } else {
          navigate('/app/dashboard', { replace: true });
        }
      }
    } catch (error: unknown) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { message?: string } } };
        errorMessage = responseError.response?.data?.message || 'Login failed';
      }
      
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: '12px'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
              Dominion Seedstars
            </Title>
            <Text type="secondary">Operations Management System</Text>
          </div>
          
          {loginMutation.isError && (
            <Alert 
              message={loginMutation.error?.message || 'Login failed'} 
              type="error" 
              showIcon 
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Email"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loginMutation.isPending}
                size="large"
                style={{ width: '100%' }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 'bold' }}>
                Create Account
              </Link>
            </Text>
          </div>
          
          {/* <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              For demo purposes:<br/>
              HO: admin@dominion.com / admin123<br/>
              BR: branch1@dominion.com / branch123
            </Text>
          </div> */}
        </Space>
      </Card>
    </div>
  );
};