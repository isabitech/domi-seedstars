
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
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useSubmitAbiyeReport } from '../../hooks/Branch/AbiyeReport/useSubmitAbiyeReport';
import { useGetBranchAbiyeReport } from '../../hooks/Branch/AbiyeReport/useGetAbiyeReport';
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
  totalNoOfNewClientTomorrow: number;
  totalNoOfOldClientTomorrow: number;
  totalPreviousSoOwn: number;
  totalAmountNeeded: number;
  currentLDNo: number;
}

const BranchAbiyeReport: React.FC = () => {
  const [form] = Form.useForm<AbiyeReportFormData>();
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE);
  const [resolutionMethods, setResolutionMethods] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isSubmittingRef = useRef(false);

  const submitMutation = useSubmitAbiyeReport();
  const { data: abiyeReports, refetch: refetchAbiyeReports, isLoading: isLoadingReports } = useGetBranchAbiyeReport();

  // Predefined resolution methods options
  const resolutionOptions = [
    'payment',
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Replace with actual API call to fetch Abiye report for current date
      // Example: const response = await fetchAbiyeReport(selectedDate);
      // form.setFieldsValue(response.data);
      await refetchAbiyeReports();
      
      toast.success('Data refreshed successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate totals and client metrics
  const watchedValues = Form.useWatch([], form);
  const disbursementAmount = watchedValues?.disbursementAmount || 0;
  const amountToClients = watchedValues?.amountToClients || 0;
  const ajoWithdrawalAmount = watchedValues?.ajoWithdrawalAmount || 0;
  const totalDisbursed = amountToClients + ajoWithdrawalAmount;
  
  // Calculate client metrics
  const totalClients = watchedValues?.totalClients || 0;
  const clientsThatPaidToday = watchedValues?.clientsThatPaidToday || 0;
  const ldSolvedToday = watchedValues?.ldSolvedToday || 0;
  const totalCurrentLdNo = totalClients - clientsThatPaidToday;

  // Form validation for submit button
  const isFormValid = watchedValues?.reportDate &&
    watchedValues?.disbursementNo !== undefined && watchedValues?.disbursementNo !== null &&
    watchedValues?.disbursementAmount !== undefined && watchedValues?.disbursementAmount !== null &&
    watchedValues?.amountToClients !== undefined && watchedValues?.amountToClients !== null &&
    watchedValues?.ajoWithdrawalAmount !== undefined && watchedValues?.ajoWithdrawalAmount !== null &&
    watchedValues?.totalClients !== undefined && watchedValues?.totalClients !== null &&
    watchedValues?.ldSolvedToday !== undefined && watchedValues?.ldSolvedToday !== null &&
    watchedValues?.clientsThatPaidToday !== undefined && watchedValues?.clientsThatPaidToday !== null &&
    watchedValues?.totalNoOfNewClientTomorrow !== undefined && watchedValues?.totalNoOfNewClientTomorrow !== null &&
    watchedValues?.totalNoOfOldClientTomorrow !== undefined && watchedValues?.totalNoOfOldClientTomorrow !== null &&
    watchedValues?.totalPreviousSoOwn !== undefined && watchedValues?.totalPreviousSoOwn !== null &&
    resolutionMethods.length > 0;

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
        currentLDNo: Math.max(0, totalCurrentLdNo), // Auto-calculated value
        totalAmountNeeded: 0, // Set default value since field is removed
      };

      await submitMutation.mutateAsync(reportData);
      toast.success('Abiye Report submitted successfully!');
      
      // Refetch the reports to show the submitted data
      await refetchAbiyeReports();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit Abiye Report');
    } finally {
      isSubmittingRef.current = false;
    }
  }, [selectedDate, resolutionMethods, submitMutation, form, totalCurrentLdNo]);

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
          <Space>
            <Tag color="blue" icon={<CalendarOutlined />}>
              {dayjs(selectedDate).format('MMM DD, YYYY')}
            </Tag>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              loading={isRefreshing}
              onClick={handleRefresh}
              title="Refresh data for current date"
            >
              Refresh
            </Button>
          </Space>
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
            totalNoOfNewClientTomorrow: 0,
            totalNoOfOldClientTomorrow: 0,
            totalPreviousSoOwn: 0,
            totalAmountNeeded: 0,
            currentLDNo: 0,
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
                message={`Total to be needed Tomorrow: ₦${totalDisbursed.toLocaleString()}`}
                type="info"
                showIcon
              />
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Total No of New Clients Tomorrow"
                name="totalNoOfNewClientTomorrow"
                rules={[
                  { required: true, message: 'Please enter total number of new clients tomorrow' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter total new clients tomorrow"
                  min={0}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={8}>
              <Form.Item
                label="Total No of Old Clients Tomorrow"
                name="totalNoOfOldClientTomorrow"
                rules={[
                  { required: true, message: 'Please enter total number of old clients tomorrow' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter total old clients tomorrow"
                  min={0}
                />
              </Form.Item>
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
                label="Total Clients in Branch"
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

          {/* Tomorrow Client Information */}
          <Row gutter={24} style={{ marginTop: '16px' }}>
            
            <Col xs={24} sm={8}>
              <Form.Item
                label="Total Previous S.O Own"
                name="totalPreviousSoOwn"
                rules={[
                  { required: true, message: 'Please enter total previous S.O own' },
                  { type: 'number', min: 0, message: 'Must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter total previous S.O own"
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

          {/* Additional Fields */}
          <Row gutter={24} style={{ marginTop: '16px' }}>
            <Col xs={24} sm={12}>
              <Form.Item label="Current LD No (Auto-calculated)">
                <Alert
                  message={`Current LD No: ${Math.max(0, totalCurrentLdNo)}`}
                  type={totalCurrentLdNo > 0 ? "warning" : "success"}
                  showIcon
                  style={{ 
                    backgroundColor: totalCurrentLdNo > 0 ? '#fff2f0' : '#f6ffed',
                    border: `1px solid ${totalCurrentLdNo > 0 ? '#ffccc7' : '#b7eb8f'}`,
                  }}
                />
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Formula: Total Clients - Clients Paid Today
                </Text>
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
                  disabled={submitMutation.isPending || !isFormValid}
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

      {/* Display Submitted Reports */}
      {abiyeReports && abiyeReports.length > 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <Title level={4} style={{ margin: 0 }}>
                Recent Abiye Reports
              </Title>
            </Space>
          }
          style={{ marginTop: '24px' }}
          loading={isLoadingReports}
        >
          {abiyeReports.slice(0, 3).map((report: any, index: number) => (
            <Card
              key={report.id || index}
              type="inner"
              title={`Report - ${dayjs(report.reportDate).format('MMM DD, YYYY')}`}
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Disbursement Info:</Text>
                    <Text>Number: {report.disbursementNo?.toLocaleString() || 'N/A'}</Text>
                    <Text>Amount: ₦{report.disbursementAmount?.toLocaleString() || '0'}</Text>
                    <Text>To Clients: ₦{report.amountToClients?.toLocaleString() || '0'}</Text>
                    <Text>AJO Withdrawal: ₦{report.ajoWithdrawalAmount?.toLocaleString() || '0'}</Text>
                  </Space>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Client Info:</Text>
                    <Text>Total Clients: {report.totalClients || 0}</Text>
                    <Text>Paid Today: {report.clientsThatPaidToday || 0}</Text>
                    <Text>Current LD No: {report.currentLDNo || 0}</Text>
                    <Text>LD Solved: {report.ldSolvedToday || 0}</Text>
                  </Space>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space direction="vertical" size="small">
                    <Text strong>Tomorrow's Plan:</Text>
                    <Text>New Clients: {report.totalNoOfNewClientTomorrow || 0}</Text>
                    <Text>Old Clients: {report.totalNoOfOldClientTomorrow || 0}</Text>
                    <Text>Previous S.O Own: ₦{report.totalPreviousSoOwn?.toLocaleString() || '0'}</Text>
                  </Space>
                </Col>
              </Row>
              {report.ldResolutionMethods && report.ldResolutionMethods.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <Text strong>Resolution Methods: </Text>
                  {report.ldResolutionMethods.map((method: string, idx: number) => (
                    <Tag key={idx} color="processing" style={{ margin: '2px' }}>
                      {method}
                    </Tag>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </Card>
      )}
    </div>
  );
};

export default BranchAbiyeReport;