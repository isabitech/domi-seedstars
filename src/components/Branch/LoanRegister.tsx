import React, { useState, useEffect } from 'react';
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
  DatePicker,
  Tag,
  Divider,
  Progress,
  Button
} from 'antd';
import { toast } from 'sonner';
import {
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DollarCircleOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { CURRENT_DATE } from '../../lib/utils';
import { useGetMe } from '../../hooks/Auth/useGetMe';
import { useGetLoanRegister, type LoanRegister as LoanRegisterType } from '../../hooks/Branch/Register/useGetLoanRegister';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const LoanRegister = () => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  const [selectedDate, setSelectedDate] = useState(CURRENT_DATE);
  
  const branchLoanRegister = useGetLoanRegister(selectedDate, user?.branchId || '');
  
  useEffect(() => {
    if (branchLoanRegister.data) {
      console.log('Loan Register Data:', branchLoanRegister.data);
      
      // Check if operations is null and show warning toast
      if (branchLoanRegister.data.operations === null) {
        toast.warning(`Operations not found for ${dayjs(selectedDate).format('DD MMMM YYYY')}`);
      }
    }
  }, [branchLoanRegister.data, selectedDate]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  const handleRefresh = () => {
    branchLoanRegister.refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const calculateNetChange = (data: LoanRegisterType) => {
    return data.loanDisbursementWithInterest - data.loanCollection;
  };

  const calculateCollectionRate = (collected: number, previousTotal: number) => {
    if (previousTotal === 0) return 0;
    return (collected / previousTotal) * 100;
  };

  const calculatePortfolioGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Table data for detailed breakdown
  const getTableData = (data: LoanRegisterType) => [
    {
      key: 'previous',
      description: 'Previous Loan Portfolio',
      amount: data.previousLoanTotal,
      type: 'opening',
      icon: <DollarCircleOutlined style={{ color: '#722ed1' }} />
    },
    {
      key: 'disbursement',
      description: 'New Loan Disbursements (With Interest)',
      amount: data.loanDisbursementWithInterest,
      type: 'disbursement',
      icon: <ArrowUpOutlined style={{ color: '#52c41a' }} />
    },
    {
      key: 'collection',
      description: 'Loan Collections/Repayments',
      amount: data.loanCollection,
      type: 'collection',
      icon: <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
    },
    {
      key: 'current',
      description: 'Current Loan Balance',
      amount: data.currentLoanBalance,
      type: 'closing',
      icon: <BankOutlined style={{ color: '#1890ff' }} />
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
            color: record.type === 'disbursement' ? '#52c41a' : 
                   record.type === 'collection' ? '#ff4d4f' : 
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
          disbursement: 'green',
          collection: 'orange',
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

  if (branchLoanRegister.isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading loan register data...</p>
        </div>
      </Card>
    );
  }

  if (branchLoanRegister.isError) {
    return (
      <Card>
        <Alert
          message="Error Loading Data"
          description="Failed to load loan register data. Please try again."
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

  const data = branchLoanRegister.data;
  
  if (!data || data.operations === null || !data.loanRegister) {
    return (
      <Card>
         <Space>
            <CalendarOutlined />
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Space>
        <Alert
          message="No Operations Data Available"
          description={`No loan register data found for ${dayjs(selectedDate).format('DD MMMM YYYY')}. Please ensure operations have been completed for this date.`}
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

  const loanData = data.loanRegister;

  const netChange = calculateNetChange(loanData);
  const collectionRate = calculateCollectionRate(loanData.loanCollection, loanData.previousLoanTotal);
  const portfolioGrowth = calculatePortfolioGrowth(loanData.currentLoanBalance, loanData.previousLoanTotal);
  const tableData = getTableData(loanData);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header Controls */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space>
            <CalendarOutlined />
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Space>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={branchLoanRegister.isFetching}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Previous Total Loan "
              value={loanData.previousLoanTotal}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<></>}
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
              title="Loan Disubursements (With Interest)"
              value={loanData.loanDisbursementWithInterest}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<ArrowUpOutlined />}
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
              title="Loan Collections"
              value={loanData.loanCollection}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<ArrowDownOutlined />}
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
              title="Current Loan Balance"
              value={loanData.currentLoanBalance}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BankOutlined />}
              valueStyle={{ 
                color: '#1890ff',
                fontSize: window.innerWidth <= 768 ? '16px' : '24px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Analysis Cards */}
      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card title="Portfolio Net Change" size="small">
            <Statistic
              value={Math.abs(netChange)}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ 
                color: netChange >= 0 ? '#52c41a' : '#ff4d4f',
                fontSize: window.innerWidth <= 768 ? '16px' : '20px'
              }}
              prefix={netChange >= 0 ? '+' : '-'}
              suffix={
                <Text style={{ fontSize: '12px', marginLeft: '8px' }}>
                  {netChange >= 0 ? 'Net Growth' : 'Net Reduction'}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Collection Rate" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                value={collectionRate}
                precision={2}
                suffix="%"
                valueStyle={{ 
                  color: '#ff7a00', 
                  fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                }}
                prefix={<PercentageOutlined />}
              />
              <Progress
                percent={Math.min(collectionRate, 100)}
                strokeColor="#ff7a00"
                showInfo={false}
                size="small"
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Collections vs Previous Portfolio
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Portfolio Growth" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                value={Math.abs(portfolioGrowth)}
                precision={2}
                suffix="%"
                valueStyle={{ 
                  color: portfolioGrowth >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                }}
                prefix={portfolioGrowth >= 0 ? '+' : '-'}
              />
              <Progress
                percent={Math.min(Math.abs(portfolioGrowth), 100)}
                strokeColor={portfolioGrowth >= 0 ? '#52c41a' : '#ff4d4f'}
                showInfo={false}
                size="small"
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Portfolio Change from Previous Day
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Breakdown Table */}
      <Card 
        title={`Loan Register - ${dayjs(selectedDate).format('DD MMMM YYYY')}`}
        extra={
          <Tag color="blue" icon={<BankOutlined />}>
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
                    <Text strong>Portfolio Net Change</Text>
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
                      {netChange >= 0 ? 'GROWTH' : 'REDUCTION'}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
        
        <Divider />
        
        {/* Portfolio Health Indicators */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card size="small" title="Portfolio Health Indicators">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: window.innerWidth <= 768 ? '18px' : '24px', 
                      color: '#52c41a' 
                    }}>
                      {((loanData.loanCollection / (loanData.loanDisbursementWithInterest || 1)) * 100).toFixed(1)}%
                    </div>
                    <Text type="secondary">Collection vs Disbursement</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: window.innerWidth <= 768 ? '18px' : '24px', 
                      color: '#1890ff' 
                    }}>
                      ₦{(loanData.currentLoanBalance / 1000000).toFixed(2)}M
                    </div>
                    <Text type="secondary">Portfolio Size (Millions)</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: window.innerWidth <= 768 ? '18px' : '24px', 
                      color: portfolioGrowth >= 0 ? '#52c41a' : '#ff4d4f' 
                    }}>
                      {portfolioGrowth >= 0 ? '+' : ''}{portfolioGrowth.toFixed(1)}%
                    </div>
                    <Text type="secondary">Daily Growth Rate</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        {/* Additional Info */}
        <Row justify="space-between">
          <Col>
            <Text type="secondary">
              Last Updated: {dayjs(loanData.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">
              Record ID: {loanData._id ? loanData._id.slice(-8) : 'N/A'}
            </Text>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default LoanRegister;