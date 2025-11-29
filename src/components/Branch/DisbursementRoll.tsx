
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
  Select,
  Tag,
  Divider,
  Progress,
  Button,
  Tooltip
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DollarCircleOutlined,
  
  InfoCircleOutlined,
  BarChartOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import { useGetDisbursementRoll, type DisbursementRoll as DisbursementRollType } from '../../hooks/Branch/DisbursementRoll/useGetDisbursementRoll';
import { useGetMe } from '../../hooks/Auth/useGetMe';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const DisbursementRoll = () => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  
  // Current date defaults
  const currentDate = dayjs();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.format('MM'));
  const [selectedYear, setSelectedYear] = useState(currentDate.format('YYYY'));
  
  const disbursementRollQuery = useGetDisbursementRoll(
    selectedMonth, 
    selectedYear, 
    user?.branchId || ''
  );
  
  useEffect(() => {
    if (disbursementRollQuery.data) {
      console.log('Disbursement Roll Data:', disbursementRollQuery.data);
    }
  }, [disbursementRollQuery.data]);

  const handleRefresh = () => {
    disbursementRollQuery.refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getMonthName = (monthNum: number) => {
    return dayjs().month(monthNum - 1).format('MMMM');
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, '0'),
    label: dayjs().month(i).format('MMMM')
  }));

  // Generate year options (current year and past 2 years)
  const yearOptions = Array.from({ length: 3 }, (_, i) => {
    const year = currentDate.year() - i;
    return {
      value: year.toString(),
      label: year.toString()
    };
  });

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getTableData = (data: DisbursementRollType) => [
    {
      key: 'previous',
      description: 'Previous Month Disbursement',
      amount: data.previousDisbursement,
      type: 'previous',
      icon: <DollarCircleOutlined style={{ color: '#722ed1' }} />
    },
    {
      key: 'daily',
      description: 'Daily Disbursement Average',
      amount: data.dailyDisbursement,
      type: 'daily',
      icon: <CalendarOutlined style={{ color: '#52c41a' }} />
    },
    {
      key: 'total',
      description: 'Total Disbursement Roll',
      amount: data.disbursementRoll,
      type: 'total',
      icon: <BarChartOutlined style={{ color: '#1890ff' }} />
    }
  ];

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: any) => (
        <Space>
          {record.icon}
          <Text strong={record.type === 'total'}>
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
          strong={record.type === 'total'}
          style={{
            color: record.type === 'total' ? '#1890ff' : 
                   record.type === 'daily' ? '#52c41a' : '#722ed1',
            fontSize: record.type === 'total' ? '16px' : '14px'
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
          previous: 'purple',
          daily: 'green',
          total: 'blue'
        };
        const labels = {
          previous: 'PREVIOUS',
          daily: 'DAILY AVG',
          total: 'TOTAL'
        };
        return (
          <Tag color={colors[type as keyof typeof colors]}>
            {labels[type as keyof typeof labels]}
          </Tag>
        );
      }
    }
  ];

  if (disbursementRollQuery.isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Loading disbursement roll data...</p>
        </div>
      </Card>
    );
  }

  if (disbursementRollQuery.isError) {
    return (
      <Card>
        <Alert
          message="Error Loading Data"
          description="Failed to load disbursement roll data. Please try again."
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

  const responseData = disbursementRollQuery.data?.data?.disbursementRoll;
  
  if (!responseData) {
    return (
      <Card>
        <Alert
          message="No Data Available"
          description={`No disbursement roll data found for ${getMonthName(parseInt(selectedMonth))} ${selectedYear}.`}
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const growthRate = calculateGrowthRate(responseData.disbursementRoll, responseData.previousDisbursement);
  const dailyPercentage = (responseData.dailyDisbursement / responseData.disbursementRoll) * 100;
  const tableData = getTableData(responseData);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header Controls */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space size="large">
            <div>
              <Text strong>Month:</Text>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 120, marginLeft: 8 }}
              >
                {monthOptions.map(month => (
                  <Option key={month.value} value={month.value}>
                    {month.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Text strong>Year:</Text>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 100, marginLeft: 8 }}
              >
                {yearOptions.map(year => (
                  <Option key={year.value} value={year.value}>
                    {year.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={disbursementRollQuery.isFetching}
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
              title="Previous Month"
              value={responseData.previousDisbursement}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Daily Average"
              value={responseData.dailyDisbursement}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Disbursement"
              value={responseData.disbursementRoll}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Growth Rate"
              value={Math.abs(growthRate)}
              precision={2}
              suffix="%"
              prefix={growthRate >= 0 ? <BarChartOutlined/> : <BarChartOutlined style={{ transform: 'scaleY(-1)' }} />}
              valueStyle={{ 
                color: growthRate >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Analysis Cards */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Performance" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Growth from Previous Month</Text>
                <Tooltip title={`${growthRate >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(growthRate).toFixed(2)}%`}>
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </div>
              <Progress
                percent={Math.min(Math.abs(growthRate), 100)}
                strokeColor={growthRate >= 0 ? '#52c41a' : '#ff4d4f'}
                format={() => `${growthRate >= 0 ? '+' : '-'}${Math.abs(growthRate).toFixed(1)}%`}
              />
              <Text type="secondary">
                {growthRate >= 0 ? 'Positive growth indicates increased disbursement activity' : 'Negative growth indicates reduced disbursement activity'}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Daily Average Impact" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Daily Average Contribution</Text>
                <Tooltip title="Percentage contribution of daily average to total disbursement">
                  <InfoCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </div>
              <Progress
                percent={dailyPercentage}
                strokeColor="#ff7a00"
                format={() => `${dailyPercentage.toFixed(1)}%`}
              />
              <Text type="secondary">
                Daily disbursement represents {dailyPercentage.toFixed(1)}% of total monthly disbursement
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Breakdown Table */}
      <Card 
        title={`Disbursement Roll - ${getMonthName(responseData.month)} ${responseData.year}`}
        extra={
          <Tag color="blue" icon={<FileTextOutlined />}>
            Branch: {user?.branchName || 'Current Branch'}
          </Tag>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                <Table.Summary.Cell index={0}>
                  <Text strong>Net Monthly Change</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text
                    strong
                    style={{
                      color: growthRate >= 0 ? '#52c41a' : '#ff4d4f',
                      fontSize: '16px'
                    }}
                  >
                    {growthRate >= 0 ? '+' : ''}{formatCurrency(responseData.disbursementRoll - responseData.previousDisbursement)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Tag color={growthRate >= 0 ? 'green' : 'red'}>
                    {growthRate >= 0 ? 'INCREASE' : 'DECREASE'}
                  </Tag>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
        
        <Divider />
        
        {/* Performance Insights */}
        <Card size="small" title="Performance Insights" style={{ backgroundColor: '#f9f9f9' }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#1890ff' }}>
                  ₦{(responseData.disbursementRoll / 1000000).toFixed(2)}M
                </div>
                <Text type="secondary">Total Volume (Millions)</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#52c41a' }}>
                  ₦{(responseData.dailyDisbursement / 1000).toFixed(0)}K
                </div>
                <Text type="secondary">Daily Average (Thousands)</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  color: growthRate >= 0 ? '#52c41a' : '#ff4d4f' 
                }}>
                  {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </div>
                <Text type="secondary">Monthly Growth</Text>
              </div>
            </Col>
          </Row>
        </Card>
        
        {/* Record Info */}
        <Row justify="space-between" style={{ marginTop: 16 }}>
          <Col>
            <Text type="secondary">
              Last Updated: {dayjs(responseData.updatedAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Col>
          <Col>
            <Text type="secondary">
              Record ID: {responseData._id.slice(-8)}
            </Text>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default DisbursementRoll;