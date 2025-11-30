import React, { useState, useMemo } from 'react';
import { 
  Card, 
  DatePicker, 
  Table, 
  Space, 
  Typography, 
  Button, 
  Row, 
  Col,
  Statistic,
  Tag,
  Divider,
  Alert,
  Spin
} from 'antd';
import { 
  FileTextOutlined, 
  BankOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { calculations } from '../../utils/calculations';
import { useListAllDailyOperations, type Operation } from '../../hooks/Operations/useListAllDailyOperations';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import './BranchDailyReportPage.css';

const { Title, Text } = Typography;

// Transform API Operation data to BranchDailyReportData format
interface BranchDailyReportData {
  branchId: string;
  branchName: string;
  date: string;
  cashbook1: {
    pcih: number;
    savings: number;
    loanCollection: number;
    charges: number;
    collectionTotal: number;
    frmHO: number;
    frmBR: number;
    cbTotal1: number;
  };
  cashbook2: {
    disNo: number;
    disAmt: number;
    disWithInt: number;
    savWith: number;
    domiBank: number;
    posT: number;
    cbTotal2: number;
  };
  onlineCIH: number;
  bankStatement1: {
    opening: number;
    recHO: number;
    recBO: number;
    domi: number;
    pa: number;
    bs1Total: number;
  };
  bankStatement2: {
    withd: number;
    tbo: number;
    tboToBranch: string;
    exAmt: number;
    exPurpose: string;
    bs2Total: number;
  };
  tso: number;
  cbrSavings: number;
  cbrLoan: number;
  disbursementRoll: number;
}

const transformOperationToReportData = (operation: Operation): BranchDailyReportData => {
  return {
    branchId: operation.branch._id,
    branchName: operation.branch.name,
    date: operation.date,
    cashbook1: {
      pcih: operation.cashbook1.pcih,
      savings: operation.cashbook1.savings,
      loanCollection: operation.cashbook1.loanCollection,
      charges: operation.cashbook1.chargesCollection,
      collectionTotal: operation.cashbook1.total,
      frmHO: operation.cashbook1.frmHO,
      frmBR: operation.cashbook1.frmBR,
      cbTotal1: operation.cashbook1.cbTotal1,
    },
    cashbook2: {
      disNo: operation.cashbook2.disNo,
      disAmt: operation.cashbook2.disAmt,
      disWithInt: operation.cashbook2.disWithInt,
      savWith: operation.cashbook2.savWith,
      domiBank: operation.cashbook2.domiBank,
      posT: operation.cashbook2.posT,
      cbTotal2: operation.cashbook2.cbTotal2,
    },
    onlineCIH: operation.onlineCIH,
    bankStatement1: {
      opening: operation.bankStatement1.opening,
      recHO: operation.bankStatement1.recHO,
      recBO: operation.bankStatement1.recBO,
      domi: operation.bankStatement1.domi,
      pa: operation.bankStatement1.pa,
      bs1Total: operation.bankStatement1.bs1Total,
    },
    bankStatement2: {
      withd: operation.bankStatement2.withd,
      tbo: operation.bankStatement2.tbo,
      tboToBranch: operation.branch.name, // Using branch name as placeholder
      exAmt: operation.bankStatement2.exAmt,
      exPurpose: operation.bankStatement2.exPurpose,
      bs2Total: operation.bankStatement2.bs2Total,
    },
    tso: operation.tso,
    cbrSavings: operation.savingsRegister.currentSavings,
    cbrLoan: operation.loanRegister.currentLoanBalance,
    disbursementRoll: operation.loanRegister.previousLoanTotal + operation.loanRegister.loanDisbursementWithInterest,
  };
};

export const BranchDailyReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  // Use the API hook
  const { data: operationsData, isLoading, error, refetch } = useListAllDailyOperations(
    selectedDate.format('YYYY-MM-DD')
  );

  // Transform API data to report format
  const reportData = useMemo(() => {
    if (!operationsData?.data?.operations) return [];
    return operationsData.data.operations.map(transformOperationToReportData);
  }, [operationsData]);

  // Calculate totals
  const totals = useMemo(() => {
    return reportData.reduce((acc, branch) => ({
      cbTotal1: acc.cbTotal1 + branch.cashbook1.cbTotal1,
      cbTotal2: acc.cbTotal2 + branch.cashbook2.cbTotal2,
      onlineCIH: acc.onlineCIH + branch.onlineCIH,
      bs1Total: acc.bs1Total + branch.bankStatement1.bs1Total,
      bs2Total: acc.bs2Total + branch.bankStatement2.bs2Total,
      tso: acc.tso + branch.tso,
      cbrSavings: acc.cbrSavings + branch.cbrSavings,
      cbrLoan: acc.cbrLoan + branch.cbrLoan,
      disbursementRoll: acc.disbursementRoll + branch.disbursementRoll
    }), {
      cbTotal1: 0,
      cbTotal2: 0,
      onlineCIH: 0,
      bs1Total: 0,
      bs2Total: 0,
      tso: 0,
      cbrSavings: 0,
      cbrLoan: 0,
      disbursementRoll: 0
    });
  }, [reportData]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleExportReport = () => {
    if (!reportData.length) return;

    // Prepare data for Excel export
    const exportData = [...reportData, grandTotal].map((row, index) => {
      const isGrandTotal = row.branchId === 'grand-total';
      return {
        'Branch': isGrandTotal ? '🏆 Grand Total' : row.branchName,
        'Date': row.date,
        // Cashbook 1 Data
        'PCIH': row.cashbook1.pcih,
        'Savings': row.cashbook1.savings,
        'Loan Collection': row.cashbook1.loanCollection,
        'Charges': row.cashbook1.charges,
        'Collection Total': row.cashbook1.collectionTotal,
        'FRM HO': row.cashbook1.frmHO,
        'FRM BR': row.cashbook1.frmBR,
        'CB Total 1': row.cashbook1.cbTotal1,
        // Cashbook 2 Data
        'DIS NO': row.cashbook2.disNo,
        'DIS AMT': row.cashbook2.disAmt,
        'DIS WIT INT': row.cashbook2.disWithInt,
        'SAV WITH': row.cashbook2.savWith,
        'DOMI BANK': row.cashbook2.domiBank,
        'POS/T': row.cashbook2.posT,
        'CB Total 2': row.cashbook2.cbTotal2,
        // Online CIH
        'Online CIH': row.onlineCIH,
        // Bank Statement Data
        'Opening': row.bankStatement1.opening,
        'REC HO': row.bankStatement1.recHO,
        'REC BO': row.bankStatement1.recBO,
        'DOMI': row.bankStatement1.domi,
        'PA': row.bankStatement1.pa,
        'BS1 Total': row.bankStatement1.bs1Total,
        'WITHD': row.bankStatement2.withd,
        'TBO': row.bankStatement2.tbo,
        'TBO To Branch': row.bankStatement2.tboToBranch,
        'EX AMT': row.bankStatement2.exAmt,
        'EX Purpose': row.bankStatement2.exPurpose,
        'BS2 Total': row.bankStatement2.bs2Total,
        'TSO': row.tso,
        // Current Branch Register
        'CBR (Savings)': row.cbrSavings,
        'CBR (Loan)': row.cbrLoan,
        'Disbursement Roll': row.disbursementRoll
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Branch
      { wch: 12 }, // Date
      { wch: 12 }, // PCIH
      { wch: 12 }, // Savings
      { wch: 15 }, // Loan Collection
      { wch: 12 }, // Charges
      { wch: 15 }, // Collection Total
      { wch: 12 }, // FRM HO
      { wch: 12 }, // FRM BR
      { wch: 12 }, // CB Total 1
      { wch: 10 }, // DIS NO
      { wch: 12 }, // DIS AMT
      { wch: 12 }, // DIS WIT INT
      { wch: 12 }, // SAV WITH
      { wch: 12 }, // DOMI BANK
      { wch: 10 }, // POS/T
      { wch: 12 }, // CB Total 2
      { wch: 12 }, // Online CIH
      { wch: 12 }, // Opening
      { wch: 12 }, // REC HO
      { wch: 12 }, // REC BO
      { wch: 12 }, // DOMI
      { wch: 10 }, // PA
      { wch: 12 }, // BS1 Total
      { wch: 12 }, // WITHD
      { wch: 10 }, // TBO
      { wch: 15 }, // TBO To Branch
      { wch: 12 }, // EX AMT
      { wch: 20 }, // EX Purpose
      { wch: 12 }, // BS2 Total
      { wch: 12 }, // TSO
      { wch: 15 }, // CBR (Savings)
      { wch: 15 }, // CBR (Loan)
      { wch: 18 }  // Disbursement Roll
    ];

    ws['!cols'] = colWidths;

    // Style the grand total row
    if (exportData.length > 1) {
      const grandTotalRowIndex = exportData.length; // 1-based index for Excel
      // You can add more styling here if needed
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Branch Daily Report');

    // Generate filename with date
    const fileName = `Branch_Daily_Report_${selectedDate.format('YYYY-MM-DD')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);

    console.log('Report exported successfully:', fileName);
  };

  // Calculate Grand Total row
  const calculateGrandTotal = (): BranchDailyReportData => {
    const grandTotal: BranchDailyReportData = {
      branchId: 'grand-total',
      branchName: 'Grand Total',
      date: '',
      cashbook1: {
        pcih: 0,
        savings: 0,
        loanCollection: 0,
        charges: 0,
        collectionTotal: 0,
        frmHO: 0,
        frmBR: 0,
        cbTotal1: 0
      },
      cashbook2: {
        disNo: 0,
        disAmt: 0,
        disWithInt: 0,
        savWith: 0,
        domiBank: 0,
        posT: 0,
        cbTotal2: 0
      },
      onlineCIH: 0,
      bankStatement1: {
        opening: 0,
        recHO: 0,
        recBO: 0,
        domi: 0,
        pa: 0,
        bs1Total: 0
      },
      bankStatement2: {
        withd: 0,
        tbo: 0,
        tboToBranch: '',
        exAmt: 0,
        exPurpose: '',
        bs2Total: 0
      },
      tso: 0,
      cbrSavings: 0,
      cbrLoan: 0,
      disbursementRoll: 0
    };

    // Sum all numeric fields
    reportData.forEach(branch => {
      grandTotal.cashbook1.pcih += branch.cashbook1.pcih;
      grandTotal.cashbook1.savings += branch.cashbook1.savings;
      grandTotal.cashbook1.loanCollection += branch.cashbook1.loanCollection;
      grandTotal.cashbook1.charges += branch.cashbook1.charges;
      grandTotal.cashbook1.collectionTotal += branch.cashbook1.collectionTotal;
      grandTotal.cashbook1.frmHO += branch.cashbook1.frmHO;
      grandTotal.cashbook1.frmBR += branch.cashbook1.frmBR;
      grandTotal.cashbook1.cbTotal1 += branch.cashbook1.cbTotal1;
      
      grandTotal.cashbook2.disNo += branch.cashbook2.disNo;
      grandTotal.cashbook2.disAmt += branch.cashbook2.disAmt;
      grandTotal.cashbook2.disWithInt += branch.cashbook2.disWithInt;
      grandTotal.cashbook2.savWith += branch.cashbook2.savWith;
      grandTotal.cashbook2.domiBank += branch.cashbook2.domiBank;
      grandTotal.cashbook2.posT += branch.cashbook2.posT;
      grandTotal.cashbook2.cbTotal2 += branch.cashbook2.cbTotal2;
      
      grandTotal.onlineCIH += branch.onlineCIH;
      
      grandTotal.bankStatement1.opening += branch.bankStatement1.opening;
      grandTotal.bankStatement1.recHO += branch.bankStatement1.recHO;
      grandTotal.bankStatement1.recBO += branch.bankStatement1.recBO;
      grandTotal.bankStatement1.domi += branch.bankStatement1.domi;
      grandTotal.bankStatement1.pa += branch.bankStatement1.pa;
      grandTotal.bankStatement1.bs1Total += branch.bankStatement1.bs1Total;
      
      grandTotal.bankStatement2.withd += branch.bankStatement2.withd;
      grandTotal.bankStatement2.tbo += branch.bankStatement2.tbo;
      grandTotal.bankStatement2.exAmt += branch.bankStatement2.exAmt;
      grandTotal.bankStatement2.bs2Total += branch.bankStatement2.bs2Total;
      
      grandTotal.tso += branch.tso;
      grandTotal.cbrSavings += branch.cbrSavings;
      grandTotal.cbrLoan += branch.cbrLoan;
      grandTotal.disbursementRoll += branch.disbursementRoll;
    });

    return grandTotal;
  };

  const grandTotal = calculateGrandTotal();

  // Helper function to render currency with grand total styling
  const renderCurrency = (value: number, record: BranchDailyReportData, color?: string) => {
    if (record.branchId === 'grand-total') {
      return (
        <Text strong style={{ 
          color: color || '#1890ff', 
          fontSize: window.innerWidth <= 768 ? '11px' : '13px'
        }}>
          {calculations.formatCurrency(value)}
        </Text>
      );
    }
    return color ? (
      <Text style={{ 
        color, 
        fontWeight: 'bold',
        fontSize: window.innerWidth <= 768 ? '12px' : '14px'
      }}>
        {calculations.formatCurrency(value)}
      </Text>
    ) : (
      <span style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
        {calculations.formatCurrency(value)}
      </span>
    );
  };

  const columns: ColumnsType<BranchDailyReportData> = [
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      fixed: 'left',
      width: 150,
      render: (name: string, record: BranchDailyReportData) => {
        if (record.branchId === 'grand-total') {
          return (
            <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
              🏆 {name}
            </Text>
          );
        }
        return (
          <Space>
            <BankOutlined />
            <Text strong>{name}</Text>
          </Space>
        );
      }
    },
    // Cashbook 1 columns
    {
      title: 'Cashbook 1 Data',
      children: [
        {
          title: 'PCIH',
          dataIndex: ['cashbook1', 'pcih'],
          key: 'pcih',
          render: (value: number, record: BranchDailyReportData) => renderCurrency(value, record)
        },
        {
          title: 'Savings',
          dataIndex: ['cashbook1', 'savings'],
          key: 'savings',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'Loan Collection',
          dataIndex: ['cashbook1', 'loanCollection'],
          key: 'loanCollection',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'Charges',
          dataIndex: ['cashbook1', 'charges'],
          key: 'charges',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'FRM HO',
          dataIndex: ['cashbook1', 'frmHO'],
          key: 'frmHO',
          render: (value: number) => (
            <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
              {calculations.formatCurrency(value)}
            </Text>
          )
        },
        {
          title: 'FRM BR',
          dataIndex: ['cashbook1', 'frmBR'],
          key: 'frmBR',
          render: (value: number) => (
            <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
              {calculations.formatCurrency(value)}
            </Text>
          )
        },
        {
          title: 'CB Total 1',
          dataIndex: ['cashbook1', 'cbTotal1'],
          key: 'cbTotal1',
          render: (value: number) => (
            <Tag color="green">{calculations.formatCurrency(value)}</Tag>
          )
        }
      ]
    },
    // Cashbook 2 columns
    {
      title: 'Cashbook 2 Data',
      children: [
        {
          title: 'DIS NO',
          dataIndex: ['cashbook2', 'disNo'],
          key: 'disNo',
          render: (value: number) => <Text>{value}</Text>
        },
        {
          title: 'DIS AMT',
          dataIndex: ['cashbook2', 'disAmt'],
          key: 'disAmt',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'DIS WIT INT',
          dataIndex: ['cashbook2', 'disWithInt'],
          key: 'disWithInt',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'SAV WITH',
          dataIndex: ['cashbook2', 'savWith'],
          key: 'savWith',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'DOMI BANK',
          dataIndex: ['cashbook2', 'domiBank'],
          key: 'domiBank',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'POS/T',
          dataIndex: ['cashbook2', 'posT'],
          key: 'posT',
          render: (value: number) => calculations.formatCurrency(value)
        },
        {
          title: 'CB Total 2',
          dataIndex: ['cashbook2', 'cbTotal2'],
          key: 'cbTotal2',
          render: (value: number) => (
            <Tag color="orange">{calculations.formatCurrency(value)}</Tag>
          )
        }
      ]
    },
    // Online CIH
    {
      title: 'Online CIH',
      dataIndex: 'onlineCIH',
      key: 'onlineCIH',
      render: (value: number) => (
        <Tag color="purple">{calculations.formatCurrency(value)}</Tag>
      )
    },
    // Bank Statement columns
    {
      title: 'Bank Statement Data',
      children: [
        {
          title: 'BS1 Total',
          dataIndex: ['bankStatement1', 'bs1Total'],
          key: 'bs1Total',
          render: (value: number) => (
            <Tag color="blue">{calculations.formatCurrency(value)}</Tag>
          )
        },
        {
          title: 'BS2 Total',
          dataIndex: ['bankStatement2', 'bs2Total'],
          key: 'bs2Total',
          render: (value: number) => (
            <Tag color="red">{calculations.formatCurrency(value)}</Tag>
          )
        },
        {
          title: 'TSO',
          dataIndex: 'tso',
          key: 'tso',
          render: (value: number) => (
            <Tag color="cyan">{calculations.formatCurrency(value)}</Tag>
          )
        }
      ]
    },
    // Current Branch Register
    {
      title: 'Current Branch Register',
      children: [
        {
          title: 'CBR (Savings)',
          dataIndex: 'cbrSavings',
          key: 'cbrSavings',
          render: (value: number) => (
            <Tag color="geekblue">{calculations.formatCurrency(value)}</Tag>
          )
        },
        {
          title: 'CBR (Loan)',
          dataIndex: 'cbrLoan',
          key: 'cbrLoan',
          render: (value: number) => (
            <Tag color="magenta">{calculations.formatCurrency(value)}</Tag>
          )
        }
      ]
    },
    // Disbursement Roll
    {
      title: 'Disbursement Roll',
      dataIndex: 'disbursementRoll',
      key: 'disbursementRoll',
      render: (value: number) => (
        <Tag color="gold">{calculations.formatCurrency(value)}</Tag>
      )
    }
  ];

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ fontSize: window.innerWidth <= 768 ? '20px' : '28px' }}>
              <FileTextOutlined /> Branch Daily Report
            </Title>
            <Text type="secondary">
              Comprehensive daily performance data across all branches
            </Text>
          </Col>
          <Col>
            <Space>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
              />
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
                disabled={isLoading || !reportData.length}
              >
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error Loading Data"
            description={error.message || 'Failed to load daily operations data'}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: 16 }}>
                Loading daily operations data...
              </Text>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        {!isLoading && !error && (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Online CIH"
                  value={totals.onlineCIH}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#52c41a',
                    fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total TSO"
                  value={totals.tso}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#1890ff',
                    fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total CBR (Savings)"
                  value={totals.cbrSavings}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#722ed1',
                    fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total CBR (Loan)"
                  value={totals.cbrLoan}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: '#fa8c16',
                    fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Divider />

        {/* Main Data Table */}
        {!isLoading && !error && (
          <Card 
            title={
              <Space>
                <DollarOutlined />
                <Text strong>Daily Performance Data - {selectedDate.format('DD MMMM YYYY')}</Text>
              </Space>
            }
            extra={
              <Text type="secondary">
                {reportData.length} Branches Reporting
              </Text>
            }
          >
            {reportData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">
                  No data available for {selectedDate.format('DD MMMM YYYY')}
                </Text>
              </div>
            ) : (
              <div style={{
                overflow: 'auto',
                ...(window.innerWidth <= 768 && {
                  maxWidth: '100%',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px'
                })
              }}>
                <Table
                  columns={columns}
                  dataSource={[...reportData, grandTotal]}
                  rowKey="branchId"
                  scroll={{ x: window.innerWidth <= 768 ? 2200 : 2000 }}
                  pagination={false}
                  size="small"
                  bordered
                  rowClassName={(record) => {
                    if (record.branchId === 'grand-total') {
                      return 'grand-total-row';
                    }
                    return '';
                  }}
                />
              </div>
            )}
          </Card>
        )}

        {/* Summary Footer */}
        {!isLoading && !error && reportData.length > 0 && (
          <Card title="Daily Totals Summary" size="small">
            <Row gutter={[16, 8]}>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>CB Total 1: </Text>
                <Tag color="green">{calculations.formatCurrency(totals.cbTotal1)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>CB Total 2: </Text>
                <Tag color="orange">{calculations.formatCurrency(totals.cbTotal2)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Online CIH: </Text>
                <Tag color="purple">{calculations.formatCurrency(totals.onlineCIH)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>BS1 Total: </Text>
                <Tag color="blue">{calculations.formatCurrency(totals.bs1Total)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>BS2 Total: </Text>
                <Tag color="red">{calculations.formatCurrency(totals.bs2Total)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>TSO Total: </Text>
                <Tag color="cyan">{calculations.formatCurrency(totals.tso)}</Tag>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
};