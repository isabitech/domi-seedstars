import React from 'react';
import { Table, Button, Card, Typography, Tag } from 'antd';
import { toast } from 'sonner';
import { DownloadOutlined } from '@ant-design/icons';
import { calculations } from '../../../utils/calculations';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;

interface FinancialData {
  branchId: string;
  branchName: string;
  date: string;
  cashbook1Total: number;
  cashbook2Total: number;
  onlineCIH: number;
  savings: number;
  loanCollection: number;
  disbursements: number;
  charges: number;
  expenses: number;
  transferToSenate: number;
  frmHO: number;
  frmBR: number;
  netCashFlow: number;
}

interface FinancialTableProps {
  data: FinancialData[];
  dateRange: [Dayjs, Dayjs] | null;
  loading: boolean;
}

export const FinancialTableComponent: React.FC<FinancialTableProps> = ({ data, dateRange, loading }) => {
  const columns: ColumnsType<FinancialData> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD'),
    },
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Savings',
      dataIndex: 'savings',
      key: 'savings',
      render: (value: number) => calculations.formatCurrency(value),
    },
    {
      title: 'Loan Collection',
      dataIndex: 'loanCollection',
      key: 'loanCollection',
      render: (value: number) => calculations.formatCurrency(value),
    },
    {
      title: 'Charges',
      dataIndex: 'charges',
      key: 'charges',
      render: (value: number) => calculations.formatCurrency(value),
    },
    {
      title: 'Disbursements',
      dataIndex: 'disbursements',
      key: 'disbursements',
      render: (value: number) => <Text type="danger">{calculations.formatCurrency(value)}</Text>,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (value: number) => <Text type="danger">{calculations.formatCurrency(value)}</Text>,
    },
    {
      title: 'Online CIH',
      dataIndex: 'onlineCIH',
      key: 'onlineCIH',
      render: (value: number) => (
        <Text type={value >= 0 ? 'success' : 'danger'}>
          {calculations.formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: 'Transfer to Senate',
      dataIndex: 'transferToSenate',
      key: 'transferToSenate',
      render: (value: number) => calculations.formatCurrency(value),
    },
    {
      title: 'Net Cash Flow',
      dataIndex: 'netCashFlow',
      key: 'netCashFlow',
      render: (value: number) => (
        <Tag color={value >= 0 ? 'green' : 'red'}>
          {value >= 0 ? '+' : ''}{calculations.formatCurrency(value)}
        </Tag>
      ),
    },
  ];

  return (
    <Card 
      title={`Detailed Financial Report - ${dateRange ? `${dateRange[0].format('MMM DD')} to ${dateRange[1].format('MMM DD, YYYY')}` : ''}`}
      extra={
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={() => {
            toast.success('Financial report exported successfully');
          }}
        >
          Export Excel
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => `${record.branchId}-${record.date}`}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        summary={(tableData) => {
          if (tableData.length === 0) return null;
          
          const totalSavings = tableData.reduce((sum, item) => sum + item.savings, 0);
          const totalLoans = tableData.reduce((sum, item) => sum + item.loanCollection, 0);
          const totalCharges = tableData.reduce((sum, item) => sum + item.charges, 0);
          const totalDisbursements = tableData.reduce((sum, item) => sum + item.disbursements, 0);
          const totalExpenses = tableData.reduce((sum, item) => sum + item.expenses, 0);
          const totalOnlineCIH = tableData.reduce((sum, item) => sum + item.onlineCIH, 0);
          const totalTransferToSenate = tableData.reduce((sum, item) => sum + item.transferToSenate, 0);
          const totalNetCashFlow = tableData.reduce((sum, item) => sum + item.netCashFlow, 0);
          
          return (
            <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
              <Table.Summary.Cell index={0} colSpan={2}>
                <Text strong>TOTAL</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <Text strong>{calculations.formatCurrency(totalSavings)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <Text strong>{calculations.formatCurrency(totalLoans)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Text strong>{calculations.formatCurrency(totalCharges)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <Text strong type="danger">{calculations.formatCurrency(totalDisbursements)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}>
                <Text strong type="danger">{calculations.formatCurrency(totalExpenses)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7}>
                <Text strong type={totalOnlineCIH >= 0 ? 'success' : 'danger'}>
                  {calculations.formatCurrency(totalOnlineCIH)}
                </Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8}>
                <Text strong>{calculations.formatCurrency(totalTransferToSenate)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9}>
                <Tag color={totalNetCashFlow >= 0 ? 'green' : 'red'}>
                  <Text strong>{totalNetCashFlow >= 0 ? '+' : ''}{calculations.formatCurrency(totalNetCashFlow)}</Text>
                </Tag>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </Card>
  );
};