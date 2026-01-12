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
  Spin,
  Tooltip
} from 'antd';
import { 
  FileTextOutlined, 
  BankOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { calculations } from '../../utils/calculations';
import { useListAllDailyOperations, type Operation } from '../../hooks/Operations/useListAllDailyOperations';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { toast } from 'sonner';
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
  totalCollections: number;
  disbursementNumber: number;
  disbursementAmount: number;
  disbursementRollNumber: number;
  totalFrmHO: number;
  predictions: {
    predictionNo: number;
    predictionAmount: number;
    predictionDate: string;
  };
  disbursementRollData: {
    previousDisbursement: number;
    dailyDisbursement: number;
    month: number;
    year: number;
  };
  amountNeedTomorrow: {
    loanAmount: number;
    savingsWithdrawalAmount: number;
    expensesAmount: number;
    total: number;
    notes: string;
    date: string | null;
  };
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
    disbursementRoll: operation.disbursementRoll?.disbursementRoll || 0,
    totalCollections: operation.cashbook1.savings + operation.cashbook1.loanCollection + operation.cashbook1.chargesCollection,
    disbursementNumber: operation.disbursementRoll?.disNo || 0,
    disbursementAmount: operation.cashbook2.disAmt,
    disbursementRollNumber: (operation.disbursementRoll?.previousDisbursementRollNo || 0) + (operation.disbursementRoll?.disNo || 0),
    totalFrmHO: operation.cashbook1.frmHO,
    predictions: {
      predictionNo: operation.predictions?.predictionNo || 0,
      predictionAmount: operation.predictions?.predictionAmount || 0,
      predictionDate: operation.prediction?.predictionDate || '',
    },
    disbursementRollData: {
      previousDisbursement: operation.disbursementRoll?.previousDisbursement || 0,
      dailyDisbursement: operation.disbursementRoll?.dailyDisbursement || 0,
      month: operation.disbursementRoll?.month || 0,
      year: operation.disbursementRoll?.year || 0,
    },
    amountNeedTomorrow: {
      loanAmount: operation.amountNeedTomorrow?.loanAmount || 0,
      savingsWithdrawalAmount: operation.amountNeedTomorrow?.savingsWithdrawalAmount || 0,
      expensesAmount: operation.amountNeedTomorrow?.expensesAmount || 0,
      total: operation.amountNeedTomorrow?.total || 0,
      notes: operation.amountNeedTomorrow?.notes || '',
      date: operation.amountNeedTomorrow?.date || null,
    },
  };
};

export const BranchDailyReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  // Use the API hook
  const { data: operationsData, isLoading, error, refetch } = useListAllDailyOperations(
    selectedDate.format('YYYY-MM-DD')
  );

  const handleRefresh = async () => {
    toast.info('Refreshing daily report data...');
    try {
      await refetch();
      toast.success(`Daily report data for ${selectedDate.format('YYYY-MM-DD')} loaded successfully`);
    } catch (error) {
      toast.error('Failed to refresh daily report data');
    }
  }
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
      disbursementRoll: acc.disbursementRoll + branch.disbursementRoll,
      totalCollections: acc.totalCollections + branch.totalCollections,
      disbursementNumber: acc.disbursementNumber + branch.disbursementNumber,
      disbursementAmount: acc.disbursementAmount + branch.disbursementAmount,
      disbursementRollNumber: acc.disbursementRollNumber + branch.disbursementRollNumber,
      totalFrmHO: acc.totalFrmHO + branch.totalFrmHO,
      totalPredictionAmount: acc.totalPredictionAmount + branch.predictions.predictionAmount,
      totalPredictionNo: acc.totalPredictionNo + branch.predictions.predictionNo,
      totalExpenses: acc.totalExpenses + branch.bankStatement2.exAmt,
      totalAmountNeedTomorrow: acc.totalAmountNeedTomorrow + branch.amountNeedTomorrow.total,
    }), {
      cbTotal1: 0,
      cbTotal2: 0,
      onlineCIH: 0,
      bs1Total: 0,
      bs2Total: 0,
      tso: 0,
      cbrSavings: 0,
      cbrLoan: 0,
      disbursementRoll: 0,
      totalCollections: 0,
      disbursementNumber: 0,
      disbursementAmount: 0,
      disbursementRollNumber: 0,
      totalFrmHO: 0,
      totalPredictionAmount: 0,
      totalPredictionNo: 0,
      totalExpenses: 0,
      totalAmountNeedTomorrow: 0,
    });
  }, [reportData]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Export only columns mapped to the UI table
  const handleExportReport = () => {
    if (!reportData.length) return;

    // Define the columns to export based on the UI table
    const exportColumns = [
      { title: 'Branch', key: 'branchName', getValue: (row) => row.branchId === 'grand-total' ? '🏆 Grand Total' : row.branchName },
      // Cashbook 1
      { title: 'PCIH', key: 'pcih', getValue: (row) => row.cashbook1.pcih },
      { title: 'Savings', key: 'savings', getValue: (row) => row.cashbook1.savings },
      { title: 'Loan Collection', key: 'loanCollection', getValue: (row) => row.cashbook1.loanCollection },
      { title: 'Charges', key: 'charges', getValue: (row) => row.cashbook1.charges },
      { title: 'Total Collections', key: 'collectionTotal', getValue: (row) => row.cashbook1.savings + row.cashbook1.loanCollection + row.cashbook1.charges },
      { title: 'FRM HO', key: 'frmHO', getValue: (row) => row.cashbook1.frmHO },
      { title: 'FRM BR', key: 'frmBR', getValue: (row) => row.cashbook1.frmBR },
      { title: 'CB Total 1', key: 'cbTotal1', getValue: (row) => row.cashbook1.cbTotal1 },
      // Cashbook 2
      { title: 'DIS NO', key: 'disNo', getValue: (row) => row.cashbook2.disNo },
      { title: 'DIS AMT', key: 'disAmt', getValue: (row) => row.cashbook2.disAmt },
      { title: 'DIS WIT INT', key: 'disWithInt', getValue: (row) => row.cashbook2.disWithInt },
      { title: 'SAV WITH', key: 'savWith', getValue: (row) => row.cashbook2.savWith },
      { title: 'DOMI BANK', key: 'domiBank', getValue: (row) => row.cashbook2.domiBank },
      { title: 'POS/T', key: 'posT', getValue: (row) => row.cashbook2.posT },
      { title: 'CB Total 2', key: 'cbTotal2', getValue: (row) => row.cashbook2.cbTotal2 },
      // Online CIH
      { title: 'Online CIH', key: 'onlineCIH', getValue: (row) => row.onlineCIH },
      // Bank Statement
      { title: 'BS1 Total', key: 'bs1Total', getValue: (row) => row.bankStatement1.bs1Total },
      { title: 'BS2 Total', key: 'bs2Total', getValue: (row) => row.bankStatement2.bs2Total },
      { title: 'TSO', key: 'tso', getValue: (row) => row.tso },
      { title: 'Expenses', key: 'exAmt', getValue: (row) => row.bankStatement2.exAmt },
      { title: 'Expenses Purpose', key: 'exPurpose', getValue: (row) => row.bankStatement2.exPurpose },
      // Current Branch Register
      { title: 'CBR (Savings)', key: 'cbrSavings', getValue: (row) => row.cbrSavings },
      { title: 'CBR (Loan)', key: 'cbrLoan', getValue: (row) => row.cbrLoan },
      // Disbursement Roll Data
      { title: 'Disbursement Roll No', key: 'disbursementRollNumber', getValue: (row) => row.disbursementRollNumber },
      { title: 'Disbursement Roll', key: 'disbursementRoll', getValue: (row) => row.disbursementRoll },
      // Predictions
      { title: 'Prediction No', key: 'predictionNo', getValue: (row) => row.predictions.predictionNo },
      { title: 'Prediction Amount', key: 'predictionAmount', getValue: (row) => row.predictions.predictionAmount },
      { title: 'Prediction Date', key: 'predictionDate', getValue: (row) => row.predictions.predictionDate },
      // Senate Planning
      { title: 'ANT Loan Amount', key: 'antLoanAmount', getValue: (row) => row.amountNeedTomorrow.loanAmount },
      { title: 'ANT Savings Withdrawal', key: 'antSavingsWithdrawal', getValue: (row) => row.amountNeedTomorrow.savingsWithdrawalAmount },
      { title: 'ANT Expenses', key: 'antExpenses', getValue: (row) => row.amountNeedTomorrow.expensesAmount },
      { title: 'ANT Total', key: 'antTotal', getValue: (row) => row.amountNeedTomorrow.total },
      { title: 'ANT Notes', key: 'antNotes', getValue: (row) => row.amountNeedTomorrow.notes },
    ];

    // Prepare data for Excel export
    const exportData = [...reportData, grandTotal].map((row) => {
      const rowData = {};
      exportColumns.forEach(col => {
        rowData[col.title] = col.getValue(row);
      });
      return rowData;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths (optional, can be adjusted)
    ws['!cols'] = exportColumns.map(() => ({ wch: 15 }));

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
      disbursementRoll: 0,
      totalCollections: 0,
      disbursementNumber: 0,
      disbursementAmount: 0,
      disbursementRollNumber: 0,
      totalFrmHO: 0,
      predictions: {
        predictionNo: 0,
        predictionAmount: 0,
        predictionDate: ''
      },
      disbursementRollData: {
        previousDisbursement: 0,
        dailyDisbursement: 0,
        month: 0,
        year: 0
      },
      amountNeedTomorrow: {
        loanAmount: 0,
        savingsWithdrawalAmount: 0,
        expensesAmount: 0,
        total: 0,
        notes: '',
        date: null
      }
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
      grandTotal.totalCollections += branch.totalCollections;
      grandTotal.disbursementNumber += branch.disbursementNumber;
      grandTotal.disbursementAmount += branch.disbursementAmount;
      grandTotal.disbursementRollNumber += branch.disbursementRollNumber;
      grandTotal.totalFrmHO += branch.totalFrmHO;
      grandTotal.predictions.predictionAmount += branch.predictions.predictionAmount;
      grandTotal.disbursementRollData.previousDisbursement += branch.disbursementRollData.previousDisbursement;
      grandTotal.disbursementRollData.dailyDisbursement += branch.disbursementRollData.dailyDisbursement;
      grandTotal.amountNeedTomorrow.loanAmount += branch.amountNeedTomorrow.loanAmount;
      grandTotal.amountNeedTomorrow.savingsWithdrawalAmount += branch.amountNeedTomorrow.savingsWithdrawalAmount;
      grandTotal.amountNeedTomorrow.expensesAmount += branch.amountNeedTomorrow.expensesAmount;
      grandTotal.amountNeedTomorrow.total += branch.amountNeedTomorrow.total;
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
          title: 'Total Collections',
          dataIndex: ['cashbook1', 'collectionTotal'],
          key: 'collectionTotal',
          render: (value: number, record: BranchDailyReportData) => {
            const totalCollections = record.cashbook1.savings + record.cashbook1.loanCollection + record.cashbook1.charges;
            return (
              <Text style={{ 
                color: '#52c41a', 
                fontWeight: 'bold',
                fontSize: window.innerWidth <= 768 ? '12px' : '14px'
              }}>
                {calculations.formatCurrency(totalCollections)}
              </Text>
            );
          }
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
        },
        {
          title: 'Expenses',
          dataIndex: ['bankStatement2', 'exAmt'],
          key: 'expenses',
          render: (value: number) => (
            <Tag color="volcano">{calculations.formatCurrency(value)}</Tag>
          )
        },
        {
          title: 'Expenses Purpose',
          dataIndex: ['bankStatement2', 'exPurpose'],
          key: 'expensesPurpose',
          width: 200,
          render: (purpose: string, record: BranchDailyReportData) => {
            if (record.branchId === 'grand-total' || !purpose || purpose.trim() === '') {
              return (
                <Text style={{ 
                  color: '#999',
                  fontSize: window.innerWidth <= 768 ? '11px' : '12px'
                }}>
                  -
                </Text>
              );
            }
            
            return (
              <Text style={{ 
                fontSize: window.innerWidth <= 768 ? '11px' : '12px',
                color: '#333'
              }}>
                {purpose}
              </Text>
            );
          }
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
    // Disbursement Roll Data
    {
      title: 'Disbursement Roll Data',
      children: [
        {
          title: 'Disbursement Roll No',
          dataIndex: 'disbursementRollNumber',
          key: 'disbursementRollNumber',
          render: (value: number, record: BranchDailyReportData) => {
            if (record.branchId === 'grand-total') {
              return (
                <Text strong style={{ 
                  color: '#fa8c16', 
                  fontSize: window.innerWidth <= 768 ? '11px' : '13px'
                }}>
                  {value.toLocaleString()}
                </Text>
              );
            }
            return (
              <span style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                {value.toLocaleString()}
              </span>
            );
          }
        },
        {
          title: 'Disbursement Roll',
          dataIndex: 'disbursementRoll',
          key: 'disbursementRoll',
          render: (value: number, record: BranchDailyReportData) => renderCurrency(value, record, '#faad14')
        }
      ]
    },
    // Predictions Data
    {
      title: 'Predictions',
      children: [
        {
          title: 'Prediction No',
          dataIndex: ['predictions', 'predictionNo'],
          key: 'predictionNo',
          render: (value: number, record: BranchDailyReportData) => {
            if (record.branchId === 'grand-total') {
              return (
                <Text strong style={{ 
                  color: '#eb2f96', 
                  fontSize: window.innerWidth <= 768 ? '11px' : '13px'
                }}>
                  -
                </Text>
              );
            }
            return (
              <Tag color="volcano">{value}</Tag>
            );
          }
        },
        {
          title: 'Prediction Amount',
          dataIndex: ['predictions', 'predictionAmount'],
          key: 'predictionAmount',
          render: (value: number, record: BranchDailyReportData) => renderCurrency(value, record, '#eb2f96')
        },
        {
          title: 'Prediction Date',
          dataIndex: ['predictions', 'predictionDate'],
          key: 'predictionDate',
          width: 120,
          render: (value: string, record: BranchDailyReportData) => {
            if (record.branchId === 'grand-total' || !value) {
              return (
                <Text style={{ 
                  color: '#999',
                  fontSize: window.innerWidth <= 768 ? '11px' : '13px'
                }}>
                  -
                </Text>
              );
            }
            return (
              <Text style={{ 
                fontSize: window.innerWidth <= 768 ? '11px' : '12px',
                color: '#666'
              }}>
                {dayjs(value).format('MMM DD, YYYY')}
              </Text>
            );
          }
        }
      ]
    },
    // Senate Planning Data
    {
      title: 'Senate Planning',
      children: [
        {
          title: 'ANT Loan Amount',
          dataIndex: ['amountNeedTomorrow', 'loanAmount'],
          key: 'antLoanAmount',
          render: (value: number, record: BranchDailyReportData) => renderCurrency(value, record, '#1890ff')
        },
        {
          title: 'ANT Savings Withdrawal',
          dataIndex: ['amountNeedTomorrow', 'savingsWithdrawalAmount'],
          key: 'antSavingsWithdrawal',
          render: (value: number, record: BranchDailyReportData) => renderCurrency(value, record, '#52c41a')
        },
        {
          title: 'ANT Expenses',
          dataIndex: ['amountNeedTomorrow', 'expensesAmount'],
          key: 'antExpenses',
          render: (value: number, record: BranchDailyReportData) => renderCurrency(value, record, '#fa8c16')
        },
        {
          title: 'ANT Total',
          dataIndex: ['amountNeedTomorrow', 'total'],
          key: 'antTotal',
          render: (value: number, record: BranchDailyReportData) => (
            <Text
              strong
              style={{
                color: record.branchId === 'grand-total' ? '#f5222d' : '#f5222d',
                fontWeight: 'bold',
                fontSize: window.innerWidth <= 768 ? '12px' : '14px'
              }}
            >
              {calculations.formatCurrency(value)}
            </Text>
          )
        },
        {
          title: 'ANT Notes',
          dataIndex: ['amountNeedTomorrow', 'notes'],
          key: 'antNotes',
          width: 200,
          render: (notes: string, record: BranchDailyReportData) => {
            if (record.branchId === 'grand-total' || !notes || notes.trim() === '') {
              return (
                <Text style={{
                  color: '#999',
                  fontSize: window.innerWidth <= 768 ? '11px' : '12px'
                }}>
                  -
                </Text>
              );
            }
            
            return (
              <Text style={{
                fontSize: window.innerWidth <= 768 ? '11px' : '12px',
                color: '#333'
              }}>
                {notes}
              </Text>
            );
          }
        }
      ]
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
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={isLoading}
                type="default"
              >
                Refresh
              </Button>
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
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Daily Collections"
                    value={totals.totalCollections}
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
                    title=" Total Daily Disbursement Number"
                    value={totals.disbursementNumber}
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
                    title="Total Daily Disbursement Amount"
                    value={totals.disbursementAmount}
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
                    title="Current Total Disbursement Roll Number"
                    value={totals.disbursementRollNumber}
                    valueStyle={{ 
                      color: '#fa8c16',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Current Total Disbursement Roll Amount"
                    value={totals.disbursementRoll}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#fa8c16',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Daily Expenses"
                    value={totals.totalExpenses}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#ff4d4f',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Daily FRM HO"
                    value={totals.totalFrmHO}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#13c2c2',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Daily Online CIH"
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
                    title="Total Daily TSO"
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
                    title="Total Daily Prediction Amount"
                    value={totals.totalPredictionAmount}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#eb2f96',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Daily Prediction Number"
                    value={totals.totalPredictionNo}
                    valueStyle={{ 
                      color: '#eb2f96',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Total Senate Planning"
                    value={totals.totalAmountNeedTomorrow}
                    precision={2}
                    prefix="₦"
                    valueStyle={{ 
                      color: '#f5222d',
                      fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
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
                  scroll={{ x: window.innerWidth <= 768 ? 3800 : 3400 }}
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
                <Text strong>Total Collections: </Text>
                <Tag color="green">{calculations.formatCurrency(totals.totalCollections)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Daily Disbursement No: </Text>
                <Tag color="blue">{totals.disbursementNumber.toLocaleString()}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Total Disbursement Amt: </Text>
                <Tag color="purple">{calculations.formatCurrency(totals.disbursementAmount)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Total FRM HO: </Text>
                <Tag color="cyan">{calculations.formatCurrency(totals.totalFrmHO)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>CB Total 1: </Text>
                <Tag color="green">{calculations.formatCurrency(totals.cbTotal1)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>CB Total 2: </Text>
                <Tag color="orange">{calculations.formatCurrency(totals.cbTotal2)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>TSO Total: </Text>
                <Tag color="cyan">{calculations.formatCurrency(totals.tso)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Predictions Total: </Text>
                <Tag color="magenta">{calculations.formatCurrency(totals.totalPredictionAmount)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Total Expenses: </Text>
                <Tag color="volcano">{calculations.formatCurrency(totals.totalExpenses)}</Tag>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <Text strong>Senate Planning: </Text>
                <Tag color="red">{calculations.formatCurrency(totals.totalAmountNeedTomorrow)}</Tag>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
};