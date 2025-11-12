import React, { useState, useEffect } from 'react';
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
  Divider 
} from 'antd';
import { SaveOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import type { Cashbook1 } from '../types';

const { Title, Text } = Typography;

interface Cashbook1FormProps {
  onSubmit: (data: Partial<Cashbook1>) => void;
  initialData?: Partial<Cashbook1>;
  readonly?: boolean;
}

export const Cashbook1Component: React.FC<Cashbook1FormProps> = ({
  onSubmit,
  initialData,
  readonly = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    total: 0,
    cbTotal1: 0
  });
  const { user } = useAuthStore();

  // Calculate values when form values change
  useEffect(() => {
    const values = form.getFieldsValue();
    const total = calculations.calculateCashbook1Total(values);
    const cbTotal1 = calculations.calculateCashbook1CBTotal(values);
    
    setCalculatedValues({ total, cbTotal1 });
  }, [form]);

  const handleValuesChange = () => {
    const values = form.getFieldsValue();
    const total = calculations.calculateCashbook1Total(values);
    const cbTotal1 = calculations.calculateCashbook1CBTotal(values);
    
    setCalculatedValues({ total, cbTotal1 });
  };

  const handleSubmit = async (values: Record<string, number>) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        total: calculatedValues.total,
        cbTotal1: calculatedValues.cbTotal1,
        date: new Date().toISOString().split('T')[0],
        branchId: user?.branchId || 'ho',
        submittedBy: user?.id || '',
        submittedAt: new Date().toISOString()
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>
            Cashbook 1 - Daily Input
          </Title>
          <Text type="secondary">
            Enter daily operations data for {new Date().toLocaleDateString()}
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card title="Daily Input Form" className="form-section">
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
                      label="Previous Cash in Hand (PCIH)"
                      name="pcih"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 0, message: 'Must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="Savings"
                      name="savings"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 0, message: 'Must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Loan Collection"
                      name="loanCollection"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 0, message: 'Must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="Charges Collection"
                      name="charges"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 0, message: 'Must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Head Office Only Fields</Divider>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Fund from HO (FRM HO)"
                      name="frmHO"
                      tooltip={user?.role !== 'HO' ? 'Only Head Office can edit this field' : ''}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        disabled={user?.role !== 'HO'}
                        style={{ 
                          backgroundColor: user?.role !== 'HO' ? '#f5f5f5' : 'white' 
                        }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="Fund from Branch (FRM BR)"
                      name="frmBR"
                      tooltip={user?.role !== 'HO' ? 'Only Head Office can edit this field' : ''}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        disabled={user?.role !== 'HO'}
                        style={{ 
                          backgroundColor: user?.role !== 'HO' ? '#f5f5f5' : 'white' 
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {user?.role !== 'HO' && (
                  <Alert
                    message="Note"
                    description="FRM HO and FRM BR fields can only be edited by Head Office users"
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
                    >
                      Submit Cashbook 1
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card 
              title={<span><CalculatorOutlined /> Calculations</span>}
              className="stats-card"
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Statistic
                  title="Total (Savings + Loan + Charges)"
                  value={calculatedValues.total}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#3f8600' }}
                />
                
                <Statistic
                  title="CB TOTAL 1"
                  value={calculatedValues.cbTotal1}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#1890ff' }}
                />
                
                <div className="calculation-result">
                  <Text style={{ color: 'white' }}>
                    <strong>Final Cashbook 1 Total</strong>
                  </Text>
                  <br />
                  <Text style={{ color: 'white', fontSize: '24px' }}>
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