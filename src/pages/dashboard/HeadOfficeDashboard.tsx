import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  DatePicker,
  Space,
  Typography,
  Tag,
  Progress,
  Alert,
  Button,
  Spin,
  Select,
  Badge,
  Avatar,
  Tooltip,
  Timeline,
  Divider
} from 'antd';
import { toast } from 'sonner';
import { 
  DashboardOutlined,
  BankOutlined,
  TrophyOutlined,
  ReloadOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  DollarCircleOutlined,
  SwapOutlined,
  CreditCardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  PercentageOutlined,
  TeamOutlined,
  CalendarOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useGetOnlineCIHTSO } from '../../hooks/Metrics/useGetOnlineCIH-TSO';
import { calculations } from '../../utils/calculations';
import { useGetHODashboard, } from '../../hooks/Head Office/HO-Dashboard/useGetHODashboard';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const HeadOfficeDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'), 
    dayjs()
  ]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Fetch dashboard data using our hooks with date parameters
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    refetch: refetchDashboard,
    isRefetching 
  } = useGetHODashboard({
    startDate: dateRange[0].format('YYYY-MM-DD'),
    endDate: dateRange[1].format('YYYY-MM-DD'),
    branchId: selectedBranch === 'all' ? undefined : selectedBranch
  });

  const { 
    isLoading: isMetricsLoading,
    refetch: refetchMetrics 
  } = useGetOnlineCIHTSO({ date: selectedDate });

  const isLoading = isDashboardLoading || isMetricsLoading;

  // Refetch data when date range or branch selection changes
  useEffect(() => {
    refetchDashboard();
  }, [dateRange, selectedBranch, refetchDashboard]);

  // Refetch metrics when selectedDate changes
  useEffect(() => {
    refetchMetrics();
  }, [selectedDate, refetchMetrics]);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchDashboard(), refetchMetrics()]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh data');
    }
  };

  // Get data from hooks
  const dashboard = dashboardData?.data?.dashboardData;

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  const totals = dashboard?.consolidatedSummary || {
    totalSavings: 0,
    totalLoanCollection: 0,
    totalCharges: 0,
    totalDisbursements: 0,
    totalWithdrawals: 0,
    totalOnlineCIH: 0,
    totalTSO: 0,
    totalFrmHO: 0,
    totalDisbursementRollNo: 0,
    totalCollections: 0,
    activeBranches: [],
    totalOperations: 0
  };

  const branchTableColumns = [
    {
      title: 'Branch',
      key: 'branch',
      width: window.innerWidth <= 768 ? 120 : 200,
      render: (_: unknown, record: any) => (
        <Space>
          <Avatar icon={<BankOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
              {record.branchName}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
              {record.branchCode}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: unknown, record: any) => {
        const todayBranch = dashboard?.todayStatus?.find(t => t.branchCode === record.branchCode);
        const isCompleted = todayBranch?.isCompleted;
        return (
          <Badge 
            status={isCompleted ? 'success' : 'processing'} 
            text={
              <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                {isCompleted ? 'Complete' : 'Pending'}
              </Text>
            }
          />
        );
      }
    },
    {
      title: 'Savings',
      key: 'savings',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, record: any) => (
        <Text strong style={{ 
          color: '#52c41a',
          fontSize: window.innerWidth <= 768 ? '11px' : '12px'
        }}>
          {calculations.formatCurrency(record.totalSavings || 0)}
        </Text>
      )
    },
    {
      title: 'Disbursements',
      key: 'disbursements',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, record: any) => (
        <Text style={{ 
          color: '#fa8c16',
          fontSize: window.innerWidth <= 768 ? '11px' : '12px'
        }}>
          {calculations.formatCurrency(record.totalDisbursements || 0)}
        </Text>
      )
    },
    {
      title: 'Online CIH',
      key: 'onlineCIH',
      width: 120,
      align: 'right' as const,
      render: (_: unknown, record: any) => (
        <Text style={{ 
          color: '#1890ff',
          fontSize: window.innerWidth <= 768 ? '11px' : '12px'
        }}>
          {calculations.formatCurrency(record.avgOnlineCIH || 0)}
        </Text>
      )
    },
    {
      title: 'TSO',
      key: 'tso',
      width: 100,
      align: 'right' as const,
      render: (_: unknown, record: any) => (
        <Text style={{ 
          color: '#722ed1',
          fontSize: window.innerWidth <= 768 ? '11px' : '12px'
        }}>
          {calculations.formatCurrency(record.totalTSO || 0)}
        </Text>
      )
    },
    {
      title: 'Performance',
      key: 'performance',
      width: 120,
      render: (_: unknown, record: any) => {
        const efficiency = Math.min(100, (record.operationDays / 30) * 100);
        return (
          <Tooltip title={`${record.operationDays} operation days this month`}>
            <Progress 
              percent={efficiency} 
              size={window.innerWidth <= 768 ? 'small' : 'default'}
              status={efficiency >= 90 ? 'success' : efficiency >= 70 ? 'active' : 'exception'}
              format={(percent) => `${percent?.toFixed(0)}%`}
            />
          </Tooltip>
        );
      }
    },
    {
      title: 'Last Activity',
      key: 'lastOperation',
      width: 120,
      render: (_: unknown, record: any) => (
        <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
          {record.lastOperation ? dayjs(record.lastOperation).fromNow() : 'No data'}
        </Text>
      )
    }
  ];

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%', backgroundColor: '#f0f2f5', padding: 24 }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ fontSize: window.innerWidth <= 768 ? '20px' : '28px' }}>
              <DashboardOutlined /> Head Office Dashboard
            </Title>
            <Text type="secondary">
              Real-time overview of all branch operations
            </Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                loading={isRefetching}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
              >
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Enhanced Filters */}
        <Card size="small">
          <Row gutter={[16, 16]} align="middle" wrap>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Date:</Text>
                <DatePicker 
                  value={dayjs(selectedDate)}
                  onChange={(date) => {
                    if (date) {
                      setSelectedDate(date.format('YYYY-MM-DD'));
                    }
                  }}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  size={window.innerWidth <= 768 ? 'small' : 'middle'}
                  disabled={isMetricsLoading}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Date Range:</Text>
                <RangePicker 
                  value={dateRange}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0], dates[1]]);
                    }
                  }}
                  style={{ width: '100%' }}
                  size={window.innerWidth <= 768 ? 'small' : 'middle'}
                  disabled={isDashboardLoading}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Branch:</Text>
                <Select
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  style={{ width: '100%' }}
                  size={window.innerWidth <= 768 ? 'small' : 'middle'}
                >
                  <Select.Option value="all">All Branches</Select.Option>
                  {dashboard?.branches?.map(branch => (
                    <Select.Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>View:</Text>
                <Select
                  value={viewMode}
                  onChange={setViewMode}
                  style={{ width: '100%' }}
                  size={window.innerWidth <= 768 ? 'small' : 'middle'}
                >
                  <Select.Option value="summary">Summary</Select.Option>
                  <Select.Option value="detailed">Detailed</Select.Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Enhanced Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}
            >
              <Statistic
                title={<Text style={{ color: 'white', fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Total Savings</Text>}
                value={totals.totalSavings}
                precision={0}
                prefix={<DollarCircleOutlined style={{ color: '#52c41a' }} />}
                suffix="₦"
                valueStyle={{ 
                  color: 'white', 
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                  fontWeight: 'bold'
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
                  <ArrowUpOutlined style={{ color: '#52c41a' }} /> Total customer savings
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}
            >
              <Statistic
                title={<Text style={{ color: 'white', fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Total Disbursements</Text>}
                value={totals.totalDisbursements}
                precision={0}
                prefix={<CreditCardOutlined style={{ color: '#fa8c16' }} />}
                suffix="₦"
                valueStyle={{ 
                  color: 'white', 
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                  fontWeight: 'bold'
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
                  <ArrowDownOutlined style={{ color: '#fa8c16' }} /> Total loan disbursements
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}
            >
              <Statistic
                title={<Text style={{ color: 'white', fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Total Online CIH</Text>}
                value={totals.totalOnlineCIH}
                precision={0}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                suffix="₦"
                valueStyle={{ 
                  color: 'white', 
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                  fontWeight: 'bold'
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
                  <LineChartOutlined style={{ color: '#faad14' }} /> Cash in hand across branches
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* Secondary Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Total Collections</Text>}
                value={totals.totalCollections}
                precision={0}
                prefix="₦"
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Loan Collections</Text>}
                value={totals.totalLoanCollection}
                precision={0}
                prefix="₦"
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Total FRM HO</Text>}
                value={totals.totalFrmHO}
                precision={0}
                prefix="₦"
                valueStyle={{ 
                  color: '#13c2c2', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Disbursement Roll No</Text>}
                value={totals.totalDisbursementRollNo}
                valueStyle={{ 
                  color: '#fa8c16', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Total Withdrawals</Text>}
                value={totals.totalWithdrawals}
                precision={0}
                prefix="₦"
                valueStyle={{ 
                  color: '#ff4d4f', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Total TSO</Text>}
                value={totals.totalTSO}
                precision={0}
                prefix="₦"
                valueStyle={{ 
                  color: '#722ed1', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={3}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Total Charges</Text>}
                value={totals.totalCharges}
                precision={0}
                prefix="₦"
                valueStyle={{ 
                  color: '#fa541c', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Active Branches</Text>}
                value={totals.activeBranches.length}
                suffix={`/ ${dashboard?.branches?.length || 0}`}
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={12} sm={6} lg={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>System Efficiency</Text>}
                value={totals.activeBranches.length && dashboard?.branches?.length ? 
                       (totals.activeBranches.length / dashboard.branches.length) * 100 : 0}
                precision={1}
                suffix="%"
                valueStyle={{ 
                  color: '#13c2c2', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>Total Operations</Text>}
                value={totals.totalOperations}
                prefix={<TransactionOutlined />}
                valueStyle={{ 
                  color: '#eb2f96', 
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                }}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Trend Analysis */}
        {dashboard?.trendData && dashboard.trendData.length > 0 && (
          <Card title="Performance Trends" extra={
            <Space>
              <LineChartOutlined />
              <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                Last {dashboard.trendData.length} days
              </Text>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <div style={{ 
                  overflow: 'auto',
                  maxHeight: '300px',
                  ...(window.innerWidth <= 768 && {
                    maxWidth: '100%',
                    border: '1px solid #f0f0f0',
                    borderRadius: '6px'
                  })
                }}>
                  <Table
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                        width: 100,
                        render: (date: string) => (
                          <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                            {dayjs(date).format('MMM DD')}
                          </Text>
                        )
                      },
                      {
                        title: 'Savings',
                        dataIndex: 'totalSavings',
                        key: 'savings',
                        width: 120,
                        align: 'right' as const,
                        render: (value: number) => (
                          <Text style={{ color: '#52c41a', fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                            {calculations.formatCurrency(value)}
                          </Text>
                        )
                      },
                      {
                        title: 'Disbursements',
                        dataIndex: 'totalDisbursements',
                        key: 'disbursements',
                        width: 120,
                        align: 'right' as const,
                        render: (value: number) => (
                          <Text style={{ color: '#fa8c16', fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                            {calculations.formatCurrency(value)}
                          </Text>
                        )
                      },
                      {
                        title: 'TSO',
                        dataIndex: 'totalTSO',
                        key: 'tso',
                        width: 100,
                        align: 'right' as const,
                        render: (value: number) => (
                          <Text style={{ color: '#722ed1', fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                            {calculations.formatCurrency(value)}
                          </Text>
                        )
                      },
                      {
                        title: 'Active Branches',
                        dataIndex: 'operatingBranches',
                        key: 'branches',
                        width: 80,
                        align: 'center' as const,
                        render: (value: number) => (
                          <Tag color="blue" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                            {value}
                          </Tag>
                        )
                      }
                    ]}
                    dataSource={dashboard.trendData}
                    rowKey="date"
                    pagination={false}
                    size="small"
                    scroll={window.innerWidth <= 768 ? { x: 500 } : undefined}
                  />
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                    <Statistic
                      title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px', color: '#52c41a' }}>Avg Daily Savings</Text>}
                      value={dashboard.trendData.reduce((sum, item) => sum + item.totalSavings, 0) / dashboard.trendData.length}
                      precision={0}
                      prefix="₦"
                      valueStyle={{ color: '#52c41a', fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                    />
                  </Card>
                  <Card size="small" style={{ backgroundColor: '#fff7e6' }}>
                    <Statistic
                      title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px', color: '#fa8c16' }}>Avg Daily Disbursements</Text>}
                      value={dashboard.trendData.reduce((sum, item) => sum + item.totalDisbursements, 0) / dashboard.trendData.length}
                      precision={0}
                      prefix="₦"
                      valueStyle={{ color: '#fa8c16', fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                    />
                  </Card>
                  <Card size="small" style={{ backgroundColor: '#f9f0ff' }}>
                    <Statistic
                      title={<Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px', color: '#722ed1' }}>Avg Daily TSO</Text>}
                      value={dashboard.trendData.reduce((sum, item) => sum + item.totalTSO, 0) / dashboard.trendData.length}
                      precision={0}
                      prefix="₦"
                      valueStyle={{ color: '#722ed1', fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                    />
                  </Card>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Enhanced System Status */}
        {dashboard?.todayStatus && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              {dashboard.todayStatus.some(status => !status.isCompleted) ? (
                <Alert
                  message="Operations Status Alert"
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>
                        {dashboard.todayStatus.filter(s => !s.isCompleted).length} of {dashboard.todayStatus.length} branches have pending operations.
                      </Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {dashboard.todayStatus
                          .filter(s => !s.isCompleted)
                          .slice(0, 5)
                          .map(branch => (
                            <Tag key={branch._id} color="orange" icon={<ClockCircleOutlined />}>
                              {branch.branchCode} {branch.branchName}
                            </Tag>
                          ))}
                        {dashboard.todayStatus.filter(s => !s.isCompleted).length > 5 && (
                          <Tag color="orange">+{dashboard.todayStatus.filter(s => !s.isCompleted).length - 5} more</Tag>
                        )}
                      </div>
                    </Space>
                  }
                  type="warning"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                  closable
                />
              ) : (
                <Alert
                  message="All Systems Operational"
                  description={
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>All {dashboard.todayStatus.length} branches have completed today's operations successfully.</Text>
                    </Space>
                  }
                  type="success"
                  showIcon
                  closable
                />
              )}
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" title="Quick Stats" style={{ height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>Completed:</Text>
                    <Tag color="green">
                      {dashboard.todayStatus.filter(s => s.isCompleted).length}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>Pending:</Text>
                    <Tag color="orange">
                      {dashboard.todayStatus.filter(s => !s.isCompleted).length}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>Completion Rate:</Text>
                    <Tag color="blue">
                      {((dashboard.todayStatus.filter(s => s.isCompleted).length / dashboard.todayStatus.length) * 100).toFixed(1)}%
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* Enhanced Branch Performance Table */}
        <Card 
          title={
            <Space>
              <TeamOutlined />
              <Text style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>Branch Performance Overview</Text>
              <Badge count={dashboard?.branchPerformance?.length || 0} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          extra={
            <Space>
              <Button 
                size="small" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  // Export functionality can be added here
                  toast.success('Export feature coming soon!');
                }}
              >
                Export
              </Button>
              <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
                Last updated: {dayjs().format('HH:mm:ss')}
              </Text>
            </Space>
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
              columns={branchTableColumns}
              dataSource={dashboard?.branchPerformance || []}
              rowKey="_id"
              pagination={{
                pageSize: window.innerWidth <= 768 ? 5 : 10,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} branches`
              }}
              size={window.innerWidth <= 768 ? 'small' : 'middle'}
              loading={isLoading}
              scroll={window.innerWidth <= 768 ? { x: 800 } : undefined}
              rowClassName={(record, index) => 
                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
              }
            />
          </div>
        </Card>

        {/* Enhanced Performance Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card 
              title={<Space><CalendarOutlined />Daily Performance Summary</Space>}
              size="small"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Active Branches:</Text>
                    <Tag color="green" style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                      {totals.activeBranches.length} / {dashboard?.branches?.length || 0}
                    </Tag>
                  </div>
                  <Progress 
                    percent={(totals.activeBranches.length / (dashboard?.branches?.length || 1)) * 100}
                    size="small"
                    strokeColor="#52c41a"
                  />
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Operations Completed:</Text>
                  <br />
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '18px' : '20px', color: '#1890ff' }}>
                    {totals.totalOperations.toLocaleString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px', marginLeft: 8 }}>
                    total transactions
                  </Text>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Today's Net Flow:</Text>
                  <br />
                  <Text style={{ 
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px', 
                    color: (totals.totalSavings - totals.totalWithdrawals) >= 0 ? '#52c41a' : '#ff4d4f'
                  }}>
                    {(totals.totalSavings - totals.totalWithdrawals) >= 0 ? '+' : ''}
                    {calculations.formatCurrency(totals.totalSavings - totals.totalWithdrawals)}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                    (Savings - Withdrawals)
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<Space><DollarCircleOutlined />Financial Summary</Space>}
              size="small"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>Loan Collections:</Text>
                  <Text strong style={{ 
                    color: '#1890ff',
                    fontSize: window.innerWidth <= 768 ? '11px' : '12px'
                  }}>
                    {calculations.formatCurrency(totals.totalLoanCollection)}
                  </Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>Total Charges:</Text>
                  <Text strong style={{ 
                    color: '#fa541c',
                    fontSize: window.innerWidth <= 768 ? '11px' : '12px'
                  }}>
                    {calculations.formatCurrency(totals.totalCharges)}
                  </Text>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Total Inflow:</Text>
                  <Text strong style={{ 
                    color: '#52c41a',
                    fontSize: window.innerWidth <= 768 ? '12px' : '13px'
                  }}>
                    {calculations.formatCurrency(totals.totalSavings + totals.totalLoanCollection)}
                  </Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Total Outflow:</Text>
                  <Text strong style={{ 
                    color: '#ff4d4f',
                    fontSize: window.innerWidth <= 768 ? '12px' : '13px'
                  }}>
                    {calculations.formatCurrency(totals.totalDisbursements + totals.totalWithdrawals)}
                  </Text>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />
                
                <div style={{ 
                  backgroundColor: '#f0f2f5', 
                  padding: window.innerWidth <= 768 ? '8px' : '12px', 
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Net Position:</Text>
                    <Text strong style={{ 
                      color: ((totals.totalSavings + totals.totalLoanCollection) - (totals.totalDisbursements + totals.totalWithdrawals)) >= 0 ? '#52c41a' : '#ff4d4f',
                      fontSize: window.innerWidth <= 768 ? '12px' : '13px'
                    }}>
                      {calculations.formatCurrency((totals.totalSavings + totals.totalLoanCollection) - (totals.totalDisbursements + totals.totalWithdrawals))}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card 
              title={<Space><PercentageOutlined />Performance Insights</Space>}
              size="small"
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Disbursement Ratio:</Text>
                  <br />
                  <Progress 
                    percent={totals.totalSavings > 0 ? (totals.totalDisbursements / totals.totalSavings) * 100 : 0}
                    status="active"
                    strokeColor="#fa8c16"
                    format={(percent) => `${(percent || 0).toFixed(1)}%`}
                  />
                  <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                    Disbursements vs Savings
                  </Text>
                </div>
                
                <div>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>Collection Efficiency:</Text>
                  <br />
                  <Progress 
                    percent={totals.totalDisbursements > 0 ? (totals.totalLoanCollection / totals.totalDisbursements) * 100 : 0}
                    status="active"
                    strokeColor="#1890ff"
                    format={(percent) => `${(percent || 0).toFixed(1)}%`}
                  />
                  <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                    Collections vs Disbursements
                  </Text>
                </div>
                
                <div>
                  <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '13px' }}>TSO Efficiency:</Text>
                  <br />
                  <Progress 
                    percent={totals.totalOnlineCIH > 0 ? (totals.totalTSO / totals.totalOnlineCIH) * 100 : 0}
                    status="active"
                    strokeColor="#722ed1"
                    format={(percent) => `${(percent || 0).toFixed(1)}%`}
                  />
                  <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
                    TSO vs Online CIH
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};