import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Switch,
  Typography,
  Tag,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BankOutlined 
} from '@ant-design/icons';
import type { Branch, BranchForm } from '../types';

const { Title } = Typography;

export const BranchManagement: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 'br-001',
      name: 'Lagos Branch',
      code: 'LG001',
      location: 'Victoria Island, Lagos',
      email: 'lagos@dominion-seedstars.com',
      password: 'lagos123',
      isActive: true,
      createdAt: '2024-01-01',
      users: []
    },
    {
      id: 'br-002',
      name: 'Abuja Branch',
      code: 'AB002',
      location: 'Central Business District, Abuja',
      email: 'abuja@dominion-seedstars.com',
      password: 'abuja123',
      isActive: true,
      createdAt: '2024-01-15',
      users: []
    }
  ]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Branch Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Branch Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Branch) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const handleAdd = () => {
    setEditingBranch(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue(branch);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Branch',
      content: 'Are you sure you want to delete this branch?',
      onOk: () => {
        setBranches(branches.filter(b => b.id !== id));
        message.success('Branch deleted successfully');
      }
    });
  };

  const handleSubmit = (values: BranchForm) => {
    if (editingBranch) {
      // Update existing branch
      setBranches(branches.map(b => 
        b.id === editingBranch.id 
          ? { ...b, ...values }
          : b
      ));
      message.success('Branch updated successfully');
    } else {
      // Add new branch
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        ...values,
        isActive: true,
        createdAt: new Date().toISOString(),
        users: []
      };
      setBranches([...branches, newBranch]);
      message.success('Branch added successfully');
    }
    
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleStatusToggle = (id: string, checked: boolean) => {
    setBranches(branches.map(b =>
      b.id === id ? { ...b, isActive: checked } : b
    ));
    message.success(`Branch ${checked ? 'activated' : 'deactivated'}`);
  };

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={3}>
              <BankOutlined /> Branch Management
            </Title>
            <p>Manage branches and their operations</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Add New Branch
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={branches}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          width={600}
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
              rules={[
                { required: true, message: 'Please enter branch code' },
                { pattern: /^[A-Z]{2}\d{3}$/, message: 'Code format: AB123' }
              ]}
            >
              <Input placeholder="e.g., LG001" />
            </Form.Item>

            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="Enter branch location" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter branch email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input placeholder="Enter branch email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter branch password' }]}
            >
              <Input.Password placeholder="Enter branch password" />
            </Form.Item>

            {editingBranch && (
              <Form.Item
                label="Status"
                name="isActive"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  onChange={(checked) => 
                    handleStatusToggle(editingBranch.id, checked)
                  }
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Space>
    </div>
  );
};