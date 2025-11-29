import React from 'react';
import { Card, Typography, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import DisbursementRoll from '../../components/Branch/DisbursementRoll';

const { Title, Text } = Typography;

export const DisbursementRollPage: React.FC = () => {
  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            <Space>
              <FileTextOutlined />
              Disbursement Roll
            </Space>
          </Title>
          <Text type="secondary">
            View and manage branch disbursement roll data by month and year
          </Text>
        </div>

        {/* Main Content */}
        <Card>
          <DisbursementRoll />
        </Card>
      </Space>
    </div>
  );
};