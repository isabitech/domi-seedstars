import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

export const CashbookPage: React.FC = () => {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Cashbook 1 - Daily Input',
      children: (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h3>Cashbook 1 - Daily Input Form</h3>
          <p>Daily cashbook input form coming soon...</p>
          <p>This will include cash receipts, disbursements, and daily balancing.</p>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Cashbook 2 - Disbursements',
      children: (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h3>Cashbook 2 - Disbursements Form</h3>
          <p>Disbursements tracking form coming soon...</p>
          <p>This will include expense tracking, vendor payments, and approval workflows.</p>
        </div>
      ),
    },
  ];

  return (
    <Tabs 
      items={items} 
      size="large"
      type="card"
      defaultActiveKey="1"
    />
  );
};