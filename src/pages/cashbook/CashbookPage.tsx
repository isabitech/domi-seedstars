import React, { useState } from 'react';
import { Tabs, Space, Typography, Breadcrumb, Alert, Row, Col } from 'antd';
import type { TabsProps } from 'antd';
import { HomeOutlined, BookOutlined, DollarOutlined, BankOutlined } from '@ant-design/icons';
import { Cashbook1Component } from '../../components/Cashbook1';
import { Cashbook2Component } from '../../components/Cashbook2';
import { CashbookSidebar } from '../../components/CashbookSidebar';
import type { Cashbook1, Cashbook2, Prediction } from '../../types';
import { calculations } from '../../utils/calculations';

const { Title } = Typography;

export const CashbookPage: React.FC = () => {
  const [cashbook1Data, setCashbook1Data] = useState<Cashbook1 | null>(null);
  const [cashbook2Data, setCashbook2Data] = useState<Cashbook2 | null>(null);
  const [onlineCIH, setOnlineCIH] = useState<number>(0);
  const [sidebarRefresh, setSidebarRefresh] = useState<number>(0);
  const [predictionData, setPredictionData] = useState<Prediction | null>(null);

  const handleCashbook1Submit = (data: Cashbook1) => {
    console.log('Cashbook 1 submitted:', data);
    setCashbook1Data(data);
    
    // Recalculate Online CIH if Cashbook 2 data exists
    if (cashbook2Data) {
      const newOnlineCIH = calculations.calculateOnlineCIH(data.cbTotal1, cashbook2Data.cbTotal2);
      setOnlineCIH(newOnlineCIH);
    }
    
    // Trigger sidebar refresh
    setSidebarRefresh(prev => prev + 1);
  };

  const handleCashbook2Submit = (data: Cashbook2) => {
    console.log('Cashbook 2 submitted:', data);
    setCashbook2Data(data);
    
    // Calculate Online CIH if Cashbook 1 data exists
    if (cashbook1Data) {
      const newOnlineCIH = calculations.calculateOnlineCIH(cashbook1Data.cbTotal1, data.cbTotal2);
      setOnlineCIH(newOnlineCIH);
    }
    
    // Trigger sidebar refresh
    setSidebarRefresh(prev => prev + 1);
  };

  const handlePredictionSubmit = (data: Prediction) => {
    console.log('Prediction submitted:', data);
    setPredictionData(data);
  };
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <DollarOutlined />
          Cashbook 1 - Daily Input
        </span>
      ),
      children: (
        <div style={{ padding: '20px 0' }}>
          <Cashbook1Component onSubmit={handleCashbook1Submit} />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <BankOutlined />
          Cashbook 2 - Operations
        </span>
      ),
      children: (
        <div style={{ padding: '20px 0' }}>
          <Cashbook2Component 
            onSubmit={handleCashbook2Submit}
            cashbook1CBTotal={cashbook1Data?.cbTotal1 || 0}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Breadcrumb 
          items={[
            {
              href: '/dashboard',
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
                  <BookOutlined />
                  <span>Cashbook</span>
                </span>
              ),
            },
          ]}
        />
        
        <div>
          <Title level={2}>Daily Cashbook Management</Title>
          <p style={{ color: '#666', marginBottom: 16 }}>
            Record and manage daily cash operations, collections, disbursements, and transfers.
          </p>
          
          {cashbook1Data && cashbook2Data && (
            <Alert
              message={`Online Cash in Hand: ${calculations.formatCurrency(onlineCIH)}`}
              description={
                <span>
                  CB TOTAL 1: {calculations.formatCurrency(cashbook1Data.cbTotal1)} - 
                  CB TOTAL 2: {calculations.formatCurrency(cashbook2Data.cbTotal2)} = 
                  <strong>{calculations.formatCurrency(onlineCIH)}</strong>
                </span>
              }
              type={onlineCIH >= 0 ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </div>

        <Row gutter={[24, 24]}>
          <Col span={18}>
            <Tabs 
              items={items} 
              size="large"
              type="card"
              defaultActiveKey="1"
            />
          </Col>
          
          <Col span={6}>
            <div style={{ 
              position: 'sticky',
              top: '24px',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}>
              <CashbookSidebar 
                refreshTrigger={sidebarRefresh}
                onPredictionSubmit={handlePredictionSubmit}
              />
            </div>
          </Col>
        </Row>
      </Space>
    </div>
  );
};