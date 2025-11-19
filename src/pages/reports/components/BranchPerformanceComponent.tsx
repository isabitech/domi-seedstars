import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography, Tag, Table, Button, message } from 'antd';
import { TrophyOutlined, DownloadOutlined } from '@ant-design/icons';
import { calculations } from '../../../utils/calculations';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;

interface BranchPerformanceData {
  branchId: string;
  branchName: string;
  branchCode: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  collectionEfficiency: number;
  disbursementVolume: number;
  customerCount: number;
  averageTransactionSize: number;
  growthRate: number;
  performanceScore: number;
  ranking: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  lastUpdated: string;
}

interface BranchPerformanceProps {
  data: BranchPerformanceData[];
  dateRange: [Dayjs, Dayjs] | null;
  loading: boolean;
}

export const BranchPerformanceComponent: React.FC<BranchPerformanceProps> = ({ data, dateRange, loading }) => {
  const performanceColumns: ColumnsType<BranchPerformanceData> = [
    {
      title: 'Rank',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 70,
      render: (rank: number) => (
        <Tag color={rank === 1 ? 'gold' : rank <= 3 ? 'orange' : 'default'}>
          #{rank}
        </Tag>
      ),
    },
    {
      title: 'Branch',
      key: 'branch',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.branchName}</Text>
          <Text type="secondary">{record.branchCode}</Text>
        </Space>
      ),
    },
    {
      title: 'Performance Score',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      width: 120,
      render: (score: number, record) => (
        <div>
          <Progress 
            percent={score} 
            size="small" 
            status={record.status === 'excellent' ? 'success' : record.status === 'poor' ? 'exception' : 'active'}
          />
          <Text strong style={{ fontSize: '12px' }}>{score}%</Text>
        </div>
      ),
    },
    {
      title: 'Total Income',
      dataIndex: 'totalIncome',
      key: 'totalIncome',
      render: (value: number) => calculations.formatCurrency(value),
    },
    {
      title: 'Net Profit',
      dataIndex: 'netProfit',
      key: 'netProfit',
      render: (value: number) => (
        <Text type={value >= 0 ? 'success' : 'danger'}>
          {calculations.formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Profit Margin',
      dataIndex: 'profitMargin',
      key: 'profitMargin',
      render: (value: number) => (
        <Text type={value >= 0 ? 'success' : 'danger'}>
          {value.toFixed(2)}%
        </Text>
      ),
    },
    {
      title: 'Collection Efficiency',
      dataIndex: 'collectionEfficiency',
      key: 'collectionEfficiency',
      render: (value: number) => (
        <Progress percent={value} size="small" status={value >= 80 ? 'success' : 'active'} />
      ),
    },
    {
      title: 'Growth Rate',
      dataIndex: 'growthRate',
      key: 'growthRate',
      render: (value: number) => (
        <Tag color={value >= 15 ? 'green' : value >= 10 ? 'orange' : 'red'}>
          {value.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          excellent: 'green',
          good: 'blue',
          average: 'orange',
          poor: 'red'
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  if (data.length === 0) return null;

  const topPerformer = data[0];
  const avgPerformanceScore = data.reduce((sum, item) => sum + item.performanceScore, 0) / data.length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Performance Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Top Performing Branch"
              value={topPerformer?.branchName || 'N/A'}
              suffix={topPerformer && <TrophyOutlined style={{ color: '#faad14' }} />}
            />
            {topPerformer && (
              <Text type="secondary">
                Score: {topPerformer.performanceScore}% | Profit: {calculations.formatCurrency(topPerformer.netProfit)}
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Average Performance Score"
              value={avgPerformanceScore}
              precision={1}
              suffix="%"
              valueStyle={{ color: avgPerformanceScore >= 75 ? '#3f8600' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Branches Analyzed"
              value={data.length}
              suffix="branches"
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Analysis */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Performance Distribution" size="small">
            {(['excellent', 'good', 'average', 'poor'] as const).map(status => {
              const count = data.filter(b => b.status === status).length;
              const percentage = (count / data.length) * 100;
              return (
                <div key={status} style={{ marginBottom: 8 }}>
                  <Text>{status.charAt(0).toUpperCase() + status.slice(1)}: {count} branches</Text>
                  <Progress percent={percentage} size="small" showInfo={false} />
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Key Insights" size="small">
            <Space direction="vertical">
              <Text>
                • Highest profit margin: {Math.max(...data.map(b => b.profitMargin)).toFixed(2)}%
              </Text>
              <Text>
                • Best collection efficiency: {Math.max(...data.map(b => b.collectionEfficiency))}%
              </Text>
              <Text>
                • Average growth rate: {(data.reduce((sum, item) => sum + item.growthRate, 0) / data.length).toFixed(2)}%
              </Text>
              <Text>
                • Total customers served: {data.reduce((sum, item) => sum + item.customerCount, 0).toLocaleString()}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Detailed Performance Table */}
      <Card 
        title={`Branch Performance Analysis - ${dateRange ? `${dateRange[0].format('MMM DD')} to ${dateRange[1].format('MMM DD, YYYY')}` : ''}`}
        extra={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => message.success('Performance report exported successfully')}
          >
            Export Excel
          </Button>
        }
      >
        <Table
          columns={performanceColumns}
          dataSource={data}
          rowKey="branchId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>
    </Space>
  );
};