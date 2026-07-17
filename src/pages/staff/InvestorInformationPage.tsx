import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useGetMe } from '../../hooks/Auth/useGetMe';
import { useListInvestors, type Investor, type InvestorStatus } from '../../hooks/Investors/useListInvestors';
import { useCreateInvestor } from '../../hooks/Investors/useCreateInvestor';
import { useUpdateInvestor } from '../../hooks/Investors/useUpdateInvestor';
import { useDeleteInvestor } from '../../hooks/Investors/useDeleteInvestor';

const { Title, Text } = Typography;

interface InvestorFormValues {
  investorName: string;
  gender: 'male' | 'female';
  phone: string;
  rioDate: dayjs.Dayjs;
  status: InvestorStatus;
}

export const InvestorInformationPage: React.FC = () => {
  const { data: currentUser } = useGetMe();
  const isHO = currentUser?.data?.role === 'HO';

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'male' | 'female' | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<InvestorStatus | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [form] = Form.useForm<InvestorFormValues>();

  const { data: investorsData, isLoading } = useListInvestors({
    page: pagination.current,
    limit: pagination.pageSize,
    search: search || undefined,
    gender: genderFilter,
    status: statusFilter,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });

  const createInvestor = useCreateInvestor();
  const updateInvestor = useUpdateInvestor();
  const deleteInvestor = useDeleteInvestor();

  const investors = useMemo(
    () =>
      [...(investorsData?.data?.investors || [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [investorsData?.data?.investors],
  );
  const total = investorsData?.data?.total || 0;

  if (!isHO) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="Investor Information is available to Head Office users only."
      />
    );
  }

  const openCreateModal = () => {
    setEditingInvestor(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: Investor) => {
    setEditingInvestor(record);
    form.setFieldsValue({
      investorName: record.investorName,
      gender: record.gender,
      phone: record.phone,
      rioDate: dayjs(record.rioDate),
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: InvestorFormValues) => {
    try {
      if (editingInvestor) {
        await updateInvestor.mutateAsync({
          id: editingInvestor._id,
          ...values,
          rioDate: values.rioDate.format('YYYY-MM-DD'),
        });
        toast.success('Investor information updated successfully');
      } else {
        await createInvestor.mutateAsync({
          ...values,
          rioDate: values.rioDate.format('YYYY-MM-DD'),
        });
        toast.success('Investor information added successfully');
      }

      form.resetFields();
      setEditingInvestor(null);
      setIsModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save investor information';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestor.mutateAsync(id);
      toast.success('Investor information deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete investor information';
      toast.error(message);
    }
  };

  const handleExport = () => {
    if (!investors.length) {
      toast.info('No investor information to download');
      return;
    }

    const rows = investors.map((item, index) => ({
      'S/N': (pagination.current - 1) * pagination.pageSize + index + 1,
      'INVESTOR NAME': item.investorName || '',
      'GENDER': item.gender || '',
      'PHONE': item.phone || '',
      'R.I.O DATE': item.rioDate ? dayjs(item.rioDate).format('YYYY-MM-DD') : '',
      'STATUS': item.status || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Investor Information');
    XLSX.writeFile(workbook, 'investor-information.xlsx');
    toast.success('Investor information downloaded');
  };

  const columns: ColumnsType<Investor> = [
    {
      title: 'S/N',
      key: 'sn',
      width: 70,
      render: (_value, _record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Investor Name',
      dataIndex: 'investorName',
      key: 'investorName',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (value: string) => value || '-',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (value: string) => value || '-',
    },
    {
      title: 'R.I.O Date',
      dataIndex: 'rioDate',
      key: 'rioDate',
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => value || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete investor information"
            description="Are you sure you want to delete this record?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Row justify="space-between" align="middle" gutter={[12, 12]}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                <TeamOutlined /> Investor Information
              </Title>
              <Text type="secondary">Head Office investor records management</Text>
            </Col>
            <Col>
              <Space wrap>
                <Input.Search
                  allowClear
                  placeholder="Search investors"
                  onSearch={(value) => {
                    setSearch(value.trim());
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  style={{ width: 220 }}
                />
                <Select
                  allowClear
                  placeholder="Gender"
                  style={{ width: 140 }}
                  onChange={(value) => {
                    setGenderFilter(value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                />
                <Select
                  allowClear
                  placeholder="Status"
                  style={{ width: 160 }}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  options={[
                    { value: 'paid', label: 'Paid' },
                    { value: 'update', label: 'Update' },
                    { value: 'withdrawal', label: 'Withdrawal' },
                  ]}
                />
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  Download List
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Add Investor
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={investors}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: true,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 10 }),
            }}
            scroll={window.innerWidth <= 768 ? { x: 1200 } : { x: 1100 }}
          />
        </Card>
      </Space>

      <Modal
        title={editingInvestor ? 'Edit Investor Information' : 'Add Investor Information'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingInvestor(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form<InvestorFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="Investor Name" name="investorName" rules={[{ required: true, message: 'Investor name is required' }]}>
            <Input placeholder="Enter investor name" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Gender" name="gender" rules={[{ required: true, message: 'Gender is required' }]}>
                <Select
                  placeholder="Select gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Phone is required' }]}>
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="R.I.O Date" name="rioDate" rules={[{ required: true, message: 'R.I.O date is required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Status is required' }]}>
                <Select
                  placeholder="Select status"
                  options={[
                    { value: 'paid', label: 'Paid' },
                    { value: 'update', label: 'Update' },
                    { value: 'withdrawal', label: 'Withdrawal' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createInvestor.isPending || updateInvestor.isPending}>
                {editingInvestor ? 'Update Investor' : 'Create Investor'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingInvestor(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};