import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Modal, App, Space, Table, Tag, Typography, Form, Input, Spin, Tabs, Select, Dropdown } from 'antd';
import { toast } from 'sonner';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, UserAddOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useListBranches, type ListBranchesParams, type Branch } from '../../hooks/Branches/useListBranches';
import { useCreateBranch } from '../../hooks/Branches/useCreateBranch';
import { useUpdateBranch } from '../../hooks/Branches/useUpdateBranch';
import { useDeleteBranch } from '../../hooks/Branches/useDeleteBranch';
import { useListUsers } from '../../hooks/Users(Head Office - HO)/useListUsers';
import { useCreateUser } from '../../hooks/Users(Head Office - HO)/useCreateUser';
import { useUpdateUser } from '../../hooks/Users(Head Office - HO)/useUpdateUser';
import { useDeleteUser } from '../../hooks/Users(Head Office - HO)/useDeleteUser';
import type { User } from '../../hooks/Auth/useGetMe';
import { queryClient } from '../../lib/queryClient';

const { Title } = Typography;

interface BranchFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  managerName: string;
  managerUsername: string;
  managerEmail: string;
  managerPassword: string;
  operationHours: string;
  previousLoanTotal: number;
  previousSavingsTotal: number;
  previousDisbursement: number;
}

interface UserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'HO' | 'BR' | 'admin';
  branchId?: string;
}

export const BranchManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form] = Form.useForm<BranchFormData>();
  
  // User management state
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm] = Form.useForm<UserFormData>();

  // Pagination state
  const [branchPagination, setBranchPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [userPagination, setUserPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Hooks for branch operations
  const { data: branchesData, isLoading: isLoadingBranches } = useListBranches({
    page: branchPagination.current,
    limit: branchPagination.pageSize,
  });
  
  // Separate hook to fetch all branches for modal dropdown
  const { data: allBranchesData } = useListBranches({
    page: 1,
    limit: 100, // Large limit to get all branches
  });
  
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();
  
  // Hooks for user operations
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers({
    page: userPagination.current,
    limit: userPagination.pageSize,
  });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const branches = branchesData?.data?.branches || [];
  const allBranches = allBranchesData?.data?.branches || [];
  const users = usersData?.data?.users || [];

  const handleAddBranch = () => {
    setEditingBranch(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  useEffect(()=>{
    if(allBranchesData){
      console.log("all branches fetched")
    }
  }, [allBranchesData]);  

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    form.setFieldsValue({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone,
      email: branch.email,
      managerName: branch.managerName || '',
      managerUsername: branch.managerUsername || '',
      managerEmail: branch.managerEmail || '',
      managerPassword: '',
      operationHours: branch.operationHours || '',
      previousLoanTotal: branch.previousLoanTotal || 0,
      previousSavingsTotal: branch.previousSavingsTotal || 0,
      previousDisbursement: branch.previousDisbursement || 0,
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
            toast.success('Branch deleted successfully');
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete branch';
            toast.error(errorMessage);
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
          id: editingBranch._id,
          ...values
        });
        toast.success('Branch updated successfully');
      } else {
        // Add new branch
        await createBranchMutation.mutateAsync(values);
        toast.success('Branch created successfully');
      }
      setIsModalVisible(false);
      setEditingBranch(null);
      form.resetFields();
      
      // Refetch branches list to update the table
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save branch';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBranch(null);
    form.resetFields();
  };

  // User management functions
  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setIsUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      branchId: user.branchId || '',
      password: '' // Don't pre-fill password for security
    });
    setIsUserModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okType: 'danger',
      onOk() {
        deleteUserMutation.mutate(userId, {
          onSuccess: () => {
            toast.success('User deleted successfully');
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error(errorMessage);
          }
        });
      },
    });
  };

  const handleUserSubmit = async (values: UserFormData) => {
    try {
      if (editingUser) {
        // Update existing user (exclude password if empty)
        const updateData: any = {
          email: values.email,
          username: values.username,
          branchId: values.branchId
        };
        
        await updateUserMutation.mutateAsync({
          id: editingUser._id,
          ...updateData
        });
        
        toast.success('User updated successfully');
      } else {
        // Create new user
        await createUserMutation.mutateAsync(values);
        toast.success('User created successfully');
      }
      setIsUserModalVisible(false);
      setEditingUser(null);
      userForm.resetFields();
      
      // Refetch users list to update the table
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save user';
      toast.error(errorMessage);
    }
  };

  const handleUserCancel = () => {
    setIsUserModalVisible(false);
    setEditingUser(null);
    userForm.resetFields();
  };

  // User table columns
  const userColumns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'HO' ? 'purple' : 'blue'}>
          {role === 'HO' ? 'Head Office' : 'Branch'}
        </Tag>
      )
    },
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      render: (_,record: User) => {
        if (record?.role === 'HO') return <Tag color="purple">N/A</Tag>;
        return record.branch?.name || 'Unassigned';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Active' : 'Inactive'}
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
      width: 80,
      render: (_, record: User) => {
        const items = [
          {
            key: 'edit',
            label: (
              <span onClick={() => handleEditUser(record)}>
                <EditOutlined style={{ marginRight: 8 }} />
                Edit
              </span>
            ),
          },
          {
            key: 'delete',
            label: (
              <span onClick={() => handleDeleteUser(record.id)} style={{ color: '#ff4d4f' }}>
                <DeleteOutlined style={{ marginRight: 8 }} />
                Delete
              </span>
            ),
          },
        ];
        
        return (
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ transform: 'rotate(90deg)' }}
            />
          </Dropdown>
        );
      }
    }
  ];

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
      width: 80,
      render: (_, record: Branch) => {
        const items = [
          {
            key: 'edit',
            label: (
              <span onClick={() => handleEditBranch(record)}>
                <EditOutlined style={{ marginRight: 8 }} />
                Edit
              </span>
            ),
          },
          {
            key: 'delete',
            label: (
              <span onClick={() => handleDeleteBranch(record._id)} style={{ color: '#ff4d4f' }}>
                <DeleteOutlined style={{ marginRight: 8 }} />
                Delete
              </span>
            ),
          },
        ];
        
        return (
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ transform: 'rotate(90deg)' }}
            />
          </Dropdown>
        );
      },
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
                <Title level={2} style={{ 
                  margin: 0, 
                  display: 'inline',
                  fontSize: window.innerWidth <= 768 ? '20px' : '28px'
                }}>System Management</Title>
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
                            dataSource={branches}
                            rowKey="_id"
                            loading={isLoadingBranches}
                            scroll={window.innerWidth <= 768 ? { x: 1000 } : undefined}
                            pagination={{
                              current: branchPagination.current,
                              pageSize: branchPagination.pageSize,
                              total: branchesData?.data?.total || 0,
                              showSizeChanger: true,
                              showQuickJumper: true,
                              showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} branches`,
                              onChange: (page, pageSize) => {
                                setBranchPagination({ current: page, pageSize: pageSize || 10 });
                              },
                              onShowSizeChange: (current, size) => {
                                setBranchPagination({ current: 1, pageSize: size });
                              },
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'users',
                  label: (
                    <span>
                      <UserAddOutlined />
                      User Management
                    </span>
                  ),
                  children: (
                    <div>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddUser}
                        >
                          Register New User
                        </Button>
                      </div>
                      
                      {isLoadingUsers ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                          <Spin size="large" />
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
                            columns={userColumns}
                            dataSource={users}
                            rowKey="id"
                            loading={isLoadingUsers}
                            scroll={window.innerWidth <= 768 ? { x: 900 } : undefined}
                            pagination={{
                              current: userPagination.current,
                              pageSize: userPagination.pageSize,
                              total: usersData?.data?.pagination?.total || 0,
                              showSizeChanger: true,
                              showQuickJumper: true,
                              showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} users`,
                              onChange: (page, pageSize) => {
                                setUserPagination({ current: page, pageSize: pageSize || 10 });
                              },
                              onShowSizeChange: (current, size) => {
                                setUserPagination({ current: 1, pageSize: size });
                              },
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ),
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
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            operationHours: '8:00 AM - 5:00 PM',
            previousLoanTotal: 0,
            previousSavingsTotal: 0,
            previousDisbursement: 0
          }}
        >
          {/* Basic Branch Information */}
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Branch Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Branch Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter branch name' }]}
                >
                  <Input placeholder="Enter branch name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Branch Code"
                  name="code"
                  rules={[{ required: true, message: 'Please enter branch code' }]}
                >
                  <Input placeholder="Enter branch code (e.g., LMB001)" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Branch Address"
                  name="address"
                  rules={[{ required: true, message: 'Please enter branch address' }]}
                >
                  <Input placeholder="Enter complete branch address" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="+234-800-123-4567" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Branch Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter branch email' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input placeholder="branch@dominion.com" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Operation Hours"
                  name="operationHours"
                  rules={[{ required: true, message: 'Please enter operation hours' }]}
                >
                  <Input placeholder="8:00 AM - 5:00 PM" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Manager Information */}
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Branch Manager Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Manager Name"
                  name="managerName"
                  rules={[{ required: true, message: 'Please enter manager name' }]}
                >
                  <Input placeholder="Enter manager full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Manager Username"
                  name="managerUsername"
                  rules={[{ required: true, message: 'Please enter manager username' }]}
                >
                  <Input placeholder="Enter manager username" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Manager Email"
                  name="managerEmail"
                  rules={[
                    { required: true, message: 'Please enter manager email' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input placeholder="manager@dominion.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Manager Password"
                  name="managerPassword"
                  rules={[
                    { required: true, message: 'Please enter manager password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password placeholder="Enter manager password" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Initial Balances */}
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Initial Balances</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Previous Loan Total"
                  name="previousLoanTotal"
                  help="Starting loan portfolio balance"
                >
                  <Input type="number" placeholder="0" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Previous Savings Total"
                  name="previousSavingsTotal"
                  help="Starting savings balance"
                >
                  <Input type="number" placeholder="0" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Previous Disbursement"
                  name="previousDisbursement"
                  help="Starting disbursement amount"
                >
                  <Input type="number" placeholder="0" min={0} />
                </Form.Item>
              </Col>
            </Row>
          </div>

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

      {/* User Form Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Register New User'}
        open={isUserModalVisible}
        onCancel={handleUserCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select user role">
                  {/* <Select.Option value="HO">Head Office</Select.Option> */}
                  <Select.Option value="BR">Branch User</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
          >
            {({ getFieldValue }) => {
              const role = getFieldValue('role');
              if (role === 'BR') {
                return (
                  <Form.Item
                    label="Branch"
                    name="branchId"
                    rules={[{ required: true, message: 'Please select a branch' }]}
                  >
                    <Select placeholder="Select branch">
                      {allBranches.map((branch) => (
                        <Select.Option key={branch._id} value={branch._id}>
                          {branch.name} ({branch.code})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          {editingUser && (
            <div style={{ marginBottom: 16 }}>
              <Typography.Text type="secondary">
                Leave password empty to keep current password
              </Typography.Text>
              <Form.Item
                label="New Password (Optional)"
                name="password"
                rules={[
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password placeholder="Enter new password (optional)" />
              </Form.Item>
            </div>
          )}

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button onClick={handleUserCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};