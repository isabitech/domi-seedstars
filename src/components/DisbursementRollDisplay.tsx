import React, { useState, useEffect } from 'react';
import { Card, Statistic, Typography, Space, Alert, Spin, Tag } from 'antd';
import { DollarOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import type { Cashbook2 } from '../types';

const { Text } = Typography;

interface DisbursementRollDisplayProps {
  cashbook2Data?: Partial<Cashbook2>;
  previousDisbursement?: number;
  loading?: boolean;
}

export const DisbursementRollDisplay: React.FC<DisbursementRollDisplayProps> = ({
  cashbook2Data,
  previousDisbursement = 50000, // Default previous disbursement from HO
  loading = false
}) => {
  const { user } = useAuthStore();
  const [disbursementRoll, setDisbursementRoll] = useState(previousDisbursement);

  useEffect(() => {
    if (cashbook2Data?.disAmt) {
      const newRoll = calculations.calculateDisbursementRoll(previousDisbursement, cashbook2Data.disAmt);
      setDisbursementRoll(newRoll);
    }
  }, [cashbook2Data, previousDisbursement]);

  return (
    <Card 
      title={
        <Space>
          <DollarOutlined />
          Disbursement Roll
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
          <p style={{ marginTop: 8 }}>Calculating...</p>
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Statistic
            title="Total Disbursement Roll"
            value={disbursementRoll}
            precision={2}
            prefix="₦"
            valueStyle={{ 
              color: '#fa8c16', 
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          />
          
          <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
            <Text strong style={{ color: '#666' }}>Calculation Breakdown:</Text>
            <br />
            <Text type="secondary">Previous Disbursement (HO Input): ₦{previousDisbursement.toLocaleString()}</Text>
            <br />
            <Text type="secondary">Daily Disbursement (DIS AMT): ₦{(cashbook2Data?.disAmt || 0).toLocaleString()}</Text>
            <br />
            <Text code>Total = {previousDisbursement.toLocaleString()} + {(cashbook2Data?.disAmt || 0).toLocaleString()} = ₦{disbursementRoll.toLocaleString()}</Text>
          </div>

          {user?.role === 'BR' && (
            <Alert
              message={
                <Space>
                  <InfoCircleOutlined />
                  <Text strong>Branch User Notice</Text>
                </Space>
              }
              description="This field is automatically calculated and cannot be edited by branch users. Previous disbursement amounts are set by Head Office."
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