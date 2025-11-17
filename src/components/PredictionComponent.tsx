import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Form,
  Input,
  Button,
  Space, 
  Typography, 
  Alert,
  Spin,
  Tag,
  Statistic,
  message
} from 'antd';
import { PlusOutlined, SaveOutlined, ReloadOutlined, FundProjectionScreenOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store';
import { predictionService } from '../services/prediction';
import { calculations } from '../utils/calculations';
import type { Prediction } from '../types';

const { Title, Text } = Typography;

interface PredictionFormProps {
  date?: string;
  onSubmit?: (data: Prediction) => void;
  readonly?: boolean;
}

export const PredictionComponent: React.FC<PredictionFormProps> = ({
  date,
  onSubmit,
  readonly = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [hasExistingPrediction, setHasExistingPrediction] = useState(false);
  const [predictionData, setPredictionData] = useState<Prediction | null>(null);
  
  const { user } = useAuthStore();
  const tomorrowDate = date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const loadExistingPrediction = useCallback(async () => {
    if (!user?.branchId) return;
    
    setDataLoading(true);
    try {
      const response = await predictionService.getPrediction(user.branchId, tomorrowDate);
      if (response.success && response.data) {
        const existingData = response.data;
        form.setFieldsValue({
          predictionNo: existingData.predictionNo,
          predictionAmount: existingData.predictionAmount
        });
        setPredictionData(existingData);
        setHasExistingPrediction(true);
      } else {
        setHasExistingPrediction(false);
        setPredictionData(null);
      }
    } catch {
      console.error('Error loading existing prediction');
    } finally {
      setDataLoading(false);
    }
  }, [user?.branchId, tomorrowDate, form]);

  // Load existing data on component mount
  useEffect(() => {
    loadExistingPrediction();
  }, [loadExistingPrediction]);

  const handleSubmit = async (values: { predictionNo: number; predictionAmount: number }) => {
    if (!user?.branchId) {
      message.error('User branch information is missing');
      return;
    }

    // Only branches can submit predictions
    if (user.role !== 'BR') {
      message.error('Only branch users can submit predictions');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        predictionNo: Number(values.predictionNo),
        predictionAmount: Number(values.predictionAmount),
        date: tomorrowDate,
        branchId: user.branchId,
        submittedBy: user.id
      };
      
      const response = await predictionService.submitPrediction(submitData);
      
      if (response.success && response.data) {
        message.success(response.message || 'Prediction submitted successfully!');
        setPredictionData(response.data);
        setHasExistingPrediction(true);
        
        if (onSubmit) {
          onSubmit(response.data);
        }
      } else {
        message.error(response.error || 'Failed to submit prediction');
      }
    } catch {
      message.error('An unexpected error occurred while submitting prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadExistingPrediction();
    message.info('Prediction data refreshed');
  };

  // Branch users can input, HO can only view
  const canEdit = user?.role === 'BR' && !readonly;

  return (
    <Card 
      title={
        <Space>
          <FundProjectionScreenOutlined />
          Tomorrow's Prediction
          {user?.role === 'BR' && (
            <Tag color="blue">Branch Input</Tag>
          )}
          {user?.role === 'HO' && (
            <Tag color="purple">HO View Only</Tag>
          )}
        </Space>
      }
      extra={
        <Button 
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={dataLoading}
          size="small"
          type="text"
        >
          Refresh
        </Button>
      }
      size="small"
      style={{ marginTop: 16 }}
    >
      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 8 }}>Loading prediction data...</p>
        </div>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Prediction for: {new Date(tomorrowDate).toLocaleDateString()}
            </Text>
          </div>

          {hasExistingPrediction && predictionData ? (
            // Display existing prediction
            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Prediction No:</Text>
                  <Text strong>{predictionData.predictionNo} clients</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Prediction Amount:</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {calculations.formatCurrency(predictionData.predictionAmount)}
                  </Text>
                </div>
                <div style={{ 
                  borderTop: '1px solid #d9f7be',
                  paddingTop: 8,
                  marginTop: 8,
                  textAlign: 'center'
                }}>
                  <Text type="success" style={{ fontSize: '12px' }}>
                    ✓ Prediction submitted for tomorrow
                  </Text>
                </div>
              </Space>
            </div>
          ) : (
            // No existing prediction
            <Alert
              message="No Prediction Found"
              description={`No disbursement prediction has been submitted for ${new Date(tomorrowDate).toLocaleDateString()}`}
              type="info"
              showIcon
            />
          )}

          {canEdit && (
            <>
              <Title level={5} style={{ margin: 0 }}>
                {hasExistingPrediction ? 'Update Prediction' : 'Submit Prediction'}
              </Title>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                size="small"
              >
                <Form.Item
                  label="Prediction No (Number of Clients)"
                  name="predictionNo"
                  rules={[
                    { required: true, message: 'Number of clients is required' },
                    { type: 'number', min: 1, message: 'Must be at least 1 client' }
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Number of clients"
                    min="1"
                    step="1"
                  />
                </Form.Item>

                <Form.Item
                  label="Prediction Amount (Total Disbursement)"
                  name="predictionAmount"
                  rules={[
                    { required: true, message: 'Prediction amount is required' },
                    { type: 'number', min: 0, message: 'Must be a positive amount' }
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="0.00"
                    prefix="₦"
                    step="0.01"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={hasExistingPrediction ? <SaveOutlined /> : <PlusOutlined />}
                    size="small"
                    style={{ width: '100%' }}
                  >
                    {hasExistingPrediction ? 'Update Prediction' : 'Submit Prediction'}
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}

          {user?.role === 'HO' && !hasExistingPrediction && (
            <Alert
              message="Waiting for Branch Prediction"
              description="Branch has not yet submitted tomorrow's disbursement prediction."
              type="warning"
              showIcon
              style={{ fontSize: '12px' }}
            />
          )}
        </Space>
      )}
    </Card>
  );
};