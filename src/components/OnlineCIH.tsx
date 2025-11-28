import React, { useState } from 'react';
import { 
  Card, 
  Statistic, 
  Space, 
  Typography, 
  Alert,
  Spin,
  Button,
  Tag,
  DatePicker
} from 'antd';
import { DollarOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetMe } from '../hooks/Auth/useGetMe';
import { useGetOnlineCIHTSO } from '../hooks/Metrics/useGetOnlineCIH-TSO';
import { calculations } from '../utils/calculations';

const { Text } = Typography;

interface OnlineCIHProps {
  date?: string;
}

export const OnlineCIHComponent: React.FC<OnlineCIHProps> = ({ date }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    date || dayjs().format('YYYY-MM-DD')
  );
  
  const { data: currentUser } = useGetMe();
  const { 
    data: metricsData, 
    isLoading: loading, 
    error,
    refetch: refetchMetrics 
  } = useGetOnlineCIHTSO({ date: selectedDate });

  const user = currentUser?.data;
  
  // Find current branch data from metrics
  const branchMetric = metricsData?.data?.raw?.find(
    metric => user?.branchId && metric.branch.id === user.branchId
  );
  
  const onlineCIH = branchMetric?.onlineCIH || 0;
  const lastUpdated = metricsData?.data?.generatedAt ? 
    dayjs(metricsData.data.generatedAt).format('HH:mm:ss') : 
    dayjs().format('HH:mm:ss');

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
        <Space>
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={(date) => {
              if (date) {
                setSelectedDate(date.format('YYYY-MM-DD'));
              }
            }}
            format="YYYY-MM-DD"
            size="small"
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => refetchMetrics()}
            loading={loading}
            size="small"
            type="text"
          >
            Refresh
          </Button>
        </Space>
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
          description={error.message || 'Failed to fetch data'}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : !branchMetric ? (
        <Alert
          message="No Data Found"
          description="No cashbook data found for the selected date"
          type="info"
          showIcon
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
              Branch Information:
            </Text>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Branch:</Text>
                <Text style={{ color: '#1890ff' }}>
                  {branchMetric.branch.name}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Code:</Text>
                <Text style={{ color: '#722ed1' }}>
                  {branchMetric.branch.code}
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
        </Space>
      )}
    </Card>
  );
};