import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, message, Space, Table, Tag, Typography, Form, Input, Spin, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useListBranches } from '../../hooks/Branches/useListBranches';
import { useCreateBranch } from '../../hooks/Branches/useCreateBranch';
import { useUpdateBranch } from '../../hooks/Branches/useUpdateBranch';
import { useDeleteBranch } from '../../hooks/Branches/useDeleteBranch';
import { AdminUserRegistration } from '../../components/AdminUserRegistration';
import type { Branch } from '../../hooks/Branches/useListBranches';

const { Title } = Typography;

interface BranchFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export const BranchManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm<BranchFormData>();

  // Hooks for branch operations
  const { data: branchesData, isLoading: isLoadingBranches } = useListBranches();
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();

  const branches = branchesData?.data?.branches || [];

  const handleAddBranch = () => {
    setEditingBranch(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
    });
    setIsModalVisible(true);
  };

  const handleDeleteBranch = (branchId: string) => {
    Modal.confirm({
      title: 'Delete Branch',
      content: 'Are you sure you want to delete this branch? This action cannot be undone.',
      okType: 'danger',
      onOk() {
        deleteBranchMutation.mutate(branchId, {
          onSuccess: () => {
            message.success('Branch deleted successfully');
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete branch';
            message.error(errorMessage);
          }
        });
      },
    });
  };

  const handleSubmit = async (values: BranchFormData) => {
    try {
      if (editingBranch) {
        // Update existing branch
        await updateBranchMutation.mutateAsync({
          id: editingBranch.id,
          ...values
        });
        message.success('Branch updated successfully');
      } else {
        // Add new branch
        await createBranchMutation.mutateAsync(values);
        message.success('Branch created successfully');
      }
      setIsModalVisible(false);
      setEditingBranch(null);
      form.resetFields();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save branch';
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBranch(null);
    form.resetFields();
  };

  const columns: ColumnsType<Branch> = [
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Branch) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditBranch(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBranch(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Header */}
        <Col span={24}>
          <Card>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div>
                <BankOutlined style={{ fontSize: 24, marginRight: 8 }} />
                <Title level={2} style={{ margin: 0, display: 'inline' }}>System Management</Title>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Main Content with Tabs */}
        <Col span={24}>
          <Card>
            <Tabs
              defaultActiveKey="branches"
              items={[
                {
                  key: 'branches',
                  label: (
                    <span>
                      <BankOutlined />
                      Branch Management
                    </span>
                  ),
                  children: (
                    <div>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddBranch}
                        >
                          Add New Branch
                        </Button>
                      </div>
                      
                      {isLoadingBranches ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                          <Spin size="large" />
                        </div>
                      ) : (
                        <Table
                          columns={columns}
                          dataSource={branches}
                          rowKey="id"
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} branches`,
                          }}
                        />
                      )}
                    </div>
                  ),
                },
                {
                  key: 'users',
                  label: (
                    <span>
                      <UserAddOutlined />
                      User Registration
                    </span>
                  ),
                  children: <AdminUserRegistration showAsCard={false} />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Branch Form Modal */}
      <Modal
        title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Branch Name"
            name="name"
            rules={[{ required: true, message: 'Please enter branch name' }]}
          >
            <Input placeholder="Enter branch name" />
          </Form.Item>

          <Form.Item
            label="Branch Code"
            name="code"
            rules={[{ required: true, message: 'Please enter branch code' }]}
          >
            <Input placeholder="Enter branch code" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input placeholder="Enter branch address" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="Enter branch phone number" />
          </Form.Item>

          <Form.Item
            label="Branch Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter branch email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="Enter branch email" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={createBranchMutation.isPending || updateBranchMutation.isPending}
              >
                {editingBranch ? 'Update Branch' : 'Create Branch'}
              </Button>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};