
import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Statistic,
  Alert,
  Spin,
  Tooltip,
  Badge,
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CalendarOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useGetHOAbiyeReport } from '../../hooks/Head Office/AbiyeHO/useGetHOAbiyeReport';
import { CURRENT_DATE } from '../../lib/utils';
import * as XLSX from 'xlsx';
import './HOAbiyeReport.css';

const { Title, Text } = Typography;

interface AbiyeReportData {
  id: string;
  branchId: string;
  branchName: string;
  disbursementNo: number;
  disbursementAmount: number;
  amountToClients: number;
  ajoWithdrawalAmount: number;
  totalClients: number;
  ldSolvedToday: number;
  clientsThatPaidToday: number;
  ldResolutionMethods: string[];
  totalNoOfNewClientTomorrow: number;
  totalNoOfOldClientTomorrow: number;
  totalPreviousSoOwn: number;
  totalAmountNeeded: number;
  currentLDNo: number;
  reportDate: string;
  submittedAt: string;
  submittedBy: string;
}

const HOAbiyeReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: reportData, isLoading, error, refetch } = useGetHOAbiyeReport({
    startDate: selectedDate,
    endDate: selectedDate
  });

  // Process data for display
  const processedData = useMemo(() => {
    if (!reportData?.data) return [];
    
    return reportData.data.map((item: any, index: number) => ({
      key: item.id || index,
      id: item.id,
      branchId: item.branch?._id,
      branchName: item.branch?.name || `Branch ${item.branchId}`,
      disbursementNo: item.disbursementNo || 0,
      disbursementAmount: item.disbursementAmount || 0,
      amountToClients: item.amountToClients || 0,
      ajoWithdrawalAmount: item.ajoWithdrawalAmount || 0,
      totalClients: item.totalClients || 0,
      ldSolvedToday: item.ldSolvedToday || 0,
      clientsThatPaidToday: item.clientsThatPaidToday || 0,
      ldResolutionMethods: item.ldResolutionMethods || [],
      totalNoOfNewClientTomorrow: item.totalNoOfNewClientTomorrow || 0,
      totalNoOfOldClientTomorrow: item.totalNoOfOldClientTomorrow || 0,
      totalPreviousSoOwn: item.totalPreviousSoOwn || 0,
      totalAmountNeeded: item.totalAmountNeeded || 0,
      currentLDNo: item.currentLDNo || 0,
      reportDate: item.reportDate || CURRENT_DATE,
      submittedAt: item.createdAt || item.submittedAt,
      submittedBy: item.createdBy || item.submittedBy || 'Unknown',
    }));
  }, [reportData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!processedData.length) {
      return {
        totalBranches: 0,
        totalDisbursements: 0,
        totalDisbursementAmount: 0,
        totalAmountToClients: 0,
        totalAjoWithdrawals: 0,
        totalClients: 0,
        totalLdSolved: 0,
        totalClientsPaid: 0,
        totalCurrentLdNo: 0,
        totalNewClientsTomorrow: 0,
        totalOldClientsTomorrow: 0,
        totalPreviousSoOwn: 0,
        totalAmountNeeded: 0,
        paymentRate: 0,
        ldResolutionRate: 0,
      };
    }

    const stats = processedData.reduce(
      (acc, item) => ({
        totalBranches: acc.totalBranches + 1,
        totalDisbursements: acc.totalDisbursements + item.disbursementNo,
        totalDisbursementAmount: acc.totalDisbursementAmount + item.disbursementAmount,
        totalAmountToClients: acc.totalAmountToClients + item.amountToClients,
        totalAjoWithdrawals: acc.totalAjoWithdrawals + item.ajoWithdrawalAmount,
        totalClients: acc.totalClients + item.totalClients,
        totalLdSolved: acc.totalLdSolved + item.ldSolvedToday,
        totalClientsPaid: acc.totalClientsPaid + item.clientsThatPaidToday,
        totalNewClientsTomorrow: acc.totalNewClientsTomorrow + item.totalNoOfNewClientTomorrow,
        totalOldClientsTomorrow: acc.totalOldClientsTomorrow + item.totalNoOfOldClientTomorrow,
        totalPreviousSoOwn: acc.totalPreviousSoOwn + item.totalPreviousSoOwn,
        totalAmountNeeded: acc.totalAmountNeeded + item.totalAmountNeeded,
      }),
      {
        totalBranches: 0,
        totalDisbursements: 0,
        totalDisbursementAmount: 0,
        totalAmountToClients: 0,
        totalAjoWithdrawals: 0,
        totalClients: 0,
        totalLdSolved: 0,
        totalClientsPaid: 0,
        totalNewClientsTomorrow: 0,
        totalOldClientsTomorrow: 0,
        totalPreviousSoOwn: 0,
        totalAmountNeeded: 0,
      }
    );

    return {
      ...stats,
      totalCurrentLdNo: stats.totalClients - stats.totalClientsPaid - stats.totalLdSolved,
      paymentRate: stats.totalClients > 0 ? (stats.totalClientsPaid / stats.totalClients) * 100 : 0,
      ldResolutionRate: stats.totalLdSolved > 0 ? (stats.totalLdSolved / stats.totalBranches) * 100 : 0,
    };
  }, [processedData]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success('Abiye Reports refreshed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to refresh reports');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM-DD');
      setSelectedDate(formattedDate);
      // Hook will automatically refetch with new date parameters
    }
  };

  const handleExportToExcel = () => {
    try {
      const exportData = processedData.map(item => ({
        'Branch Name': item.branchName,
        'Branch ID': item.branchId,
        'Report Date': dayjs(item.reportDate).format('YYYY-MM-DD'),
        'Disbursement No.': item.disbursementNo,
        'Disbursement Amount (₦)': item.disbursementAmount.toLocaleString(),
        'Amount to Clients (₦)': item.amountToClients.toLocaleString(),
        'AJO Withdrawal (₦)': item.ajoWithdrawalAmount.toLocaleString(),
        'Total Clients': item.totalClients,
        'Clients Paid Today': item.clientsThatPaidToday,
        'LD Cases Solved': item.ldSolvedToday,
        'New Clients Tomorrow': item.totalNoOfNewClientTomorrow,
        'Old Clients Tomorrow': item.totalNoOfOldClientTomorrow,
        'Previous S.O Own (₦)': item.totalPreviousSoOwn.toLocaleString(),
        'Amount Needed (₦)': item.totalAmountNeeded.toLocaleString(),
        'Current LD No': item.currentLDNo,
        'Resolution Methods': item.ldResolutionMethods.join(', '),
        'Submitted At': dayjs(item.submittedAt).format('YYYY-MM-DD HH:mm'),
        'Submitted By': item.submittedBy,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Abiye Reports');
      
      const filename = `abiye_reports_${dayjs().format('YYYY_MM_DD')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const columns: ColumnsType<AbiyeReportData> = [
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      fixed: 'left',
      width: 150,
      render: (text: string, record: AbiyeReportData) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.branchId}
          </Text>
        </div>
      ),
    },
    {
      title: 'Report Date',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: AbiyeReportData, b: AbiyeReportData) => 
        dayjs(a.reportDate).unix() - dayjs(b.reportDate).unix(),
    },
    {
      title: 'Disbursement',
      key: 'disbursement',
      width: 150,
      render: (record: AbiyeReportData) => (
        <div>
          <div>No: <Badge count={record.disbursementNo} showZero /></div>
          <div style={{ marginTop: '4px' }}>
            <Text strong>₦{record.disbursementAmount.toLocaleString()}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Amount Distribution',
      key: 'amountDistribution',
      width: 180,
      render: (record: AbiyeReportData) => (
        <div>
          <div>
            <Text type="secondary">To Clients:</Text>
            <br />
            <Text strong>₦{record.amountToClients.toLocaleString()}</Text>
          </div>
          <div style={{ marginTop: '4px' }}>
            <Text type="secondary">AJO Withdrawal:</Text>
            <br />
            <Text strong>₦{record.ajoWithdrawalAmount.toLocaleString()}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Client Metrics',
      key: 'clientMetrics',
      width: 130,
      render: (record: AbiyeReportData) => {
        const paymentRate = record.totalClients > 0 
          ? ((record.clientsThatPaidToday / record.totalClients) * 100).toFixed(1)
          : '0';
        
        return (
          <div>
            <div>Total: <Badge count={record.totalClients} showZero /></div>
            <div style={{ marginTop: '4px' }}>
              Paid: <Badge count={record.clientsThatPaidToday} showZero />
            </div>
            <div style={{ marginTop: '4px' }}>
              <Tag color={parseFloat(paymentRate) >= 80 ? 'green' : parseFloat(paymentRate) >= 50 ? 'orange' : 'red'}>
                {paymentRate}% paid
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: 'LD Resolution',
      key: 'ldResolution',
      width: 130,
      render: (record: AbiyeReportData) => (
        <div>
          <div>
            <Text type="secondary">Cases Solved:</Text>
            <br />
            <Badge count={record.ldSolvedToday} showZero />
          </div>
          <div style={{ marginTop: '4px' }}>
            <Tooltip title={record.ldResolutionMethods.join(', ')}>
              <Tag color="processing">
                {record.ldResolutionMethods.length} methods
              </Tag>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Tomorrow Clients',
      key: 'tomorrowClients',
      width: 140,
      render: (record: AbiyeReportData) => (
        <div>
          <div>
            <Text type="secondary">New:</Text>
            <br />
            <Badge count={record.totalNoOfNewClientTomorrow} showZero />
          </div>
          <div style={{ marginTop: '4px' }}>
            <Text type="secondary">Old:</Text>
            <br />
            <Badge count={record.totalNoOfOldClientTomorrow} showZero />
          </div>
        </div>
      ),
    },
    {
      title: 'Financial Info',
      key: 'financialInfo',
      width: 160,
      render: (record: AbiyeReportData) => (
        <div>
          <div>
            <Text type="secondary">Previous S.O:</Text>
            <br />
            <Text strong>₦{record.totalPreviousSoOwn.toLocaleString()}</Text>
          </div>
          <div style={{ marginTop: '4px' }}>
            <Text type="secondary">Amount Needed:</Text>
            <br />
            <Text strong>₦{record.totalAmountNeeded.toLocaleString()}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Current LD',
      dataIndex: 'currentLDNo',
      key: 'currentLDNo',
      width: 100,
      render: (value: number) => (
        <Badge 
          count={value} 
          showZero 
          style={{ backgroundColor: value > 0 ? '#f5222d' : '#52c41a' }}
        />
      ),
      sorter: (a: AbiyeReportData, b: AbiyeReportData) => a.currentLDNo - b.currentLDNo,
    },
    {
      title: 'Resolution Methods',
      dataIndex: 'ldResolutionMethods',
      key: 'ldResolutionMethods',
      width: 200,
      render: (methods: string[]) => (
        <div>
          {methods.slice(0, 3).map(method => (
            <Tag key={method} style={{ margin: '2px' }}>
              {method}
            </Tag>
          ))}
          {methods.length > 3 && (
            <Tooltip title={methods.slice(3).join(', ')}>
              <Tag style={{ margin: '2px' }}>
                +{methods.length - 3} more
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Submitted',
      key: 'submitted',
      width: 150,
      render: (record: AbiyeReportData) => (
        <div>
          <div>{dayjs(record.submittedAt).format('MMM DD, HH:mm')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            by {record.submittedBy}
          </Text>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <Alert
        message="Error Loading Abiye Reports"
        description={error.message || "Failed to load Abiye reports"}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <Title level={2} style={{ margin: 0 }}>
                Abiye Reports - Head Office Dashboard
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <DatePicker
                value={dayjs(selectedDate)}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                placeholder="Select date"
                allowClear={false}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isRefreshing}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportToExcel}
                disabled={!processedData.length}
              >
                Export to Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Branches Reporting"
              value={summaryStats.totalBranches}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Disbursement Amount"
              value={summaryStats.totalDisbursementAmount}
              prefix="₦"
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Clients"
              value={summaryStats.totalClients}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Payment Rate"
              value={summaryStats.paymentRate}
              suffix="%"
              precision={1}
              valueStyle={{ 
                color: summaryStats.paymentRate >= 80 ? '#3f8600' : 
                       summaryStats.paymentRate >= 50 ? '#fa8c16' : '#cf1322'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Amount to Clients"
              value={summaryStats.totalAmountToClients}
              prefix="₦"
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="AJO Withdrawals"
              value={summaryStats.totalAjoWithdrawals}
              prefix="₦"
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="LD Cases Solved"
              value={summaryStats.totalLdSolved}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Current LD No"
              value={summaryStats.totalCurrentLdNo}
              valueStyle={{ 
                color: summaryStats.totalCurrentLdNo > 0 ? '#cf1322' : '#3f8600'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tomorrow Clients & Financial Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="New Clients Tomorrow"
              value={summaryStats.totalNewClientsTomorrow}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Old Clients Tomorrow"
              value={summaryStats.totalOldClientsTomorrow}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Previous S.O Own"
              value={summaryStats.totalPreviousSoOwn}
              prefix="₦"
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Amount Needed"
              value={summaryStats.totalAmountNeeded}
              prefix="₦"
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Branch Abiye Reports</span>
            <Tag color="blue">{processedData.length} reports</Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={processedData}
          loading={isLoading}
          pagination={{
            total: processedData.length,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} reports`,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 20,
          }}
          scroll={{ x: 1200, y: 600 }}
          size="small"
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      {processedData.length === 0 && !isLoading && (
        <Card style={{ marginTop: '24px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
            <Title level={4} type="secondary">
              No Abiye Reports Available
            </Title>
            <Text type="secondary">
              No branches have submitted Abiye reports yet.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HOAbiyeReport;