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
  Divider
} from 'antd';
import { 
  FileTextOutlined, 
  BankOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { BranchDailyReportData } from '../../types';
import { calculations } from '../../utils/calculations';
import dayjs from 'dayjs';
import './BranchDailyReportPage.css';

const { Title, Text } = Typography;

// Mock data for demonstration - in real app this would come from API
const generateMockReportData = (date: string): BranchDailyReportData[] => [
  {
    branchId: 'br-001',
    branchName: 'Lagos Branch',
    date,
    cashbook1: {
      pcih: 150000,
      savings: 850000,
      loanCollection: 400000,
      charges: 25000,
      collectionTotal: 1275000, // savings + loanCollection + charges
      frmHO: 200000,
      frmBR: 100000,
      cbTotal1: 1725000 // PCIH + savings + loan + charges + frmHO + frmBR
    },
    cashbook2: {
      disNo: 45,
      disAmt: 650000,
      disWithInt: 715000,
      savWith: 120000,
      domiBank: 200000,
      posT: 50000,
      cbTotal2: 1020000 // disAmt + savWith + domiBank + posT
    },
    onlineCIH: 705000, // cbTotal1 - cbTotal2
    bankStatement1: {
      opening: 0,
      recHO: 200000, // from frmHO
      recBO: 100000, // from frmBR
      domi: 200000, // from domiBank
      pa: 50000, // from posT
      bs1Total: 550000
    },
    bankStatement2: {
      withd: 200000, // from frmHO
      tbo: 150000,
      tboToBranch: 'Abuja Branch',
      exAmt: 75000,
      exPurpose: 'Office supplies and maintenance',
      bs2Total: 425000
    },
    tso: 125000, // bs1Total - bs2Total
    cbrSavings: 2180000, // Previous: 1450000 + savings: 850000 - savWith: 120000
    cbrLoan: 3200000, // Previous: 2485000 + disWithInt: 715000 - loanCollection: 400000
    disbursementRoll: 12650000 // Previous: 12000000 + disAmt: 650000
  },
  {
    branchId: 'br-002',
    branchName: 'Abuja Branch',
    date,
    cashbook1: {
      pcih: 120000,
      savings: 650000,
      loanCollection: 330000,
      charges: 18000,
      collectionTotal: 998000,
      frmHO: 180000,
      frmBR: 80000,
      cbTotal1: 1378000
    },
    cashbook2: {
      disNo: 38,
      disAmt: 450000,
      disWithInt: 495000,
      savWith: 95000,
      domiBank: 180000,
      posT: 35000,
      cbTotal2: 760000
    },
    onlineCIH: 618000,
    bankStatement1: {
      opening: 0,
      recHO: 180000,
      recBO: 80000,
      domi: 180000,
      pa: 35000,
      bs1Total: 475000
    },
    bankStatement2: {
      withd: 180000,
      tbo: 100000,
      tboToBranch: 'Kano Branch',
      exAmt: 45000,
      exPurpose: 'Transportation and utilities',
      bs2Total: 325000
    },
    tso: 150000,
    cbrSavings: 1605000, // Previous: 1050000 + savings: 650000 - savWith: 95000
    cbrLoan: 2160000, // Previous: 1995000 + disWithInt: 495000 - loanCollection: 330000
    disbursementRoll: 8450000 // Previous: 8000000 + disAmt: 450000
  },
  {
    branchId: 'br-003',
    branchName: 'Kano Branch',
    date,
    cashbook1: {
      pcih: 95000,
      savings: 420000,
      loanCollection: 280000,
      charges: 15000,
      collectionTotal: 715000,
      frmHO: 120000,
      frmBR: 60000,
      cbTotal1: 990000
    },
    cashbook2: {
      disNo: 28,
      disAmt: 380000,
      disWithInt: 418000,
      savWith: 85000,
      domiBank: 120000,
      posT: 25000,
      cbTotal2: 610000
    },
    onlineCIH: 380000,
    bankStatement1: {
      opening: 0,
      recHO: 120000,
      recBO: 60000,
      domi: 120000,
      pa: 25000,
      bs1Total: 325000
    },
    bankStatement2: {
      withd: 120000,
      tbo: 80000,
      tboToBranch: 'Lagos Branch',
      exAmt: 35000,
      exPurpose: 'Security and cleaning services',
      bs2Total: 235000
    },
    tso: 90000,
    cbrSavings: 1185000, // Previous: 850000 + savings: 420000 - savWith: 85000
    cbrLoan: 1938000, // Previous: 1800000 + disWithInt: 418000 - loanCollection: 280000
    disbursementRoll: 6380000 // Previous: 6000000 + disAmt: 380000
  }
];

export const BranchDailyReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [reportData, setReportData] = useState<BranchDailyReportData[]>(
    generateMockReportData(dayjs().format('YYYY-MM-DD'))
  );

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
      // In real app, this would trigger API call to fetch data for the selected date
      setReportData(generateMockReportData(date.format('YYYY-MM-DD')));
    }
  };

  const handleExportReport = () => {
    console.log('Exporting daily report for:', selectedDate.format('YYYY-MM-DD'));
    // Implementation for Excel/PDF export would go here
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
        <Text strong style={{ color: color || '#1890ff', fontSize: '13px' }}>
          {calculations.formatCurrency(value)}
        </Text>
      );
    }
    return color ? (
      <Text style={{ color, fontWeight: 'bold' }}>
        {calculations.formatCurrency(value)}
      </Text>
    ) : calculations.formatCurrency(value);
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
            <Title level={2}>
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
              >
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Online CIH"
                value={totals.onlineCIH}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#52c41a' }}
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
                valueStyle={{ color: '#1890ff' }}
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
                valueStyle={{ color: '#722ed1' }}
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
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Main Data Table */}
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
          <Table
            columns={columns}
            dataSource={[...reportData, grandTotal]}
            rowKey="branchId"
            scroll={{ x: 2000 }}
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
        </Card>

        {/* Summary Footer */}
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
      </Space>
    </div>
  );
};