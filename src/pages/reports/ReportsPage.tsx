import React, { useState } from 'react';
import { Card, Tabs, DatePicker, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

// Import modular components
import { FinancialSummaryComponent } from './components/FinancialSummaryComponent';
import { FinancialTableComponent } from './components/FinancialTableComponent';
import { BranchPerformanceComponent } from './components/BranchPerformanceComponent';
import { TransactionLogComponent } from './components/TransactionLogComponent';

// Import data service
import {
  generateMockFinancialData,
  generateBranchPerformanceData,
  generateTransactionData,
  type FinancialData,
  type FinancialSummary
} from './utils/reportDataService';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [branchFilter, setBranchFilter] = useState('all');
  const loading = false; // Static for demo purposes

  // Generate data using the data service
  const financialData = generateMockFinancialData(dateRange[0], dateRange[1], branchFilter);
  const branchPerformanceData = generateBranchPerformanceData(dateRange[0], dateRange[1], branchFilter);
  const transactionData = generateTransactionData(dateRange[0], dateRange[1], branchFilter);

  // Calculate financial summary
  const calculateFinancialSummary = (data: FinancialData[]): FinancialSummary => {
    const totals = data.reduce(
      (acc, item) => ({
        totalIncome: acc.totalIncome + item.savings + item.loanCollection + item.charges,
        totalExpenses: acc.totalExpenses + item.disbursements + item.expenses,
        totalSavings: acc.totalSavings + item.savings,
        totalLoans: acc.totalLoans + item.loanCollection,
        totalDisbursements: acc.totalDisbursements + item.disbursements,
        totalCharges: acc.totalCharges + item.charges,
        totalTransferToSenate: acc.totalTransferToSenate + item.transferToSenate,
      }),
      {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        totalLoans: 0,
        totalDisbursements: 0,
        totalCharges: 0,
        totalTransferToSenate: 0,
      }
    );

    const netProfit = totals.totalIncome - totals.totalExpenses;
    const profitMargin = totals.totalIncome > 0 ? (netProfit / totals.totalIncome) * 100 : 0;
    const growthRate = Math.floor(Math.random() * 25) + 5; // Mock growth rate

    return {
      ...totals,
      netProfit,
      profitMargin,
      growthRate,
    };
  };

  const summary = calculateFinancialSummary(financialData);

  // Financial Report Component
  const FinancialReport = () => (
    <div>
      <FinancialSummaryComponent summary={summary} />
      <FinancialTableComponent 
        data={financialData} 
        dateRange={dateRange}
        loading={loading}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'financial',
      label: 'Financial Reports',
      children: <FinancialReport />,
    },
    {
      key: 'performance',
      label: 'Branch Performance',
      children: <BranchPerformanceComponent 
        data={branchPerformanceData} 
        dateRange={dateRange}
        loading={loading}
      />,
    },
    {
      key: 'transactions',
      label: 'Transaction Log',
      children: <TransactionLogComponent 
        data={transactionData} 
        dateRange={dateRange}
        loading={loading}
      />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Reports & Analytics</Title>
        
        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <div>
              <span style={{ marginRight: 8 }}>Date Range:</span>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                format="YYYY-MM-DD"
              />
            </div>
            <div>
              <span style={{ marginRight: 8 }}>Branch:</span>
              <Select value={branchFilter} onChange={setBranchFilter} style={{ width: 200 }}>
                <Option value="all">All Branches</Option>
                <Option value="br-001">Lagos Branch</Option>
                <Option value="br-002">Abuja Branch</Option>
                <Option value="br-003">Kano Branch</Option>
              </Select>
            </div>
          </Space>
        </Card>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
      />
    </div>
  );
};

export default ReportsPage;