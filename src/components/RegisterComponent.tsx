import React from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Typography,
  Row,
  Col
} from 'antd';
import { toast } from 'sonner';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UserAddOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/Auth/useRegister';
import type { RegisterRequest } from '../hooks/Auth/useRegister';

const { Title, Text } = Typography;

interface RegisterComponentProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const RegisterComponent: React.FC<RegisterComponentProps> = ({
  onSuccess,
  redirectTo = '/login'
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Register mutation
  const registerMutation = useRegister();

  const handleSubmit = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const registerData: RegisterRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: 'HO', // Default role
      };

      await registerMutation.mutateAsync(registerData);
      
      toast.success('Account created successfully! Please login to continue.');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to login page
        navigate(redirectTo);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Registration failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
              Create Account
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Join Dominion Seedstars Management System
            </Text>
          </div>

          {/* Registration Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            size="large"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="username"
                  label="Username"
                  rules={[
                    { required: true, message: 'Please enter your username' },
                    { min: 3, message: 'Username must be at least 3 characters' },
                    { max: 50, message: 'Username cannot exceed 50 characters' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your username"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter your email address"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number'
                    }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={registerMutation.isPending}
                block
                style={{ 
                  height: '50px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                icon={<UserAddOutlined />}
              >
                {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 'bold' }}>
                Sign In
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};