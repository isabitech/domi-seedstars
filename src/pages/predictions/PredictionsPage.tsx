import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Button, Tabs, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, RiseOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type PredictionType = 'revenue' | 'expenses' | 'growth' | 'trends';

export const PredictionsPage: React.FC = () => {
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionType>('revenue');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const predictionTypes = [
    {
      key: 'revenue',
      title: 'Revenue Predictions',
      icon: <RiseOutlined />,
      description: 'Forecast future revenue based on historical data',
      color: '#1890ff',
    },
    {
      key: 'expenses',
      title: 'Expense Forecasting',
      icon: <BarChartOutlined />,
      description: 'Predict upcoming expenses and budget requirements',
      color: '#52c41a',
    },
    {
      key: 'growth',
      title: 'Growth Analysis',
      icon: <LineChartOutlined />,
      description: 'Analyze growth patterns and future opportunities',
      color: '#faad14',
    },
    {
      key: 'trends',
      title: 'Market Trends',
      icon: <PieChartOutlined />,
      description: 'Identify market trends and seasonal patterns',
      color: '#722ed1',
    },
  ];

  const mockPredictions = {
    revenue: {
      current: 2500000,
      predicted: 2800000,
      growth: 12,
      confidence: 85,
    },
    expenses: {
      current: 1800000,
      predicted: 1950000,
      growth: 8.3,
      confidence: 78,
    },
    growth: {
      quarterlyGrowth: 15.5,
      yearlyGrowth: 45.2,
      confidence: 92,
    },
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <RiseOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 16 }} />
                  <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                    ${mockPredictions.revenue.predicted.toLocaleString()}
                  </div>
                  <Text type="secondary">Predicted Revenue (Next Quarter)</Text>
                  <div style={{ color: '#52c41a', marginTop: 8 }}>
                    +{mockPredictions.revenue.growth}% growth
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: 40, color: '#faad14', marginBottom: 16 }} />
                  <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                    ${mockPredictions.expenses.predicted.toLocaleString()}
                  </div>
                  <Text type="secondary">Predicted Expenses (Next Quarter)</Text>
                  <div style={{ color: '#faad14', marginTop: 8 }}>
                    +{mockPredictions.expenses.growth}% increase
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <LineChartOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 16 }} />
                  <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                    {mockPredictions.growth.quarterlyGrowth}%
                  </div>
                  <Text type="secondary">Quarterly Growth Rate</Text>
                  <div style={{ color: '#52c41a', marginTop: 8 }}>
                    {mockPredictions.growth.confidence}% confidence
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'detailed',
      label: 'Detailed Analysis',
      children: (
        <div>
          <p>Detailed prediction analysis coming soon...</p>
          <p>Selected type: {selectedPrediction}</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Financial Predictions & Analytics</Title>
        <Text type="secondary">
          AI-powered predictions based on historical data and market trends
        </Text>
      </div>

      {/* Prediction Type Selection */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {predictionTypes.map((type) => (
          <Col xs={24} sm={12} md={6} key={type.key}>
            <Card
              hoverable
              className={selectedPrediction === type.key ? 'selected-card' : ''}
              onClick={() => setSelectedPrediction(type.key as PredictionType)}
              style={{
                border: selectedPrediction === type.key ? `2px solid ${type.color}` : '1px solid #d9d9d9',
                cursor: 'pointer',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: type.color, fontSize: 32, marginBottom: 16 }}>
                  {type.icon}
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0' }}>
                  {type.title}
                </Title>
                <Text type="secondary">{type.description}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            placeholder={['Start Date', 'End Date']}
          />
          <Button type="primary">
            Generate Predictions
          </Button>
          <Button>
            Export Report
          </Button>
        </Space>
      </Card>

      {/* Prediction Content */}
      <Card>
        <Tabs items={tabItems} defaultActiveKey="overview" size="large" />
      </Card>
    </div>
  );
};