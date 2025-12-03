import React, { useEffect, useState } from 'react';
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
  Spin
} from 'antd';
import { toast } from 'sonner';
import { 
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CalendarOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { calculations } from '../utils/calculations';
import {
  useGetConsolidatedReport,
  type ConsolidatedDaum,
  type GrandTotals,
  type CurrentRegister,
  type ReportData
} from '../hooks/Reports/useGetConsolidatedReport';
import {
  useListBranches
} from '../hooks/Branches/useListBranches';
import type { Branch } from '../types';

dayjs.extend(isBetween);

export const ReportsComponent: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get branches for filter
  const { data: branchesData } = useListBranches();
  
  // Get consolidated report
  const { 
    data: consolidatedReport, 
    isLoading: consolidatedLoading,
    refetch: refetchReport 
  } = useGetConsolidatedReport({
    startDate: dateRange[0].format('YYYY-MM-DD'),
    endDate: dateRange[1].format('YYYY-MM-DD')
  });

  // Extract report data
  const reportData: ReportData | undefined = consolidatedReport?.data?.reportData;
  const consolidatedData: ConsolidatedDaum[] = reportData?.consolidatedData || [];
  const grandTotals: GrandTotals | undefined = reportData?.grandTotals;
  const currentRegisters: CurrentRegister[] = reportData?.currentRegisters || [];
  const branches = branchesData?.data?.branches || [];

  const handleRefresh = async () => {
    toast.info('Refreshing consolidated report data...');
    try {
      await refetchReport();
      const periodText = dateRange[0].format('MMM DD') + ' - ' + dateRange[1].format('MMM DD, YYYY');
      toast.success(`Consolidated report data for ${periodText} loaded successfully`);
    } catch (error) {
      toast.error('Failed to refresh consolidated report data');
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        format: format
      };

      if (format === 'excel') {
        // Call the consolidated report endpoint with format=excel
        const response = await fetch(`/api/reports/consolidated?${new URLSearchParams(params)}`);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `consolidated-report-${dateRange[0].format('YYYY-MM-DD')}-to-${dateRange[1].format('YYYY-MM-DD')}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success('Excel export downloaded successfully.');
        } else {
          throw new Error('Export failed');
        }
      } 
    } catch {
      toast.error(`Failed to export ${format} report`);
    } finally {
      setExportLoading(false);
    }
  };

  const isLoading = consolidatedLoading;
  const [exportLoading, setExportLoading] = useState(false);

  // Consolidated report columns with comprehensive data
  const consolidatedColumns = [
    {
      title: 'Branch',
      key: 'branch',
      fixed: 'left' as const,
      width: 200,
      render: (_: unknown, record: ConsolidatedDaum) => (
        <div>
          <strong>{record.branchName}</strong>
          <br />
          <Text type="secondary">{record.branchCode}</Text>
        </div>
      )
    },
    {
      title: 'Operating Days',
      dataIndex: 'operatingDays',
      key: 'operatingDays',
      width: 120,
      render: (days: number) => (
        <Tag color="blue">{days} days</Tag>
      )
    },
    {
      title: 'Collections',
      children: [
        {
          title: 'Savings',
          dataIndex: 'totalSavings',
          key: 'totalSavings',
          render: (value: number) => (
            <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>
              {calculations.formatCurrency(value)}
            </span>
          )
        },
        {
          title: 'Loan Collection',
          dataIndex: 'totalLoanCollection',
          key: 'totalLoanCollection',
          render: (value: number) => (
            <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>
              {calculations.formatCurrency(value)}
            </span>
          )
        },
        {
          title: 'Charges',
          dataIndex: 'totalCharges',
          key: 'totalCharges',
          render: (value: number) => (
            <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>
              {calculations.formatCurrency(value)}
            </span>
          )
        }
      ]
    },
    {
      title: 'Disbursements',
      dataIndex: 'totalDisbursements',
      key: 'totalDisbursements',
      render: (value: number) => (
        <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>
          {calculations.formatCurrency(value)}
        </span>
      )
    },
    {
      title: 'Withdrawals',
      dataIndex: 'totalWithdrawals',
      key: 'totalWithdrawals',
      render: (value: number) => (
        <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>
          {calculations.formatCurrency(value)}
        </span>
      )
    },
    {
      title: 'TSO',
      dataIndex: 'totalTSO',
      key: 'totalTSO',
      render: (value: number) => (
        <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500' }}>
          {calculations.formatCurrency(value)}
        </span>
      )
    },
    {
      title: 'Avg Online CIH',
      dataIndex: 'avgOnlineCIH',
      key: 'avgOnlineCIH',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'green' : 'red'} style={{ fontSize: isMobile ? '12px' : '14px' }}>
          {calculations.formatCurrency(value)}
        </Tag>
      )
    },
    {
      title: 'Last Operation',
      dataIndex: 'lastOperationDate',
      key: 'lastOperationDate',
      render: (date: string) => (
        <Text type="secondary">
          {dayjs(date).format('MMM DD, YYYY')}
        </Text>
      )
    }
  ];

  // Current Registers columns
  const registersColumns = [
    {
      title: 'Branch',
      key: 'branch',
      render: (_: unknown, record: CurrentRegister) => (
        <div>
          <strong>{record.name}</strong>
          <br />
          <Text type="secondary">{record.code}</Text>
        </div>
      )
    },
    {
      title: 'Current Loan Balance',
      dataIndex: 'currentLoanBalance',
      key: 'currentLoanBalance',
      render: (value: number) => (
        <Text strong style={{ color: '#722ed1', fontSize: isMobile ? '14px' : '16px' }}>
          {calculations.formatCurrency(value)}
        </Text>
      )
    },
    {
      title: 'Current Savings Balance',
      dataIndex: 'currentSavingsBalance',
      key: 'currentSavingsBalance',
      render: (value: number) => (
        <Text strong style={{ color: '#3f8600', fontSize: isMobile ? '14px' : '16px' }}>
          {calculations.formatCurrency(value)}
        </Text>
      )
    }
  ];

  interface TotalStats {
    totalCollections: number;
    totalDisbursements: number;
    totalOnlineCIH: number;
    totalTransferToSenate: number;
    totalCharges: number;
    totalWithdrawals: number;
    activeBranches: number;
    totalOperations: number;
  }

  // Get totals from backend grandTotals
  const getTotalStats = (): TotalStats => {
    if (grandTotals) {
      return {
        totalCollections: grandTotals.totalSavings + grandTotals.totalLoanCollection,
        totalDisbursements: grandTotals.totalDisbursements,
        totalOnlineCIH: grandTotals.totalOnlineCIH,
        totalTransferToSenate: grandTotals.totalTSO,
        totalCharges: grandTotals.totalCharges,
        totalWithdrawals: grandTotals.totalWithdrawals,
        activeBranches: grandTotals.activeBranches.length,
        totalOperations: grandTotals.totalOperations
      };
    }
    
    // Fallback to zero values
    return {
      totalCollections: 0,
      totalDisbursements: 0,
      totalOnlineCIH: 0,
      totalTransferToSenate: 0,
      totalCharges: 0,
      totalWithdrawals: 0,
      activeBranches: 0,
      totalOperations: 0
    };
  };

  const totalStats = getTotalStats();

  const { Title, Text } = Typography;
  const { RangePicker } = DatePicker;

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        }}>
          <div>
            <Title level={4} style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '8px' }}>
              <FileTextOutlined /> Financial Reports
            </Title>
            <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
              Comprehensive financial overview across all branches for {reportData?.period ? 
                `${dayjs(reportData.period.startDate).format('MMM DD')} - ${dayjs(reportData.period.endDate).format('MMM DD, YYYY')}` : 
                'selected period'
              }
            </Text>
          </div>
          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              loading={exportLoading}
              onClick={() => handleExport('excel')}
              size={isMobile ? 'small' : 'middle'}
              block={isMobile}
            >
              Export Excel
            </Button>
            {/* <Button 
              icon={<ExportOutlined />}
              loading={exportLoading}
              onClick={() => handleExport('pdf')}
              size={isMobile ? 'small' : 'middle'}
              block={isMobile}
            >
              Export PDF
            </Button> */}
          </Space>
        </div>

        {/* Filters */}
        <Card size="small">
          <Row gutter={16} align="middle">
            <Col>
              <Space>
                <Text strong>Date Range:</Text>
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
            <Col>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={consolidatedLoading}
              >
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Collections"
                value={totalStats.totalCollections}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#3f8600',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Savings + Loan Collections
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Disbursements"
                value={totalStats.totalDisbursements}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#722ed1',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Loan disbursements
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Net Online CIH"
                value={totalStats.totalOnlineCIH}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: totalStats.totalOnlineCIH >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Cash in hand across branches
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total TSO"
                value={totalStats.totalTransferToSenate}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#1890ff',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Transfers to senate
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Additional Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Charges"
                value={totalStats.totalCharges}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#fa8c16',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Withdrawals"
                value={totalStats.totalWithdrawals}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: '#ff4d4f',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Active Branches"
                value={totalStats.activeBranches}
                valueStyle={{ 
                  color: '#52c41a',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Operating branches
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Total Operations"
                value={totalStats.totalOperations}
                valueStyle={{ 
                  color: '#13c2c2',
                  fontSize: isMobile ? '18px' : '24px'
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Total transactions
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Branch Operations Table */}
        <Card 
          title="Branch Operations Summary"
          extra={
            <Space>
              <Text type="secondary">
                {consolidatedData.length} branches • Generated {reportData?.generatedAt ? dayjs(reportData.generatedAt).fromNow() : ''}
              </Text>
            </Space>
          }
          loading={isLoading}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>Loading consolidated report...</p>
            </div>
          ) : (
            <Table
              columns={consolidatedColumns}
              dataSource={consolidatedData}
              rowKey="_id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: isMobile ? 1000 : 1200 }}
              size="small"
              style={isMobile ? { overflowX: 'auto' } : {}}
            />
          )}
        </Card>

        {/* Current Registers */}
        {currentRegisters.length > 0 && (
          <Card 
            title="Current Branch Registers"
            extra={
              <Text type="secondary">
                Current loan and savings balances
              </Text>
            }
          >
            <Table
              columns={registersColumns}
              dataSource={currentRegisters}
              rowKey="_id"
              pagination={false}
              scroll={{ x: isMobile ? 600 : 'auto' }}
              size="small"
              style={isMobile ? { overflowX: 'auto' } : {}}
            />
          </Card>
        )}

        {/* Export Information */}
        <Alert
          message="Export Information"
          description={
            <Space direction="vertical">
              <Text>• Excel export includes detailed calculations and formulas</Text>
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