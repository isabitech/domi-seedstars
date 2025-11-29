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
  message
} from 'antd';
import { 
  DashboardOutlined,
  BankOutlined,
  TrophyOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useGetOnlineCIHTSO } from '../../hooks/Metrics/useGetOnlineCIH-TSO';
import { calculations } from '../../utils/calculations';
import { useGetHODashboard, type BranchPerformance as APiBranchPerformance } from '../../hooks/Head Office/HO-Dashboard/useGetHODashboard';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const HeadOfficeDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'), 
    dayjs()
  ]);

  // Fetch dashboard data using our hooks
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    refetch: refetchDashboard,
    isRefetching 
  } = useGetHODashboard();

  const { 
    isLoading: isMetricsLoading,
    refetch: refetchMetrics 
  } = useGetOnlineCIHTSO({ date: selectedDate });

  const isLoading = isDashboardLoading || isMetricsLoading;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchDashboard(), refetchMetrics()]);
      message.success('Data refreshed successfully');
    } catch {
      message.error('Failed to refresh data');
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
    totalCashbook1: 0,
    totalCashbook2: 0,
    totalOnlineCIH: 0,
    totalLoanCollection: 0,
    totalSavings: 0,
    totalTSO: 0
  };

  const branchTableColumns = [
    {
      title: 'Branch',
      key: 'branch',
      render: (_: unknown, record: APiBranchPerformance) => (
        <Space>
          <BankOutlined />
          <div>
            <strong>{record.branchName}</strong>
            <br />
            <Text type="secondary">{record.branchCode}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: APiBranchPerformance) => {
        // Determine status based on lastOperation or other criteria
        const status = record.lastOperation ? 'submitted' : 'pending';
        return (
          <Tag color={status === 'submitted' ? 'green' : 'orange'}>
            {status === 'submitted' ? 'Submitted' : 'Pending'}
          </Tag>
        );
      }
    },
    {
      title: 'Online CIH (Avg)',
      key: 'onlineCIH',
      render: (_: unknown, record: APiBranchPerformance) => 
        calculations.formatCurrency(record.avgOnlineCIH || 0)
    },
    {
      title: 'TSO',
      key: 'tso',
      render: (_: unknown, record: APiBranchPerformance) => 
        calculations.formatCurrency(record.totalTSO || 0)
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: unknown, record: APiBranchPerformance) => {
        // Calculate efficiency based on operation days vs expected days
        const efficiency = parseFloat((Math.min(100, (record.operationDays / 30) * 100).toFixed(2)));
        return (
          <Progress 
            percent={efficiency} 
            size="small"
            status={efficiency >= 90 ? 'success' : 'active'}
          />
        );
      }
    },
    {
      title: 'Last Operation',
      key: 'lastOperation',
      render: (_: unknown, record: APiBranchPerformance) => (
        <Text type="secondary">
          {record.lastOperation ? dayjs(record.lastOperation).format('DD MMM, HH:mm') : 'No operations'}
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
            <Title level={2}>
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

        {/* Filters */}
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col>
              <Text strong>Date:</Text>
            </Col>
            <Col>
              <DatePicker 
                value={dayjs(selectedDate)}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date.format('YYYY-MM-DD'));
                  }
                }}
                format="YYYY-MM-DD"
              />
            </Col>
            <Col>
              <Text strong>Date Range:</Text>
            </Col>
            <Col>
              <RangePicker 
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Online CIH"
                value={totals.totalOnlineCIH}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                suffix={<TrophyOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Collections Today"
                value={totals.totalLoanCollection + totals.totalSavings}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total TSO"
                value={totals.totalTSO}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="System Efficiency"
                value={dashboard?.consolidatedSummary?.activeBranches?.length && dashboard?.branches?.length ? 
                       (dashboard.consolidatedSummary.activeBranches.length / dashboard.branches.length) * 100 : 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* System Status Alert */}
        {dashboard?.todayStatus && dashboard.todayStatus.some(status => !status.isCompleted) ? (
          <Alert
            message="Pending Operations"
            description={`${dashboard.todayStatus.filter(s => !s.isCompleted).length} branches have pending operations for today.`}
            type="warning"
            showIcon
            closable
          />
        ) : (
          <Alert
            message="System Status"
            description="All systems are running normally. No alerts at this time."
            type="success"
            showIcon
            closable
          />
        )}

        {/* Branch Performance Table */}
        <Card 
          title="Branch Performance Overview"
          extra={
            <Space>
              <Text type="secondary">
                Last updated: {dayjs().format('HH:mm:ss')}
              </Text>
            </Space>
          }
        >
          <Table
            columns={branchTableColumns}
            dataSource={dashboard?.branchPerformance || []}
            rowKey="_id"
            pagination={false}
            size="middle"
            loading={isLoading}
          />
        </Card>

        {/* Performance Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Daily Performance Summary">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Total Active Branches:</Text>
                  <br />
                  <Text>
                    {dashboard?.consolidatedSummary?.activeBranches?.length || 0} branches operating today
                  </Text>
                </div>
                <div>
                  <Text strong>Total Operations:</Text>
                  <br />
                  <Text>
                    {dashboard?.consolidatedSummary?.totalOperations || 0} operations completed
                  </Text>
                </div>
                <div>
                  <Text strong>Today's Collections:</Text>
                  <br />
                  <Text>
                    ₦{((dashboard?.consolidatedSummary?.totalSavings || 0) + (dashboard?.consolidatedSummary?.totalLoanCollection || 0)).toLocaleString()}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Financial Summary">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Total Disbursements"
                  value={dashboard?.consolidatedSummary?.totalDisbursements || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#3f8600' }}
                />
                <Statistic
                  title="Total Withdrawals"
                  value={dashboard?.consolidatedSummary?.totalWithdrawals || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#ff4d4f' }}
                />
                <Statistic
                  title="Total Charges"
                  value={dashboard?.consolidatedSummary?.totalCharges || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};