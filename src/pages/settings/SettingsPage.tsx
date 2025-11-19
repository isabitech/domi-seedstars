import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  Table,
  Modal,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Tag,
  TimePicker,
  Checkbox,
  Radio,
  DatePicker,
  Alert,
  Statistic,
  Progress
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  BankOutlined,
  DollarOutlined,
  SecurityScanOutlined,
  BellOutlined,
  DatabaseOutlined,
  AuditOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { calculations } from '../../utils/calculations';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'HO' | 'BR';
  branchId?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface BranchData {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  manager: string;
  status: 'active' | 'inactive';
  operationHours: string;
  dailyLimit: number;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  
  // Mock data
  const [users] = useState<UserData[]>([
    {
      id: 'usr-001',
      username: 'admin',
      email: 'admin@dominion.com',
      role: 'HO',
      status: 'active',
      lastLogin: '2024-11-19 10:30:00',
      createdAt: '2024-01-15'
    },
    {
      id: 'usr-002',
      username: 'lagos_branch',
      email: 'lagos@dominion.com',
      role: 'BR',
      branchId: 'br-001',
      status: 'active',
      lastLogin: '2024-11-19 09:15:00',
      createdAt: '2024-02-01'
    }
  ]);

  const [branches] = useState<BranchData[]>([
    {
      id: 'br-001',
      name: 'Lagos Branch',
      code: 'LG001',
      address: 'Victoria Island, Lagos',
      phone: '+234-801-234-5678',
      email: 'lagos@dominion.com',
      manager: 'John Doe',
      status: 'active',
      operationHours: '8:00 AM - 5:00 PM',
      dailyLimit: 5000000
    },
    {
      id: 'br-002',
      name: 'Abuja Branch',
      code: 'AB002',
      address: 'Wuse II, Abuja',
      phone: '+234-802-345-6789',
      email: 'abuja@dominion.com',
      manager: 'Jane Smith',
      status: 'active',
      operationHours: '8:00 AM - 5:00 PM',
      dailyLimit: 3000000
    }
  ]);

  const handleSave = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`${section} settings saved successfully`);
    } catch {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (action: string, user?: UserData) => {
    setSelectedUser(user || null);
    setUserModalVisible(true);
    message.info(`${action} user functionality`);
  };

  const handleBranchAction = (action: string, branch?: BranchData) => {
    setSelectedBranch(branch || null);
    setBranchModalVisible(true);
    message.info(`${action} branch functionality`);
  };

  // System Configuration Tab
  const SystemConfigTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Application Settings" size="small">
            <Form layout="vertical">
              <Form.Item label="Application Name">
                <Input defaultValue="Dominion Seedstars" />
              </Form.Item>
              <Form.Item label="Company Name">
                <Input defaultValue="Seedstars Nigeria Limited" />
              </Form.Item>
              <Form.Item label="Default Currency">
                <Select defaultValue="NGN">
                  <Option value="NGN">Nigerian Naira (₦)</Option>
                  <Option value="USD">US Dollar ($)</Option>
                  <Option value="EUR">Euro (€)</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Financial Year Start">
                <DatePicker defaultValue={dayjs('2024-01-01')} />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => handleSave('System')}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Business Rules" size="small">
            <Form layout="vertical">
              <Form.Item label="Maximum Daily Transaction Limit">
                <InputNumber
                  defaultValue={10000000}
                  style={{ width: '100%' }}
                  addonBefore="₦"
                />
              </Form.Item>
              <Form.Item label="Auto-backup Time">
                <TimePicker defaultValue={dayjs('23:00', 'HH:mm')} />
              </Form.Item>
              <Form.Item label="Session Timeout (minutes)">
                <InputNumber defaultValue={30} min={5} max={120} />
              </Form.Item>
              <Form.Item label="Enable Audit Trail">
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="System Status" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Database Status"
                  value="Online"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Active Users"
                  value={users.filter(u => u.status === 'active').length}
                  suffix={`/ ${users.length}`}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="System Uptime"
                  value="99.8%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <div>
                  <Text strong>Storage Usage</Text>
                  <Progress percent={65} status="active" />
                  <Text type="secondary">650 GB / 1 TB</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // User Management Tab
  const UserManagementTab = () => {
    const userColumns: ColumnsType<UserData> = [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        render: (text, record) => (
          <Space>
            <UserOutlined />
            <div>
              <div style={{ fontWeight: 'bold' }}>{text}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
            </div>
          </Space>
        ),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role) => (
          <Tag color={role === 'HO' ? 'blue' : 'green'}>
            {role === 'HO' ? 'Head Office' : 'Branch User'}
          </Tag>
        ),
      },
      {
        title: 'Branch',
        dataIndex: 'branchId',
        key: 'branchId',
        render: (branchId) => branchId || 'N/A',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Last Login',
        dataIndex: 'lastLogin',
        key: 'lastLogin',
        render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm'),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleUserAction('Edit', record)}
            />
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleUserAction('Delete', record)}
            />
          </Space>
        ),
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>User Management</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => handleUserAction('Add')}
          >
            Add User
          </Button>
        </div>
        
        <Card>
          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    );
  };

  // Branch Management Tab
  const BranchManagementTab = () => {
    const branchColumns: ColumnsType<BranchData> = [
      {
        title: 'Branch',
        key: 'branch',
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
          </div>
        ),
      },
      {
        title: 'Contact Info',
        key: 'contact',
        render: (_, record) => (
          <div>
            <div>{record.phone}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        ),
      },
      {
        title: 'Manager',
        dataIndex: 'manager',
        key: 'manager',
      },
      {
        title: 'Daily Limit',
        dataIndex: 'dailyLimit',
        key: 'dailyLimit',
        render: (limit) => calculations.formatCurrency(limit),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleBranchAction('Edit', record)}
            />
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleBranchAction('Delete', record)}
            />
          </Space>
        ),
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>Branch Management</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => handleBranchAction('Add')}
          >
            Add Branch
          </Button>
        </div>
        
        <Card>
          <Table
            columns={branchColumns}
            dataSource={branches}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    );
  };

  // Financial Settings Tab
  const FinancialSettingsTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Interest Rates & Charges" size="small">
            <Form layout="vertical">
              <Form.Item label="Default Loan Interest Rate (%)">
                <InputNumber defaultValue={15} min={1} max={50} precision={2} />
              </Form.Item>
              <Form.Item label="Savings Interest Rate (%)">
                <InputNumber defaultValue={5} min={0} max={20} precision={2} />
              </Form.Item>
              <Form.Item label="Processing Fee (%)">
                <InputNumber defaultValue={2.5} min={0} max={10} precision={2} />
              </Form.Item>
              <Form.Item label="Late Payment Penalty (%)">
                <InputNumber defaultValue={5} min={0} max={20} precision={2} />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => handleSave('Financial')}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Transaction Limits" size="small">
            <Form layout="vertical">
              <Form.Item label="Minimum Savings Amount">
                <InputNumber
                  defaultValue={1000}
                  style={{ width: '100%' }}
                  addonBefore="₦"
                />
              </Form.Item>
              <Form.Item label="Maximum Loan Amount">
                <InputNumber
                  defaultValue={5000000}
                  style={{ width: '100%' }}
                  addonBefore="₦"
                />
              </Form.Item>
              <Form.Item label="Daily Withdrawal Limit">
                <InputNumber
                  defaultValue={500000}
                  style={{ width: '100%' }}
                  addonBefore="₦"
                />
              </Form.Item>
              <Form.Item label="Enable Transaction Approvals">
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Security Settings Tab
  const SecuritySettingsTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Password Policy" size="small">
            <Form layout="vertical">
              <Form.Item label="Minimum Password Length">
                <InputNumber defaultValue={8} min={6} max={20} />
              </Form.Item>
              <Form.Item label="Password Requirements">
                <Checkbox.Group defaultValue={['uppercase', 'lowercase', 'numbers']}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Checkbox value="uppercase">Uppercase letters</Checkbox>
                    <Checkbox value="lowercase">Lowercase letters</Checkbox>
                    <Checkbox value="numbers">Numbers</Checkbox>
                    <Checkbox value="special">Special characters</Checkbox>
                  </div>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item label="Password Expiry (days)">
                <InputNumber defaultValue={90} min={30} max={365} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Security Features" size="small">
            <Form layout="vertical">
              <Form.Item label="Two-Factor Authentication">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="Login Attempt Limit">
                <InputNumber defaultValue={5} min={3} max={10} />
              </Form.Item>
              <Form.Item label="Account Lockout Duration (minutes)">
                <InputNumber defaultValue={15} min={5} max={60} />
              </Form.Item>
              <Form.Item label="IP Whitelist">
                <Switch defaultValue={false} />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => handleSave('Security')}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Notification Settings Tab
  const NotificationSettingsTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Email Notifications" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Form layout="vertical">
                  <Form.Item label="Daily Reports">
                    <Switch defaultChecked />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Send daily financial reports</Text>
                    </div>
                  </Form.Item>
                  <Form.Item label="Low Balance Alerts">
                    <Switch defaultChecked />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Alert when branch balance is low</Text>
                    </div>
                  </Form.Item>
                </Form>
              </Col>
              <Col span={8}>
                <Form layout="vertical">
                  <Form.Item label="Transaction Alerts">
                    <Switch defaultValue={false} />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Notify on large transactions</Text>
                    </div>
                  </Form.Item>
                  <Form.Item label="System Maintenance">
                    <Switch defaultChecked />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Maintenance notifications</Text>
                    </div>
                  </Form.Item>
                </Form>
              </Col>
              <Col span={8}>
                <Form layout="vertical">
                  <Form.Item label="Report Schedule">
                    <Select defaultValue="daily" style={{ width: '100%' }}>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Recipients">
                    <Select mode="tags" style={{ width: '100%' }} placeholder="Add email addresses">
                      <Option value="admin@dominion.com">admin@dominion.com</Option>
                      <Option value="manager@dominion.com">manager@dominion.com</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="SMS Notifications" size="small">
            <Alert
              message="SMS Service Configuration"
              description="Configure your SMS gateway settings to enable SMS notifications for critical alerts and OTP verification."
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Form layout="inline">
              <Form.Item label="SMS Gateway">
                <Select defaultValue="disabled" style={{ width: 200 }}>
                  <Option value="disabled">Disabled</Option>
                  <Option value="twilio">Twilio</Option>
                  <Option value="nexmo">Vonage/Nexmo</Option>
                  <Option value="local">Local Gateway</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={() => handleSave('Notifications')}>
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Data Management Tab
  const DataManagementTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Backup & Restore" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Last Backup:</Text>
                <div>November 19, 2024 - 02:00 AM</div>
              </div>
              <Divider />
              <Space>
                <Button icon={<DownloadOutlined />}>
                  Create Backup
                </Button>
                <Button icon={<UploadOutlined />}>
                  Restore Backup
                </Button>
              </Space>
              <Form.Item label="Auto Backup Schedule">
                <Radio.Group defaultValue="daily">
                  <Radio value="daily">Daily</Radio>
                  <Radio value="weekly">Weekly</Radio>
                  <Radio value="monthly">Monthly</Radio>
                </Radio.Group>
              </Form.Item>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Data Export" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form layout="vertical">
                <Form.Item label="Export Format">
                  <Select defaultValue="excel" style={{ width: '100%' }}>
                    <Option value="excel">Excel (.xlsx)</Option>
                    <Option value="csv">CSV</Option>
                    <Option value="pdf">PDF</Option>
                    <Option value="json">JSON</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Date Range">
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<DownloadOutlined />} style={{ width: '100%' }}>
                    Export Data
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Data Retention" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Transaction Records (years)">
                  <InputNumber defaultValue={7} min={1} max={20} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Audit Logs (years)">
                  <InputNumber defaultValue={5} min={1} max={10} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="User Session Logs (months)">
                  <InputNumber defaultValue={6} min={1} max={24} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Audit & Compliance Tab
  const AuditComplianceTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Audit Settings" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Logging Configuration</Text>
                  <Form layout="vertical">
                    <Form.Item>
                      <Checkbox defaultChecked>User Login/Logout</Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox defaultChecked>Financial Transactions</Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox defaultChecked>Data Modifications</Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox defaultChecked>System Configuration Changes</Checkbox>
                    </Form.Item>
                  </Form>
                </Space>
              </Col>
              <Col span={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Compliance Reports</Text>
                  <div>
                    <Button type="link" icon={<DownloadOutlined />}>
                      Monthly Compliance Report
                    </Button>
                  </div>
                  <div>
                    <Button type="link" icon={<DownloadOutlined />}>
                      Annual Audit Report
                    </Button>
                  </div>
                  <div>
                    <Button type="link" icon={<DownloadOutlined />}>
                      Transaction Audit Trail
                    </Button>
                  </div>
                </Space>
              </Col>
              <Col span={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Regulatory Compliance</Text>
                  <div>
                    <Tag color="green">CBN Compliant</Tag>
                  </div>
                  <div>
                    <Tag color="green">NDPR Compliant</Tag>
                  </div>
                  <div>
                    <Tag color="orange">AML Review Due</Tag>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Button type="primary" size="small">
                      Run Compliance Check
                    </Button>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const tabItems = [
    {
      key: 'system',
      label: 'System',
      icon: <SettingOutlined />,
      children: <SystemConfigTab />,
    },
    {
      key: 'users',
      label: 'Users',
      icon: <UserOutlined />,
      children: <UserManagementTab />,
    },
    {
      key: 'branches',
      label: 'Branches',
      icon: <BankOutlined />,
      children: <BranchManagementTab />,
    },
    {
      key: 'financial',
      label: 'Financial',
      icon: <DollarOutlined />,
      children: <FinancialSettingsTab />,
    },
    {
      key: 'security',
      label: 'Security',
      icon: <SecurityScanOutlined />,
      children: <SecuritySettingsTab />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <BellOutlined />,
      children: <NotificationSettingsTab />,
    },
    {
      key: 'data',
      label: 'Data Management',
      icon: <DatabaseOutlined />,
      children: <DataManagementTab />,
    },
    {
      key: 'audit',
      label: 'Audit & Compliance',
      icon: <AuditOutlined />,
      children: <AuditComplianceTab />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>System Settings</Title>
        <Text type="secondary">
          Configure system parameters, manage users, and customize application behavior
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        style={{ minHeight: '600px' }}
      />

      {/* User Modal */}
      <Modal
        title={selectedUser ? 'Edit User' : 'Add New User'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Username" required>
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" required>
                <Input type="email" placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Role" required>
                <Select placeholder="Select role">
                  <Option value="HO">Head Office</Option>
                  <Option value="BR">Branch User</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Branch">
                <Select placeholder="Select branch">
                  <Option value="br-001">Lagos Branch</Option>
                  <Option value="br-002">Abuja Branch</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary">Save</Button>
              <Button onClick={() => setUserModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Branch Modal */}
      <Modal
        title={selectedBranch ? 'Edit Branch' : 'Add New Branch'}
        open={branchModalVisible}
        onCancel={() => setBranchModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Branch Name" required>
                <Input placeholder="Enter branch name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Branch Code" required>
                <Input placeholder="Enter branch code" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Address" required>
            <TextArea rows={3} placeholder="Enter branch address" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Phone">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email">
                <Input type="email" placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary">Save</Button>
              <Button onClick={() => setBranchModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;