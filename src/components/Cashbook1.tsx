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
  Alert,
  Typography,
  Divider,
  message,
  Spin,
  Tag,
  Tooltip 
} from 'antd';
import { SaveOutlined, CalculatorOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import { cashbookService } from '../services/cashbook';
import type { Cashbook1 } from '../types';

const { Title, Text } = Typography;

interface Cashbook1FormProps {
  onSubmit?: (data: Cashbook1) => void;
  initialData?: Partial<Cashbook1>;
  readonly?: boolean;
  date?: string;
}

export const Cashbook1Component: React.FC<Cashbook1FormProps> = ({
  onSubmit,
  initialData,
  readonly = false,
  date
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    total: 0,
    cbTotal1: 0
  });
  const { user } = useAuthStore();
  const currentDate = date || new Date().toISOString().split('T')[0];

  const handleValuesChange = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      // Convert string values to numbers
      const numericValues = {
        pcih: Number(values.pcih) || 0,
        savings: Number(values.savings) || 0,
        loanCollection: Number(values.loanCollection) || 0,
        charges: Number(values.charges) || 0,
        frmHO: Number(values.frmHO) || 0,
        frmBR: Number(values.frmBR) || 0
      };
      
      const total = calculations.calculateCashbook1Total(numericValues);
      const cbTotal1 = calculations.calculateCashbook1CBTotal(numericValues);
      
      setCalculatedValues({ total, cbTotal1 });
    } catch {
      console.error('Error calculating values');
    }
  }, [form]);

  // Load existing data on component mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (user?.branchId && currentDate) {
        setDataLoading(true);
        try {
          const response = await cashbookService.getCashbook1(user.branchId, currentDate);
          if (response.success && response.data) {
            const existingData = response.data;
            form.setFieldsValue({
              pcih: existingData.pcih,
              savings: existingData.savings,
              loanCollection: existingData.loanCollection,
              charges: existingData.charges,
              frmHO: existingData.frmHO,
              frmBR: existingData.frmBR
            });
            setHasExistingData(true);
            // Trigger calculation update
            handleValuesChange();
          }
        } catch {
          console.error('Error loading existing data');
        } finally {
          setDataLoading(false);
        }
      }
    };

    loadExistingData();
  }, [user?.branchId, currentDate, form, handleValuesChange]);

  // Calculate values when form values change
  useEffect(() => {
    if (initialData) {
      const total = calculations.calculateCashbook1Total(initialData);
      const cbTotal1 = calculations.calculateCashbook1CBTotal(initialData);
      setCalculatedValues({ total, cbTotal1 });
    }
  }, [initialData]);

  const handleSubmit = async (values: Record<string, number>) => {
    if (!user?.branchId) {
      message.error('User branch information is missing');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...values,
        total: calculatedValues.total,
        cbTotal1: calculatedValues.cbTotal1,
        date: currentDate,
        branchId: user.branchId,
        submittedBy: user.id,
        submittedAt: new Date().toISOString()
      };
      
      const response = await cashbookService.submitCashbook1(submitData);
      
      if (response.success && response.data) {
        message.success(response.message || 'Cashbook 1 data submitted successfully!');
        setHasExistingData(true);
        
        // Call parent onSubmit if provided
        if (onSubmit) {
          onSubmit(response.data);
        }
      } else {
        message.error(response.error || 'Failed to submit data');
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
      const response = await cashbookService.getCashbook1(user.branchId, currentDate);
      if (response.success && response.data) {
        const existingData = response.data;
        form.setFieldsValue({
          pcih: existingData.pcih,
          savings: existingData.savings,
          loanCollection: existingData.loanCollection,
          charges: existingData.charges,
          frmHO: existingData.frmHO,
          frmBR: existingData.frmBR
        });
        setHasExistingData(true);
        handleValuesChange();
        message.success('Data refreshed successfully');
      } else {
        message.info('No existing data found for today');
        setHasExistingData(false);
      }
    } catch {
      message.error('Failed to refresh data');
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
                Cashbook 1 - Daily Input
                {hasExistingData && (
                  <Tag color="green" style={{ marginLeft: 8 }}>Data Exists</Tag>
                )}
              </Title>
              <Text type="secondary">
                Enter daily operations data for {new Date(currentDate).toLocaleDateString()}
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
                  Daily Input Form
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
                  <Tag color="success">Updated: {hasExistingData ? 'Today' : 'Never'}</Tag>
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
                          Previous Cash in Hand (PCIH)
                          <Tooltip title={user?.role === 'BR' 
                            ? "This value is automatically set from yesterday's Online CIH and cannot be edited" 
                            : "The amount of cash carried over from the previous day"
                          }>
                            <InfoCircleOutlined style={{ 
                              color: user?.role === 'BR' ? '#fa8c16' : '#1890ff' 
                            }} />
                          </Tooltip>
                          {user?.role === 'BR' && (
                            <Tag color="orange">Auto-filled</Tag>
                          )}
                        </Space>
                      }
                      name="pcih"
                      rules={[
                        { required: true, message: 'PCIH is required' },
                        { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder={user?.role === 'BR' ? 'Auto-filled from yesterday\'s Online CIH' : '0.00'}
                        prefix="₦"
                        size="large"
                        step="0.01"
                        disabled={user?.role === 'BR'} // Disable for branches
                        style={{ 
                          backgroundColor: user?.role === 'BR' ? '#fff2e8' : 'white',
                          borderColor: user?.role === 'BR' ? '#ffb366' : '#d9d9d9'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Savings
                          <Tooltip title="Total savings collected today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="savings"
                      rules={[
                        { required: true, message: 'Savings amount is required' },
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
                          Loan Collection
                          <Tooltip title="Total loan repayments collected today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="loanCollection"
                      rules={[
                        { required: true, message: 'Loan collection amount is required' },
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
                          Charges Collection
                          <Tooltip title="Service charges and fees collected today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="charges"
                      rules={[
                        { required: true, message: 'Charges amount is required' },
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

                <Divider orientation="left">
                  <Space>
                    Head Office Only Fields
                    {user?.role !== 'HO' && (
                      <Tag color="orange">View Only</Tag>
                    )}
                  </Space>
                </Divider>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Fund from HO (FRM HO)
                          <Tooltip title={user?.role !== 'HO' 
                            ? 'Only Head Office can edit this field' 
                            : 'Amount received from Head Office'
                          }>
                            <InfoCircleOutlined style={{ 
                              color: user?.role !== 'HO' ? '#fa8c16' : '#1890ff' 
                            }} />
                          </Tooltip>
                        </Space>
                      }
                      name="frmHO"
                    >
                      <Input
                        type="number"
                        placeholder={user?.role !== 'HO' ? 'HO will fill this' : '0.00'}
                        prefix="₦"
                        size="large"
                        step="0.01"
                        disabled={user?.role !== 'HO'}
                        style={{ 
                          backgroundColor: user?.role !== 'HO' ? '#fff2e8' : 'white',
                          borderColor: user?.role !== 'HO' ? '#ffb366' : '#d9d9d9'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          Fund from Branch (FRM BR)
                          <Tooltip title={user?.role !== 'HO' 
                            ? 'Only Head Office can edit this field' 
                            : 'Amount received from other branches'
                          }>
                            <InfoCircleOutlined style={{ 
                              color: user?.role !== 'HO' ? '#fa8c16' : '#1890ff' 
                            }} />
                          </Tooltip>
                        </Space>
                      }
                      name="frmBR"
                    >
                      <Input
                        type="number"
                        placeholder={user?.role !== 'HO' ? 'HO will fill this' : '0.00'}
                        prefix="₦"
                        size="large"
                        step="0.01"
                        disabled={user?.role !== 'HO'}
                        style={{ 
                          backgroundColor: user?.role !== 'HO' ? '#fff2e8' : 'white',
                          borderColor: user?.role !== 'HO' ? '#ffb366' : '#d9d9d9'
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {user?.role !== 'HO' && (
                  <Alert
                    message="Branch User Guidelines"
                    description={
                      <div>
                        <p>• <strong>PCIH (Previous Cash in Hand):</strong> Automatically filled from yesterday's Online CIH - cannot be edited</p>
                        <p>• <strong>FRM HO and FRM BR:</strong> Can only be edited by Head Office users</p>
                        <p>• <strong>Disbursement Roll, Loan & Savings Registers:</strong> View-only, calculated automatically</p>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

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
                      {hasExistingData ? 'Update Cashbook 1' : 'Submit Cashbook 1'}
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
                      Collection Total
                      <br />
                      <small>(Savings + Loan + Charges)</small>
                    </span>
                  }
                  value={calculatedValues.total}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
                />
                
                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
                
                <Statistic
                  title={
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                      CB TOTAL 1
                      <br />
                      <small>(PCIH + Collection + FRM HO + FRM BR)</small>
                    </span>
                  }
                  value={calculatedValues.cbTotal1}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}
                />
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '16px'
                }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    Final Cashbook 1 Total
                  </Text>
                  <br />
                  <Text style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
                    {calculations.formatCurrency(calculatedValues.cbTotal1)}
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
                <Text code>Total = Savings + Loan + Charges</Text>
                <Text code>CB TOTAL 1 = PCIH + Total + FRM HO + FRM BR</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};