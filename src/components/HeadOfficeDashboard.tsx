import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Select, 
  DatePicker,
  Space,
  Typography,
  Tag,
  Progress,
  Alert,
  Button
} from 'antd';
import { 
  DashboardOutlined,
  BankOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { calculations } from '../utils/calculations';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mock data for demonstration
const mockBranchData = [
  {
    branchId: 'br-001',
    branchName: 'Lagos Branch',
    branchCode: 'LG001',
    todayData: {
      cashbook1Total: 1250000,
      cashbook2Total: 980000,
      onlineCIH: 270000,
      savingsTotal: 850000,
      loanCollection: 400000,
      disbursements: 650000,
      transferToSenate: 200000
    },
    monthlyData: {
      totalSavings: 12500000,
      totalLoans: 8900000,
      totalDisbursements: 15600000,
      performance: 92
    },
    lastUpdated: dayjs().subtract(30, 'minutes').toISOString(),
    status: 'active'
  },
  {
    branchId: 'br-002',
    branchName: 'Abuja Branch',
    branchCode: 'AB002',
    todayData: {
      cashbook1Total: 980000,
      cashbook2Total: 720000,
      onlineCIH: 260000,
      savingsTotal: 650000,
      loanCollection: 330000,
      disbursements: 450000,
      transferToSenate: 180000
    },
    monthlyData: {
      totalSavings: 9800000,
      totalLoans: 7200000,
      totalDisbursements: 12300000,
      performance: 88
    },
    lastUpdated: dayjs().subtract(15, 'minutes').toISOString(),
    status: 'active'
  },
  {
    branchId: 'br-003',
    branchName: 'Kano Branch',
    branchCode: 'KN003',
    todayData: {
      cashbook1Total: 750000,
      cashbook2Total: 580000,
      onlineCIH: 170000,
      savingsTotal: 420000,
      loanCollection: 280000,
      disbursements: 380000,
      transferToSenate: 120000
    },
    monthlyData: {
      totalSavings: 7500000,
      totalLoans: 5800000,
      totalDisbursements: 9200000,
      performance: 85
    },
    lastUpdated: dayjs().subtract(2, 'hours').toISOString(),
    status: 'warning'
  }
];

export const HeadOfficeDashboard: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'), 
    dayjs()
  ]);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate totals across all branches
  const totals = mockBranchData.reduce((acc, branch) => ({
    totalCashbook1: acc.totalCashbook1 + branch.todayData.cashbook1Total,
    totalCashbook2: acc.totalCashbook2 + branch.todayData.cashbook2Total,
    totalOnlineCIH: acc.totalOnlineCIH + branch.todayData.onlineCIH,
    totalSavings: acc.totalSavings + branch.todayData.savingsTotal,
    totalLoans: acc.totalLoans + branch.todayData.loanCollection,
    totalDisbursements: acc.totalDisbursements + branch.todayData.disbursements,
    totalTransferToSenate: acc.totalTransferToSenate + branch.todayData.transferToSenate
  }), {
    totalCashbook1: 0,
    totalCashbook2: 0,
    totalOnlineCIH: 0,
    totalSavings: 0,
    totalLoans: 0,
    totalDisbursements: 0,
    totalTransferToSenate: 0
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const branchTableColumns = [
    {
      title: 'Branch',
      key: 'branch',
      render: (_: unknown, record: typeof mockBranchData[0]) => (
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
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? 'Online' : 'Warning'}
        </Tag>
      )
    },
    {
      title: 'Online CIH',
      key: 'onlineCIH',
      render: (_: unknown, record: typeof mockBranchData[0]) => 
        calculations.formatCurrency(record.todayData.onlineCIH)
    },
    {
      title: 'Today\'s Collections',
      key: 'collections',
      render: (_: unknown, record: typeof mockBranchData[0]) => 
        calculations.formatCurrency(record.todayData.loanCollection + record.todayData.savingsTotal)
    },
    {
      title: 'Today\'s Disbursements',
      key: 'disbursements',
      render: (_: unknown, record: typeof mockBranchData[0]) => 
        calculations.formatCurrency(record.todayData.disbursements)
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: unknown, record: typeof mockBranchData[0]) => (
        <Progress 
          percent={record.monthlyData.performance} 
          size="small"
          status={record.monthlyData.performance >= 90 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Last Updated',
      key: 'lastUpdated',
      render: (_: unknown, record: typeof mockBranchData[0]) => (
        <Text type="secondary">
          {dayjs(record.lastUpdated).fromNow()}
        </Text>
      )
    }
  ];

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                loading={refreshing}
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
              <Text strong>Filters:</Text>
            </Col>
            <Col>
              <Select
                value={selectedBranch}
                onChange={setSelectedBranch}
                style={{ width: 200 }}
              >
                <Select.Option value="all">All Branches</Select.Option>
                {mockBranchData.map(branch => (
                  <Select.Option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </Select.Option>
                ))}
              </Select>
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
                value={totals.totalSavings + totals.totalLoans}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Disbursements"
                value={totals.totalDisbursements}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Transfer to Senate"
                value={totals.totalTransferToSenate}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts */}
        <Alert
          message="System Status"
          description="All branches are reporting. Kano Branch last updated 2 hours ago - please check connection."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          closable
        />

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
            dataSource={mockBranchData}
            rowKey="branchId"
            pagination={false}
            size="middle"
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
                  <Text>Lagos Branch - 92% efficiency</Text>
                </div>
                <div>
                  <Text strong>Attention Required:</Text>
                  <br />
                  <Text type="warning">Kano Branch - Connectivity issues</Text>
                </div>
                <div>
                  <Text strong>Total Branches Active:</Text>
                  <br />
                  <Text>{mockBranchData.filter(b => b.status === 'active').length} of {mockBranchData.length}</Text>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Financial Summary">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Net Cash Flow Today"
                  value={(totals.totalSavings + totals.totalLoans) - totals.totalDisbursements}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: (totals.totalSavings + totals.totalLoans) > totals.totalDisbursements ? '#3f8600' : '#cf1322' 
                  }}
                />
                <div>
                  <Text strong>Collection Efficiency:</Text>
                  <br />
                  <Progress 
                    percent={Math.round(((totals.totalSavings + totals.totalLoans) / (totals.totalDisbursements || 1)) * 100)}
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