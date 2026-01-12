import React, { useEffect } from 'react';
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Space,
  Typography,
  Alert,
  Spin,
  Tag,
  Divider,
  Progress,
  Button
} from 'antd';
import { toast } from 'sonner';
import {
  ReloadOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  BoxPlotOutlined
} from '@ant-design/icons';
import { useGetSavingsRegister, type SavingsRegister as SavingsRegisterType } from '../../hooks/Branch/Register/useGetSavingsRegister';
import { useGetMe } from '../../hooks/Auth/useGetMe';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SavingsRegisterProps {
  selectedDate: string;
}

const SavingsRegister: React.FC<SavingsRegisterProps> = ({ selectedDate }) => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  
  const branchSavingsRegister = useGetSavingsRegister(selectedDate, user?.branchId || '');
  
  useEffect(() => {
    if (branchSavingsRegister.data) {
      console.log('Savings Register Data:', branchSavingsRegister.data);
      
      // Check if operations is null and show warning toast
      if (branchSavingsRegister.data?.operations === null) {
        toast.warning(`Operations not found for ${dayjs(selectedDate).format('DD MMMM YYYY')}`);
      }
    }
  }, [branchSavingsRegister.data, selectedDate]);

  const handleRefresh = () => {
    branchSavingsRegister.refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const calculateNetChange = (data: SavingsRegisterType) => {
    return data.savings - data.savingsWithdrawal;
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Table data for detailed breakdown
  const getTableData = (data: SavingsRegisterType) => [
    {
      key: 'previous',
      description: 'Previous Savings Total',
      amount: data.previousSavingsTotal,
      type: 'opening',
      icon: <DollarCircleOutlined style={{ color: '#722ed1' }} />
    },
    {
      key: 'deposits',
      description: 'New Savings Deposits',
      amount: data.savings,
      type: 'credit',
      icon: <BarChartOutlined style={{ color: '#52c41a' }} />
    },
    {
      key: 'withdrawals',
      description: 'Savings Withdrawals',
      amount: data.savingsWithdrawal,
      type: 'debit',
      icon: <BarChartOutlined style={{ color: '#ff4d4f' }} />
    },
    {
      key: 'current',
      description: 'Current Savings Balance',
      amount: data.currentSavings,
      type: 'closing',
      icon: <BoxPlotOutlined style={{ color: '#1890ff' }} />
    }
  ];

  const columns = [
    {
      title: 'Transaction Type',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: any) => (
        <Space>
          {record.icon}
          <Text strong={record.type === 'opening' || record.type === 'closing'}>
            {text}
          </Text>
        </Space>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number, record: any) => (
        <Text
          strong={record.type === 'opening' || record.type === 'closing'}
          style={{
            color: record.type === 'credit' ? '#52c41a' : 
                   record.type === 'debit' ? '#ff4d4f' : 
                   record.type === 'closing' ? '#1890ff' : '#722ed1',
            fontSize: window.innerWidth <= 768 ? '14px' : '16px'
          }}
        >
          {formatCurrency(amount)}
        </Text>
      )
    },
    {
      title: 'Category',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          opening: 'purple',
          credit: 'green',
          debit: 'red',
          closing: 'blue'
        };
        return (
          <Tag color={colors[type as keyof typeof colors]}>
            {type.toUpperCase()}
          </Tag>
        );
      }
    }
  ];

  if (branchSavingsRegister.isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading savings register data...</p>
        </div>
      </Card>
    );
  }

  if (branchSavingsRegister.isError) {
    return (
      <Card>
        <Alert
          message="Error Loading Data"
          description="Failed to load savings register data. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const data = branchSavingsRegister.data;
  
  if (!data || data.operations === null || !data.savingsRegister) {
    return (
      <Card>
        <Alert
          message="No Operations Data Available"
          description={`No savings register data found for ${dayjs(selectedDate).format('DD MMMM YYYY')}. Please ensure operations have been completed for this date.`}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const savingsData = data.savingsRegister;

  const netChange = calculateNetChange(savingsData);
  const growthRate = calculateGrowthRate(savingsData.currentSavings, savingsData.previousSavingsTotal);
  const tableData = getTableData(savingsData);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header Controls */}
      <Card size="small">
        <Row justify="end" align="middle">
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={branchSavingsRegister.isFetching}
              type="primary"
              size="large"
            >
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Previous Balance"
              value={savingsData.previousSavingsTotal}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ 
                color: '#722ed1',
                fontSize: window.innerWidth <= 768 ? '16px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Savings Deposits"
              value={savingsData.savings}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BarChartOutlined />}
              valueStyle={{ 
                color: '#52c41a',
                fontSize: window.innerWidth <= 768 ? '16px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Savings Withdrawals"
              value={savingsData.savingsWithdrawal}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BarChartOutlined />}
              valueStyle={{ 
                color: '#ff4d4f',
                fontSize: window.innerWidth <= 768 ? '16px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Current Balance"
              value={savingsData.currentSavings}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BoxPlotOutlined />}
              valueStyle={{ 
                color: '#1890ff',
                fontSize: window.innerWidth <= 768 ? '16px' : '24px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Net Change & Growth Analysis */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Daily Net Change" size="small">
            <Statistic
              value={Math.abs(netChange)}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ 
                color: netChange >= 0 ? '#52c41a' : '#ff4d4f',
                fontSize: window.innerWidth <= 768 ? '18px' : '24px'
              }}
              prefix={netChange >= 0 ? '+' : '-'}
              suffix={
                <Text style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {netChange >= 0 ? 'Net Increase' : 'Net Decrease'}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Growth Rate" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                value={Math.abs(growthRate)}
                precision={2}
                suffix="%"
                valueStyle={{ 
                  color: growthRate >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px'
                }}
                prefix={growthRate >= 0 ? '+' : '-'}
              />
              <Progress
                percent={Math.min(Math.abs(growthRate), 100)}
                strokeColor={growthRate >= 0 ? '#52c41a' : '#ff4d4f'}
                showInfo={false}
                size="small"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Breakdown Table */}
      <Card 
        title={`Savings Register - ${dayjs(selectedDate).format('DD MMMM YYYY')}`}
        extra={
          <Tag color="blue" icon={<BoxPlotOutlined />}>
            Branch: {user?.branchName || 'Current Branch'}
          </Tag>
        }
      >
        <div style={{
          overflow: 'auto',
          ...(window.innerWidth <= 768 && {
            maxWidth: '100%',
            border: '1px solid #f0f0f0',
            borderRadius: '6px'
          })
        }}>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            size="middle"
            scroll={window.innerWidth <= 768 ? { x: 600 } : undefined}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Net Change for Day</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text
                      strong
                      style={{
                        color: netChange >= 0 ? '#52c41a' : '#ff4d4f',
                        fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                      }}
                    >
                      {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Tag color={netChange >= 0 ? 'green' : 'red'}>
                      {netChange >= 0 ? 'POSITIVE' : 'NEGATIVE'}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
        
        <Divider />
        
        {/* Additional Info */}
        <Row justify="space-between">
          <Col>
            <Text type="secondary">
              Last Updated: {dayjs(savingsData.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">
              Record ID: {savingsData._id.slice(-8)}
            </Text>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default SavingsRegister;