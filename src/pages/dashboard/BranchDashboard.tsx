import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Typography, 
  Alert, 
  Button, 
  notification, 
  Spin,
  Table,
  Tag,
  Divider,
  DatePicker
} from 'antd';
import dayjs from 'dayjs';
import { 
  DollarOutlined, 
  BankOutlined, 
  CalculatorOutlined,
  FileTextOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetBranchDashboard } from '../../hooks/Branch/Dashboard/useGetBranchDashboard';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'sonner';

const { Title, Text } = Typography;

export const BranchDashboard: React.FC = () => {
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString();
  
  // Date range state
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'), // Default to last 30 days
    dayjs()
  ]);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  const { data: dashboardData, isLoading, error } = useGetBranchDashboard({
    startDate,
    endDate
  });

  // Handle date range change
  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    if (dates) {
      setDateRange(dates);
      setStartDate(dates[0].format('YYYY-MM-DD'));
      setEndDate(dates[1].format('YYYY-MM-DD'));
    }
  };

  useEffect(() => {
    if (dashboardData) {
      // console.log("branch dashboard data", dashboardData);
      toast.success(`${dashboardData.message || 'Dashboard data loaded successfully'}`);
    }
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Alert
          message="Error Loading Dashboard"
          description="Failed to load dashboard data. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const dashboard = dashboardData?.data?.dashboardData;
  const todayOps = dashboard?.todayOperations;
  const summary = dashboard?.summary;
  const trendData = dashboard?.trendData || [];
  const currentRegisters = dashboard?.currentRegisters;

  // Trend data table columns
  const trendColumns: ColumnsType<any> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Savings',
      dataIndex: 'savings',
      key: 'savings',
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      title: 'Disbursements',
      dataIndex: 'disbursements',
      key: 'disbursements',
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      title: 'Online CIH',
      dataIndex: 'onlineCIH',
      key: 'onlineCIH',
      render: (value: number) => (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          ₦{value.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'TSO',
      dataIndex: 'tso',
      key: 'tso',
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
  ];

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3}>
                <CalculatorOutlined /> Branch Dashboard
              </Title>
              <Text type="secondary">
                Daily operations overview for {date}
              </Text>
            </Col>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text strong>Date Range:</Text>
                <DatePicker.RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                  allowClear={false}
                  disabledDate={(current) => {
                    // Disable future dates
                    return current && current > dayjs().endOf('day');
                  }}
                  style={{ width: 280 }}
                  placeholder={['Start Date', 'End Date']}
                />
              </Space>
            </Col>
          </Row>
        </div>

        {/* Today's Operations Status */}
        {todayOps && (
          <Alert
            message={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {todayOps.isCompleted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                <Text strong>
                  Today's Operations {todayOps.isCompleted ? 'Completed' : 'In Progress'}
                </Text>
              </div>
            }
            description={
              todayOps.isCompleted 
                ? `Submitted on ${new Date(todayOps.submittedAt).toLocaleString()}`
                : 'Complete your daily cashbook entries to finish today\'s operations.'
            }
            type={todayOps.isCompleted ? 'success' : 'warning'}
            showIcon={false}
          />
        )}

        {/* Key Metrics Row */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Daily Collection"
                value={
                  (todayOps?.cashbook1?.savings || 0) + 
                  (todayOps?.cashbook1?.loanCollection || 0) + 
                  (todayOps?.cashbook1?.chargesCollection || 0)
                }
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#fa8c16',
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px'
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Online Cash in Hand"
                value={todayOps?.onlineCIH || 0}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: (todayOps?.onlineCIH || 0) >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px'
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Transfer to Senate Office"
                value={todayOps?.tso || 0}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#1890ff', 
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px' 
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Loan Balance"
                value={currentRegisters?.loanBalance || 0}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#722ed1', 
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px' 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Second Row for Additional Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Savings Balance"
                value={currentRegisters?.savingsBalance || 0}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#52c41a', 
                  fontSize: window.innerWidth <= 768 ? '18px' : '24px' 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Today's Operations Details */}
        {todayOps && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={<span><FileTextOutlined /> Cashbook 1 - Collections</span>}
                extra={
                  <Tag color={todayOps.cashbook1?.isSubmitted ? 'green' : 'orange'}>
                    {todayOps.cashbook1?.isSubmitted ? 'Submitted' : 'Pending'}
                  </Tag>
                }
              >
                {todayOps.cashbook1 ? (
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic
                        title="Previous CIH"
                        value={todayOps.cashbook1.pcih}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Savings"
                        value={todayOps.cashbook1.savings}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Loan Collection"
                        value={todayOps.cashbook1.loanCollection}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Charges"
                        value={todayOps.cashbook1.chargesCollection}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Daily Collection"
                        value={
                          (todayOps.cashbook1.savings || 0) + 
                          (todayOps.cashbook1.loanCollection || 0) + 
                          (todayOps.cashbook1.chargesCollection || 0)
                        }
                        precision={2}
                        prefix="₦"
                        valueStyle={{ 
                          color: '#fa8c16', 
                          fontWeight: 'bold',
                          fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                        }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="From HO"
                        value={todayOps.cashbook1.frmHO}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    
                    <Col span={8}>
                      <Statistic
                        title="CB Total 1"
                        value={todayOps.cashbook1.cbTotal1}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ 
                          color: '#1890ff', 
                          fontWeight: 'bold',
                          fontSize: window.innerWidth <= 768 ? '16px' : '18px'
                        }}
                      />
                    </Col>
                  </Row>
                ) : (
                  <Alert message="Cashbook 1 not completed" type="info" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={<span><BankOutlined /> Cashbook 2 - Disbursements</span>}
                extra={
                  <Tag color={todayOps.cashbook2?.isSubmitted ? 'green' : 'orange'}>
                    {todayOps.cashbook2?.isSubmitted ? 'Submitted' : 'Pending'}
                  </Tag>
                }
              >
                {todayOps.cashbook2 ? (
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic
                        title="Disbursement No."
                        value={todayOps.cashbook2.disNo}
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '16px' : '18px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Disbursement Amt"
                        value={todayOps.cashbook2.disAmt}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Savings Withdrawal"
                        value={todayOps.cashbook2.savWith}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="DOMI Bank"
                        value={todayOps.cashbook2.domiBank}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="POS/Transfer"
                        value={todayOps.cashbook2.posT}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="CB Total 2"
                        value={todayOps.cashbook2.cbTotal2}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ 
                          color: '#722ed1', 
                          fontWeight: 'bold',
                          fontSize: window.innerWidth <= 768 ? '16px' : '18px'
                        }}
                      />
                    </Col>
                  </Row>
                ) : (
                  <Alert message="Cashbook 2 not completed" type="info" />
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Summary Statistics */}
        {summary && (
          <Card title={<span><FileTextOutlined /> Summary Statistics</span>}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} lg={4}>
                <Statistic
                  title="Total Savings"
                  value={summary.totalSavings}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#52c41a',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}
                />
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Statistic
                  title="Total Loan Collection"
                  value={summary.totalLoanCollection}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#1890ff',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}
                />
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Statistic
                  title="Total Charges"
                  value={summary.totalCharges}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#fa8c16',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}
                />
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Statistic
                  title="Total Disbursements"
                  value={summary.totalDisbursements}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#722ed1',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}
                />
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Statistic
                  title="Total Withdrawals"
                  value={summary.totalWithdrawals}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#f5222d',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}
                />
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Statistic
                  title="Avg Online CIH"
                  value={summary.avgOnlineCIH}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: summary.avgOnlineCIH >= 0 ? '#3f8600' : '#cf1322',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px'
                  }}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total TSO"
                  value={summary.totalTSO}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#13c2c2',
                    fontSize: window.innerWidth <= 768 ? '16px' : '18px'
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Operation Days"
                  value={summary.operationDays}
                  suffix="days"
                  valueStyle={{ 
                    color: '#595959',
                    fontSize: window.innerWidth <= 768 ? '16px' : '18px'
                  }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Current Registers */}
        {currentRegisters && (
          <Card title={<span><DollarOutlined /> Current Registers</span>}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card type="inner" title="Loan Register">
                  <Statistic
                    title="Current Loan Balance"
                    value={currentRegisters.loanBalance}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#722ed1', 
                      fontSize: window.innerWidth <= 768 ? '18px' : '24px' 
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card type="inner" title="Savings Register">
                  <Statistic
                    title="Current Savings Balance"
                    value={currentRegisters.savingsBalance}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#52c41a', 
                      fontSize: window.innerWidth <= 768 ? '18px' : '24px' 
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card type="inner" title="Monthly Disbursement">
                  <Statistic
                    title="This Month's Disbursements"
                    value={currentRegisters.monthlyDisbursement}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#fa8c16', 
                      fontSize: window.innerWidth <= 768 ? '18px' : '24px' 
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        )}

        {/* Trend Data */}
        {trendData.length > 0 && (
          <Card title={<span><LineChartOutlined /> Recent Trend Data</span>}>
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={trendData}
                columns={trendColumns}
                pagination={{ pageSize: 5 }}
                size="small"
                rowKey="date"
                scroll={{ x: 600 }}
              />
            </div>
          </Card>
        )}

        {/* Loan and Savings Registers Details */}
        {todayOps && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<span><BankOutlined /> Loan Register</span>}>
                {todayOps.loanRegister ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Previous Loan Total:</Text>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>₦{todayOps.loanRegister.previousLoanTotal.toLocaleString()}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Loan Disbursement (with Interest):</Text>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>₦{todayOps.loanRegister.loanDisbursementWithInterest.toLocaleString()}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Loan Collection:</Text>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>₦{todayOps.loanRegister.loanCollection.toLocaleString()}</Text>
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>Current Loan Balance:</Text>
                      <Text strong style={{ 
                        color: '#722ed1', 
                        fontSize: window.innerWidth <= 768 ? '16px' : '18px' 
                      }}>
                        ₦{todayOps.loanRegister.currentLoanBalance.toLocaleString()}
                      </Text>
                    </div>
                  </Space>
                ) : (
                  <Alert message="Loan register data not available" type="info" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title={<span><DollarOutlined /> Savings Register</span>}>
                {todayOps.savingsRegister ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Previous Savings Total:</Text>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>₦{todayOps.savingsRegister.previousSavingsTotal.toLocaleString()}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>New Savings:</Text>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>₦{todayOps.savingsRegister.savings.toLocaleString()}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Savings Withdrawal:</Text>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>₦{todayOps.savingsRegister.savingsWithdrawal.toLocaleString()}</Text>
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>Current Savings:</Text>
                      <Text strong style={{ 
                        color: '#52c41a', 
                        fontSize: window.innerWidth <= 768 ? '16px' : '18px' 
                      }}>
                        ₦{todayOps.savingsRegister.currentSavings.toLocaleString()}
                      </Text>
                    </div>
                  </Space>
                ) : (
                  <Alert message="Savings register data not available" type="info" />
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/app/cashbook')}
                type={!todayOps?.isCompleted ? 'primary' : 'default'}
              >
                Daily Cashbook Entry
              </Button>
            </Col>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<RiseOutlined />}
                onClick={() => navigate('/app/predictions')}
              >
                Tomorrow's Predictions
              </Button>
            </Col>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<BankOutlined />}
                onClick={() => navigate('/app/bank-statements')}
              >
                Bank Statements
              </Button>
            </Col>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<CalculatorOutlined />}
                onClick={() => navigate('/app/reports')}
                disabled={!todayOps}
              >
                View Reports
              </Button>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};