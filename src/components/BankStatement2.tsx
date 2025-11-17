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
import { useAuthStore } from '../store';
import type { BankStatement2Data, BankStatement2Input } from '../services/bankStatement';
import { 
  getBankStatement2, 
  saveBankStatement2, 
  calculateBankStatement2 
} from '../services/bankStatement';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BankStatement2Props {
  selectedDate?: string;
}

// Sample branch options (in real app, this would come from API)
const branchOptions = [
  { value: 'BR001', label: 'Lagos Main Branch' },
  { value: 'BR002', label: 'Abuja Branch' },
  { value: 'BR003', label: 'Port Harcourt Branch' },
  { value: 'BR004', label: 'Kano Branch' },
  { value: 'BR005', label: 'Ibadan Branch' },
];

export const BankStatement2: React.FC<BankStatement2Props> = ({ selectedDate }) => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [statement, setStatement] = useState<BankStatement2Data | null>(null);
  const [currentDate, setCurrentDate] = useState(selectedDate || dayjs().format('YYYY-MM-DD'));
  const [error, setError] = useState<string | null>(null);

  // Load existing statement data
  const loadStatement = useCallback(async () => {
    if (!user?.branchId || !currentDate) return;

    setLoading(true);
    setError(null);

    try {
      const existingStatement = await getBankStatement2(user.branchId, currentDate);
      
      if (existingStatement) {
        setStatement(existingStatement);
        form.setFieldsValue({
          tbo: existingStatement.tbo,
          tboToBranch: existingStatement.tboToBranch,
          exAmt: existingStatement.exAmt,
          exPurpose: existingStatement.exPurpose,
          date: dayjs(existingStatement.date)
        });
      } else {
        // Calculate initial statement with default values
        const calculatedStatement = await calculateBankStatement2(user.branchId, currentDate, 0, '', 0, '');
        setStatement(calculatedStatement);
        form.setFieldsValue({
          tbo: 0,
          tboToBranch: '',
          exAmt: 0,
          exPurpose: '',
          date: dayjs(currentDate)
        });
      }
    } catch (err) {
      setError('Failed to load bank statement 2 data');
      console.error('Error loading statement:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.branchId, currentDate, form]);

  // Calculate statement when values change
  const handleRecalculate = useCallback(async () => {
    if (!user?.branchId) return;

    const values = form.getFieldsValue();
    setCalculating(true);

    try {
      const calculatedStatement = await calculateBankStatement2(
        user.branchId, 
        currentDate, 
        values.tbo || 0,
        values.tboToBranch || '',
        values.exAmt || 0,
        values.exPurpose || ''
      );
      setStatement(calculatedStatement);
    } catch (err) {
      setError('Failed to calculate bank statement 2');
      console.error('Error calculating statement:', err);
    } finally {
      setCalculating(false);
    }
  }, [user?.branchId, currentDate, form]);

  // Handle form submission
  const handleSubmit = async (values: { 
    tbo: number; 
    tboToBranch: string;
    exAmt: number;
    exPurpose: string;
    date: dayjs.Dayjs;
  }) => {
    if (!user?.branchId) return;

    setLoading(true);
    setError(null);

    try {
      const input: BankStatement2Input = {
        branchId: user.branchId,
        date: currentDate,
        tbo: values.tbo || 0,
        tboToBranch: values.tboToBranch || '',
        exAmt: values.exAmt || 0,
        exPurpose: values.exPurpose || ''
      };

      const savedStatement = await saveBankStatement2(input);
      setStatement(savedStatement);
      
      // Success feedback could be added here
    } catch (err) {
      setError('Failed to save bank statement 2');
      console.error('Error saving statement:', err);
    } finally {
      setLoading(false);
    }
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
    tboToBranch?: string; 
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
      description: `Transfer to Branch Office (T.B.O)${statement.tboToBranch ? ` - ${statement.tboToBranch}` : ''}`,
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
      loading={loading}
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
          disabled={loading}
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
                label="Transfer to Branch"
                name="tboToBranch"
                help="Name of branch the transfer is going to"
              >
                <Select
                  placeholder="Select destination branch"
                  options={branchOptions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
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
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Save Statement
            </Button>
            <Button
              icon={<CalculatorOutlined />}
              onClick={handleRecalculate}
              loading={calculating}
            >
              Recalculate
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
                        value={statement.total}
                        precision={0}
                        valueStyle={{ 
                          color: statement.total >= 0 ? '#3f8600' : '#cf1322',
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