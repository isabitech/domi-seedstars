import React, { useState } from 'react';
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
import { useGetHODashboard } from '../../hooks/Dashboard/useGetHODashboard';
import { useGetOnlineCIHTSO } from '../../hooks/Metrics/useGetOnlineCIH-TSO';
import { calculations } from '../../utils/calculations';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Interface for branch performance data
interface BranchPerformance {
  branchId: string;
  branchName: string;
  branchCode: string;
  status: 'submitted' | 'pending' | 'overdue';
  onlineCIH: number;
  tso: number;
  submissionTime?: string;
  efficiency: number;
}

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
  } = useGetHODashboard({ date: selectedDate });

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
  const dashboard = dashboardData?.data?.dashboard;

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

  const totals = dashboard?.dailyConsolidation || {
    totalCashbook1: 0,
    totalCashbook2: 0,
    totalOnlineCIH: 0,
    totalLoanCollection: 0,
    totalSavingsDeposit: 0,
    totalTSO: 0
  };

  const branchTableColumns = [
    {
      title: 'Branch',
      key: 'branch',
      render: (_: unknown, record: BranchPerformance) => (
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
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'submitted' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'submitted' ? 'Submitted' : status === 'pending' ? 'Pending' : 'Overdue'}
        </Tag>
      )
    },
    {
      title: 'Online CIH',
      key: 'onlineCIH',
      render: (_: unknown, record: BranchPerformance) => 
        calculations.formatCurrency(record.onlineCIH)
    },
    {
      title: 'TSO',
      key: 'tso',
      render: (_: unknown, record: BranchPerformance) => 
        calculations.formatCurrency(record.tso)
    },
    {
      title: 'Efficiency',
      key: 'efficiency',
      render: (_: unknown, record: BranchPerformance) => (
        <Progress 
          percent={record.efficiency || 0} 
          size="small"
          status={record.efficiency >= 90 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Submission Time',
      key: 'submissionTime',
      render: (_: unknown, record: BranchPerformance) => (
        <Text type="secondary">
          {record.submissionTime ? dayjs(record.submissionTime).format('HH:mm') : 'Not submitted'}
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
                value={totals.totalLoanCollection + totals.totalSavingsDeposit}
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
                value={dashboard?.topMetrics?.systemEfficiency || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts */}
        {dashboard?.recentAlerts && dashboard.recentAlerts.length > 0 ? (
          dashboard.recentAlerts.map((alert, index) => (
            <Alert
              key={index}
              message={`${alert.branchName}: ${alert.message}`}
              description={`Type: ${alert.type} | Time: ${dayjs(alert.timestamp).fromNow()}`}
              type={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
              showIcon
              closable
            />
          ))
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
            rowKey="branchId"
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
                  <Text strong>Best Performing Branch:</Text>
                  <br />
                  <Text>
                    {dashboard?.topMetrics?.highestPerformingBranch?.branchName || 'N/A'} - 
                    {dashboard?.topMetrics?.highestPerformingBranch?.performance || 0}% efficiency
                  </Text>
                </div>
                <div>
                  <Text strong>Total Branches:</Text>
                  <br />
                  <Text>
                    {dashboard?.systemOverview?.activeBranches || 0} active of {dashboard?.systemOverview?.totalBranches || 0}
                  </Text>
                </div>
                <div>
                  <Text strong>Today's Submissions:</Text>
                  <br />
                  <Text>
                    {dashboard?.systemOverview?.todaySubmissions || 0} submitted, {dashboard?.systemOverview?.pendingSubmissions || 0} pending
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Financial Summary">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Total System Cashflow"
                  value={dashboard?.topMetrics?.totalSystemCashflow || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#3f8600' }}
                />
                <Statistic
                  title="Average Branch Cashflow"
                  value={dashboard?.topMetrics?.averageBranchCashflow || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#1890ff' }}
                />
                <div>
                  <Text strong>System Efficiency:</Text>
                  <br />
                  <Progress 
                    percent={dashboard?.topMetrics?.systemEfficiency || 0}
                    status="active"
                  />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};