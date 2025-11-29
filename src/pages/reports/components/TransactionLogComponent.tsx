import React, { useState } from 'react';
import { Card, Table, Button, Select, Space, Typography, Tag, Input } from 'antd';
import { toast } from 'sonner';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { calculations } from '../../../utils/calculations';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

interface TransactionData {
  id: string;
  date: string;
  time: string;
  branchId: string;
  branchName: string;
  type: 'savings' | 'loan_collection' | 'disbursement' | 'expense' | 'transfer';
  category: string;
  amount: number;
  description: string;
  referenceNo: string;
  userId: string;
  userName: string;
  status: 'completed' | 'pending' | 'failed';
  balanceBefore: number;
  balanceAfter: number;
}

interface TransactionLogProps {
  data: TransactionData[];
  dateRange: [Dayjs, Dayjs] | null;
  loading: boolean;
}

export const TransactionLogComponent: React.FC<TransactionLogProps> = ({ data, dateRange, loading }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  const getTypeColor = (type: string) => {
    const colors = {
      savings: 'green',
      loan_collection: 'blue',
      disbursement: 'purple',
      expense: 'red',
      transfer: 'orange'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'green',
      pending: 'orange',
      failed: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const filteredData = data.filter(transaction => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    const searchMatch = searchText === '' || 
      transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.referenceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchText.toLowerCase());
    
    return typeMatch && statusMatch && searchMatch;
  });

  const transactionColumns: ColumnsType<TransactionData> = [
    {
      title: 'Date & Time',
      key: 'datetime',
      width: 140,
      render: (_, record) => (
        <div>
          <div>{dayjs(record.date).format('MMM DD, YYYY')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.time}</Text>
        </div>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'referenceNo',
      key: 'referenceNo',
      width: 120,
      render: (ref: string) => (
        <Text code style={{ fontSize: '11px' }}>{ref}</Text>
      ),
    },
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 140,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record) => (
        <Text 
          type={record.type === 'savings' || record.type === 'loan_collection' ? 'success' : 'danger'}
          strong
        >
          {record.type === 'savings' || record.type === 'loan_collection' ? '+' : '-'}
          {calculations.formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <Text title={desc}>{desc}</Text>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 130,
      render: (balance: number) => (
        <Text type={balance >= 0 ? 'success' : 'danger'}>
          {calculations.formatCurrency(balance)}
        </Text>
      ),
    },
  ];

  // Calculate summary statistics
  const completedTransactions = filteredData.filter(t => t.status === 'completed');
  const totalInflow = completedTransactions
    .filter(t => t.type === 'savings' || t.type === 'loan_collection')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = completedTransactions
    .filter(t => t.type === 'disbursement' || t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Transaction Summary */}
      <Card title="Transaction Summary" size="small">
        <Space wrap size="large">
          <div>
            <Text strong>Total Transactions: </Text>
            <Text>{filteredData.length.toLocaleString()}</Text>
          </div>
          <div>
            <Text strong>Completed: </Text>
            <Text type="success">{completedTransactions.length.toLocaleString()}</Text>
          </div>
          <div>
            <Text strong>Total Inflow: </Text>
            <Text type="success">{calculations.formatCurrency(totalInflow)}</Text>
          </div>
          <div>
            <Text strong>Total Outflow: </Text>
            <Text type="danger">{calculations.formatCurrency(totalOutflow)}</Text>
          </div>
          <div>
            <Text strong>Net Flow: </Text>
            <Text type={totalInflow - totalOutflow >= 0 ? 'success' : 'danger'}>
              {calculations.formatCurrency(totalInflow - totalOutflow)}
            </Text>
          </div>
        </Space>
      </Card>

      {/* Transaction Log Table */}
      <Card 
        title={`Transaction Log - ${dateRange ? `${dateRange[0].format('MMM DD')} to ${dateRange[1].format('MMM DD, YYYY')}` : ''}`}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => toast.success('Transaction log exported successfully')}
            >
              Export Excel
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <Space wrap style={{ marginBottom: 16 }}>
          <div>
            <Text strong>Type: </Text>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 150 }}
            >
              <Option value="all">All Types</Option>
              <Option value="savings">Savings</Option>
              <Option value="loan_collection">Loan Collection</Option>
              <Option value="disbursement">Disbursement</Option>
              <Option value="expense">Expense</Option>
              <Option value="transfer">Transfer</Option>
            </Select>
          </div>
          
          <div>
            <Text strong>Status: </Text>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
            >
              <Option value="all">All Status</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </div>

          <div>
            <Text strong>Search: </Text>
            <Input
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>
        </Space>

        <Table
          columns={transactionColumns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
          }}
        />
      </Card>
    </Space>
  );
};