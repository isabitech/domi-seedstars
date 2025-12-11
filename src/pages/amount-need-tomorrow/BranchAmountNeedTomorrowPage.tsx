import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Alert,
  Spin,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useGetAmountNeedTomorrowBranch } from '../../hooks/AmountNeedTomorrow/useGetAmountNeedTomorrowBranch';
import { useCreateAmountNeedTomorrow } from '../../hooks/AmountNeedTomorrow/useCreateAmountNeedTomorrow';
import { useUpdateAmountNeedTomorrow } from '../../hooks/AmountNeedTomorrow/useUpdateAmountNeedTomorrow';
import { calculations } from '../../utils/calculations';
import dayjs from 'dayjs';
import { toast } from 'sonner';

const { Title, Text } = Typography;

interface AmountNeedTomorrowFormData {
  loanAmount: number;
  savingsWithdrawalAmount: number;
  expensesAmount: number;
  notes?: string;
}

const BranchAmountNeedTomorrowPage: React.FC = () => {
  // Form and state
  const [form] = Form.useForm<AmountNeedTomorrowFormData>();
  const [formData, setFormData] = useState<AmountNeedTomorrowFormData>({
    loanAmount: 0,
    savingsWithdrawalAmount: 0,
    expensesAmount: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks
  const { data: currentRecord, isLoading, error, refetch } = useGetAmountNeedTomorrowBranch();
  const createMutation = useCreateAmountNeedTomorrow();
  const updateMutation = useUpdateAmountNeedTomorrow();

  // Check if this is the first record (no previous record exists)
  const isFirstRecord = !currentRecord?.amountNeedTomorrow;

  // Handle refresh
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

  // Initialize form with existing data
  useEffect(() => {
    if (currentRecord?.amountNeedTomorrow) {
      const record = currentRecord.amountNeedTomorrow;
      const formValues = {
        loanAmount: record.loanAmount,
        savingsWithdrawalAmount: record.savingsWithdrawalAmount,
        expensesAmount: record.expensesAmount,
        notes: record.notes || '',
      };
      form.setFieldsValue(formValues);
      setFormData(formValues);
    }
  }, [currentRecord, form]);

  // Handle form submission
  const handleSubmit = async (values: AmountNeedTomorrowFormData) => {
    try {
      const payload = {
        loanAmount: Number(values.loanAmount) || 0,
        savingsWithdrawalAmount: Number(values.savingsWithdrawalAmount) || 0,
        expensesAmount: Number(values.expensesAmount) || 0,
        notes: values.notes || '',
      };

      if (isFirstRecord) {
        await createMutation.mutateAsync(payload);
        toast.success('Amount Need Tomorrow record created successfully!');
      } else {
        await updateMutation.mutateAsync(payload);
        toast.success('Amount Need Tomorrow record updated successfully!');
      }

      setFormData(payload);
    } catch (error: any) {
      // Error is handled by the mutation hook
      console.error('Submission error:', error);
    }
  };

  // Calculate total
  const calculatedTotal = useMemo(() => {
    return (formData.loanAmount || 0) + 
           (formData.savingsWithdrawalAmount || 0) + 
           (formData.expensesAmount || 0);
  }, [formData]);

  // Check if form data has changed
  const hasChanges = useMemo(() => {
    if (!currentRecord?.amountNeedTomorrow) return true;
    
    const record = currentRecord.amountNeedTomorrow;
    return (
      formData.loanAmount !== record.loanAmount ||
      formData.savingsWithdrawalAmount !== record.savingsWithdrawalAmount ||
      formData.expensesAmount !== record.expensesAmount ||
      formData.notes !== record.notes
    );
  }, [formData, currentRecord]);

  const isProcessing = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <DollarOutlined style={{ marginRight: '8px' }} />
              Amount Need Tomorrow
            </Title>
            <Text type="secondary">
              Plan your branch's financial needs for tomorrow
            </Text>
          </Col>
          <Col>
            <Button 
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Data"
            description="Failed to load today's Amount Need Tomorrow record"
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
                {isRefreshing ? 'Refreshing Amount Need Tomorrow data...' : 'Loading Amount Need Tomorrow data...'}
              </Text>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {!isLoading && !isRefreshing && !error && (
          <>
            {/* Status Alert */}
            {currentRecord?.amountNeedTomorrow && (
              <Alert
                message="Record Exists"
                description={
                  `Amount Need Tomorrow record for today (${dayjs().format('DD MMMM YYYY')}) exists. You can update the values below.`
                }
                type="info"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ borderColor: '#1890ff' }}
              />
            )}

            <Row gutter={[24, 24]}>
              {/* Form Card */}
              <Col xs={24} lg={14}>
                <Card 
                  title={
                    <Space>
                      {isFirstRecord ? <PlusOutlined /> : <CalculatorOutlined />}
                      <Text strong>
                        {isFirstRecord ? 'Create Amount Need Tomorrow' : 'Update Amount Need Tomorrow'}
                      </Text>
                    </Space>
                  }
                  extra={
                    <Text type="secondary">
                      {dayjs().format('DD MMMM YYYY')}
                    </Text>
                  }
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={(_, allValues) => {
                      setFormData({
                        loanAmount: Number(allValues.loanAmount) || 0,
                        savingsWithdrawalAmount: Number(allValues.savingsWithdrawalAmount) || 0,
                        expensesAmount: Number(allValues.expensesAmount) || 0,
                        notes: allValues.notes || '',
                      });
                    }}
                    size="large"
                  >
                    {/* Loan Amount */}
                    <Form.Item
                      name="loanAmount"
                      label="Loan Amount Needed"
                      tooltip="Amount needed for loan disbursements tomorrow"
                      rules={[
                        { required: true, message: 'Please enter loan amount' },
                      ]}
                    >
                      <Input
                        type="number"
                        prefix="₦"
                        placeholder="0.00"
                        size="large"
                        style={{ fontSize: '16px' }}
                      />
                    </Form.Item>

                    {/* Savings Withdrawal Amount */}
                    <Form.Item
                      name="savingsWithdrawalAmount"
                      label="Savings Withdrawal Amount"
                      tooltip="Amount needed for savings withdrawals tomorrow"
                      rules={[
                        { required: true, message: 'Please enter savings withdrawal amount' },
                        // { type: 'number', min: 0, message: 'Amount must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        prefix="₦"
                        placeholder="0.00"
                        size="large"
                        style={{ fontSize: '16px' }}
                      />
                    </Form.Item>

                    {/* Expenses Amount */}
                    <Form.Item
                      name="expensesAmount"
                      label="Expenses Amount"
                      tooltip="Amount needed for branch expenses tomorrow"
                      rules={[
                        { required: true, message: 'Please enter expenses amount' },
                        // { type: 'number', min: 0, message: 'Amount must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        prefix="₦"
                        placeholder="0.00"
                        size="large"
                        style={{ fontSize: '16px' }}
                      />
                    </Form.Item>

                    {/* Notes */}
                    <Form.Item
                      name="notes"
                      label="Notes (Optional)"
                      tooltip="Additional notes or comments"
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Enter any additional notes or comments..."
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>

                    {/* Action Button */}
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isProcessing}
                        icon={isFirstRecord ? <PlusOutlined /> : <CalculatorOutlined />}
                        size="large"
                        disabled={!hasChanges}
                      >
                        {isFirstRecord ? 'Create Record' : 'Update Record'}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              {/* Summary Card */}
              <Col xs={24} lg={10}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* Calculation Summary */}
                  <Card title="Total Amount Summary">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Statistic
                          title="Loan Amount"
                          value={formData.loanAmount || 0}
                          precision={2}
                          prefix="₦"
                          valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Statistic
                          title="Savings Withdrawal"
                          value={formData.savingsWithdrawalAmount || 0}
                          precision={2}
                          prefix="₦"
                          valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Statistic
                          title="Expenses"
                          value={formData.expensesAmount || 0}
                          precision={2}
                          prefix="₦"
                          valueStyle={{ color: '#fa8c16', fontSize: '16px' }}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Divider style={{ margin: '8px 0' }} />
                        <Statistic
                          title="Total Amount Needed"
                          value={calculatedTotal}
                          precision={2}
                          prefix="₦"
                          valueStyle={{ 
                            color: '#f5222d', 
                            fontSize: '18px',
                            fontWeight: 'bold'
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>

                  {/* Record Information */}
                  {currentRecord?.amountNeedTomorrow && (
                    <Card title="Record Information" size="small">
                      <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Created:</Text><br />
                          <Text>{dayjs(currentRecord.amountNeedTomorrow.createdAt).format('DD MMM YYYY, HH:mm A')}</Text>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Last Updated:</Text><br />
                          <Text>{dayjs(currentRecord.amountNeedTomorrow.updatedAt).format('DD MMM YYYY, HH:mm A')}</Text>
                        </Col>
                      </Row>
                    </Card>
                  )}
                </Space>
              </Col>
            </Row>

            {/* Formula Information */}
            <Card title="Amount Need Tomorrow Formula" size="small">
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Text strong style={{ fontSize: '14px' }}>
                    Total Amount Needed = Loan Amount + Savings Withdrawal Amount + Expenses Amount
                  </Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    • <strong>Loan Amount:</strong> Expected amount needed for loan disbursements<br />
                    • <strong>Savings Withdrawal Amount:</strong> Expected amount needed for savings withdrawals<br />
                    • <strong>Expenses Amount:</strong> Expected amount needed for branch operational expenses<br />
                    • <strong>Total:</strong> Total amount your branch will need tomorrow for all operations
                  </Text>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Space>
    </div>
  );
};

export default BranchAmountNeedTomorrowPage;