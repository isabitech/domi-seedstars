
import React, { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
  DatePicker,
  Button,
  Tag,
  Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SafetyOutlined,
  DollarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useGetEFCCHO, type EFCCBranchSummary } from '../../hooks/EFCC/useGetEFCCHO';
import { calculations } from '../../utils/calculations';
import dayjs from 'dayjs';
import { toast } from 'sonner';

const { Title, Text } = Typography;

const HOEFCCPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch EFCC summary data
  const { data: efccData, isLoading, error, refetch } = useGetEFCCHO(
    selectedDate.format('YYYY-MM-DD')
  );

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success('EFCC data refreshed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refresh EFCC data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Table columns
  const columns: ColumnsType<EFCCBranchSummary> = [
    {
      title: 'Branch',
      dataIndex: ['branch', 'name'],
      key: 'branchName',
      fixed: 'left',
      width: window.innerWidth <= 768 ? 120 : 150,
      render: (name: string, record: EFCCBranchSummary) => (
        <Space>
          <BankOutlined />
          <div>
            <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
              {name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
              {record.branch.code}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: window.innerWidth <= 768 ? 'Prev. Owing' : 'Previous Amount Owing',
      dataIndex: 'previousAmountOwing',
      key: 'previousAmountOwing',
      width: window.innerWidth <= 768 ? 110 : 150,
      render: (value: number) => (
        <Text style={{ 
          color: '#722ed1', 
          fontWeight: 'bold',
          fontSize: window.innerWidth <= 768 ? '11px' : '13px'
        }}>
          {calculations.formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: window.innerWidth <= 768 ? 'Today\'s Rem.' : 'Today\'s Remittance',
      dataIndex: 'todayRemittance',
      key: 'todayRemittance',
      width: window.innerWidth <= 768 ? 110 : 150,
      render: (value: number) => (
        <Text style={{ 
          color: '#52c41a', 
          fontWeight: 'bold',
          fontSize: window.innerWidth <= 768 ? '11px' : '13px'
        }}>
          {calculations.formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: window.innerWidth <= 768 ? 'Amt. Remitting' : 'Amount Remitting Now',
      dataIndex: 'amtRemittingNow',
      key: 'amtRemittingNow',
      width: window.innerWidth <= 768 ? 110 : 150,
      render: (value: number) => (
        <Text style={{ 
          color: '#f5222d', 
          fontWeight: 'bold',
          fontSize: window.innerWidth <= 768 ? '11px' : '13px'
        }}>
          {calculations.formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: window.innerWidth <= 768 ? 'Current Owing' : 'Current Amount Owing',
      dataIndex: 'currentAmountOwing',
      key: 'currentAmountOwing',
      width: window.innerWidth <= 768 ? 110 : 150,
      render: (value: number) => (
        <Text 
          style={{ 
            color: value >= 0 ? '#1890ff' : '#f5222d', 
            fontWeight: 'bold',
            fontSize: window.innerWidth <= 768 ? '11px' : '14px'
          }}
        >
          {calculations.formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isSubmitted',
      key: 'status',
      width: window.innerWidth <= 768 ? 90 : 120,
      render: (isSubmitted: boolean, record: EFCCBranchSummary) => (
        <Space direction="vertical" size="small">
          <Tag 
            color={isSubmitted ? 'green' : record.hasRecord ? 'orange' : 'red'}
            icon={isSubmitted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}
          >
            {window.innerWidth <= 768 
              ? (isSubmitted ? 'Done' : record.hasRecord ? 'Draft' : 'None')
              : (isSubmitted ? 'Submitted' : record.hasRecord ? 'Draft' : 'No Record')
            }
          </Tag>
        </Space>
      ),
    },
    {
      title: window.innerWidth <= 768 ? 'Submitted' : 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: window.innerWidth <= 768 ? 90 : 150,
      render: (submittedAt: string, record: EFCCBranchSummary) => {
        if (!submittedAt || !record.isSubmitted) {
          return <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>-</Text>;
        }
        return (
          <div>
            <Text style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
              {dayjs(submittedAt).format(window.innerWidth <= 768 ? 'DD MMM' : 'DD MMM YYYY')}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '9px' : '11px' }}>
              {dayjs(submittedAt).format('HH:mm')}
            </Text>
          </div>
        );
      },
    },
    {
      title: window.innerWidth <= 768 ? 'By' : 'Submitted By',
      dataIndex: ['submittedBy', 'username'],
      key: 'submittedBy',
      width: window.innerWidth <= 768 ? 80 : 120,
      render: (username: string, record: EFCCBranchSummary) => {
        if (!username || !record.isSubmitted) {
          return <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>-</Text>;
        }
        return <Text style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>{username}</Text>;
      },
    },
  ];

  // Calculate submission progress
  const submissionProgress = efccData ? {
    submitted: efccData.summary.submittedToday,
    total: efccData.summary.totalBranches,
    percentage: Math.round((efccData.summary.submittedToday / efccData.summary.totalBranches) * 100),
  } : { submitted: 0, total: 0, percentage: 0 };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <SafetyOutlined style={{ marginRight: '8px' }} />
              DSA Summary
            </Title>
            <Text type="secondary">
              Expected Financial Compliance Calculation - All Branches
            </Text>
          </Col>
          <Col>
            <Space>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
              />
              <Button 
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isRefreshing}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading EFCC Data"
            description="Failed to load EFCC summary for all branches"
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          />
        )}

        {/* Loading State */}
        {(isLoading || isRefreshing) && (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: 16 }}>
                {isRefreshing ? 'Refreshing EFCC data...' : `Loading EFCC data for ${selectedDate.format('DD MMMM YYYY')}...`}
              </Text>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        {!isLoading && !isRefreshing && !error && efccData && (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Previous Owing"
                    value={efccData.totals.totalPreviousOwing}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ color: '#722ed1', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Today's Remittance"
                    value={efccData.totals.totalTodayRemittance}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ color: '#52c41a', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Amount Remitting"
                    value={efccData.totals.totalAmtRemittingNow}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ color: '#f5222d', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Current Owing"
                    value={efccData.totals.totalCurrentOwing}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: efccData.totals.totalCurrentOwing >= 0 ? '#1890ff' : '#f5222d',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Grand Total Card */}
            <Card 
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px'
              }}
            >
              <Row justify="center" align="middle">
                <Col span={24} style={{ textAlign: 'center' }}>
                  <Space direction="vertical" size="small">
                    <Title level={3} style={{ color: 'white', margin: 0 }}>
                      Grand Total Outstanding
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
                      Total amount owed by all branches to Head Office
                    </Text>
                    <Title 
                      level={1} 
                      style={{ 
                        color: 'white', 
                        margin: '16px 0 8px 0',
                        fontSize: window.innerWidth <= 768 ? '36px' : '48px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {calculations.formatCurrency(efccData.totals.totalCurrentOwing)}
                    </Title>
                    <Row gutter={[24, 8]} justify="center">
                      <Col>
                        <Space direction="vertical" size={0} style={{ textAlign: 'center' }}>
                          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                            Net Change
                          </Text>
                          <Text 
                            style={{ 
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: 'bold'
                            }}
                          >
                            {calculations.formatCurrency(
                              efccData.totals.totalCurrentOwing - efccData.totals.totalPreviousOwing
                            )}
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space direction="vertical" size={0} style={{ textAlign: 'center' }}>
                          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                            Collection Rate
                          </Text>
                          <Text 
                            style={{ 
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: 'bold'
                            }}
                          >
                            {efccData.totals.totalTodayRemittance > 0 
                              ? `${Math.round((efccData.totals.totalAmtRemittingNow / efccData.totals.totalTodayRemittance) * 100)}%`
                              : '0%'
                            }
                          </Text>
                        </Space>
                      </Col>
                    </Row>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Submission Progress */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Submission Progress" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress
                      percent={submissionProgress.percentage}
                      status={submissionProgress.percentage === 100 ? 'success' : 'active'}
                      format={() => `${submissionProgress.submitted}/${submissionProgress.total}`}
                    />
                    <Text type="secondary">
                      {submissionProgress.submitted} of {submissionProgress.total} branches have submitted their EFCC records
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Summary Statistics" size="small">
                  <Row gutter={[16, 8]}>
                    <Col span={8}>
                      <Text strong>Total Branches:</Text><br />
                      <Text style={{ fontSize: '18px', color: '#1890ff' }}>
                        {efccData.summary.totalBranches}
                      </Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Submitted:</Text><br />
                      <Text style={{ fontSize: '18px', color: '#52c41a' }}>
                        {efccData.summary.submittedToday}
                      </Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Pending:</Text><br />
                      <Text style={{ fontSize: '18px', color: '#fa8c16' }}>
                        {efccData.summary.pendingSubmission}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Main Data Table */}
        {!isLoading && !isRefreshing && !error && efccData && (
          <Card 
            title={
              <Space>
                <DollarOutlined />
                <Text strong>
                  EFCC Data - {selectedDate.format('DD MMMM YYYY')}
                </Text>
              </Space>
            }
            extra={
              <Text type="secondary">
                {efccData.branches.length} Branches
              </Text>
            }
          >
            {efccData.branches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">
                  No EFCC data available for {selectedDate.format('DD MMMM YYYY')}
                </Text>
              </div>
            ) : (
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
                  dataSource={efccData.branches}
                  rowKey={(record) => record.branch._id}
                  scroll={{ 
                    x: window.innerWidth <= 768 ? 830 : 1200,
                    y: window.innerWidth <= 768 ? 400 : undefined
                  }}
                  pagination={window.innerWidth <= 768 ? {
                    pageSize: 5,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                    size: 'small'
                  } : {
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} branches`,
                  }}
                  size={window.innerWidth <= 768 ? 'small' : 'middle'}
                  bordered
                  rowClassName={(record) => {
                    if (!record.hasRecord) return 'no-record-row';
                    if (!record.isSubmitted) return 'draft-row';
                    return 'submitted-row';
                  }}
                />
              </div>
            )}
          </Card>
        )}

        {/* Formula Information */}
        {!isLoading && !isRefreshing && !error && (
          <Card title="EFCC Formula" size="small">
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Text strong style={{ fontSize: '14px' }}>
                  Current Amount Owing = Previous Amount Owing + Today's Remittance - Amount Remitting Now
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • <strong>Previous Amount Owing:</strong> Amount branch owed before today<br />
                  • <strong>Today's Remittance:</strong> Amount branch collected today<br />
                  • <strong>Amount Remitting Now:</strong> Amount branch is sending to HO now<br />
                  • <strong>Current Amount Owing:</strong> Updated amount branch owes after today's transactions
                </Text>
              </Col>
            </Row>
          </Card>
        )}
      </Space>

      {/* Custom Styles */}
      <style>{`
        .submitted-row {
          background-color: #f6ffed !important;
        }
        .draft-row {
          background-color: #fffbe6 !important;
        }
        .no-record-row {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </div>
  );
};

export default HOEFCCPage;