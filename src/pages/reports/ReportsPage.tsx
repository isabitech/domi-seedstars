import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, Button, Select, Typography, Space } from 'antd';
import { FileTextOutlined, BarChartOutlined, DollarCircleOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

type ReportType = 'financial' | 'performance' | 'transactions';

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('financial');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const reportOptions = [
    {
      key: 'financial',
      title: 'Financial Report',
      icon: <DollarCircleOutlined />,
      description: 'Revenue, expenses, and profitability analysis',
    },
    {
      key: 'performance',
      title: 'Branch Performance',
      icon: <BarChartOutlined />,
      description: 'Branch-wise performance metrics and comparisons',
    },
    {
      key: 'transactions',
      title: 'Transaction Log',
      icon: <FileTextOutlined />,
      description: 'Detailed transaction history and audit trail',
    },
  ];

  const handleGenerateReport = () => {
    console.log('Generating report:', {
      type: selectedReport,
      dateRange,
      branch: selectedBranch,
    });
  };

  const renderReportComponent = () => {
    switch (selectedReport) {
      case 'financial':
        return (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h3>Financial Report</h3>
            <p>Date Range: {dateRange ? `${dateRange[0]?.format('YYYY-MM-DD')} to ${dateRange[1]?.format('YYYY-MM-DD')}` : 'All dates'}</p>
            <p>Branch: {selectedBranch}</p>
            <p>Financial report content coming soon...</p>
          </div>
        );
      case 'performance':
        return (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h3>Branch Performance Report</h3>
            <p>Date Range: {dateRange ? `${dateRange[0]?.format('YYYY-MM-DD')} to ${dateRange[1]?.format('YYYY-MM-DD')}` : 'All dates'}</p>
            <p>Branch: {selectedBranch}</p>
            <p>Performance report content coming soon...</p>
          </div>
        );
      case 'transactions':
        return (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h3>Transaction Log Report</h3>
            <p>Date Range: {dateRange ? `${dateRange[0]?.format('YYYY-MM-DD')} to ${dateRange[1]?.format('YYYY-MM-DD')}` : 'All dates'}</p>
            <p>Branch: {selectedBranch}</p>
            <p>Transaction log content coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Title level={2}>Reports & Analytics</Title>
      
      {/* Report Type Selection */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {reportOptions.map((option) => (
          <Col xs={24} sm={8} key={option.key}>
            <Card
              hoverable
              className={selectedReport === option.key ? 'selected-card' : ''}
              onClick={() => setSelectedReport(option.key as ReportType)}
              style={{
                border: selectedReport === option.key ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer',
              }}
            >
              <Card.Meta
                avatar={option.icon}
                title={option.title}
                description={option.description}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Report Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            placeholder={['Start Date', 'End Date']}
          />
          <Select
            value={selectedBranch}
            onChange={setSelectedBranch}
            style={{ width: 150 }}
            placeholder="Select Branch"
          >
            <Option value="all">All Branches</Option>
            <Option value="main">Main Branch</Option>
            <Option value="north">North Branch</Option>
            <Option value="south">South Branch</Option>
          </Select>
          <Button type="primary" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </Space>
      </Card>

      {/* Report Content */}
      <Card>
        {renderReportComponent()}
      </Card>
    </div>
  );
};