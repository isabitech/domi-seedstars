import React, { useState, useEffect } from 'react';
import { Card, Statistic, Typography, Space, Alert, Spin, Tag, Row, Col } from 'antd';
import { BankOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import type { Cashbook1, Cashbook2 } from '../types';

const { Text } = Typography;

interface CurrentBranchRegisterDisplayProps {
  cashbook1Data?: Partial<Cashbook1>;
  cashbook2Data?: Partial<Cashbook2>;
  previousTotalSavings?: number;
  previousTotalLoan?: number;
  loading?: boolean;
}

export const CurrentBranchRegisterDisplay: React.FC<CurrentBranchRegisterDisplayProps> = ({
  cashbook1Data,
  cashbook2Data,
  previousTotalSavings = 150000, // Default from HO
  previousTotalLoan = 75000, // Default from HO
  loading = false
}) => {
  const { user } = useAuthStore();
  const [currentSavings, setCurrentSavings] = useState(previousTotalSavings);
  const [currentLoan, setCurrentLoan] = useState(previousTotalLoan);

  useEffect(() => {
    // Calculate Current Savings Register
    if (cashbook1Data?.savings !== undefined && cashbook2Data?.savWith !== undefined) {
      const newSavings = calculations.calculateCurrentSavings(
        previousTotalSavings,
        cashbook1Data.savings,
        cashbook2Data.savWith
      );
      setCurrentSavings(newSavings);
    }

    // Calculate Current Loan Register  
    if (cashbook1Data?.loanCollection !== undefined && cashbook2Data?.disWithInt !== undefined) {
      const newLoan = calculations.calculateCurrentLoan(
        previousTotalLoan,
        cashbook2Data.disWithInt,
        cashbook1Data.loanCollection
      );
      setCurrentLoan(newLoan);
    }
  }, [cashbook1Data, cashbook2Data, previousTotalSavings, previousTotalLoan]);

  return (
    <Card 
      title={
        <Space>
          <BankOutlined />
          Current Branch Register
          {user?.role === 'BR' && (
            <Tag color="red" icon={<LockOutlined />}>Read Only</Tag>
          )}
        </Space>
      }
      className="stats-card"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
          <p style={{ marginTop: 8 }}>Calculating registers...</p>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Current Savings Register"
                value={currentSavings}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Current Loan Register"
                value={currentLoan}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
              />
            </Col>
          </Row>
          
          {/* Savings Calculation Breakdown */}
          <div style={{ backgroundColor: '#f6ffed', padding: '12px', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
            <Text strong style={{ color: '#52c41a' }}>Savings Register Calculation:</Text>
            <br />
            <Text type="secondary">Previous Total Savings (HO Input): ₦{previousTotalSavings.toLocaleString()}</Text>
            <br />
            <Text type="secondary">New Savings Today: ₦{(cashbook1Data?.savings || 0).toLocaleString()}</Text>
            <br />
            <Text type="secondary">Savings Withdrawal: ₦{(cashbook2Data?.savWith || 0).toLocaleString()}</Text>
            <br />
            <Text code>
              Total = {previousTotalSavings.toLocaleString()} + {(cashbook1Data?.savings || 0).toLocaleString()} - {(cashbook2Data?.savWith || 0).toLocaleString()} = ₦{currentSavings.toLocaleString()}
            </Text>
          </div>

          {/* Loan Calculation Breakdown */}
          <div style={{ backgroundColor: '#f0f5ff', padding: '12px', borderRadius: '6px', border: '1px solid #adc6ff' }}>
            <Text strong style={{ color: '#1890ff' }}>Loan Register Calculation:</Text>
            <br />
            <Text type="secondary">Previous Total Loan (HO Input): ₦{previousTotalLoan.toLocaleString()}</Text>
            <br />
            <Text type="secondary">Disbursement with Interest: ₦{(cashbook2Data?.disWithInt || 0).toLocaleString()}</Text>
            <br />
            <Text type="secondary">Loan Collection: ₦{(cashbook1Data?.loanCollection || 0).toLocaleString()}</Text>
            <br />
            <Text code>
              Total = {previousTotalLoan.toLocaleString()} + {(cashbook2Data?.disWithInt || 0).toLocaleString()} - {(cashbook1Data?.loanCollection || 0).toLocaleString()} = ₦{currentLoan.toLocaleString()}
            </Text>
          </div>

          {user?.role === 'BR' && (
            <Alert
              message={
                <Space>
                  <InfoCircleOutlined />
                  <Text strong>Branch User Notice</Text>
                </Space>
              }
              description="These registers are automatically calculated and cannot be edited by branch users. Previous totals are set by Head Office monthly."
              type="info"
              showIcon={false}
              style={{ marginTop: 8 }}
            />
          )}
        </Space>
      )}
    </Card>
  );
};