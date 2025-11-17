import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { authService, emailService } from '../../services/auth';
import type { LoginForm } from '../../types';

const { Title, Text } = Typography;

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(values);
      
      if (response.success && response.data) {
        login(response.data);
        
        // Send email notification for branch login
        if (response.data.role === 'BR') {
          await emailService.sendBranchLoginNotification(response.data);
        }
        
        // Navigate to appropriate dashboard based on role
        const state = location.state as LocationState;
        const from = state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          // Default navigation based on role
          if (response.data.role === 'HO') {
            navigate('/app/dashboard', { replace: true });
          } else {
            navigate('/app/dashboard/branch', { replace: true });
          }
        }
      } else {
        setError(response.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
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
          
          {error && (
            <Alert 
              message={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Username"
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
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
          
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              For demo purposes:<br/>
              HO: admin / admin123<br/>
              BR: branch1 / branch123
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};