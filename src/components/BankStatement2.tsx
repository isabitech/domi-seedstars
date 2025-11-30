import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Form, 
  InputNumber, 
  Button, 
  Space, 
  Typography, 
  Alert,
  DatePicker,
  Statistic,
  Row,
  Col,
  Divider,
  Tag,
  Table,
  Input,
  Select
} from 'antd';
import { 
  SaveOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  DollarCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { BankStatement2Input } from '../services/bankStatement';
import { 
  saveBankStatement2, 
  calculateBankStatement2 
} from '../services/bankStatement';
import { useGetMe } from '../hooks/Auth/useGetMe';
import { useGetBS2, type BankStatement2 } from '../hooks/BankStatements/useGetBS2';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BankStatement2Props {
  selectedDate?: string;
  onSubmit?: (data: { tbo: number; exAmt: number; exPurpose: string }) => void;
  loading?: boolean;
}


export const BankStatement2Component: React.FC<BankStatement2Props> = ({ 
  selectedDate, 
  onSubmit, 
  loading: externalLoading 
}) => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [statement, setStatement] = useState<BankStatement2 | null>(null);
  const [editMode, setEditMode] = useState(true); // Controls whether form is editable
  const [currentDate, setCurrentDate] = useState(
    selectedDate || dayjs().format('YYYY-MM-DD')
  );
  const [error, setError] = useState<string | null>(null);
  
  // Merge internal and external loading states
  const isLoading = loading || externalLoading;

  const getBankStatement2 = useGetBS2(currentDate, user?.branchId || "");

  // Update statement state when data is fetched
  useEffect(() => {
    if (getBankStatement2.data?.data?.bankStatement2) {
      const existingStatement = getBankStatement2.data.data.bankStatement2;
      setStatement(existingStatement);
      form.setFieldsValue({
        tbo: existingStatement.tbo,
        exAmt: existingStatement.exAmt,
        exPurpose: existingStatement.exPurpose || '',
        date: dayjs(existingStatement.date),
      });
    }
  }, [getBankStatement2.data, form]);

  // Calculate statement when values change
  const handleRecalculate = useCallback(async () => {
    if (!user?.branchId) return;
    // Note: Calculation is handled by the backend API through the hook
    console.log('Recalculation would be triggered here');
  }, [user?.branchId]);

  // Handle form submission
  const handleSubmit = async (values: { 
    tbo: number; 
    exAmt: number;
    exPurpose: string;
    date: dayjs.Dayjs;
  }) => {
    if (!user?.branchId) return;

    setLoading(true);
    setError(null);
    
    // Call the parent onSubmit callback if provided
    try {
        if (onSubmit) {
         onSubmit({
          tbo: values.tbo,
          exAmt: values.exAmt,
          exPurpose: values.exPurpose,
        });
        // Refetch data to get updated statement
        await getBankStatement2.refetch();
        // Keep form editable after successful submission
      }
    } catch (err) {
      setError('Failed to submit bank statement 2');
      console.error('Error submitting statement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode toggle
  const handleEdit = () => {
    setEditMode(true);
    console.log("Edit button clicked - editMode set to:", true);
  };

  // Handle date change
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const newDate = date.format('YYYY-MM-DD');
      setCurrentDate(newDate);
    }
  };

  // Effect to recalculate when form values change
  const handleValuesChange = useCallback((changedValues: { 
    tbo?: number; 
    exAmt?: number; 
    exPurpose?: string; 
  }) => {
    if ('tbo' in changedValues || 'exAmt' in changedValues) {
      handleRecalculate();
    }
  }, [handleRecalculate]);

  useEffect(() => {
    form.setFieldsValue({ date: dayjs(currentDate) });
  }, [currentDate, form]);

  const statementColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: window.innerWidth <= 768 ? 150 : 200,
      render: (text: string) => (
        <Text style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
          {window.innerWidth <= 768 ? 
            text.replace('Transfer to Branch Office', 'Transfer to BO').replace('Expense Amount', 'Expense Amt') : 
            text}
        </Text>
      )
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
          {window.innerWidth <= 768 ? 
            (amount / 1000).toFixed(0) + 'K' : 
            amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Source/Input',
      dataIndex: 'source',
      key: 'source',
      width: window.innerWidth <= 768 ? 80 : 100,
      render: (source: string) => (
        <Tag color={source === 'Manual' ? 'blue' : 'green'} style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
          {window.innerWidth <= 768 ? (source === 'Manual' ? 'Man' : 'CB') : source}
        </Tag>
      ),
    },
  ];

  const statementData = statement ? [
    {
      key: 'withd',
      description: 'Withdrawal (WITHD)',
      amount: statement.withd,
      source: 'Cashbook 1',
    },
    {
      key: 'tbo',
      description: 'Transfer to Branch Office (T.B.O)',
      amount: statement.tbo,
      source: 'Manual',
    },
    {
      key: 'exAmt',
      description: `Expense Amount (EX AMT)${statement.exPurpose ? ` - ${statement.exPurpose}` : ''}`,
      amount: statement.exAmt,
      source: 'Manual',
    },
  ] : [];

  return (
    <Card 
      title={
        <Space>
          <SwapOutlined />
          <span style={{ fontSize: window.innerWidth <= 768 ? '16px' : '18px' }}>Bank Statement 2 (BS2)</span>
        </Space>
      }
      loading={isLoading || getBankStatement2.isLoading}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => getBankStatement2.refetch()}
          size="small"
        >
          {window.innerWidth <= 768 ? '' : 'Refresh'}
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: 'Date is required' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Transfer to Branch Office - T.B.O (₦)"
                name="tbo"
                rules={[{ required: true, message: 'T.B.O amount is required' }]}
                help="Amount transferred from HO to another branch"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Enter transfer amount"
                  formatter={value => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Expense Amount - EX AMT (₦)"
                name="exAmt"
                rules={[{ required: true, message: 'Expense amount is required' }]}
                help="Total expenses for the day"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="Enter expense amount"
                  formatter={value => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Expense Purpose - EX PURPOSE"
            name="exPurpose"
            help="Detailed reasons/purposes for the expenses"
          >
            <TextArea
              rows={3}
              placeholder="Enter the purpose/reason for expenses..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Space wrap style={{ width: '100%', justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isLoading}
              size={window.innerWidth <= 768 ? 'large' : 'middle'}
            >
              {statement ? 'Update Statement' : 'Save Statement'}
            </Button>
            <Button
              icon={<CalculatorOutlined />}
              onClick={handleRecalculate}
              loading={calculating}
              size={window.innerWidth <= 768 ? 'large' : 'middle'}
            >
              {window.innerWidth <= 768 ? 'Recalc' : 'Recalculate'}
            </Button>
          </Space>
        </Form>

        <Divider />

        {statement && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>Bank Statement 2 Details</Title>
              <Text type="secondary">
                Statement for {dayjs(statement.date).format('DD MMMM YYYY')}
              </Text>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={statementColumns}
                dataSource={statementData}
                pagination={false}
                size="small"
                scroll={{ x: window.innerWidth <= 768 ? 400 : undefined }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                      <Table.Summary.Cell index={0}>
                        <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Total Bank Statement 2</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Statistic
                          value={statement.bs2Total}
                          precision={0}
                          valueStyle={{ 
                            color: statement.bs2Total >= 0 ? '#3f8600' : '#cf1322',
                            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                            fontWeight: 'bold'
                          }}
                          prefix="₦"
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <Tag icon={<DollarCircleOutlined />} color="gold">
                          {window.innerWidth <= 768 ? 'Calc' : 'Calculated'}
                        </Tag>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            <Card size="small" style={{ 
              backgroundColor: '#fff7e6', 
              border: '1px solid #ffd591',
              padding: window.innerWidth <= 768 ? '8px' : '16px'
            }}>
              <Space direction="vertical" size="small">
                <Text strong style={{ fontSize: window.innerWidth <= 768 ? '13px' : '14px' }}>Calculation Formula:</Text>
                <Text code style={{ fontSize: window.innerWidth <= 768 ? '11px' : '12px' }}>
                  BS2 Total = WITHD + T.B.O + EX AMT
                </Text>
                <Text type="secondary" style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px' }}>
                  • WITHD is automatically pulled from Cashbook 1 (FRM HO field)
                  <br />
                  • T.B.O (Transfer to Branch Office) is manually inputted by HO
                  <br />
                  • EX AMT (Expense Amount) is manually inputted by the branch
                  <br />
                  • EX PURPOSE provides detailed explanation for expenses
                </Text>
              </Space>
            </Card>
          </Space>
        )}
      </Space>
    </Card>
  );
};