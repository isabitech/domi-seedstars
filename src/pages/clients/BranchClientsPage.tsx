import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useGetMe } from '../../hooks/Auth/useGetMe';
import { useListClients, type Client } from '../../hooks/Clients/useListClients';
import { useListBranches } from '../../hooks/Branches/useListBranches';
import { useCreateClient } from '../../hooks/Clients/useCreateClient';
import { useUpdateClient } from '../../hooks/Clients/useUpdateClient';
import { useDeleteClient } from '../../hooks/Clients/useDeleteClient';

const { Title, Text } = Typography;

interface ClientFormValues {
  union: string;
  clientName: string;
  clientPhone: string;
  clientNickName?: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorNickName?: string;
  partnerReferrerName: string;
  partnerReferrerPhone: string;
  partnerReferrerNickName?: string;
  status?: 'active' | 'inactive';
  clientCategory?: 'loan_only' | 'savings_only' | 'loan_and_savings';
}

const getClientName = (client: Client) => client.clientName || client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim();
const getClientPhone = (client: Client) => client.clientPhone || client.phone || '';

export const BranchClientsPage: React.FC = () => {
  const { branchId: routeBranchId } = useParams();
  const { data: currentUser } = useGetMe();

  const isHO = currentUser?.data?.role === 'HO';
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const effectiveBranchId = isHO
    ? (selectedBranchId === 'all' ? undefined : selectedBranchId)
    : (routeBranchId || currentUser?.data?.branchId);
  const canManageClients = !isHO;

  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form] = Form.useForm<ClientFormValues>();

  const { data: clientsData, isLoading, isFetching, refetch } = useListClients({
    page: pagination.current,
    limit: pagination.pageSize,
    branchId: effectiveBranchId,
    search: search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });

  const { data: branchesData, isLoading: isBranchesLoading } = useListBranches({
    page: 1,
    limit: 100,
  });

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const clients = useMemo(
    () =>
      [...(clientsData?.data?.clients || [])].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [clientsData?.data?.clients],
  );
  const total = clientsData?.data?.total || 0;
  const branches = branchesData?.data?.branches || [];
  const activeClientsCount = useMemo(
    () => clients.filter((client) => (client.status || 'active') === 'active').length,
    [clients],
  );
  const inactiveClientsCount = useMemo(
    () => clients.filter((client) => client.status === 'inactive').length,
    [clients],
  );

  const branchName = useMemo(() => {
    if (isHO && selectedBranchId === 'all') {
      return 'All Branches';
    }

    if (isHO && selectedBranchId !== 'all') {
      const selectedBranch = branches.find((branch) => branch._id === selectedBranchId);
      if (selectedBranch?.name) {
        return selectedBranch.name;
      }
    }

    if (clients.length > 0) {
      return clients[0].branch?.name || currentUser?.data?.branchName || 'Branch';
    }

    return currentUser?.data?.branchName || 'Branch';
  }, [branches, clients, currentUser?.data?.branchName, isHO, selectedBranchId]);

  const openCreateModal = () => {
    setEditingClient(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    form.setFieldsValue({
      union: client.union,
      clientName: client.clientName,
      clientPhone: client.clientPhone,
      clientNickName: client.clientNickName,
      guarantorName: client.guarantorName,
      guarantorPhone: client.guarantorPhone,
      guarantorNickName: client.guarantorNickName,
      partnerReferrerName: client.partnerReferrerName,
      partnerReferrerPhone: client.partnerReferrerPhone,
      partnerReferrerNickName: client.partnerReferrerNickName,
      status: client.status || 'active',
      clientCategory: client.clientCategory,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient._id,
          ...values,
        });
        toast.success('Client updated successfully');
      } else {
        await createClient.mutateAsync({
          ...values,
          branchId: effectiveBranchId,
        });
        toast.success('Client added successfully');
      }
      setIsModalOpen(false);
      setEditingClient(null);
      form.resetFields();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save client';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient.mutateAsync(id);
      toast.success('Client deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete client';
      toast.error(message);
    }
  };

  const handleExport = () => {
    if (clients.length === 0) {
      toast.info('No clients available to download');
      return;
    }

    const rows = clients.map((client, index) => ({
      'S/N': (pagination.current - 1) * pagination.pageSize + index + 1,
      'UNION': client.union || '',
      'CLIENTS NAME': getClientName(client),
      'PHONE NUMBER': getClientPhone(client),
      'NICK NAME': client.clientNickName || '',
      'GUARANTOR NAME': client.guarantorName || '',
      'GUARANTOR PHONE NUMBER': client.guarantorPhone || '',
      'GUARANTOR NICKNAME': client.guarantorNickName || '',
      'PARTNER/REFEERER NAME': client.partnerReferrerName || '',
      'PARTNER/REFEERER PHONE NUMBER': client.partnerReferrerPhone || '',
      'PARTNER/REFEERER NICKNAME': client.partnerReferrerNickName || '',
      'CLIENT CATEGORY': client.clientCategory ? client.clientCategory.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    const fileName = `${branchName.replace(/\s+/g, '-')}-clients.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Client list downloaded');
  };

  const columns: ColumnsType<Client> = [
    {
      title: 'S/N',
      key: 'sn',
      width: 70,
      render: (_value, _record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Union',
      dataIndex: 'union',
      key: 'union',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Clients Name',
      key: 'name',
      render: (_, record) => <Text strong>{getClientName(record)}</Text>,
    },
    {
      title: 'Phone Number',
      key: 'clientPhone',
      render: (_, record) => getClientPhone(record) || '-',
    },
    {
      title: 'Nick Name',
      dataIndex: 'clientNickName',
      key: 'clientNickName',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Guarantor Name',
      dataIndex: 'guarantorName',
      key: 'guarantorName',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'guarantorPhone',
      key: 'guarantorPhone',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Nickname',
      dataIndex: 'guarantorNickName',
      key: 'guarantorNickName',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Partner/Refeerer Name',
      dataIndex: 'partnerReferrerName',
      key: 'partnerReferrerName',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'partnerReferrerPhone',
      key: 'partnerReferrerPhone',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Nickname',
      dataIndex: 'partnerReferrerNickName',
      key: 'partnerReferrerNickName',
      render: (value: string | undefined) => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string | undefined) => (
        <Tag color={status === 'inactive' ? 'red' : 'green'}>{status === 'inactive' ? 'Inactive' : 'Active'}</Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'clientCategory',
      key: 'clientCategory',
      render: (category: string | undefined) => (
        <Tag color="blue">
          {category ? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'N/A'}
        </Tag>
      ),
    },
    ...(isHO
      ? [{
          title: 'Branch',
          key: 'branch',
          render: (_: unknown, record: Client) => record.branch?.name || '-',
        }]
      : []),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            disabled={!canManageClients}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete client"
            description="Are you sure you want to delete this client?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={!canManageClients}
            >
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
                <TeamOutlined /> Client Information
              </Title>
              <Text type="secondary">
                {isHO ? `Viewing clients for ${branchName}` : 'Manage clients in your branch'}
              </Text>
            </Col>
            <Col>
              <Space wrap>
                {isHO && (
                  <Select
                    value={selectedBranchId}
                    onChange={(value) => {
                      setSelectedBranchId(value);
                      setPagination((prev) => ({ ...prev, current: 1 }));
                    }}
                    loading={isBranchesLoading}
                    style={{ minWidth: 220 }}
                    options={[
                      { label: 'All Branches', value: 'all' },
                      ...branches.map((branch) => ({
                        label: branch.name,
                        value: branch._id,
                      })),
                    ]}
                  />
                )}
                <Input.Search
                  allowClear
                  placeholder="Search clients"
                  onSearch={(value) => {
                    setSearch(value.trim());
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  style={{ width: 220 }}
                />
                <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
                  Refresh
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  Download List
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                  disabled={!canManageClients}
                >
                  Add Client
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {isHO && (
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Text type="secondary">Total Clients</Text>
                <Title level={3} style={{ margin: '8px 0 0 0' }}>
                  {total}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Text type="secondary">Active Clients</Text>
                <Title level={3} style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
                  {activeClientsCount}
                </Title>
                <Text type="secondary">Inactive: {inactiveClientsCount}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={24} lg={8}>
              <Card>
                <Text type="secondary">Selected Branch</Text>
                <Title level={4} style={{ margin: '8px 0 0 0' }}>
                  {branchName}
                </Title>
              </Card>
            </Col>
          </Row>
        )}

        <Card>
          <Table
            columns={columns}
            dataSource={clients}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: true,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 10 }),
            }}
            scroll={window.innerWidth <= 768 ? { x: 1600 } : { x: 1400 }}
          />
        </Card>
      </Space>

      <Modal
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingClient(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form<ClientFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'active' }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Union" name="union" rules={[{ required: true, message: 'Union is required' }]}>
                <Input placeholder="Enter union" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Clients Name" name="clientName" rules={[{ required: true, message: 'Clients name is required' }]}>
                <Input placeholder="Enter clients name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="clientPhone"
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nick Name" name="clientNickName">
                <Input placeholder="Enter nick name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Guarantor Name" name="guarantorName" rules={[{ required: true, message: 'Guarantor name is required' }]}>
                <Input placeholder="Enter guarantor name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" name="guarantorPhone" rules={[{ required: true, message: 'Guarantor phone number is required' }]}>
                <Input placeholder="Enter guarantor phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Nickname" name="guarantorNickName">
                <Input placeholder="Enter guarantor nickname" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Partner/Refeerer Name" name="partnerReferrerName" rules={[{ required: true, message: 'Partner/Refeerer name is required' }]}>
                <Input placeholder="Enter partner/refeerer name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Phone Number" name="partnerReferrerPhone" rules={[{ required: true, message: 'Partner/Refeerer phone number is required' }]}>
                <Input placeholder="Enter partner/refeerer phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Partner/Refeerer Nick Name" name="partnerReferrerNickName">
                <Input placeholder="Enter partner/refeerer nick name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Status" name="status">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Category" name="clientCategory">
            <Select placeholder="Select client category">
              <Select.Option value="loan_only">Loan only</Select.Option>
              <Select.Option value="savings_only">Savings only</Select.Option>
              <Select.Option value="loan_and_savings">Loan and Savings</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createClient.isPending || updateClient.isPending}>
                {editingClient ? 'Update Client' : 'Create Client'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingClient(null);
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
