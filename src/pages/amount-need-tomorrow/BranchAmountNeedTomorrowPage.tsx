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
  DatePicker,
} from 'antd';
import {
  DollarOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

import { CURRENT_DATE } from '../../lib/utils';
import { calculations } from '../../utils/calculations';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useCreateSenatePlanning, useGetSenatePlanningByDate, useUpdateSenatePlanning } from '../../hooks/SenatePlanning';

const { Title, Text } = Typography;

interface SenatePlanningFormData {
  noOfDisbursement: number;
  disbursementAmount: number;
  amountToClients: number;
  notes?: string;
}

const BranchAmountNeedTomorrowPage: React.FC = () => {
  // Form and state
  const [form] = Form.useForm<SenatePlanningFormData>();
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE);
  const [formData, setFormData] = useState<SenatePlanningFormData>({
    noOfDisbursement: 0,
    disbursementAmount: 0,
    amountToClients: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if selected date is current date
  const isCurrentDate = selectedDate === CURRENT_DATE;

  // Handle date change
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  // Hooks
  const { data: currentRecord, isLoading, error, refetch } = useGetSenatePlanningByDate(selectedDate);
  const createMutation = useCreateSenatePlanning();
  const updateMutation = useUpdateSenatePlanning();

  // Check if this is the first record (no previous record exists)
  const isFirstRecord = !currentRecord?.senatePlanning;

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success('Senate Planning data refreshed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refresh Senate Planning data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initialize form with existing data
  useEffect(() => {
    if (currentRecord?.senatePlanning) {
      const record = currentRecord.senatePlanning;
      const formValues = {
        noOfDisbursement: record.noOfDisbursement || 0,
        disbursementAmount: record.disbursementAmount || record.loanAmount || 0,
        amountToClients: record.amountToClients || record.savingsWithdrawalAmount || 0,
        notes: record.notes || '',
      };
      form.setFieldsValue(formValues);
      setFormData(formValues);
    }
  }, [currentRecord, form]);

  // Handle form submission
  const handleSubmit = async (values: SenatePlanningFormData) => {
    if (!isCurrentDate) {
      toast.error('Cannot modify data for past dates');
      return;
    }

    try {
      const payload = {
        noOfDisbursement: Number(values.noOfDisbursement) || 0,
        disbursementAmount: Number(values.disbursementAmount) || 0,
        amountToClients: Number(values.amountToClients) || 0,
        notes: values.notes || '',
      };

      if (isFirstRecord) {
        await createMutation.mutateAsync(payload);
        toast.success('Senate Planning record created successfully!');
      } else {
        await updateMutation.mutateAsync(payload);
        toast.success('Senate Planning record updated successfully!');
      }

      setFormData(payload);
    } catch (error: any) {
      // Error is handled by the mutation hook
      console.error('Submission error:', error);
    }
  };

  // Calculate total
  const calculatedTotal = useMemo(() => {
    return (formData.disbursementAmount || 0) + 
           (formData.amountToClients || 0);
  }, [formData]);

  // Check if form data has changed
  const hasChanges = useMemo(() => {
    if (!currentRecord?.senatePlanning) return true;
    
    const record = currentRecord.senatePlanning;
    return (
      formData.noOfDisbursement !== (record.noOfDisbursement || 0) ||
      formData.disbursementAmount !== (record.disbursementAmount || record.loanAmount || 0) ||
      formData.amountToClients !== (record.amountToClients || record.savingsWithdrawalAmount || 0) ||
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
              Senate Planning
            </Title>
            <Text type="secondary">
              Plan your branch's financial needs - {dayjs(selectedDate).format('DD MMMM YYYY')}
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

        {/* Date Picker */}
        <Card size="small">
          <Space>
            <CalendarOutlined />
            <Text strong>Select Date:</Text>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              format="DD MMMM YYYY"
              allowClear={false}
              placeholder="Select date"
            />
            {!isCurrentDate && (
              <Alert
                message="Historical Data"
                description="Data for past dates is read-only"
                type="info"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Data"
            description="Failed to load today's Senate Planning record"
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
                {isRefreshing ? 'Refreshing Senate Planning data...' : 'Loading Senate Planning data...'}
              </Text>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {!isLoading && !isRefreshing && (
          <>
            {/* Status Alert */}
            {currentRecord?.senatePlanning && (
              <Alert
                message="Record Exists"
                description={
                  `Senate Planning record for ${dayjs(selectedDate).format('DD MMMM YYYY')} exists. ${isCurrentDate ? 'You can update the values below.' : 'This is historical data and cannot be modified.'}`
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
                        {isFirstRecord ? 'Create Senate Planning' : 'Update Senate Planning'}
                      </Text>
                    </Space>
                  }
                  extra={
                    <Text type="secondary">
                      {dayjs(selectedDate).format('DD MMMM YYYY')}
                    </Text>
                  }
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={(_, allValues) => {
                      setFormData({
                        noOfDisbursement: Number(allValues.noOfDisbursement) || 0,
                        disbursementAmount: Number(allValues.disbursementAmount) || 0,
                        amountToClients: Number(allValues.amountToClients) || 0,
                        notes: allValues.notes || '',
                      });
                    }}
                    size="large"
                    disabled={!isCurrentDate}
                  >
                    {/* No of disbursement */}
                    <Form.Item
                      name="noOfDisbursement"
                      label="No of disbursement"
                      tooltip="Number of disbursements planned for tomorrow"
                      rules={[
                        { required: true, message: 'Please enter number of disbursements' },
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0"
                        size="large"
                        style={{ fontSize: '16px' }}
                        min={0}
                        step={1}
                      />
                    </Form.Item>

                    {/* Disbursement amount */}
                    <Form.Item
                      name="disbursementAmount"
                      label="Disbursement Amount"
                      tooltip="Amount needed for loan disbursements tomorrow"
                      rules={[
                        { required: true, message: 'Please enter Disbursement amount' },
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

                    {/* Amount to clients */}
                    <Form.Item
                      name="amountToClients"
                      label="Amount to clients"
                      tooltip="Amount needed for savings withdrawals tomorrow"
                      rules={[
                        { required: true, message: 'Please enter Amount to clients' },
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
                      {isCurrentDate ? (
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
                      ) : (
                        <Alert
                          message="Read-only Mode"
                          description="Data for past dates cannot be modified"
                          type="info"
                          showIcon
                        />
                      )}
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
                          title="No of disbursement"
                          value={formData.noOfDisbursement || 0}
                          valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Statistic
                          title="Disbursement Amount"
                          value={formData.disbursementAmount || 0}
                          precision={2}
                          prefix="₦"
                          valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                        />
                      </Col>
                      <Col xs={24} sm={12}>
                        <Statistic
                          title="Amount to clients"
                          value={formData.amountToClients || 0}
                          precision={2}
                          prefix="₦"
                          valueStyle={{ color: '#52c41a', fontSize: '16px' }}
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
                  {currentRecord?.senatePlanning && (
                    <Card title="Record Information" size="small">
                      <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Created:</Text><br />
                          <Text>{dayjs(currentRecord.senatePlanning.createdAt).format('DD MMM YYYY, HH:mm A')}</Text>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary">Last Updated:</Text><br />
                          <Text>{dayjs(currentRecord.senatePlanning.updatedAt).format('DD MMM YYYY, HH:mm A')}</Text>
                        </Col>
                      </Row>
                    </Card>
                  )}
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Space>
    </div>
  );
};

export default BranchAmountNeedTomorrowPage;