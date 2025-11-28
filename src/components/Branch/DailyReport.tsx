import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  DatePicker, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Alert, 
  Spin,
  Divider,
  Tag,
  Statistic,
  notification,
  Table,
  Descriptions,
  Badge
} from 'antd';
import { 
  CalendarOutlined, 
  FileTextOutlined, 
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UserOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { 
  useGetBranchReport, 
  type Operation,
  isDailyReportResponse,
  isMonthlyReportResponse
} from '../../hooks/Branch/Reports/useGetBranchReport'
import { useGetMe } from '../../hooks/Auth/useGetMe';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const DailyReport = () => {
    const { data: CurrentUser } = useGetMe();
    
    // Form state
    const [reportType, setReportType] = useState<string>('daily');
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    
    // Query state
    const [shouldFetch, setShouldFetch] = useState(false);

    const { data: reportData, isLoading, error, refetch } = useGetBranchReport(
        CurrentUser?.data?.branchId || '',
        reportType,
        reportType === 'daily' ? selectedDate : undefined,
        reportType === 'monthly' ? selectedYear : undefined,
        reportType === 'monthly' ? selectedMonth : undefined
    );

    useEffect(() => {
        if (reportData) {
            console.log('Report Data:', reportData);
            notification.success({
                message: 'Report Generated',
                description: `The ${reportType} report has been generated successfully.`,
                duration: 3,
            });
        }
    }, [reportData]);

    useEffect(() => {
        if (error) {
            console.error('Error fetching report:', error);
        }
    }, [error]);

    const handleGenerateReport = () => {
        setShouldFetch(true);
        refetch();
    };

    const handleReportTypeChange = (value: string) => {
        setReportType(value);
        setShouldFetch(false);
    };

    const handleDateChange = (date: any) => {
        if (date) {
            setSelectedDate(date.format('YYYY-MM-DD'));
        }
    };

    const handleMonthChange = (date: any) => {
        if (date) {
            setSelectedMonth((date.month() + 1).toString());
            setSelectedYear(date.year().toString());
        }
    };

    // const currentMonth = dayjs().format('MMMM YYYY');
    // const currentDate = dayjs().format('MMMM DD, YYYY');

    return (
        <div className="page-container">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div>
                    <Title level={3}>
                        <FileTextOutlined /> Branch Reports
                    </Title>
                    <Text type="secondary">
                        Generate and view daily or monthly branch reports
                    </Text>
                </div>

                {/* Report Configuration */}
                <Card title="Report Configuration" className="shadow-sm">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={8} lg={6}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text strong>Report Type</Text>
                                <Select
                                    value={reportType}
                                    onChange={handleReportTypeChange}
                                    style={{ width: '100%' }}
                                    size="large"
                                >
                                    <Option value="daily">Daily Report</Option>
                                    <Option value="monthly">Monthly Report</Option>
                                </Select>
                            </Space>
                        </Col>

                        {reportType === 'daily' ? (
                            <Col xs={24} sm={8} lg={6}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text strong>Select Date</Text>
                                    <DatePicker
                                        value={dayjs(selectedDate)}
                                        onChange={handleDateChange}
                                        style={{ width: '100%' }}
                                        size="large"
                                        format="YYYY-MM-DD"
                                        placeholder="Select date"
                                    />
                                </Space>
                            </Col>
                        ) : (
                            <Col xs={24} sm={8} lg={6}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text strong>Select Month & Year</Text>
                                    <DatePicker
                                        value={dayjs().month(parseInt(selectedMonth) - 1).year(parseInt(selectedYear))}
                                        onChange={handleMonthChange}
                                        picker="month"
                                        style={{ width: '100%' }}
                                        size="large"
                                        format="MMMM YYYY"
                                        placeholder="Select month"
                                    />
                                </Space>
                            </Col>
                        )}

                        <Col xs={24} sm={8} lg={6}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text strong>Actions</Text>
                                <Space style={{ width: '100%' }}>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleGenerateReport}
                                        loading={isLoading}
                                        size="large"
                                    >
                                        Generate Report
                                    </Button>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={() => refetch()}
                                        disabled={!reportData}
                                        size="large"
                                    >
                                        Refresh
                                    </Button>
                                </Space>
                            </Space>
                        </Col>

                        <Col xs={24} sm={24} lg={6}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text strong>Quick Actions</Text>
                                <Space style={{ width: '100%' }}>
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            setReportType('daily');
                                            setSelectedDate(new Date().toISOString().split("T")[0]);
                                            setShouldFetch(true);
                                            refetch();
                                        }}
                                        size="large"
                                    >
                                        Today's Report
                                    </Button>
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            setReportType('monthly');
                                            setSelectedMonth((new Date().getMonth() + 1).toString());
                                            setSelectedYear(new Date().getFullYear().toString());
                                            setShouldFetch(true);
                                            refetch();
                                        }}
                                        size="large"
                                    >
                                        This Month
                                    </Button>
                                </Space>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Report Status */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card size="small">
                            <Statistic
                                title="Report Type"
                                value={reportType === 'daily' ? 'Daily' : 'Monthly'}
                                prefix={<FileTextOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card size="small">
                            <Statistic
                                title="Selected Period"
                                value={reportType === 'daily' 
                                    ? dayjs(selectedDate).format('MMM DD, YYYY')
                                    : `${dayjs().month(parseInt(selectedMonth) - 1).format('MMMM')} ${selectedYear}`
                                }
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card size="small">
                            <Statistic
                                title="Status"
                                value={isLoading ? 'Loading...' : error ? 'Error' : reportData ? 'Ready' : 'No Data'}
                                valueStyle={{
                                    color: isLoading ? '#1890ff' : error ? '#ff4d4f' : reportData ? '#52c41a' : '#faad14'
                                }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Loading State */}
                {isLoading && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16 }}>
                                <Text>Generating {reportType} report...</Text>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <Alert
                        message="Error Loading Report"
                        description={`Failed to load ${reportType} report. Please check your connection and try again.`}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" type="primary" onClick={() => refetch()}>
                                Retry
                            </Button>
                        }
                    />
                )}

                {/* Success State - Display Actual Report Data */}
                {reportData && !isLoading && !error && (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Report Header */}
                        <Card 
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        {reportType === 'daily' 
                                            ? `Daily Report - ${dayjs(selectedDate).format('MMM DD, YYYY')}`
                                            : `Monthly Report - ${dayjs().month(parseInt(selectedMonth) - 1).format('MMMM')} ${selectedYear}`
                                        }
                                    </span>
                                    <Space>
                                        <Tag color="green">Generated</Tag>
                                        <Button 
                                            icon={<DownloadOutlined />} 
                                            type="primary"
                                            size="small"
                                        >
                                            Export
                                        </Button>
                                    </Space>
                                </div>
                            }
                            className="shadow-sm"
                        >
                            {reportType === 'daily' ? (
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="Report Date">
                                        {dayjs(reportData.data.reportData.reportDate).format('MMMM DD, YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Generated At">
                                        {dayjs(reportData.data?.reportData.generatedAt).format('MMMM DD, YYYY HH:mm:ss')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Generated By">
                                        <Space>
                                            <UserOutlined />
                                            {reportData.data?.reportData.generatedBy}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Operations">
                                        <Badge count={reportData.data.reportData.operations.length} color="#52c41a" />
                                    </Descriptions.Item>
                                </Descriptions>
                            ) : (
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="Report Period">
                                        {isMonthlyReportResponse(reportData) && dayjs().month(reportData.data.month - 1).year(reportData.data.year).format('MMMM YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Generated At">
                                        {isMonthlyReportResponse(reportData) && dayjs(reportData.data.generatedAt).format('MMMM DD, YYYY HH:mm:ss')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Generated By">
                                        <Space>
                                            <UserOutlined />
                                            {isMonthlyReportResponse(reportData) && reportData.data.generatedBy}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total Branches">
                                        <Badge count={isMonthlyReportResponse(reportData) ? reportData.data.monthlySummary?.length || 0 : 0} color="#52c41a" />
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                        </Card>

                        {/* Daily Operations or Monthly Summary */}
                        {reportType === 'daily' ? (
                            /* Daily Operations Summary */
                            isDailyReportResponse(reportData) && reportData.data.reportData.operations.map((operation: Operation, index: number) => (
                                <Card 
                                    key={index}
                                    title={
                                        <Space>
                                            <BankOutlined />
                                            <Text strong>{operation.branch.name} ({operation.branch.code})</Text>
                                            <Tag color={operation.status.isCompleted ? 'green' : 'orange'}>
                                                {operation.status.isCompleted ? 'Completed' : 'In Progress'}
                                            </Tag>
                                        </Space>
                                    }
                                    extra={
                                        <Space>
                                            <UserOutlined />
                                            <Text type="secondary">{operation.user.name}</Text>
                                        </Space>
                                    }
                                    className="shadow-sm"
                                >
                                            {/* Key Metrics Row */}
                                            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                                                <Col xs={12} sm={6}>
                                                    <Statistic
                                                        title="Online CIH"
                                                        value={operation.calculated.onlineCIH}
                                                        precision={2}
                                                        prefix="₦"
                                                        valueStyle={{ 
                                                            color: operation.calculated.onlineCIH >= 0 ? '#3f8600' : '#cf1322',
                                                            fontSize: '16px'
                                                        }}
                                                    />
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <Statistic
                                                        title="TSO"
                                                        value={operation.calculated.tso}
                                                        precision={2}
                                                        prefix="₦"
                                                        valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                                                    />
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <Statistic
                                                        title="CB Total 1"
                                                        value={operation.cashbook1.cbTotal1}
                                                        precision={2}
                                                        prefix="₦"
                                                        valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                                                    />
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <Statistic
                                                        title="CB Total 2"
                                                        value={operation.cashbook2.cbTotal2}
                                                        precision={2}
                                                        prefix="₦"
                                                        valueStyle={{ color: '#fa8c16', fontSize: '16px' }}
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Detailed Breakdown */}
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} lg={12}>
                                                    <Card type="inner" title="Cashbook 1 - Collections" size="small">
                                                        <Row gutter={[8, 8]}>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Previous CIH"
                                                                    value={operation.cashbook1.pcih}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Savings"
                                                                    value={operation.cashbook1.savings}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Loan Collection"
                                                                    value={operation.cashbook1.loanCollection}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Charges Collection"
                                                                    value={operation.cashbook1.chargesCollection}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="From HO"
                                                                    value={operation.cashbook1.frmHO}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="From BR"
                                                                    value={operation.cashbook1.frmBR}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </Col>

                                                <Col xs={24} lg={12}>
                                                    <Card type="inner" title="Cashbook 2 - Disbursements" size="small">
                                                        <Row gutter={[8, 8]}>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Disbursement No."
                                                                    value={operation.cashbook2.disNo}
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Disbursement Amt"
                                                                    value={operation.cashbook2.disAmt}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Savings Withdrawal"
                                                                    value={operation.cashbook2.savWith}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    // size="small"
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="DOMI Bank"
                                                                    value={operation.cashbook2.domiBank}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    
                                                                />
                                                            </Col>
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="POS/Transfer"
                                                                    value={operation.cashbook2.posT}
                                                                    precision={2}
                                                                    prefix="₦"
                                                                    
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            <Divider />

                                            {/* Additional Information Row */}
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={8}>
                                                    <Card type="inner" title="Prediction" size="small">
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Text>Prediction No:</Text>
                                                                <Text strong>{operation.prediction.predictionNo}</Text>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Text>Amount:</Text>
                                                                <Text strong>₦{operation.prediction.predictionAmount.toLocaleString()}</Text>
                                                            </div>
                                                        </Space>
                                                    </Card>
                                                </Col>

                                                <Col xs={24} sm={8}>
                                                    <Card type="inner" title="Bank Statements" size="small">
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Text>BS1 Total:</Text>
                                                                <Text strong>₦{operation.bankStatements.bs1Total.toLocaleString()}</Text>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Text>BS2 Total:</Text>
                                                                <Text strong>₦{operation.bankStatements.bs2Total.toLocaleString()}</Text>
                                                            </div>
                                                        </Space>
                                                    </Card>
                                                </Col>

                                                <Col xs={24} sm={8}>
                                                    <Card type="inner" title="Current Registers" size="small">
                                                        <Space direction="vertical" style={{ width: '100%' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Text>Loan Balance:</Text>
                                                                <Text strong style={{ color: '#722ed1' }}>
                                                                    ₦{operation.registers.currentLoanBalance.toLocaleString()}
                                                                </Text>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Text>Savings:</Text>
                                                                <Text strong style={{ color: '#52c41a' }}>
                                                                    ₦{operation.registers.currentSavings.toLocaleString()}
                                                                </Text>
                                                            </div>
                                                        </Space>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            {/* Status Information */}
                                            {operation.status.isCompleted && (
                                                <Alert
                                                    message={
                                                        <Space>
                                                            <CheckCircleOutlined />
                                                            <Text strong>Operation Completed</Text>
                                                        </Space>
                                                    }
                                                    description={`Submitted on ${dayjs(operation.status.submittedAt).format('MMMM DD, YYYY HH:mm:ss')}`}
                                                    type="success"
                                                    style={{ marginTop: 16 }}
                                                />
                                            )}

                                            {!operation.status.isCompleted && (
                                                <Alert
                                                    message={
                                                        <Space>
                                                            <ClockCircleOutlined />
                                                            <Text strong>Operation In Progress</Text>
                                                        </Space>
                                                    }
                                                    description="This operation has not been completed yet."
                                                    type="warning"
                                                    style={{ marginTop: 16 }}
                                                />
                                            )}
                                </Card>
                            ))
                        ) : (
                            /* Monthly Report Summary */
                            <>
                                {/* Monthly Summary Table */}
                                <Card title="Monthly Branch Summary" className="shadow-sm">
                                    <Table
                                        dataSource={isMonthlyReportResponse(reportData) ? reportData.data.monthlySummary : []}
                                        pagination={false}
                                        scroll={{ x: 1200 }}
                                        size="small"
                                        rowKey="branchId"
                                        columns={[
                                            {
                                                title: 'Branch',
                                                dataIndex: 'branchName',
                                                key: 'branchName',
                                                render: (text: string, record: any) => (
                                                    <Space>
                                                        <BankOutlined />
                                                        <div>
                                                            <Text strong>{text}</Text>
                                                            <br />
                                                            <Text type="secondary" >{record.branchCode}</Text>
                                                        </div>
                                                    </Space>
                                                ),
                                                fixed: 'left',
                                                width: 150
                                            },
                                            {
                                                title: 'Total Savings',
                                                dataIndex: 'totalSavings',
                                                key: 'totalSavings',
                                                render: (value: number) => (
                                                    <Text style={{ color: '#52c41a' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Loan Collection',
                                                dataIndex: 'totalLoanCollection',
                                                key: 'totalLoanCollection',
                                                render: (value: number) => (
                                                    <Text style={{ color: '#722ed1' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Total Charges',
                                                dataIndex: 'totalCharges',
                                                key: 'totalCharges',
                                                render: (value: number) => (
                                                    <Text style={{ color: '#fa8c16' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Total Disbursements',
                                                dataIndex: 'totalDisbursements',
                                                key: 'totalDisbursements',
                                                render: (value: number) => (
                                                    <Text style={{ color: '#1890ff' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Total Withdrawals',
                                                dataIndex: 'totalWithdrawals',
                                                key: 'totalWithdrawals',
                                                render: (value: number) => (
                                                    <Text style={{ color: '#f50' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Total TSO',
                                                dataIndex: 'totalTSO',
                                                key: 'totalTSO',
                                                render: (value: number) => (
                                                    <Text strong style={{ color: '#13c2c2' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Operating Days',
                                                dataIndex: 'operatingDays',
                                                key: 'operatingDays',
                                                render: (value: number) => (
                                                    <Badge count={value} color="#108ee9" />
                                                ),
                                                align: 'center'
                                            },
                                            {
                                                title: 'Avg Online CIH',
                                                dataIndex: 'avgOnlineCIH',
                                                key: 'avgOnlineCIH',
                                                render: (value: number) => (
                                                    <Text style={{ color: value >= 0 ? '#52c41a' : '#f50' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            }
                                        ]}
                                    />
                                </Card>

                                {/* Disbursement Rolls */}
                                <Card title="Disbursement Roll Summary" className="shadow-sm">
                                    <Table
                                        dataSource={isMonthlyReportResponse(reportData) ? reportData.data.disbursementRolls : []}
                                        pagination={false}
                                        size="small"
                                        rowKey="_id"
                                        columns={[
                                            {
                                                title: 'Branch',
                                                dataIndex: 'branch',
                                                key: 'branch',
                                                render: (branch: any) => (
                                                    <Space>
                                                        <BankOutlined />
                                                        <div>
                                                            <Text strong>{branch.name}</Text>
                                                            <br />
                                                            <Text type="secondary" >{branch.code}</Text>
                                                        </div>
                                                    </Space>
                                                ),
                                                width: 200
                                            },
                                            {
                                                title: 'Previous Disbursement',
                                                dataIndex: 'previousDisbursement',
                                                key: 'previousDisbursement',
                                                render: (value: number) => (
                                                    <Text>₦{value.toLocaleString()}</Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Daily Disbursement',
                                                dataIndex: 'dailyDisbursement',
                                                key: 'dailyDisbursement',
                                                render: (value: number) => (
                                                    <Text style={{ color: '#1890ff' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Disbursement Roll',
                                                dataIndex: 'disbursementRoll',
                                                key: 'disbursementRoll',
                                                render: (value: number) => (
                                                    <Text strong style={{ color: '#722ed1' }}>
                                                        ₦{value.toLocaleString()}
                                                    </Text>
                                                ),
                                                align: 'right'
                                            },
                                            {
                                                title: 'Updated',
                                                dataIndex: 'updatedAt',
                                                key: 'updatedAt',
                                                render: (date: string) => (
                                                    <Text type="secondary">
                                                        {dayjs(date).format('MMM DD, YYYY')}
                                                    </Text>
                                                ),
                                                align: 'center'
                                            }
                                        ]}
                                    />
                                </Card>

                                {/* Register Movements */}
                                <Card title="Register Movement Summary" className="shadow-sm">
                                    <Table
                                        dataSource={isMonthlyReportResponse(reportData) ? reportData.data.registerMovement : []}
                                        pagination={false}
                                        size="small"
                                        rowKey="branchId"
                                        columns={[
                                            {
                                                title: 'Branch',
                                                dataIndex: 'branchName',
                                                key: 'branchName',
                                                render: (text: string) => (
                                                    <Space>
                                                        <BankOutlined />
                                                        <Text strong>{text}</Text>
                                                    </Space>
                                                ),
                                                width: 200
                                            },
                                            {
                                                title: 'Loan Balance',
                                                children: [
                                                    {
                                                        title: 'Opening',
                                                        dataIndex: 'openingLoanBalance',
                                                        key: 'openingLoanBalance',
                                                        render: (value: number) => (
                                                            <Text style={{ color: '#722ed1' }}>
                                                                ₦{value.toLocaleString()}
                                                            </Text>
                                                        ),
                                                        align: 'right'
                                                    },
                                                    {
                                                        title: 'Closing',
                                                        dataIndex: 'closingLoanBalance',
                                                        key: 'closingLoanBalance',
                                                        render: (value: number) => (
                                                            <Text strong style={{ color: '#722ed1' }}>
                                                                ₦{value.toLocaleString()}
                                                            </Text>
                                                        ),
                                                        align: 'right'
                                                    }
                                                ]
                                            },
                                            {
                                                title: 'Savings Balance',
                                                children: [
                                                    {
                                                        title: 'Opening',
                                                        dataIndex: 'openingSavingsBalance',
                                                        key: 'openingSavingsBalance',
                                                        render: (value: number) => (
                                                            <Text style={{ color: '#52c41a' }}>
                                                                ₦{value.toLocaleString()}
                                                            </Text>
                                                        ),
                                                        align: 'right'
                                                    },
                                                    {
                                                        title: 'Closing',
                                                        dataIndex: 'closingSavingsBalance',
                                                        key: 'closingSavingsBalance',
                                                        render: (value: number) => (
                                                            <Text strong style={{ color: '#52c41a' }}>
                                                                ₦{value.toLocaleString()}
                                                            </Text>
                                                        ),
                                                        align: 'right'
                                                    }
                                                ]
                                            }
                                        ]}
                                    />
                                </Card>
                            </>
                        )}

                        {/* Additional Report Actions */}
                        <Card title="Report Actions" size="small">
                            <div style={{ textAlign: 'center' }}>
                                <Space>
                                    <Button 
                                        onClick={() => console.log('Report Data:', reportData)}
                                        icon={<SearchOutlined />}
                                    >
                                        View in Console
                                    </Button>
                                    <Button 
                                        onClick={() => refetch()}
                                        icon={<ReloadOutlined />}
                                    >
                                        Refresh Data
                                    </Button>
                                    <Button 
                                        type="dashed"
                                        onClick={() => {
                                            const dataStr = JSON.stringify(reportData, null, 2);
                                            navigator.clipboard.writeText(dataStr);
                                            notification.success({
                                                message: 'Copied to Clipboard',
                                                description: 'Report data has been copied to clipboard.',
                                            });
                                        }}
                                    >
                                        Copy to Clipboard
                                    </Button>
                                    <Button 
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                    >
                                        Download PDF
                                    </Button>
                                </Space>
                            </div>
                        </Card>
                    </Space>
                )}

                {/* No Data State */}
                {!reportData && !isLoading && !error && shouldFetch && (
                    <Card>
                        <Alert
                            message="No Data Found"
                            description={`No ${reportType} report data found for the selected period. Try a different date or check if data exists for this period.`}
                            type="info"
                            showIcon
                        />
                    </Card>
                )}

                {/* Instructions */}
                {!shouldFetch && (
                    <Card title="How to Use" type="inner">
                        <Space direction="vertical" size="small">
                            <Text>1. Select your desired report type: <strong>Daily</strong> or <strong>Monthly</strong></Text>
                            <Text>2. Choose the specific date (for daily) or month/year (for monthly reports)</Text>
                            <Text>3. Click <strong>"Generate Report"</strong> to fetch the data</Text>
                            <Text>4. View the detailed report data in the browser console</Text>
                            <Text type="secondary">
                                💡 Use the "Today's Report" and "This Month" buttons for quick access to current period reports.
                            </Text>
                        </Space>
                    </Card>
                )}
            </Space>
        </div>
    )
}

export default DailyReport
