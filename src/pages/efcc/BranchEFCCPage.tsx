
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
  SafetyOutlined,
  DollarOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useGetEFCCBranch, type EFCCBranchResponse } from '../../hooks/EFCC/useGetEFCCBranch';
import { useCreateEFCC } from '../../hooks/EFCC/useCreateEFCC';
import { useUpdateEFCC } from '../../hooks/EFCC/useUpdateEFCC';
import { useSubmitEFCC } from '../../hooks/EFCC/useSubmitEFCC';
import dayjs from 'dayjs';
import { toast } from 'sonner';

const { Title, Text } = Typography;

interface EFCCFormData {
  previousAmountOwing?: number;
  todayRemittance: number;
  amtRemittingNow: number;
}

const BranchEFCCPage: React.FC = () => {
  const [form] = Form.useForm<EFCCFormData>();
  const [formData, setFormData] = useState<EFCCFormData>({
    todayRemittance: 0,
    amtRemittingNow: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks
  const { data: currentRecord, isLoading, error, refetch } = useGetEFCCBranch();
  const createMutation = useCreateEFCC();
  const updateMutation = useUpdateEFCC();
  const submitMutation = useSubmitEFCC();

  // Check if this is the first record (no previous record exists)
  const isFirstRecord = !currentRecord?.efcc;

  // Handle refresh
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

  // Calculate current amount owing
  const currentAmountOwing = useMemo(() => {
    const previousOwing = Number(formData.previousAmountOwing) || (currentRecord?.efcc?.previousAmountOwing ? Number(currentRecord.efcc.previousAmountOwing) : 0);
    const todayRemittance = Number(formData.todayRemittance) || 0;
    const amtRemittingNow = Number(formData.amtRemittingNow) || 0;
    
    // Formula: current owing = (previous owing + today's remittance) - Amount remitting now
    return (previousOwing + todayRemittance) - amtRemittingNow;
  }, [formData, currentRecord]);

  // Initialize form with current record data
  useEffect(() => {
    if (currentRecord?.efcc) {
      const initialData = {
        previousAmountOwing: Number(currentRecord.efcc.previousAmountOwing) || 0,
        todayRemittance: Number(currentRecord.efcc.todayRemittance) || 0,
        amtRemittingNow: Number(currentRecord.efcc.amtRemittingNow) || 0,
      };
      
      form.setFieldsValue(initialData);
      setFormData(initialData);
    }
  }, [currentRecord, form]);

  // Handle form changes
  const handleFormChange = (changedFields: any, allFields: any) => {
    setFormData({
      previousAmountOwing: Number(allFields.previousAmountOwing) || 0,
      todayRemittance: Number(allFields.todayRemittance) || 0,
      amtRemittingNow: Number(allFields.amtRemittingNow) || 0,
    });
  };

  // Handle form submission
  const handleSubmit = async (values: EFCCFormData) => {
    try {
      if (isFirstRecord || !currentRecord?.efcc) {
        // Create new record
        await createMutation.mutateAsync({
          previousAmountOwing: values.previousAmountOwing || 0,
          todayRemittance: values.todayRemittance,
          amtRemittingNow: values.amtRemittingNow,
        });
        toast.success("EFCC record created successfully");
      } else {
        // Update existing record
        await updateMutation.mutateAsync({
          previousAmountOwing: values.previousAmountOwing,
          todayRemittance: values.todayRemittance,
          amtRemittingNow: values.amtRemittingNow,
        });
        toast.success("EFCC record updated successfully");
      }
      
      await refetch();
    } catch (error: any) {
      console.error('Error saving EFCC record:', error);
      toast.error(error?.response?.data?.message || 'Failed to save EFCC record');
    }
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
      toast.success("EFCC record submitted successfully");
      await refetch();
    } catch (error: any) {
      console.error('Error submitting EFCC record:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit EFCC record');
    }
  };

  const isSubmitted = currentRecord?.efcc?.isSubmitted || false;
  const isProcessing = createMutation.isPending || updateMutation.isPending || submitMutation.isPending;

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <SafetyOutlined style={{ marginRight: '8px' }} />
              Branch DSA Summary
            </Title>
            <Text type="secondary">
              Expected Financial Compliance Calculation - {dayjs().format('DD MMMM YYYY')}
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
            message="Error Loading DSA Sumary Data"
            description="Failed to load today's DSA Sumary record"
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
                {isRefreshing ? 'Refreshing DSA Summary data...' : 'Loading DSA Summary data...'}
              </Text>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {!isLoading && !isRefreshing && !error && (
          <>
            {/* Status Alert */}
            {currentRecord?.efcc && (
              <Alert
                message={isSubmitted ? "Record Submitted" : "Draft Record"}
                description={
                  isSubmitted 
                    ? `This DSA Summary record was submitted on ${dayjs(currentRecord.efcc.submittedAt).format('DD MMMM YYYY, HH:mm A')}`
                    : "You can still modify this record until you submit it"
                }
                type={isSubmitted ? "success" : "info"}
                icon={isSubmitted ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                showIcon
              />
            )}

            <Row gutter={[24, 24]}>
              {/* Form Section */}
              <Col xs={24} lg={14}>
                <Card title="DSA Sumary Input Form" size="default">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={handleFormChange}
                    disabled={isSubmitted}
                  >
                    {/* Previous Amount Owing - Always show for editing */}
                    <Form.Item
                      label="Previous Amount Owing to HO"
                      name="previousAmountOwing"
                      rules={[
                        { required: true, message: 'Please enter previous amount owing' },
                      ]}
                      tooltip={isFirstRecord 
                        ? "Enter the amount your branch initially owed to Head Office" 
                        : "Update the previous amount owing if needed"
                      }
                    >
                      <Input
                        type="number"
                        prefix="₦"
                        placeholder="0.00"
                        size="large"
                        style={{ fontSize: '16px' }}
                      />
                    </Form.Item>

                    {/* Today's Remittance */}
                    <Form.Item
                      label="Today's Remittance"
                      name="todayRemittance"
                      rules={[
                        { required: true, message: 'Please enter today\'s remittance' },
                      ]}
                      tooltip="Amount collected by the branch today"
                    >
                      <Input
                        type="number"
                        prefix="₦"
                        placeholder="0.00"
                        size="large"
                        style={{ fontSize: '16px' }}
                      />
                    </Form.Item>

                    {/* Amount Remitting Now */}
                    <Form.Item
                      label="Amount Remitting Now"
                      name="amtRemittingNow"
                      rules={[
                        { required: true, message: 'Please enter amount remitting now' },
                      ]}
                      tooltip="Amount the branch is sending to Head Office now"
                    >
                      <Input
                        type="number"
                        prefix="₦"
                        placeholder="0.00"
                        size="large"
                        style={{ fontSize: '16px' }}
                      />
                    </Form.Item>

                    {/* Action Buttons */}
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isProcessing}
                        disabled={isSubmitted}
                        icon={<DollarOutlined />}
                      >
                        {isFirstRecord ? 'Create Record' : 'Update Record'}
                      </Button>
                      
                      {currentRecord?.efcc && !isSubmitted && (
                        <Button
                          type="default"
                          onClick={handleFinalSubmit}
                          loading={submitMutation.isPending}
                          icon={<CheckCircleOutlined />}
                          style={{ backgroundColor: '#52c41a', color: 'white', borderColor: '#52c41a' }}
                        >
                          Submit Final Record
                        </Button>
                      )}
                    </Space>
                  </Form>
                </Card>
              </Col>

              {/* Calculation Summary */}
              <Col xs={24} lg={10}>
                <Card title="DSA Sumary Calculation" size="default">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Previous Amount */}
                    <Statistic
                      title="Previous Amount Owing"
                      value={Number(formData.previousAmountOwing) || (currentRecord?.efcc?.previousAmountOwing ? Number(currentRecord.efcc.previousAmountOwing) : 0)}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: '#722ed1' }}
                    />

                    <Divider style={{ margin: '12px 0' }}>+</Divider>

                    {/* Today's Remittance */}
                    <Statistic
                      title="Today's Remittance"
                      value={Number(formData.todayRemittance) || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: '#52c41a' }}
                    />

                    <Divider style={{ margin: '12px 0' }}>-</Divider>

                    {/* Amount Remitting */}
                    <Statistic
                      title="Amount Remitting Now"
                      value={Number(formData.amtRemittingNow) || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: '#f5222d' }}
                    />

                    <Divider style={{ margin: '12px 0' }}>=</Divider>

                    {/* Current Amount Owing */}
                    <Card style={{ backgroundColor: '#f0f2ff', border: '1px solid #1890ff' }}>
                      <Statistic
                        title="Current Amount Owing to HO"
                        value={currentAmountOwing}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ 
                          color: currentAmountOwing >= 0 ? '#1890ff' : '#f5222d',
                          fontSize: '24px',
                          fontWeight: 'bold'
                        }}
                        suffix={
                          <CalculatorOutlined style={{ fontSize: '16px', marginLeft: '8px' }} />
                        }
                      />
                    </Card>

                    {/* Formula Explanation */}
                    <Card size="small" style={{ backgroundColor: '#f9f9f9' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <strong>Formula:</strong><br />
                        Current Owing = (Previous Owing + Today's Remittance) - Amount Remitting Now
                      </Text>
                    </Card>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Historical Data Note */}
            {currentRecord?.efcc && (
              <Card size="small">
                <Row gutter={[16, 8]}>
                  <Col span={24}>
                    <Text strong>Record Information:</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">Created:</Text><br />
                    <Text>{dayjs(currentRecord.efcc.createdAt).format('DD MMMM YYYY, HH:mm A')}</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">Last Updated:</Text><br />
                    <Text>{dayjs(currentRecord.efcc.updatedAt).format('DD MMMM YYYY, HH:mm A')}</Text>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text type="secondary">Status:</Text><br />
                    <Text style={{ color: isSubmitted ? '#52c41a' : '#fa8c16' }}>
                      {isSubmitted ? 'Submitted' : 'Draft'}
                    </Text>
                  </Col>
                </Row>
              </Card>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default BranchEFCCPage;