import React, { useState, useEffect, useCallback } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Typography,
  Divider,
  message,
  Spin,
  Tag,
  Tooltip,
  Alert 
} from 'antd';
import { SaveOutlined, CalculatorOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import { cashbookService } from '../services/cashbook';
import type { Cashbook2 } from '../types';

const { Title, Text } = Typography;

interface Cashbook2FormProps {
  onSubmit?: (data: Cashbook2) => void;
  initialData?: Partial<Cashbook2>;
  readonly?: boolean;
  date?: string;
  cashbook1CBTotal?: number; // For calculating Online CIH
}

export const Cashbook2Component: React.FC<Cashbook2FormProps> = ({
  onSubmit,
  initialData,
  readonly = false,
  date,
  cashbook1CBTotal = 0
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [cbTotal2, setCbTotal2] = useState(0);
  const [onlineCIH, setOnlineCIH] = useState(0);
  const { user } = useAuthStore();
  const currentDate = date || new Date().toISOString().split('T')[0];

  const handleValuesChange = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      // Convert string values to numbers for CB TOTAL 2 calculation
      const numericValues = {
        disAmt: Number(values.disAmt) || 0,
        savWith: Number(values.savWith) || 0,
        domiBank: Number(values.domiBank) || 0,
        posT: Number(values.posT) || 0
      };
      
      // CB TOTAL 2 = DIS AMT + SAV WITH + DOMI BANK + POS/T
      const total = calculations.calculateCashbook2CBTotal(numericValues);
      setCbTotal2(total);
      
      // Calculate Online CIH (CB TOTAL 1 - CB TOTAL 2)
      const cih = calculations.calculateOnlineCIH(cashbook1CBTotal, total);
      setOnlineCIH(cih);
    } catch {
      console.error('Error calculating Cashbook 2 values');
    }
  }, [form, cashbook1CBTotal]);

  // Load existing data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (user?.branchId && currentDate) {
        setDataLoading(true);
        try {
          const response = await cashbookService.getCashbook2(user.branchId, currentDate);
          if (response.success && response.data) {
            const existingData = response.data;
            form.setFieldsValue({
              disNo: existingData.disNo,
              disAmt: existingData.disAmt,
              disWithInt: existingData.disWithInt,
              savWith: existingData.savWith,
              domiBank: existingData.domiBank,
              posT: existingData.posT
            });
            setHasExistingData(true);
            handleValuesChange();
          }
        } catch {
          console.error('Error loading existing Cashbook 2 data');
        } finally {
          setDataLoading(false);
        }
      }
    };

    loadExistingData();
  }, [user?.branchId, currentDate, form, handleValuesChange]);

  // Calculate CB TOTAL 2 and Online CIH when form values change
  useEffect(() => {
    if (initialData) {
      const total = calculations.calculateCashbook2CBTotal(initialData);
      setCbTotal2(total);
      const cih = calculations.calculateOnlineCIH(cashbook1CBTotal, total);
      setOnlineCIH(cih);
    }
  }, [initialData, cashbook1CBTotal]);

  const handleSubmit = async (values: Record<string, number>) => {
    if (!user?.branchId) {
      message.error('User branch information is missing');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...values,
        cbTotal2,
        date: currentDate,
        branchId: user.branchId,
        submittedBy: user.id,
        submittedAt: new Date().toISOString()
      };
      
      const response = await cashbookService.submitCashbook2(submitData);
      
      if (response.success && response.data) {
        message.success(response.message || 'Cashbook 2 data submitted successfully!');
        setHasExistingData(true);
        
        if (onSubmit) {
          onSubmit(response.data);
        }
      } else {
        message.error(response.error || 'Failed to submit Cashbook 2 data');
      }
    } catch {
      message.error('An unexpected error occurred while submitting data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.branchId) return;
    
    setDataLoading(true);
    try {
      const response = await cashbookService.getCashbook2(user.branchId, currentDate);
      if (response.success && response.data) {
        const existingData = response.data;
        form.setFieldsValue({
          disNo: existingData.disNo,
          disAmt: existingData.disAmt,
          disWithInt: existingData.disWithInt,
          savWith: existingData.savWith,
          domiBank: existingData.domiBank,
          posT: existingData.posT
        });
        setHasExistingData(true);
        handleValuesChange();
        message.success('Cashbook 2 data refreshed successfully');
      } else {
        message.info('No existing Cashbook 2 data found for today');
        setHasExistingData(false);
      }
    } catch {
      message.error('Failed to refresh Cashbook 2 data');
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3}>
                Cashbook 2 - Daily Disbursements & Operations
                {hasExistingData && (
                  <Tag color="green" style={{ marginLeft: 8 }}>Data Exists</Tag>
                )}
              </Title>
              <Text type="secondary">
                Record daily disbursements, withdrawals and cash operations for {new Date(currentDate).toLocaleDateString()}
              </Text>
            </div>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={dataLoading}
              size="large"
            >
              Refresh
            </Button>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card 
              title={
                <Space>
                  Daily Operations Form
                  {user?.role === 'BR' && (
                    <Tag color="blue">Branch User</Tag>
                  )}
                  {user?.role === 'HO' && (
                    <Tag color="purple">Head Office</Tag>
                  )}
                </Space>
              } 
              className="form-section"
              extra={
                hasExistingData ? (
                  <Tag color="success">Updated: Today</Tag>
                ) : null
              }
            >
              {dataLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Loading existing data...</p>
                </div>
              ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                initialValues={initialData}
                disabled={readonly}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Disbursement Number (DIS NO)
                          <Tooltip title="Number of clients receiving disbursements today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="disNo"
                      rules={[
                        { required: true, message: 'Disbursement number is required' },
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Number of clients"
                        size="large"
                        min="0"
                        step="1"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Disbursement Amount (DIS AMT)
                          <Tooltip title="Total amount disbursed to clients today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="disAmt"
                      rules={[
                        { required: true, message: 'Disbursement amount is required' },
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Disbursement with Interest (DIS WIT INT)
                          <Tooltip title="Disbursement amount including interest charges">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="disWithInt"
                      rules={[
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Savings Withdrawal (SAV WITH)
                          <Tooltip title="Amount withdrawn from savings today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="savWith"
                      rules={[
                        { required: true, message: 'Savings withdrawal amount is required' },
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Cash & Transfer Information</Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          DOMI BANK (Available Cash)
                          <Tooltip title="Total cash available at the branch">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="domiBank"
                      rules={[
                        { required: true, message: 'DOMI BANK amount is required' },
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          POS/Transfer (POS/T)
                          <Tooltip title="Electronic transfers and POS transactions">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="posT"
                      rules={[
                        { required: true, message: 'POS/Transfer amount is required' },
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {!readonly && (
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{ minWidth: '200px' }}
                    >
                      {hasExistingData ? 'Update Cashbook 2' : 'Submit Cashbook 2'}
                    </Button>
                  </Form.Item>
                )}
              </Form>
              )}
            </Card>
          </Col>

          <Col span={8}>
            <Card 
              title={<span><CalculatorOutlined /> Live Calculations</span>}
              className="stats-card"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
              headStyle={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Statistic
                  title={
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                      CB TOTAL 2
                      <br />
                      <small>(DIS AMT + SAV WITH + DOMI BANK + POS/T)</small>
                    </span>
                  }
                  value={cbTotal2}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
                />
                
                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
                
                {cashbook1CBTotal > 0 && (
                  <>
                    <Statistic
                      title={
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                          Online Cash in Hand
                          <br />
                          <small>(CB TOTAL 1 - CB TOTAL 2)</small>
                        </span>
                      }
                      value={onlineCIH}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ 
                        color: onlineCIH >= 0 ? '#52c41a' : '#ff4d4f', 
                        fontSize: '20px', 
                        fontWeight: 'bold' 
                      }}
                    />
                    
                    <Alert
                      message="Online Cash in Hand Status"
                      description={
                        onlineCIH >= 0 
                          ? `Positive balance of ${calculations.formatCurrency(onlineCIH)}`
                          : `Deficit of ${calculations.formatCurrency(Math.abs(onlineCIH))}`
                      }
                      type={onlineCIH >= 0 ? 'success' : 'warning'}
                      showIcon
                      style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                  </>
                )}
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '16px'
                }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    Cashbook 2 Total
                  </Text>
                  <br />
                  <Text style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
                    {calculations.formatCurrency(cbTotal2)}
                  </Text>
                </div>
              </Space>
            </Card>

            <Card 
              title="Formula Reference" 
              size="small" 
              style={{ marginTop: 16 }}
            >
              <Space direction="vertical" size="small">
                <Text code>CB TOTAL 2 = DIS AMT + SAV WITH + DOMI BANK + POS/T</Text>
                {cashbook1CBTotal > 0 && (
                  <Text code>Online CIH = CB TOTAL 1 - CB TOTAL 2</Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};