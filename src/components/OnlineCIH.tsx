import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Statistic, 
  Space, 
  Typography, 
  Alert,
  Spin,
  Button,
  Tag
} from 'antd';
import { DollarOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { cashbookService } from '../services/cashbook';
import { calculations } from '../utils/calculations';

const { Text } = Typography;

interface OnlineCIHProps {
  date?: string;
  refreshTrigger?: number; // To trigger refresh from parent
}

export const OnlineCIHComponent: React.FC<OnlineCIHProps> = ({
  date,
  refreshTrigger = 0
}) => {
  const [loading, setLoading] = useState(false);
  const [onlineCIH, setOnlineCIH] = useState<number>(0);
  const [cbTotal1, setCbTotal1] = useState<number>(0);
  const [cbTotal2, setCbTotal2] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const { user } = useAuthStore();
  const currentDate = date || new Date().toISOString().split('T')[0];

  const fetchOnlineCIH = useCallback(async () => {
    if (!user?.branchId) return;

    setLoading(true);
    setError('');

    try {
      // Fetch both cashbook totals
      const [cb1Response, cb2Response] = await Promise.all([
        cashbookService.getCashbook1(user.branchId, currentDate),
        cashbookService.getCashbook2(user.branchId, currentDate)
      ]);

      let cb1Total = 0;
      let cb2Total = 0;

      if (cb1Response.success && cb1Response.data) {
        cb1Total = cb1Response.data.cbTotal1;
        setCbTotal1(cb1Total);
      }

      if (cb2Response.success && cb2Response.data) {
        cb2Total = cb2Response.data.cbTotal2;
        setCbTotal2(cb2Total);
      }

      // Calculate Online CIH
      const cih = calculations.calculateOnlineCIH(cb1Total, cb2Total);
      setOnlineCIH(cih);
      setLastUpdated(new Date().toLocaleTimeString());

      if (cb1Total === 0 && cb2Total === 0) {
        setError('No cashbook data found for today');
      }

    } catch {
      setError('Failed to fetch cashbook data');
    } finally {
      setLoading(false);
    }
  }, [user?.branchId, currentDate]);

  // Initial load and refresh trigger
  useEffect(() => {
    fetchOnlineCIH();
  }, [fetchOnlineCIH, refreshTrigger]);

  const getStatusColor = () => {
    if (onlineCIH > 0) return '#52c41a'; // Green for positive
    if (onlineCIH < 0) return '#ff4d4f'; // Red for negative
    return '#faad14'; // Yellow for zero
  };

  const getStatusIcon = () => {
    if (onlineCIH > 0) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (onlineCIH < 0) return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    return <DollarOutlined style={{ color: '#faad14' }} />;
  };

  const getStatusMessage = () => {
    if (onlineCIH > 0) return 'Positive Balance';
    if (onlineCIH < 0) return 'Cash Deficit';
    return 'Balanced';
  };

  return (
    <Card 
      title={
        <Space>
          <DollarOutlined />
          Online Cash in Hand (CIH)
          <Tag color={user?.role === 'HO' ? 'purple' : 'blue'}>
            {user?.role === 'HO' ? 'Head Office View' : 'Branch View'}
          </Tag>
        </Space>
      }
      extra={
        <Button 
          icon={<ReloadOutlined />}
          onClick={fetchOnlineCIH}
          loading={loading}
          size="small"
          type="text"
        >
          Refresh
        </Button>
      }
      size="small"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none'
      }}
      headStyle={{ 
        color: 'white', 
        borderBottom: '1px solid rgba(255,255,255,0.2)' 
      }}
      bodyStyle={{ background: 'rgba(255,255,255,0.95)', margin: '8px', borderRadius: '6px' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 8 }}>Calculating Online CIH...</p>
        </div>
      ) : error ? (
        <Alert
          message="Unable to Calculate"
          description={error}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Statistic
              title={
                <Space>
                  {getStatusIcon()}
                  <span>Current Cash in Hand</span>
                </Space>
              }
              value={onlineCIH}
              precision={2}
              prefix="₦"
              valueStyle={{ 
                color: getStatusColor(),
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getStatusMessage()} • Updated: {lastUpdated}
            </Text>
          </div>

          <div style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '6px',
            border: '1px solid #d9d9d9'
          }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Calculation Breakdown:
            </Text>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>CB TOTAL 1:</Text>
                <Text style={{ color: '#1890ff' }}>
                  {calculations.formatCurrency(cbTotal1)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>CB TOTAL 2:</Text>
                <Text style={{ color: '#722ed1' }}>
                  {calculations.formatCurrency(cbTotal2)}
                </Text>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderTop: '1px solid #d9d9d9',
                paddingTop: 8,
                marginTop: 8
              }}>
                <Text strong>Online CIH:</Text>
                <Text strong style={{ color: getStatusColor() }}>
                  {calculations.formatCurrency(onlineCIH)}
                </Text>
              </div>
            </Space>
          </div>

          {(cbTotal1 === 0 || cbTotal2 === 0) && (
            <Alert
              message="Incomplete Data"
              description={
                cbTotal1 === 0 && cbTotal2 === 0 
                  ? "Both Cashbook 1 and Cashbook 2 data are missing for today"
                  : cbTotal1 === 0 
                    ? "Cashbook 1 data is missing for today"
                    : "Cashbook 2 data is missing for today"
              }
              type="info"
              showIcon
              style={{ fontSize: '12px' }}
            />
          )}
        </Space>
      )}
    </Card>
  );
};