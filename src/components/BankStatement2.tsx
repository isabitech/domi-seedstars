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
import { useGetEntry } from '../hooks/Branch/Cashbook/useGetEntry';
import type { BankStatement2 } from '../hooks/Branch/Cashbook/useCreateEntry';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BankStatement2Props {
  selectedDate?: string;
  onSubmit?: (data: { tbo: number; exAmt: number; exPurpose: string }) => void;
  loading?: boolean;
}

// Sample branch options (in real app, this would come from API)
const branchOptions = [
  { value: 'BR001', label: 'Lagos Main Branch' },
  { value: 'BR002', label: 'Abuja Branch' },
  { value: 'BR003', label: 'Port Harcourt Branch' },
  { value: 'BR004', label: 'Kano Branch' },
  { value: 'BR005', label: 'Ibadan Branch' },
];

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

  const getBankStatement2 = useGetEntry(user?.branchId, currentDate);

  // Load existing statement data
  const loadStatement = useCallback(async () => {
    if (!user?.branchId || !currentDate) return;

    setLoading(true);
    setError(null);

    try {
      const existingStatement =
        getBankStatement2.data?.data?.operations?.bankStatement2;

      if (existingStatement) {
        setStatement(existingStatement);
        setEditMode(false); // Disable editing if data exists
        form.setFieldsValue({
          tbo: existingStatement.tbo,
          exAmt: existingStatement.exAmt,
          exPurpose: existingStatement.exPurpose || '',
          date: dayjs(existingStatement.date),
        });
      } else {
        setEditMode(true); // Enable editing if no data
      }
    } catch (err) {
      setError('Failed to load bank statement 2 data');
      console.error('Error loading statement:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.branchId, currentDate, form, getBankStatement2.data]);

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
        setEditMode(false); // Disable editing after successful submission
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

  // Effect to reload when date changes
  useEffect(() => {
    loadStatement();
  }, [loadStatement]);

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
      width: 200,
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: amount >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Source/Input',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => (
        <Tag color={source === 'Manual' ? 'blue' : 'green'}>
          {source}
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
          <span>Bank Statement 2 (BS2)</span>
        </Space>
      }
      loading={isLoading}
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadStatement}
          size="small"
        >
          Refresh
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
          disabled={!editMode}
        >
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
            <Col span={12}>
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

          <Space>
            {editMode ? (
              <>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isLoading}
                >
                  {statement ? 'Update Statement' : 'Save Statement'}
                </Button>
                <Button
                  icon={<CalculatorOutlined />}
                  onClick={handleRecalculate}
                  loading={calculating}
                >
                  Recalculate
                </Button>
              </>
            ) : (
              <Button
                type="default"
                icon={<SaveOutlined />}
                onClick={handleEdit}
              >
                Edit Statement
              </Button>
            )}
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

            <Table
              columns={statementColumns}
              dataSource={statementData}
              pagination={false}
              size="small"
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total Bank Statement 2</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Statistic
                        value={statement.bs2Total}
                        precision={0}
                        valueStyle={{ 
                          color: statement.bs2Total >= 0 ? '#3f8600' : '#cf1322',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                        prefix="₦"
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Tag icon={<DollarCircleOutlined />} color="gold">
                        Calculated
                      </Tag>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
              <Space direction="vertical" size="small">
                <Text strong>Calculation Formula:</Text>
                <Text code>
                  BS2 Total = WITHD + T.B.O + EX AMT
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
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