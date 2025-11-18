import React from 'react';
import { Space, Typography, Breadcrumb, Tabs } from 'antd';
import { HomeOutlined, BankOutlined } from '@ant-design/icons';
import { BankStatement1 } from '../../components/BankStatement1';
import { BankStatement2 } from '../../components/BankStatement2';

const { Title } = Typography;

export const BankStatementPage: React.FC = () => {
  const tabItems = [
    {
      key: 'bs1',
      label: 'Bank Statement 1 (BS1)',
      children: <BankStatement1 />,
    },
    {
      key: 'bs2',
      label: 'Bank Statement 2 (BS2)',
      children: <BankStatement2 />,
    },
  ];

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Breadcrumb 
          items={[
            {
              href: '/app/dashboard',
              title: (
                <span>
                  <HomeOutlined />
                  <span>Dashboard</span>
                </span>
              ),
            },
            {
              title: (
                <span>
                  <BankOutlined />
                  <span>Bank Statements</span>
                </span>
              ),
            },
          ]}
        />
        
        <div>
          <Title level={2}>Bank Statements</Title>
          <p style={{ color: '#666', marginBottom: 0 }}>
            Manage and view bank statements with automatic data integration from cashbook entries.
          </p>
        </div>

        <Tabs
          items={tabItems}
          size="large"
          style={{ width: '100%' }}
          type="card"
        />
      </Space>
    </div>
  );
};