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
  // message,
  // Spin,
  Tag,
  Tooltip,
  Alert 
} from 'antd';
import { SaveOutlined, CalculatorOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { calculations } from '../utils/calculations';
import { useCreateEntry } from '../hooks/Branch/Cashbook/useCreateEntry';
import { useUpdateEntry } from '../hooks/Branch/Cashbook/useUpdateEntry';
import type { User } from '../hooks/Auth/useGetMe';
import type { Cashbook2 } from '../hooks/Branch/Cashbook/get-daily-ops-types';

const { Title, Text } = Typography;

interface Cashbook2FormProps {
  onSubmit?: (data: Cashbook2) => void;
  initialData?: Partial<Cashbook2>;
  readonly?: boolean;
  date?: string;
  cashbook1CBTotal?: number; // For calculating Online CIH
  user: User;
  existingEntry?: Cashbook2;
}

export const Cashbook2Component: React.FC<Cashbook2FormProps> = ({
  onSubmit,
  initialData,
  readonly = false,
  date,
  cashbook1CBTotal = 0,
  user,
  existingEntry
}) => {
  const [form] = Form.useForm();
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [calculatedValues, setCalculatedValues] = useState({
    cbTotal2: 0,
    onlineCIH: 0
  });
  
  const currentDate = date || new Date().toISOString().split('T')[0];
  
  // Mutation hooks
  const createEntryMutation = useCreateEntry();
  const updateEntryMutation = useUpdateEntry();

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
      const cbTotal2 = calculations.calculateCashbook2CBTotal(numericValues);
      
      // Calculate Online CIH (CB TOTAL 1 - CB TOTAL 2)
      const onlineCIH = calculations.calculateOnlineCIH(cashbook1CBTotal, cbTotal2);
      
      setCalculatedValues({ cbTotal2, onlineCIH });
    } catch {
      console.error('Error calculating Cashbook 2 values');
    }
  }, [form, cashbook1CBTotal]);

  // Load existing data when available
  useEffect(() => {
    if (existingEntry) {
      form.setFieldsValue({
        disNo: existingEntry.disNo,
        disAmt: existingEntry.disAmt,
        disWithInt: existingEntry.disWithInt,
        savWith: existingEntry.savWith,
        domiBank: existingEntry.domiBank,
        posT: existingEntry.posT
      });
      setExistingEntryId(existingEntry._id);
      handleValuesChange();
    }
  }, [existingEntry, form, handleValuesChange]);

  // Calculate CB TOTAL 2 and Online CIH when form values change
  useEffect(() => {
    if (initialData) {
      const cbTotal2 = calculations.calculateCashbook2CBTotal(initialData);
      const onlineCIH = calculations.calculateOnlineCIH(cashbook1CBTotal, cbTotal2);
      setCalculatedValues({ cbTotal2, onlineCIH });
    }
  }, [initialData, cashbook1CBTotal]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const cashbook2Data: Cashbook2 = {
      disNo: Number(values.disNo) || 0,
      disAmt: Number(values.disAmt) || 0,
      disWithInt: Number(values.disWithInt) || 0,
      savWith: Number(values.savWith) || 0,
      domiBank: Number(values.domiBank) || 0,
      posT: Number(values.posT) || 0,
      _id: existingEntryId || '',
      date: currentDate,
      branch: user?.branchId || '',
      cbTotal2: calculatedValues.cbTotal2,
      user: user?.branchId || '',
      
    };
    onSubmit?.(cashbook2Data);
  };

  const hasExistingData = !!existingEntry;
  const loading = createEntryMutation.isPending || updateEntryMutation.isPending;

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
            {/* <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={dataLoading}
              size="large"
            >
              Refresh
            </Button> */}
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
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
              {/* {dataLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Loading existing data...</p>
                </div>
              ) : ( */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                initialValues={initialData}
                disabled={readonly}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
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
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Number of clients"
                        size="large"
                        min="0"
                        step="1"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
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
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
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
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
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
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left" orientationMargin={0} style={{ textAlign: 'center' }}>Cash & Transfer Information</Divider>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
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
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
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
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
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
              {/* )} */}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
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
                  value={calculatedValues.cbTotal2}
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
                      value={calculatedValues.onlineCIH}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ 
                        color: calculatedValues.onlineCIH >= 0 ? '#52c41a' : '#ff4d4f', 
                        fontSize: '20px', 
                        fontWeight: 'bold' 
                      }}
                    />
                    
                    <Alert
                      message="Online Cash in Hand Status"
                      description={
                        calculatedValues.onlineCIH >= 0 
                          ? `Positive balance of ${calculations.formatCurrency(calculatedValues.onlineCIH)}`
                          : `Deficit of ${calculations.formatCurrency(Math.abs(calculatedValues.onlineCIH))}`
                      }
                      type={calculatedValues.onlineCIH >= 0 ? 'success' : 'warning'}
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
                    {calculations.formatCurrency(calculatedValues.cbTotal2)}
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