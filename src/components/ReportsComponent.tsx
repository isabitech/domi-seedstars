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
  Tag,
  Spin,
  message
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
import { 
  useGetDailyReport 
} from '../hooks/Reports/useGetDailyReport';
import { 
  useGetMonthlyReport
} from '../hooks/Reports/useGetMonthlyReport';
import {
  useGetConsolidatedReport
} from '../hooks/Reports/useGetConsolidatedReport';
import {
  useListBranches
} from '../hooks/Branches/useListBranches';
// Note: Export hooks not yet implemented
// import { useExportDailyReportCSV } from '../hooks/Reports/useExportDailyReportCSV';
// import { useExportDailyReportPDF } from '../hooks/Reports/useExportDailyReportPDF';
import type { Branch, DailyReport } from '../types';

dayjs.extend(isBetween);

export const ReportsComponent: React.FC = () => {
  const [reportType, setReportType] = useState<string>('daily');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);

  // Get branches for filter
  const { data: branchesData } = useListBranches();
  
  // Get reports based on type
  const { 
    data: dailyReports, 
    isLoading: dailyLoading 
  } = useGetDailyReport(reportType === 'daily' ? {
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
    date: dateRange[0].format('YYYY-MM-DD')
  } : {});

  const { 
    data: monthlyReport, 
    isLoading: monthlyLoading 
  } = useGetMonthlyReport(reportType === 'monthly' ? {
    branchId: selectedBranch === 'all' ? undefined : selectedBranch,
    month: dateRange[0].format('YYYY-MM')
  } : {});

  const { 
    data: consolidatedReport, 
    isLoading: consolidatedLoading 
  } = useGetConsolidatedReport(reportType === 'consolidated' ? {
    startDate: dateRange[0].format('YYYY-MM-DD'),
    endDate: dateRange[1].format('YYYY-MM-DD')
  } : {});

  // Export functionality - not yet implemented
  // const exportCSVMutation = useExportDailyReportCSV();
  // const exportPDFMutation = useExportDailyReportPDF();

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const params = {
        branchId: selectedBranch === 'all' ? undefined : selectedBranch,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      };

      if (format === 'excel') {
        await exportCSVMutation.mutateAsync(params);
        message.success('Excel export started. File will download shortly.');
      } else {
        await exportPDFMutation.mutateAsync(params);
        message.success('PDF export started. File will download shortly.');
      }
    } catch {
      message.error(`Failed to export ${format} report`);
    }
  };

  const isLoading = dailyLoading || monthlyLoading || consolidatedLoading;
  // const exportLoading = exportCSVMutation.isPending || exportPDFMutation.isPending;

  // Get current report data based on type
  const getCurrentReportData = () => {
    switch (reportType) {
      case 'daily':
        return dailyReports?.data?.report?.branchSummaries || [];
      case 'monthly':
        return monthlyReport?.data?.report?.branchSummaries || [];
      case 'consolidated':
        return consolidatedReport?.data?.report?.branchSummaries || [];
      default:
        return [];
    }
  };

  const reportData = getCurrentReportData();
  const branches = branchesData?.data?.branches || [];

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
          <strong>{record.branchName || 'N/A'}</strong>
          <br />
          <Text type="secondary">{record.branchId}</Text>
        </div>
      )
    },
    {
      title: 'Collections',
      key: 'collections',
      render: (_: unknown, record: DailyReport) => {
        const savings = record.cashbook1?.savings || 0;
        const loanCollection = record.cashbook1?.loanCollection || 0;
        const total = savings + loanCollection;
        return calculations.formatCurrency(total);
      }
    },
    {
      title: 'Disbursements',
      key: 'disbursements',
      render: (_: unknown, record: DailyReport) => {
        const disAmt = record.cashbook2?.disAmt || 0;
        return calculations.formatCurrency(disAmt);
      }
    },
    {
      title: 'Online CIH',
      key: 'onlineCIH',
      render: (_: unknown, record: DailyReport) => {
        const onlineCIH = record.calculations?.onlineCIH || 0;
        return (
          <Tag color={onlineCIH >= 0 ? 'green' : 'red'}>
            {calculations.formatCurrency(onlineCIH)}
          </Tag>
        );
      }
    },
    {
      title: 'Transfer to Senate',
      key: 'transferToSenate',
      render: (_: unknown, record: DailyReport) => {
        const tso = record.calculations?.transferToSenate || 0;
        return calculations.formatCurrency(tso);
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, record: DailyReport & { status?: string }) => {
        const status = record.status || 'complete';
        const color = status === 'complete' ? 'green' : status === 'pending' ? 'orange' : 'red';
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
      }
    }
  ];

  interface TotalStats {
    totalCollections: number;
    totalDisbursements: number;
    totalOnlineCIH: number;
    totalTransferToSenate: number;
  }

  const totalStats = reportData.reduce((acc: TotalStats, report: DailyReport) => {
    const savings = report.cashbook1?.savings || 0;
    const loanCollection = report.cashbook1?.loanCollection || 0;
    const disbursements = report.cashbook2?.disAmt || 0;
    const onlineCIH = report.calculations?.onlineCIH || 0;
    const tso = report.calculations?.transferToSenate || 0;

    return {
      totalCollections: acc.totalCollections + savings + loanCollection,
      totalDisbursements: acc.totalDisbursements + disbursements,
      totalOnlineCIH: acc.totalOnlineCIH + onlineCIH,
      totalTransferToSenate: acc.totalTransferToSenate + tso
    };
  }, {
    totalCollections: 0,
    totalDisbursements: 0,
    totalOnlineCIH: 0,
    totalTransferToSenate: 0
  } as TotalStats);

  const { Title, Text } = Typography;
  const { RangePicker } = DatePicker;

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
              loading={exportLoading}
              onClick={() => handleExport('excel')}
            >
              Export Excel
            </Button>
            <Button 
              icon={<ExportOutlined />}
              loading={exportLoading}
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
                  loading={!branches.length}
                >
                  <Select.Option value="all">All Branches</Select.Option>
                  {branches.map((branch) => (
                    <Select.Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Select.Option>
                  ))}
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
              {reportData.length} record(s) found
            </Text>
          }
          loading={isLoading}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>Loading reports...</p>
            </div>
          ) : (
            <Table
              columns={reportColumns}
              dataSource={reportData}
              rowKey={(record: DailyReport) => `${record.branchId}-${record.date}`}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          )}
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