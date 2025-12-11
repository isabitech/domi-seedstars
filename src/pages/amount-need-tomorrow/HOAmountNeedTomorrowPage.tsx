import React, { useState, useMemo } from 'react';
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
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  BankOutlined,
  ReloadOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useGetAmountNeedTomorrowHO, type AmountNeedTomorrowBranchSummary } from '../../hooks/AmountNeedTomorrow/useGetAmountNeedTomorrowHO';
import { calculations } from '../../utils/calculations';
import dayjs from 'dayjs';
import { toast } from 'sonner';

const { Title, Text } = Typography;

const HOAmountNeedTomorrowPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day')); // Tomorrow's date
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch Amount Need Tomorrow summary data
  const { data: amountNeedData, isLoading, error, refetch } = useGetAmountNeedTomorrowHO(
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
      toast.success('Amount Need Tomorrow data refreshed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refresh Amount Need Tomorrow data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!amountNeedData?.data) return {
      totalLoanAmount: 0,
      totalSavingsWithdrawalAmount: 0,
      totalExpensesAmount: 0,
      grandTotal: 0,
    };

    return amountNeedData.data.reduce((acc, branch) => {
      return {
        totalLoanAmount: acc.totalLoanAmount + branch.loanAmount,
        totalSavingsWithdrawalAmount: acc.totalSavingsWithdrawalAmount + branch.savingsWithdrawalAmount,
        totalExpensesAmount: acc.totalExpensesAmount + branch.expensesAmount,
        grandTotal: acc.grandTotal + branch.total,
      };
    }, {
      totalLoanAmount: 0,
      totalSavingsWithdrawalAmount: 0,
      totalExpensesAmount: 0,
      grandTotal: 0,
    });
  }, [amountNeedData]);

  // Table columns
  const columns: ColumnsType<AmountNeedTomorrowBranchSummary> = [
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      fixed: 'left',
      width: window.innerWidth <= 768 ? 120 : 150,
      render: (name: string, record: AmountNeedTomorrowBranchSummary) => (
        <div>
          <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
            {name}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
            {record.branchCode}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loan Amount',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      width: window.innerWidth <= 768 ? 100 : 130,
      render: (amount: number) => (
        <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', color: '#1890ff' }}>
          ₦{calculations.formatNumber(amount, 0)}
        </Text>
      ),
      align: 'right',
    },
    {
      title: 'Savings Withdrawal',
      dataIndex: 'savingsWithdrawalAmount',
      key: 'savingsWithdrawalAmount',
      width: window.innerWidth <= 768 ? 110 : 140,
      render: (amount: number) => (
        <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', color: '#52c41a' }}>
          ₦{calculations.formatNumber(amount, 0)}
        </Text>
      ),
      align: 'right',
    },
    {
      title: 'Expenses',
      dataIndex: 'expensesAmount',
      key: 'expensesAmount',
      width: window.innerWidth <= 768 ? 100 : 120,
      render: (amount: number) => (
        <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', color: '#fa8c16' }}>
          ₦{calculations.formatNumber(amount, 0)}
        </Text>
      ),
      align: 'right',
    },
    {
      title: 'Total Need',
      dataIndex: 'total',
      key: 'total',
      width: window.innerWidth <= 768 ? 110 : 140,
      render: (total: number) => (
        <Text 
          strong 
          style={{ 
            fontSize: window.innerWidth <= 768 ? '12px' : '14px',
            color: '#f5222d'
          }}
        >
          ₦{calculations.formatNumber(total, 0)}
        </Text>
      ),
      align: 'right',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      width: window.innerWidth <= 768 ? 80 : 120,
      render: (notes: string) => (
        notes ? (
          <Tooltip title={notes}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
      align: 'center',
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedByUser',
      key: 'submittedBy',
      width: window.innerWidth <= 768 ? 100 : 130,
      render: (user: { username: string; email: string } | null | undefined) => (
        <div>
          <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>
            {user?.username || 'N/A'}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
            {user?.email || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'createdAt',
      key: 'submittedAt',
      width: window.innerWidth <= 768 ? 100 : 130,
      render: (date: string) => (
        <div>
          <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>
            {dayjs(date).format('DD MMM YYYY')}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '11px' }}>
            {dayjs(date).format('HH:mm A')}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <DollarOutlined style={{ marginRight: '8px' }} />
              Amount Need Tomorrow - HO Dashboard
            </Title>
            <Text type="secondary">
              All branches' expected financial needs for tomorrow
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
            message="Error Loading Amount Need Tomorrow Data"
            description="Failed to load amount need tomorrow summary for all branches"
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
                {isRefreshing ? 'Refreshing amount need tomorrow data...' : 'Loading amount need tomorrow data...'}
              </Text>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        {!isLoading && !isRefreshing && !error && amountNeedData && (
          <>
            {/* Total Statistics */}
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6} md={6}>
                <Card>
                  <Statistic
                    title="Total Loan Amount"
                    value={totals.totalLoanAmount}
                    precision={0}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#1890ff',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6} md={6}>
                <Card>
                  <Statistic
                    title="Total Savings Withdrawal"
                    value={totals.totalSavingsWithdrawalAmount}
                    precision={0}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#52c41a',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6} md={6}>
                <Card>
                  <Statistic
                    title="Total Expenses"
                    value={totals.totalExpensesAmount}
                    precision={0}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#fa8c16',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6} md={6}>
                <Card>
                  <Statistic
                    title="Grand Total"
                    value={totals.grandTotal}
                    precision={0}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#f5222d',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px',
                      fontWeight: 'bold'
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Branch Summary */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Summary Statistics" size="small">
                  <Row gutter={[16, 8]}>
                    <Col span={8}>
                      <Text strong>Total Branches:</Text><br />
                      <Text style={{ fontSize: '18px', color: '#1890ff' }}>
                        {amountNeedData.count}
                      </Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>With Records:</Text><br />
                      <Text style={{ fontSize: '18px', color: '#52c41a' }}>
                        {amountNeedData.data.length}
                      </Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Average Need:</Text><br />
                      <Text style={{ fontSize: '18px', color: '#fa8c16' }}>
                        ₦{calculations.formatNumber(
                          amountNeedData.data.length > 0 ? totals.grandTotal / amountNeedData.data.length : 0, 
                          0
                        )}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Main Data Table */}
        {!isLoading && !isRefreshing && !error && amountNeedData && (
          <Card 
            title={
              <Space>
                <BankOutlined />
                <Text strong>
                  Amount Need Tomorrow - {selectedDate.format('DD MMMM YYYY')}
                </Text>
              </Space>
            }
            extra={
              <Text type="secondary">
                {amountNeedData.data.length} Branches
              </Text>
            }
          >
            {amountNeedData.data.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">
                  No amount need tomorrow data available for {selectedDate.format('DD MMMM YYYY')}
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
                  dataSource={amountNeedData.data}
                  rowKey={(record) => record._id}
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
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                        <Table.Summary.Cell index={0}>
                          <Text strong>Total</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Text strong style={{ color: '#1890ff' }}>
                            ₦{calculations.formatNumber(totals.totalLoanAmount, 0)}
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <Text strong style={{ color: '#52c41a' }}>
                            ₦{calculations.formatNumber(totals.totalSavingsWithdrawalAmount, 0)}
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Text strong style={{ color: '#fa8c16' }}>
                            ₦{calculations.formatNumber(totals.totalExpensesAmount, 0)}
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                            ₦{calculations.formatNumber(totals.grandTotal, 0)}
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>-</Table.Summary.Cell>
                        <Table.Summary.Cell index={7}>-</Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </div>
            )}
          </Card>
        )}

        {/* Formula Information */}
        {!isLoading && !isRefreshing && !error && (
          <Card title="Amount Need Tomorrow Formula" size="small">
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Text strong style={{ fontSize: '14px' }}>
                  Total Amount Needed = Loan Amount + Savings Withdrawal Amount + Expenses Amount
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  • <strong>Loan Amount:</strong> Amount branch expects to need for loan disbursements<br />
                  • <strong>Savings Withdrawal Amount:</strong> Amount branch expects to need for savings withdrawals<br />
                  • <strong>Expenses Amount:</strong> Amount branch expects to need for operational expenses<br />
                  • <strong>Total:</strong> Total amount each branch will need for all operations tomorrow
                </Text>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default HOAmountNeedTomorrowPage;