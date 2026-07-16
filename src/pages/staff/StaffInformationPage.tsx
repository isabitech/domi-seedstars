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
import { useListBranches } from '../../hooks/Branches/useListBranches';
import { useListStaff, type Staff } from '../../hooks/Staff/useListStaff';
import { useCreateStaff } from '../../hooks/Staff/useCreateStaff';
import { useUpdateStaff } from '../../hooks/Staff/useUpdateStaff';
import { useDeleteStaff } from '../../hooks/Staff/useDeleteStaff';

const { Title, Text } = Typography;

interface StaffFormValues {
  staffName: string;
  staffIdNumber: string;
  employmentDate: dayjs.Dayjs;
  currentPosition: string;
  branchId: string;
  currentBranch: string;
  residentialAddress: string;
  guarantorName: string;
  guarantorNumber: string;
  gender: 'male' | 'female';
}

export const StaffInformationPage: React.FC = () => {
  const { data: currentUser } = useGetMe();
  const isHO = currentUser?.data?.role === 'HO';

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'male' | 'female' | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm<StaffFormValues>();

  const { data: branchesData } = useListBranches({ page: 1, limit: 100 });

  const { data: staffData, isLoading } = useListStaff({
    page: pagination.current,
    limit: pagination.pageSize,
    search: search || undefined,
    gender: genderFilter,
  });

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const branches = branchesData?.data?.branches || [];
  const staff = staffData?.data?.staff || [];
  const total = staffData?.data?.total || 0;

  const branchLookup = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((branch) => {
      map[branch._id] = branch.name;
    });
    return map;
  }, [branches]);

  if (!isHO) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="Staff Information is available to Head Office users only."
      />
    );
  }

  const openCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: Staff) => {
    setEditingStaff(record);
    form.setFieldsValue({
      staffName: record.staffName,
      staffIdNumber: record.staffIdNumber,
      employmentDate: dayjs(record.employmentDate),
      currentPosition: record.currentPosition,
      branchId: record.branchId || record.branch?._id || '',
      currentBranch: record.currentBranch,
      residentialAddress: record.residentialAddress,
      guarantorName: record.guarantorName,
      guarantorNumber: record.guarantorNumber,
      gender: record.gender,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: StaffFormValues) => {
    try {
      if (editingStaff) {
        await updateStaff.mutateAsync({
          id: editingStaff._id,
          ...values,
          employmentDate: values.employmentDate.format('YYYY-MM-DD'),
        });
        toast.success('Staff information updated successfully');
      } else {
        await createStaff.mutateAsync({
          ...values,
          employmentDate: values.employmentDate.format('YYYY-MM-DD'),
        });
        toast.success('Staff information added successfully');
      }

      form.resetFields();
      setEditingStaff(null);
      setIsModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save staff information';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStaff.mutateAsync(id);
      toast.success('Staff information deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete staff information';
      toast.error(message);
    }
  };

  const handleExport = () => {
    if (!staff.length) {
      toast.info('No staff information to download');
      return;
    }

    const rows = staff.map((item, index) => ({
      'S/N': (pagination.current - 1) * pagination.pageSize + index + 1,
      'STAFF NAME': item.staffName || '',
      'STAFF I.D NUMBER': item.staffIdNumber || '',
      'EMPLOYMENT DATE': item.employmentDate ? dayjs(item.employmentDate).format('YYYY-MM-DD') : '',
      'CURRENT POSITION': item.currentPosition || '',
      'CURRENT BRANCH': item.currentBranch || item.branch?.name || branchLookup[item.branchId || ''] || '',
      'RESIDENTIAL ADDRESS': item.residentialAddress || '',
      'GUARANTOR NAME': item.guarantorName || '',
      'GUARANTOR NUMBER': item.guarantorNumber || '',
      'GENDER': item.gender || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Information');
    XLSX.writeFile(workbook, 'staff-information.xlsx');
    toast.success('Staff information downloaded');
  };

  const columns: ColumnsType<Staff> = [
    {
      title: 'S/N',
      key: 'sn',
      width: 70,
      render: (_value, _record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Staff Name',
      dataIndex: 'staffName',
      key: 'staffName',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Staff I.D Number',
      dataIndex: 'staffIdNumber',
      key: 'staffIdNumber',
    },
    {
      title: 'Employment Date',
      dataIndex: 'employmentDate',
      key: 'employmentDate',
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
    },
    {
      title: 'Current Position',
      dataIndex: 'currentPosition',
      key: 'currentPosition',
    },
    {
      title: 'Current Branch',
      key: 'currentBranch',
      render: (_, record) => record.currentBranch || record.branch?.name || branchLookup[record.branchId || ''] || '-',
    },
    {
      title: 'Residential Address',
      dataIndex: 'residentialAddress',
      key: 'residentialAddress',
      render: (value: string) => value || '-',
    },
    {
      title: 'Guarantor Name',
      dataIndex: 'guarantorName',
      key: 'guarantorName',
      render: (value: string) => value || '-',
    },
    {
      title: 'Guarantor Number',
      dataIndex: 'guarantorNumber',
      key: 'guarantorNumber',
      render: (value: string) => value || '-',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
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
            title="Delete staff information"
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
                <TeamOutlined /> Staff Information
              </Title>
              <Text type="secondary">Head Office staff records management</Text>
            </Col>
            <Col>
              <Space wrap>
                <Input.Search
                  allowClear
                  placeholder="Search staff"
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
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  Download List
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Add Staff
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={staff}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              showSizeChanger: true,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 10 }),
            }}
            scroll={window.innerWidth <= 768 ? { x: 1800 } : { x: 1500 }}
          />
        </Card>
      </Space>

      <Modal
        title={editingStaff ? 'Edit Staff Information' : 'Add Staff Information'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form<StaffFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Staff Name" name="staffName" rules={[{ required: true, message: 'Staff name is required' }]}>
                <Input placeholder="Enter staff name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Staff I.D Number" name="staffIdNumber" rules={[{ required: true, message: 'Staff I.D number is required' }]}>
                <Input placeholder="Enter staff I.D number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Employment Date" name="employmentDate" rules={[{ required: true, message: 'Employment date is required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Current Position" name="currentPosition" rules={[{ required: true, message: 'Current position is required' }]}>
                <Input placeholder="Enter current position" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Current Branch" name="branchId" rules={[{ required: true, message: 'Current branch is required' }]}>
                <Select
                  showSearch
                  placeholder="Select branch"
                  optionFilterProp="label"
                  options={branches.map((branch) => ({
                    value: branch._id,
                    label: branch.name,
                  }))}
                  onChange={(value) => {
                    const selectedBranch = branches.find((branch) => branch._id === value);
                    form.setFieldValue('currentBranch', selectedBranch?.name || '');
                  }}
                />
              </Form.Item>
            </Col>
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
          </Row>

          <Form.Item name="currentBranch" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Residential Address" name="residentialAddress" rules={[{ required: true, message: 'Residential address is required' }]}>
            <Input.TextArea rows={2} placeholder="Enter residential address" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Guarantor Name" name="guarantorName" rules={[{ required: true, message: 'Guarantor name is required' }]}>
                <Input placeholder="Enter guarantor name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Guarantor Number" name="guarantorNumber" rules={[{ required: true, message: 'Guarantor number is required' }]}>
                <Input placeholder="Enter guarantor number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createStaff.isPending || updateStaff.isPending}>
                {editingStaff ? 'Update Staff' : 'Create Staff'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStaff(null);
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
