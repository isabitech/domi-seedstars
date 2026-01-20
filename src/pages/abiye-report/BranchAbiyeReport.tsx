
import React, { useState, useRef, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  Space,
  Row,
  Col,
  DatePicker,
  Select,
  Alert,
  Spin,
  Divider,
  Tag,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  CalendarOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useSubmitAbiyeReport } from '../../hooks/Branch/AbiyeReport/useSubmitAbiyeReport';
import { CURRENT_DATE } from '../../lib/utils';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AbiyeReportFormData {
  disbursementNo: number;
  disbursementAmount: number;
  amountToClients: number;
  ajoWithdrawalAmount: number;
  totalClients: number;
  ldSolvedToday: number;
  clientsThatPaidToday: number;
  ldResolutionMethods: string[];
  reportDate: dayjs.Dayjs | string;
}

const BranchAbiyeReport: React.FC = () => {
  const [form] = Form.useForm<AbiyeReportFormData>();
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE);
  const [resolutionMethods, setResolutionMethods] = useState<string[]>([]);
  const isSubmittingRef = useRef(false);

  const submitMutation = useSubmitAbiyeReport();

  // Predefined resolution methods options
  const resolutionOptions = [
    'closed',
    'properties',
    'promise undertaking',
    'police'
  ];

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM-DD');
      setSelectedDate(formattedDate);
      form.setFieldValue('reportDate', date);
    }
  };

  const handleResolutionMethodsChange = (values: string[]) => {
    setResolutionMethods(values);
    form.setFieldValue('ldResolutionMethods', values);
  };

  const handleSubmit = useCallback(async (values: AbiyeReportFormData) => {
    // Guarantee single call - immediate synchronous check
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const reportData = {
        ...values,
        reportDate: dayjs.isDayjs(values.reportDate) 
          ? values.reportDate.format('YYYY-MM-DD')
          : selectedDate,
        ldResolutionMethods: resolutionMethods,
      };

      await submitMutation.mutateAsync(reportData);
      toast.success('Abiye Report submitted successfully!');
      form.resetFields();
      setResolutionMethods([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit Abiye Report');
    } finally {
      isSubmittingRef.current = false;
    }
  }, [selectedDate, resolutionMethods, submitMutation, form]);

  // Calculate totals
  const watchedValues = Form.useWatch([], form);
  const disbursementAmount = watchedValues?.disbursementAmount || 0;
  const amountToClients = watchedValues?.amountToClients || 0;
  const ajoWithdrawalAmount = watchedValues?.ajoWithdrawalAmount || 0;
  const totalDisbursed = amountToClients + ajoWithdrawalAmount;
  
  // Calculate client metrics
  const totalClients = watchedValues?.totalClients || 0;
  const clientsThatPaidToday = watchedValues?.clientsThatPaidToday || 0;
  const ldSolvedToday = watchedValues?.ldSolvedToday || 0;
  const totalCurrentLdNo = totalClients - clientsThatPaidToday - ldSolvedToday;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Branch Abiye Report
            </Title>
          </Space>
        }
        extra={
          <Tag color="blue" icon={<CalendarOutlined />}>
            {dayjs(selectedDate).format('MMM DD, YYYY')}
          </Tag>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            reportDate: dayjs(selectedDate),
            disbursementNo: 0,
            disbursementAmount: 0,
            amountToClients: 0,
            ajoWithdrawalAmount: 0,
            totalClients: 0,
            ldSolvedToday: 0,
            clientsThatPaidToday: 0,
            ldResolutionMethods: [],
          }}
        >
          {/* Date Selection */}
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Report Date"
                name="reportDate"
                rules={[{ required: true, message: 'Please select report date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={handleDateChange}
                  value={dayjs(selectedDate)}
                  disabledDate={(current) => 
                    current && current > dayjs().endOf('day')
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">
            <Space>
              <DollarOutlined />
              <Text strong> Tomorrow Disbursement Information</Text>
            </Space>
          </Divider>

          {/* Disbursement Section */}
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tomorrow Disbursement Number"
                name="disbursementNo"
                rules={[
                  { required: true, message: 'Please enter tomorrow disbursement number' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter tomorrow disbursement number"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const num = value!.replace(/\$\s?|(,*)/g, '');
                    return Number(num) as any;
                  }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                label="Tomorrow Disbursement Amount (₦)"
                name="disbursementAmount"
                rules={[
                  { required: true, message: 'Please enter tomorrow disbursement amount' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter total tomorrow disbursement amount"
                  min={0}
                  formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const num = value!.replace(/₦\s?|(,*)/g, '');
                    return Number(num) as any;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Amount to Clients (₦) Tomorrow"
                name="amountToClients"
                rules={[
                  { required: true, message: 'Please enter amount to clients tomorrow' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter amount disbursed to clients"
                  min={0}
                  formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const num = value!.replace(/₦\s?|(,*)/g, '');
                    return Number(num) as any;
                  }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                label="AJO Withdrawal Amount (₦) Tomorrow"
                name="ajoWithdrawalAmount"
                rules={[
                  { required: true, message: 'Please enter AJO withdrawal amount' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter AJO withdrawal amount"
                  min={0}
                  formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const num = value!.replace(/₦\s?|(,*)/g, '');
                    return Number(num) as any;
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Alert
                message={`Total to be  Disbursed Tomorrow: ₦${totalDisbursed.toLocaleString()}`}
                type="info"
                showIcon
              />
            </Col>
          </Row>

          <Divider orientation="left">
            <Space>
              <UserOutlined />
              <Text strong>Client Information</Text>
            </Space>
          </Divider>

          {/* Client Section */}
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Total Clients"
                name="totalClients"
                rules={[
                  { required: true, message: 'Please enter total number of clients' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter total number of clients"
                  min={0}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                label="Clients That Paid Today"
                name="clientsThatPaidToday"
                rules={[
                  { required: true, message: 'Please enter number of clients that paid' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter number of clients that paid"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Client Metrics Summary */}
          {(totalClients > 0 || clientsThatPaidToday > 0 || ldSolvedToday > 0) && (
            <Row gutter={24} style={{ marginTop: '16px' }}>
              <Col xs={24} sm={8}>
                <Alert
                  message={`Payment Rate: ${totalClients > 0 ? ((clientsThatPaidToday / totalClients) * 100).toFixed(1) : 0}%`}
                  type="info"
                  showIcon
                />
              </Col>
              <Col xs={24} sm={8}>
                <Alert
                  message={`Total Current LD No: ${Math.max(0, totalCurrentLdNo)}`}
                  type={totalCurrentLdNo > 0 ? "warning" : "success"}
                  showIcon
                />
              </Col>
              <Col xs={24} sm={8}>
                <Alert
                  message={`LD Resolution: ${ldSolvedToday} cases`}
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
          )}

          <Divider orientation="left">
            <Space>
              <CheckCircleOutlined />
              <Text strong>Loan Default (LD) Resolution</Text>
            </Space>
          </Divider>

          {/* LD Resolution Section */}
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="LD Cases Solved Today"
                name="ldSolvedToday"
                rules={[
                  { required: true, message: 'Please enter number of LD cases solved' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter LD cases solved today"
                  min={0}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={16}>
              <Form.Item
                label="LD Resolution Methods Used"
                name="ldResolutionMethods"
                rules={[
                  { required: true, message: 'Please select at least one resolution method' }
                ]}
              >
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Select resolution methods used"
                  value={resolutionMethods}
                  onChange={handleResolutionMethodsChange}
                  optionLabelProp="label"
                  maxTagCount="responsive"
                >
                  {resolutionOptions.map(method => (
                    <Option key={method} value={method} label={method}>
                      {method}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Selected Resolution Methods Display */}
          {resolutionMethods.length > 0 && (
            <Row>
              <Col xs={24}>
                <Text strong>Selected Resolution Methods:</Text>
                <div style={{ marginTop: '8px' }}>
                  {resolutionMethods.map(method => (
                    <Tag key={method} color="processing" style={{ margin: '2px' }}>
                      {method}
                    </Tag>
                  ))}
                </div>
              </Col>
            </Row>
          )}

          <Divider />

          {/* Submit Section */}
          <Row justify="end">
            <Col>
              <Space>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setResolutionMethods([]);
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitMutation.isPending}
                  disabled={submitMutation.isPending}
                  icon={<FileTextOutlined />}
                  size="large"
                >
                  Submit Abiye Report
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {submitMutation.isPending && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px' }}>
              <Text>Submitting Abiye Report...</Text>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BranchAbiyeReport;