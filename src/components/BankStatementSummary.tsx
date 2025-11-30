import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Alert,
  DatePicker,
  Button,
  Divider,
  Tag,
  Table,
  Progress,
} from 'antd';
import {
  
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalculatorOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetMe } from '../hooks/Auth/useGetMe';
import { useGetBS1 } from '../hooks/BankStatements/useGetBS1';
import { useGetBS2 } from '../hooks/BankStatements/useGetBS2';

const { Title, Text } = Typography;

interface BankStatementSummaryProps {
  selectedDate?: string;
}

export const BankStatementSummaryComponent: React.FC<BankStatementSummaryProps> = ({
  selectedDate,
}) => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  const [currentDate, setCurrentDate] = useState(
    selectedDate || dayjs().format('YYYY-MM-DD')
  );

  const getBankStatement1 = useGetBS1(currentDate, user?.branchId || '');
  const getBankStatement2 = useGetBS2(currentDate, user?.branchId || '');

  const statement1 = getBankStatement1.data?.data?.bankStatement1;
  const statement2 = getBankStatement2.data?.data?.bankStatement2;
  const isLoading = getBankStatement1.isLoading || getBankStatement2.isLoading;

  // Handle date change
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const newDate = date.format('YYYY-MM-DD');
      setCurrentDate(newDate);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    getBankStatement1.refetch();
    getBankStatement2.refetch();
  };

  // Calculate summary data
  const summaryData = React.useMemo(() => {
    if (!statement1 || !statement2) return null;

    const totalInflow = statement1.bs1Total;
    const totalOutflow = statement2.bs2Total;
    const netPosition = totalInflow - totalOutflow;

    return {
      totalInflow,
      totalOutflow,
      netPosition,
      statement1Total: statement1.bs1Total,
      statement2Total: statement2.bs2Total,
      date: statement1.date || statement2.date,
    };
  }, [statement1, statement2]);

  // Completion status
  const completionStatus = React.useMemo(() => {
    const bs1Complete = !!statement1;
    const bs2Complete = !!statement2;
    const overallComplete = bs1Complete && bs2Complete;

    return {
      bs1Complete,
      bs2Complete,
      overallComplete,
      completionPercentage: (bs1Complete ? 50 : 0) + (bs2Complete ? 50 : 0),
    };
  }, [statement1, statement2]);

  // Summary table data
  const summaryTableData = summaryData ? [
    {
      key: 'bs1',
      description: 'Bank Statement 1 (Inflow)',
      amount: summaryData.statement1Total,
      type: 'Inflow',
      status: completionStatus.bs1Complete,
    },
    {
      key: 'bs2',
      description: 'Bank Statement 2 (Outflow)',
      amount: summaryData.statement2Total,
      type: 'Outflow',
      status: completionStatus.bs2Complete,
    },
  ] : [];

  // Bank Statement 1 detailed data
  const bs1DetailData = statement1 ? [
    {
      key: 'opening',
      description: 'Opening Balance',
      amount: statement1.opening,
      source: 'Manual',
    },
    {
      key: 'recHO',
      description: 'Received from Head Office (REC HO)',
      amount: statement1.recHO,
      source: 'Cashbook 1',
    },
    {
      key: 'recBO',
      description: 'Received from Branch Office (REC BO)',
      amount: statement1.recBO,
      source: 'Cashbook 1',
    },
    {
      key: 'domi',
      description: 'Dominion Bank',
      amount: statement1.domi,
      source: 'Cashbook 2',
    },
    {
      key: 'pa',
      description: 'POS/Transfer',
      amount: statement1.pa,
      source: 'Cashbook 2',
    },
  ] : [];

  // Bank Statement 2 detailed data
  const bs2DetailData = statement2 ? [
    {
      key: 'withd',
      description: 'Withdrawal (WITHD)',
      amount: statement2.withd,
      source: 'Cashbook 1',
    },
    {
      key: 'tbo',
      description: 'Transfer to Branch Office (T.B.O)',
      amount: statement2.tbo,
      source: 'Manual',
    },
    {
      key: 'exAmt',
      description: `Expense Amount (EX AMT)${statement2.exPurpose ? ` - ${statement2.exPurpose}` : ''}`,
      amount: statement2.exAmt,
      source: 'Manual',
    },
  ] : [];

  const summaryColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: window.innerWidth <= 768 ? 150 : 200,
      render: (text: string) => (
        <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
          {window.innerWidth <= 768 ? text.replace('Bank Statement', 'BS') : text}
        </Text>
      ),
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      width: window.innerWidth <= 768 ? 100 : 120,
      render: (amount: number) => (
        <Text strong style={{ 
          color: amount >= 0 ? '#52c41a' : '#ff4d4f',
          fontSize: window.innerWidth <= 768 ? '12px' : '14px'
        }}>
          {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: window.innerWidth <= 768 ? 60 : 80,
      render: (type: string) => (
        <Tag color={type === 'Inflow' ? 'green' : 'orange'} style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: window.innerWidth <= 768 ? 60 : 80,
      render: (status: boolean) => (
        <Tag 
          icon={status ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          color={status ? 'success' : 'warning'}
          style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}
        >
          {window.innerWidth <= 768 ? (status ? 'Done' : 'Pending') : (status ? 'Complete' : 'Pending')}
        </Tag>
      ),
    },
  ];

  // Detail table columns for both bank statements
  const detailColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: window.innerWidth <= 768 ? 150 : 200,
      render: (text: string) => (
        <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>
          {window.innerWidth <= 768 ? 
            text.replace('Received from Head Office', 'Rec from HO')
                .replace('Received from Branch Office', 'Rec from BO')
                .replace('Transfer to Branch Office', 'Transfer to BO')
                .replace('Opening Balance', 'Opening Bal')
                .replace('Expense Amount', 'Expense Amt') : 
            text}
        </Text>
      ),
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      width: window.innerWidth <= 768 ? 90 : 110,
      render: (amount: number) => (
        <Text strong style={{ 
          color: amount >= 0 ? '#52c41a' : '#ff4d4f',
          fontSize: window.innerWidth <= 768 ? '11px' : '13px'
        }}>
          {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: window.innerWidth <= 768 ? 70 : 90,
      render: (source: string) => (
        <Tag color={source === 'Manual' ? 'blue' : 'green'} style={{ fontSize: window.innerWidth <= 768 ? '9px' : '11px' }}>
          {window.innerWidth <= 768 ? (source === 'Manual' ? 'Man' : 'CB') : source}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <FileDoneOutlined />
          <span style={{ fontSize: window.innerWidth <= 768 ? '16px' : '18px' }}>Bank Statement Summary</span>
        </Space>
      }
      loading={isLoading}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
            {window.innerWidth <= 768 ? '' : 'Refresh'}
          </Button>
          {summaryData && (
            <Button 
              icon={<DownloadOutlined />} 
              type="primary" 
              size="small"
              disabled={!completionStatus.overallComplete}
            >
              {window.innerWidth <= 768 ? '' : 'Export'}
            </Button>
          )}
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Date Selection */}
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Select Date</Text>
              <DatePicker
                value={dayjs(currentDate)}
                onChange={handleDateChange}
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Completion Status</Text>
              <Progress 
                percent={completionStatus.completionPercentage} 
                status={completionStatus.overallComplete ? 'success' : 'active'}
                strokeColor={completionStatus.overallComplete ? '#52c41a' : '#1890ff'}
                size={window.innerWidth <= 768 ? 'small' : 'default'}
              />
            </Space>
          </Col>
        </Row>

        {/* Status Alert */}
        {!completionStatus.overallComplete && (
          <Alert
            message={
              <Space>
                <ExclamationCircleOutlined />
                <Text strong>Incomplete Bank Statements</Text>
              </Space>
            }
            description={
              <div>
                {!completionStatus.bs1Complete && <Text>• Bank Statement 1 is missing</Text>}
                <br />
                {!completionStatus.bs2Complete && <Text>• Bank Statement 2 is missing</Text>}
              </div>
            }
            type="warning"
            showIcon={false}
          />
        )}

        {/* Summary Statistics */}
        {summaryData && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Statistic
                  title="Total Inflow (BS1)"
                  value={summaryData.totalInflow}
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
              <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                <Statistic
                  title="Total Outflow (BS2)"
                  value={summaryData.totalOutflow}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#fa8c16',
                    fontSize: window.innerWidth <= 768 ? '18px' : '24px'
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ 
                backgroundColor: summaryData.netPosition >= 0 ? '#f6ffed' : '#fff2f0',
                border: summaryData.netPosition >= 0 ? '1px solid #b7eb8f' : '1px solid #ffccc7'
              }}>
                <Statistic
                  title="Net Position"
                  value={summaryData.netPosition}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: summaryData.netPosition >= 0 ? '#52c41a' : '#ff4d4f',
                    fontSize: window.innerWidth <= 768 ? '18px' : '24px'
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Summary Table */}
        <div>
          <Title level={4} style={{ fontSize: window.innerWidth <= 768 ? '16px' : '18px', marginBottom: '16px' }}>
            Statement Breakdown
          </Title>
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={summaryColumns}
              dataSource={summaryTableData}
              pagination={false}
              size="small"
              scroll={{ x: window.innerWidth <= 768 ? 400 : undefined }}
              summary={() => summaryData ? (
                <Table.Summary>
                  <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                    <Table.Summary.Cell index={0}>
                      <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                        Net Bank Position
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Statistic
                        value={summaryData.netPosition}
                        precision={0}
                        valueStyle={{
                          color: summaryData.netPosition >= 0 ? '#3f8600' : '#cf1322',
                          fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                          fontWeight: 'bold',
                        }}
                        prefix="₦"
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Tag color={summaryData.netPosition >= 0 ? 'success' : 'error'}>
                        {summaryData.netPosition >= 0 ? 'Positive' : 'Deficit'}
                      </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Tag 
                        icon={<CalculatorOutlined />} 
                        color="gold"
                        style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}
                      >
                        {window.innerWidth <= 768 ? 'Calc' : 'Calculated'}
                      </Tag>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              ) : undefined}
            />
          </div>
        </div>

        {/* Detailed Bank Statement Tables */}
        {(statement1 || statement2) && (
          <Row gutter={[16, 16]}>
            {/* Bank Statement 1 Details */}
            {statement1 && (
              <Col xs={24} lg={12}>
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <Text strong style={{ color: '#52c41a', fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>
                        Bank Statement 1 Details
                      </Text>
                      <Tag color="green">Inflow</Tag>
                    </Space>
                  }
                  style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
                >
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={detailColumns}
                      dataSource={bs1DetailData}
                      pagination={false}
                      size="small"
                      scroll={{ x: window.innerWidth <= 768 ? 300 : undefined }}
                      summary={() => (
                        <Table.Summary>
                          <Table.Summary.Row style={{ backgroundColor: '#f0f9ef' }}>
                            <Table.Summary.Cell index={0}>
                              <Text strong style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', color: '#52c41a' }}>
                                BS1 Total
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text strong style={{
                                color: '#3f8600',
                                fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                              }}>
                                ₦{statement1.bs1Total.toLocaleString()}
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>
                              <Tag color="gold" style={{ fontSize: window.innerWidth <= 768 ? '9px' : '11px' }}>
                                {window.innerWidth <= 768 ? 'Auto' : 'Calculated'}
                              </Tag>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  </div>
                </Card>
              </Col>
            )}

            {/* Bank Statement 2 Details */}
            {statement2 && (
              <Col xs={24} lg={12}>
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <Text strong style={{ color: '#fa8c16', fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>
                        Bank Statement 2 Details
                      </Text>
                      <Tag color="orange">Outflow</Tag>
                    </Space>
                  }
                  style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}
                >
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      columns={detailColumns}
                      dataSource={bs2DetailData}
                      pagination={false}
                      size="small"
                      scroll={{ x: window.innerWidth <= 768 ? 300 : undefined }}
                      summary={() => (
                        <Table.Summary>
                          <Table.Summary.Row style={{ backgroundColor: '#fef7e6' }}>
                            <Table.Summary.Cell index={0}>
                              <Text strong style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px', color: '#fa8c16' }}>
                                BS2 Total
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text strong style={{
                                color: '#d48806',
                                fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                              }}>
                                ₦{statement2.bs2Total.toLocaleString()}
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>
                              <Tag color="gold" style={{ fontSize: window.innerWidth <= 768 ? '9px' : '11px' }}>
                                {window.innerWidth <= 768 ? 'Auto' : 'Calculated'}
                              </Tag>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Detailed Analysis */}
        {summaryData && (
          <Card 
            size="small" 
            title="Analysis & Insights"
            style={{ 
              backgroundColor: '#f9f9f9',
              padding: window.innerWidth <= 768 ? '8px' : '16px'
            }}
          >
            <Space direction="vertical" size="small">
              <Text strong style={{ fontSize: window.innerWidth <= 768 ? '13px' : '14px' }}>
                Summary for {dayjs(summaryData.date).format('DD MMMM YYYY')}:
              </Text>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                    Bank Statement 1 shows total inflow of ₦{summaryData.totalInflow.toLocaleString()}
                  </Text>
                </li>
                <li>
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                    Bank Statement 2 shows total outflow of ₦{summaryData.totalOutflow.toLocaleString()}
                  </Text>
                </li>
                <li>
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                    Net bank position: ₦{summaryData.netPosition.toLocaleString()} 
                    {summaryData.netPosition >= 0 ? ' (Surplus)' : ' (Deficit)'}
                  </Text>
                </li>
                <li>
                  <Text style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                    Both statements are {completionStatus.overallComplete ? 'complete' : 'incomplete'}
                  </Text>
                </li>
              </ul>
            </Space>
          </Card>
        )}

        {/* No Data State */}
        {!isLoading && (!statement1 && !statement2) && (
          <Alert
            message="No Bank Statements Found"
            description={`No bank statement data found for ${dayjs(currentDate).format('DD MMMM YYYY')}. Please complete Bank Statement 1 and Bank Statement 2 first.`}
            type="info"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};