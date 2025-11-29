import React from 'react';
import { Card, Typography, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import SavingsRegister from '../../components/Branch/SavingsRegister';

const { Title, Text } = Typography;

export const SavingsRegisterPage: React.FC = () => {
  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            <Space>
              <BookOutlined />
              Savings Register
            </Space>
          </Title>
          <Text type="secondary">
            View and manage branch savings register entries
          </Text>
        </div>

        {/* Main Content */}
        <Card>
          <SavingsRegister />
        </Card>
      </Space>
    </div>
  );
};