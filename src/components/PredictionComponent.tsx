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
  Alert,
  Table
} from 'antd';
import { 
  SaveOutlined, 
  EyeOutlined, 
  RiseOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../store';
import { calculations } from '../utils/calculations';
import type { Prediction } from '../types';

const { Title, Text } = Typography;

interface PredictionComponentProps {
  onSubmit: (data: Partial<Prediction>) => void;
  initialData?: Partial<Prediction>;
  readonly?: boolean;
}

export const PredictionComponent: React.FC<PredictionComponentProps> = ({
  onSubmit,
  initialData,
  readonly = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      branchId: 'br-001',
      predictionNo: 15,
      predictionAmount: 750000,
      submittedBy: 'branch1'
    },
    {
      id: '2',
      date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
      branchId: 'br-001',
      predictionNo: 12,
      predictionAmount: 600000,
      submittedBy: 'branch1'
    }
  ]);
  const { user } = useAuthStore();

  const [currentPrediction, setCurrentPrediction] = useState({
    predictionNo: 0,
    predictionAmount: 0,
    avgPerClient: 0
  });

  useEffect(() => {
    const values = form.getFieldsValue();
    const { predictionNo = 0, predictionAmount = 0 } = values;
    const avgPerClient = predictionNo > 0 ? predictionAmount / predictionNo : 0;
    
    setCurrentPrediction({
      predictionNo,
      predictionAmount,
      avgPerClient
    });
  }, [form]);

  const handleValuesChange = () => {
    const values = form.getFieldsValue();
    const { predictionNo = 0, predictionAmount = 0 } = values;
    const avgPerClient = predictionNo > 0 ? predictionAmount / predictionNo : 0;
    
    setCurrentPrediction({
      predictionNo,
      predictionAmount,
      avgPerClient
    });
  };

  const handleSubmit = async (values: Record<string, number>) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        date: dayjs().add(1, 'day').format('YYYY-MM-DD'), // Next day
        branchId: user?.branchId || 'ho',
        submittedBy: user?.id || '',
        id: Date.now().toString()
      };
      
      // Add to local predictions list
      const newPrediction = submitData as Prediction;
      setPredictions(prev => [newPrediction, ...prev.slice(0, 9)]); // Keep last 10
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const predictionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Predicted Clients',
      dataIndex: 'predictionNo',
      key: 'predictionNo',
      render: (value: number) => <strong>{value}</strong>
    },
    {
      title: 'Predicted Amount',
      dataIndex: 'predictionAmount',
      key: 'predictionAmount',
      render: (value: number) => calculations.formatCurrency(value)
    },
    {
      title: 'Avg per Client',
      key: 'avgPerClient',
      render: (_: unknown, record: Prediction) => 
        calculations.formatCurrency(record.predictionAmount / record.predictionNo)
    }
  ];

  const tomorrow = dayjs().add(1, 'day');

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>
            <RiseOutlined /> Next-Day Predictions
          </Title>
          <Text type="secondary">
            Predict tomorrow's disbursement activity for planning purposes
          </Text>
        </div>

        <Alert
          message="Prediction Purpose"
          description="Help Head Office prepare adequate funds and resources by predicting tomorrow's disbursement requirements."
          type="info"
          showIcon
          closable
        />

        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Card 
              title={
                <span>
                  <CalendarOutlined /> Prediction for {tomorrow.format('dddd, MMMM DD, YYYY')}
                </span>
              }
              className="form-section"
            >
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
                      label="Number of Clients (PREDICTION NO)"
                      name="predictionNo"
                      rules={[
                        { required: true, message: 'Required' },
                        { type: 'number', min: 0, message: 'Must be positive' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Expected number of clients"
                        size="large"
                        suffix="clients"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="Total Amount (PREDICTION AMOUNT)"
                      name="predictionAmount"
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
                      Submit Prediction
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </Card>
          </Col>

          <Col span={10}>
            <Card 
              title={<span><EyeOutlined /> Prediction Summary</span>}
              className="stats-card"
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Statistic
                  title="Expected Clients"
                  value={currentPrediction.predictionNo}
                  valueStyle={{ color: '#1890ff' }}
                  suffix="clients"
                />
                
                <Statistic
                  title="Expected Amount"
                  value={currentPrediction.predictionAmount}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#3f8600' }}
                />
                
                <Statistic
                  title="Average per Client"
                  value={currentPrediction.avgPerClient}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#722ed1' }}
                />

                <div className="calculation-result">
                  <Text style={{ color: 'white' }}>
                    <strong>Fund Requirement</strong>
                  </Text>
                  <br />
                  <Text style={{ color: 'white', fontSize: '20px' }}>
                    {calculations.formatCurrency(currentPrediction.predictionAmount)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card title="Previous Predictions" className="form-section">
          <Table
            columns={predictionColumns}
            dataSource={predictions}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>

        <Alert
          message="Planning Notes"
          description={
            <Space direction="vertical">
              <Text>• Predictions help Head Office prepare adequate funding</Text>
              <Text>• Consider historical patterns and market conditions</Text>
              <Text>• Update predictions if circumstances change</Text>
              <Text>• Accuracy improves operational efficiency</Text>
            </Space>
          }
          type="warning"
          showIcon
        />
      </Space>
    </div>
  );
};