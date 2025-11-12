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
  Typography,
  Divider 
} from 'antd';
import { SaveOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import type { Cashbook2 } from '../types';

const { Title, Text } = Typography;

interface Cashbook2FormProps {
  onSubmit: (data: Partial<Cashbook2>) => void;
  initialData?: Partial<Cashbook2>;
  readonly?: boolean;
}

export const Cashbook2Component: React.FC<Cashbook2FormProps> = ({
  onSubmit,
  initialData,
  readonly = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cbTotal2, setCbTotal2] = useState(0);
  const { user } = useAuthStore();

  // Calculate CB TOTAL 2 when form values change
  useEffect(() => {
    const values = form.getFieldsValue();
    const total = calculations.calculateCashbook2CBTotal(values);
    setCbTotal2(total);
  }, [form]);

  const handleValuesChange = () => {
    const values = form.getFieldsValue();
    const total = calculations.calculateCashbook2CBTotal(values);
    setCbTotal2(total);
  };

  const handleSubmit = async (values: Record<string, number>) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        cbTotal2,
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
            Cashbook 2 - Daily Disbursements & Withdrawals
          </Title>
          <Text type="secondary">
            Enter disbursement and withdrawal data for {new Date().toLocaleDateString()}
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card title="Disbursement & Withdrawal Form" className="form-section">
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
                      label="Disbursement Number (DIS NO)"
                      name="disNo"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 0, message: 'Must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Number of clients"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="Disbursement Amount (DIS AMT)"
                      name="disAmt"
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
                      label="Disbursement with Interest (DIS WIT INT)"
                      name="disWithInt"
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
                      label="Savings Withdrawal (SAV WITH)"
                      name="savWith"
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

                <Divider orientation="left">Cash & Transfer Information</Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="DOMI BANK (Available Cash)"
                      name="domiBank"
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
                      label="POS/Transfer (POS/T)"
                      name="posT"
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

                {!readonly && (
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      Submit Cashbook 2
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
                  title="CB TOTAL 2"
                  value={cbTotal2}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#1890ff' }}
                />
                
                <div className="calculation-result">
                  <Text style={{ color: 'white' }}>
                    <strong>Cashbook 2 Total</strong>
                  </Text>
                  <br />
                  <Text style={{ color: 'white', fontSize: '24px' }}>
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
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};