import React from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Space, Typography } from 'antd';
import { RiseOutlined, FallOutlined, TrophyOutlined } from '@ant-design/icons';
import { calculations } from '../../../utils/calculations';

const { Text } = Typography;

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalSavings: number;
  totalLoans: number;
  totalDisbursements: number;
  totalCharges: number;
  totalTransferToSenate: number;
  profitMargin: number;
  growthRate: number;
}

interface FinancialSummaryProps {
  summary: FinancialSummary;
}

export const FinancialSummaryComponent: React.FC<FinancialSummaryProps> = ({ summary }) => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Financial Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Income"
              value={summary.totalIncome}
              precision={2}
              prefix="₦"
              suffix={<RiseOutlined style={{ color: '#3f8600' }} />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={summary.totalExpenses}
              precision={2}
              prefix="₦"
              suffix={<FallOutlined style={{ color: '#cf1322' }} />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Net Profit"
              value={summary.netProfit}
              precision={2}
              prefix="₦"
              valueStyle={{ color: summary.netProfit >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Profit Margin"
              value={summary.profitMargin}
              precision={2}
              suffix="%"
              valueStyle={{ color: summary.profitMargin >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Income Breakdown" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Savings"
                  value={summary.totalSavings}
                  prefix="₦"
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Loan Collection"
                  value={summary.totalLoans}
                  prefix="₦"
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Charges"
                  value={summary.totalCharges}
                  prefix="₦"
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Performance Indicators" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Collection Efficiency:</Text>
                <Progress 
                  percent={Math.min(((summary.totalSavings + summary.totalLoans) / summary.totalDisbursements * 100), 100)} 
                  status="active"
                  size="small"
                />
              </div>
              <div>
                <Text strong>Growth Rate:</Text>
                <Progress 
                  percent={summary.growthRate} 
                  status="active"
                  size="small"
                  strokeColor="#52c41a"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Alert
        message="Financial Health Status"
        description={`${summary.netProfit >= 0 ? 'Positive' : 'Negative'} cash flow detected. Total transfer to Senate: ${calculations.formatCurrency(summary.totalTransferToSenate)}`}
        type={summary.netProfit >= 0 ? 'success' : 'warning'}
        showIcon
        icon={summary.netProfit >= 0 ? <TrophyOutlined /> : undefined}
      />
    </Space>
  );
};