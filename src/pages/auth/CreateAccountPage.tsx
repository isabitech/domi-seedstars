import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Select, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../../hooks/Users(Head Office - HO)/useCreateUser';
import type { CreateUserRequest } from '../../hooks/Users(Head Office - HO)/useCreateUser';

const { Title, Text } = Typography;
const { Option } = Select;

interface CreateAccountForm extends CreateUserRequest {
  confirmPassword: string;
}

export const CreateAccountPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const createUserMutation = useCreateUser();
  const [isSuccess, setIsSuccess] = useState(false);

  const onFinish = async (values: CreateAccountForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = values;
    
    createUserMutation.mutate(userData, {
      onSuccess: (response) => {
        if (response.success) {
          setIsSuccess(true);
          form.resetFields();
        }
      }
    });
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Please confirm your password!'));
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match!'));
    }
    return Promise.resolve();
  };

  if (isSuccess) {
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
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Account Created Successfully!"
              description="The user account has been created and is now active."
              type="success"
              showIcon
            />
            <Space>
              <Button 
                type="primary"
                onClick={() => {
                  setIsSuccess(false);
                  form.resetFields();
                }}
              >
                Create Another Account
              </Button>
              <Button onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

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
          width: 500, 
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: '12px'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
              Create User Account
            </Title>
            <Text type="secondary">Admin Panel - User Registration</Text>
          </div>
          
          {createUserMutation.isError && (
            <Alert 
              message="Account Creation Failed" 
              description={createUserMutation.error?.message || 'An error occurred while creating the account'}
              type="error" 
              showIcon 
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form
            form={form}
            name="createAccount"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please input username!' },
                { min: 3, message: 'Username must be at least 3 characters!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Enter username"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Enter email address"
              />
            </Form.Item>
            
            <Form.Item
              name="role"
              label="User Role"
              rules={[{ required: true, message: 'Please select user role!' }]}
            >
              <Select 
                placeholder="Select user role" 
                allowClear
                onChange={() => {
                  // Clear branchId when role changes
                  form.setFieldsValue({ branchId: undefined });
                }}
              >
                <Option value="HO">
                  <Space>
                    <UserOutlined />
                    Head Office (HO) - Administrator
                  </Space>
                </Option>
                <Option value="BR">
                  <Space>
                    <BankOutlined />
                    Branch (BR) - Branch User
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.role !== currentValues.role
              }
            >
              {({ getFieldValue }) => {
                const role = getFieldValue('role');
                return role === 'BR' ? (
                  <Form.Item
                    name="branchId"
                    label="Branch ID"
                    rules={[
                      { required: true, message: 'Please input branch ID for branch users!' },
                      { 
                        pattern: /^[a-zA-Z0-9\-_]+$/, 
                        message: 'Branch ID can only contain letters, numbers, hyphens, and underscores!'
                      }
                    ]}
                  >
                    <Input 
                      prefix={<BankOutlined />} 
                      placeholder="Enter branch ID (e.g., BR-001, LAGOS-MAIN)"
                    />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
            
            <Divider />
            
            <Form.Item
              name="password"
              label="Password"
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password (min 6 characters)"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[{ validator: validateConfirmPassword }]}
              dependencies={['password']}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={createUserMutation.isPending}
                style={{ width: '100%' }}
              >
                Create Account
              </Button>
            </Form.Item>

            <Form.Item>
              <Button 
                type="link"
                onClick={() => navigate('/login')}
                style={{ width: '100%' }}
              >
                Back to Login
              </Button>
            </Form.Item>
          </Form>
          
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            <Text type="secondary">
              Admin Panel - Only authorized personnel should create accounts
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};