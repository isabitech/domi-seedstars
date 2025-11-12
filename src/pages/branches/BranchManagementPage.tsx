import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, message, Space, Table, Tag, Typography, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';
import type { Branch } from '../../types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface BranchFormData {
  name: string;
  code: string;
  location: string;
  isActive: boolean;
}

export const BranchManagementPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      name: 'Main Branch',
      code: 'MAIN',
      location: '123 Main Street, City Center',
      isActive: true,
      createdAt: '2023-01-01',
      users: [],
    },
    {
      id: '2',
      name: 'North Branch',
      code: 'NORTH',
      location: '456 North Avenue, Northside',
      isActive: true,
      createdAt: '2023-06-15',
      users: [],
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm<BranchFormData>();

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
      location: branch.location,
      isActive: branch.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDeleteBranch = (branchId: string) => {
    Modal.confirm({
      title: 'Delete Branch',
      content: 'Are you sure you want to delete this branch? This action cannot be undone.',
      okType: 'danger',
      onOk() {
        setBranches(prev => prev.filter(branch => branch.id !== branchId));
        message.success('Branch deleted successfully');
      },
    });
  };

  const handleSubmit = async (values: BranchFormData) => {
    try {
      if (editingBranch) {
        // Update existing branch
        setBranches(prev => 
          prev.map(branch => 
            branch.id === editingBranch.id 
              ? { ...branch, ...values }
              : branch
          )
        );
        message.success('Branch updated successfully');
      } else {
        // Add new branch
        const newBranch: Branch = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          users: [],
          ...values,
        };
        setBranches(prev => [...prev, newBranch]);
        message.success('Branch created successfully');
      }
      setIsModalVisible(false);
      setEditingBranch(null);
    } catch {
      message.error('Failed to save branch');
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
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
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
                <Title level={2} style={{ margin: 0, display: 'inline' }}>Branch Management</Title>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddBranch}
                size="large"
              >
                Add New Branch
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Branch Statistics */}
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {branches.length}
              </div>
              <div>Total Branches</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {branches.filter(b => b.isActive).length}
              </div>
              <div>Active Branches</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {branches.filter(b => !b.isActive).length}
              </div>
              <div>Inactive Branches</div>
            </div>
          </Card>
        </Col>

        {/* Branch List */}
        <Col span={24}>
          <Card title="All Branches">
            <Table
              dataSource={branches}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
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
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="Enter branch location" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
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