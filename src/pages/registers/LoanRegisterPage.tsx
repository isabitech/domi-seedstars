import React from 'react';
import { Card, Typography, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import LoanRegister from '../../components/Branch/LoanRegister';

const { Title, Text } = Typography;

export const LoanRegisterPage: React.FC = () => {
  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            <Space>
              <BookOutlined />
              Loan Register
            </Space>
          </Title>
          <Text type="secondary">
            View and manage branch loan register entries
          </Text>
        </div>

        {/* Main Content */}
        <Card>
          <LoanRegister />
        </Card>
      </Space>
    </div>
  );
};