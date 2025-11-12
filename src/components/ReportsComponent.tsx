import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker,
  Button,
  Table,
  Space,
  Typography,
  Statistic,
  Alert,
  Tag
} from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CalendarOutlined,
  ExportOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { calculations } from '../utils/calculations';
import type { DailyReport } from '../types';

dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mock report data
const mockReports: DailyReport[] = [
  {
    date: '2024-11-12',
    branchId: 'br-001',
    branchName: 'Lagos Branch',
    cashbook1: {
      id: '1',
      date: '2024-11-12',
      branchId: 'br-001',
      pcih: 150000,
      savings: 850000,
      loanCollection: 400000,
      charges: 25000,
      total: 1275000,
      frmHO: 200000,
      frmBR: 50000,
      cbTotal1: 1525000,
      submittedBy: 'branch1',
      submittedAt: '2024-11-12T10:30:00Z'
    },
    cashbook2: {
      id: '1',
      date: '2024-11-12',
      branchId: 'br-001',
      disNo: 15,
      disAmt: 750000,
      disWithInt: 780000,
      savWith: 120000,
      domiBank: 100000,
      posT: 50000,
      cbTotal2: 1020000,
      submittedBy: 'branch1',
      submittedAt: '2024-11-12T14:30:00Z'
    },
    calculations: {
      onlineCIH: 505000,
      transferToSenate: 455000
    }
  },
  {
    date: '2024-11-11',
    branchId: 'br-002',
    branchName: 'Abuja Branch',
    cashbook1: {
      id: '2',
      date: '2024-11-11',
      branchId: 'br-002',
      pcih: 120000,
      savings: 650000,
      loanCollection: 330000,
      charges: 20000,
      total: 1000000,
      frmHO: 150000,
      frmBR: 30000,
      cbTotal1: 1300000,
      submittedBy: 'branch2',
      submittedAt: '2024-11-11T09:45:00Z'
    },
    cashbook2: {
      id: '2',
      date: '2024-11-11',
      branchId: 'br-002',
      disNo: 12,
      disAmt: 580000,
      disWithInt: 600000,
      savWith: 80000,
      domiBank: 75000,
      posT: 35000,
      cbTotal2: 770000,
      submittedBy: 'branch2',
      submittedAt: '2024-11-11T13:15:00Z'
    },
    calculations: {
      onlineCIH: 530000,
      transferToSenate: 405000
    }
  }
];

export const ReportsComponent: React.FC = () => {
  const [reportType, setReportType] = useState<string>('daily');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real app, this would trigger file download
      console.log(`Exporting ${reportType} report as ${format}`);
    } finally {
      setLoading(false);
    }
  };

  const reportColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Branch',
      key: 'branch',
      render: (_: unknown, record: DailyReport) => (
        <div>
          <strong>{record.branchName}</strong>
          <br />
          <Text type="secondary">{record.branchId}</Text>
        </div>
      )
    },
    {
      title: 'Collections',
      key: 'collections',
      render: (_: unknown, record: DailyReport) => {
        const total = record.cashbook1.savings + record.cashbook1.loanCollection;
        return calculations.formatCurrency(total);
      }
    },
    {
      title: 'Disbursements',
      key: 'disbursements',
      render: (_: unknown, record: DailyReport) => 
        calculations.formatCurrency(record.cashbook2.disAmt)
    },
    {
      title: 'Online CIH',
      key: 'onlineCIH',
      render: (_: unknown, record: DailyReport) => (
        <Tag color={record.calculations.onlineCIH >= 0 ? 'green' : 'red'}>
          {calculations.formatCurrency(record.calculations.onlineCIH)}
        </Tag>
      )
    },
    {
      title: 'Transfer to Senate',
      key: 'transferToSenate',
      render: (_: unknown, record: DailyReport) => 
        calculations.formatCurrency(record.calculations.transferToSenate)
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Complete</Tag>
    }
  ];

  const filteredReports = mockReports.filter(report => {
    if (selectedBranch !== 'all' && report.branchId !== selectedBranch) {
      return false;
    }
    const reportDate = dayjs(report.date);
    return reportDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
  });

  const totalStats = filteredReports.reduce((acc, report) => ({
    totalCollections: acc.totalCollections + report.cashbook1.savings + report.cashbook1.loanCollection,
    totalDisbursements: acc.totalDisbursements + report.cashbook2.disAmt,
    totalOnlineCIH: acc.totalOnlineCIH + report.calculations.onlineCIH,
    totalTransferToSenate: acc.totalTransferToSenate + report.calculations.transferToSenate
  }), {
    totalCollections: 0,
    totalDisbursements: 0,
    totalOnlineCIH: 0,
    totalTransferToSenate: 0
  });

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3}>
              <FileTextOutlined /> Reports & Analytics
            </Title>
            <Text type="secondary">
              Generate and export comprehensive reports
            </Text>
          </div>
          <Space>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              loading={loading}
              onClick={() => handleExport('excel')}
            >
              Export Excel
            </Button>
            <Button 
              icon={<ExportOutlined />}
              loading={loading}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col>
              <Space>
                <Text strong>Report Type:</Text>
                <Select
                  value={reportType}
                  onChange={setReportType}
                  style={{ width: 150 }}
                >
                  <Select.Option value="daily">Daily Reports</Select.Option>
                  <Select.Option value="monthly">Monthly Summary</Select.Option>
                  <Select.Option value="consolidated">Consolidated</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text strong>Branch:</Text>
                <Select
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  style={{ width: 200 }}
                >
                  <Select.Option value="all">All Branches</Select.Option>
                  <Select.Option value="br-001">Lagos Branch</Select.Option>
                  <Select.Option value="br-002">Abuja Branch</Select.Option>
                  <Select.Option value="br-003">Kano Branch</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <CalendarOutlined />
                <RangePicker 
                  value={dateRange}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0], dates[1]]);
                    }
                  }}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Collections"
                value={totalStats.totalCollections}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Disbursements"
                value={totalStats.totalDisbursements}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Online CIH"
                value={totalStats.totalOnlineCIH}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: totalStats.totalOnlineCIH >= 0 ? '#3f8600' : '#cf1322' 
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="stats-card">
              <Statistic
                title="Total TSO"
                value={totalStats.totalTransferToSenate}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Reports Table */}
        <Card 
          title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Reports`}
          extra={
            <Text type="secondary">
              {filteredReports.length} record(s) found
            </Text>
          }
        >
          <Table
            columns={reportColumns}
            dataSource={filteredReports}
            rowKey={(record) => `${record.branchId}-${record.date}`}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Export Information */}
        <Alert
          message="Export Information"
          description={
            <Space direction="vertical">
              <Text>• Excel export includes detailed calculations and formulas</Text>
              <Text>• PDF export provides formatted reports ready for printing</Text>
              <Text>• All exports include the current filter selections</Text>
              <Text>• Data is exported with proper formatting and company branding</Text>
            </Space>
          }
          type="info"
          showIcon
          closable
        />
      </Space>
    </div>
  );
};