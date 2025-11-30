import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Table,
  DatePicker,
  Alert,
  Statistic,
  Modal
} from 'antd';
import { toast } from 'sonner';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  DollarOutlined,
  BankOutlined,
  FileTextOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { calculations } from '../../utils/calculations';
import { useUpdateHOFields } from '../../hooks/Operations/useUpdateHOFields';
import { useListBranches } from '../../hooks/Branches/useListBranches';
import { useListAllDailyOperations } from '../../hooks/Operations/useListAllDailyOperations';


const { Title, Text } = Typography;

interface BranchHOData {
  branchId: string;
  branchName: string;
  branchCode: string;
  cashbook1: {
    frmHO: number;
    frmBR: number;
  };
  disbursementRoll: {
    prevDis: number;
  };
  currentBranchRegister: {
    prevTotalSav: number;
    prevTotalLoan: number;
  };
  lastUpdated?: string;
}

export const HOOperationsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [branchData, setBranchData] = useState<BranchHOData[]>([]);
  const [editingCell, setEditingCell] = useState<{branchId: string, field: string} | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchHOData | null>(null);
  const [modalForm] = Form.useForm();
  const [form] = Form.useForm();

  // Initialize the useUpdateHOFields hook
  const updateHOFieldsMutation = useUpdateHOFields();
  
  // Fetch branches from API
  const { data: branchesResponse, isLoading: branchesLoading, error: branchesError, refetch: refetchBranches } = useListBranches({
    page: 1,
    limit: 100
  });

  const getAllOperationsData = useListAllDailyOperations(
    selectedDate.format('YYYY-MM-DD')
  );

  // Initialize branch data
  useEffect(() => {
    const loadData = async () => {
      if (!branchesResponse?.data?.branches) return;
      
      setLoading(true);
      try {
        const branches = branchesResponse.data.branches;
        
        // Wait for operations data to be available
        await new Promise(resolve => setTimeout(resolve, 100));
        const operationsData = getAllOperationsData?.data?.data?.operations || [];
        
        // Initialize data using API branches and operations data
        const initialData: BranchHOData[] = branches.map(branch => {
          // Find the corresponding operation data for this branch
          const branchOperation = operationsData.find(
            (op: any) => op.branch._id === branch._id
          );
          
          // Extract cashbook1 data if available
          const frmHO = branchOperation?.cashbook1?.frmHO || 0;
          const frmBR = branchOperation?.cashbook1?.frmBR || 0;
          
          return {
            branchId: branch._id,
            branchName: branch.name,
            branchCode: branch.code,
            cashbook1: {
              frmHO: frmHO,
              frmBR: frmBR,
            },
            disbursementRoll: {
              prevDis: branch.previousDisbursement || 0,
            },
            currentBranchRegister: {
              prevTotalSav: branch.previousSavingsTotal || 0,
              prevTotalLoan: branch.previousLoanTotal || 0,
            },
          };
        });

        setBranchData(initialData);
        
        // Set form values
        const formValues: Record<string, number> = {};
        initialData.forEach(branch => {
          formValues[`${branch.branchId}_frmHO`] = branch.cashbook1.frmHO;
          formValues[`${branch.branchId}_frmBR`] = branch.cashbook1.frmBR;
          formValues[`${branch.branchId}_prevDis`] = branch.disbursementRoll.prevDis;
          formValues[`${branch.branchId}_prevTotalSav`] = branch.currentBranchRegister.prevTotalSav;
          formValues[`${branch.branchId}_prevTotalLoan`] = branch.currentBranchRegister.prevTotalLoan;
        });
        
        form.setFieldsValue(formValues);
      } catch (error) {
        console.error('Error loading branch data:', error);
        toast.error('Failed to load branch data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedDate.format('YYYY-MM-DD'), branchesResponse?.data?.branches, getAllOperationsData?.data?.data?.operations, form, refetchBranches]);

  const handleCellUpdate = async (branchId: string, field: string, value: number) => {
    try {
      // Prepare the API request data
      const apiData: Record<string, number> = {};
      
      if (field === 'frmHO') {
        apiData.frmHO = value;
      } else if (field === 'frmBR') {
        apiData.frmBR = value;
      } else if (field === 'prevDis') {
        apiData.previousDisbursement = value;
      } else if (field === 'prevTotalSav') {
        apiData.previousSavingsTotal = value;
      } else if (field === 'prevTotalLoan') {
        apiData.previousLoanTotal = value;
      }

      // Call the API
      await updateHOFieldsMutation.mutateAsync({
        branchId,
        ...apiData,
        // Include branch information if needed by your API
        field1: branchId === 'br-001' ? value : undefined,
        field2: branchId === 'br-002' ? value : undefined,
        field3: branchId === 'br-003' ? value : undefined,
      });

      // Update local state
      setBranchData(prev => prev.map(branch => {
        if (branch.branchId === branchId) {
          const updatedBranch = { ...branch, lastUpdated: dayjs().toISOString() };
          
          if (field === 'frmHO') {
            updatedBranch.cashbook1.frmHO = value;
          } else if (field === 'frmBR') {
            updatedBranch.cashbook1.frmBR = value;
          } else if (field === 'prevDis') {
            updatedBranch.disbursementRoll.prevDis = value;
          } else if (field === 'prevTotalSav') {
            updatedBranch.currentBranchRegister.prevTotalSav = value;
          } else if (field === 'prevTotalLoan') {
            updatedBranch.currentBranchRegister.prevTotalLoan = value;
          }
          
          return updatedBranch;
        }
        return branch;
      }));
      
      setEditingCell(null);
      toast.success('Value updated successfully');
    } catch (error) {
      console.error('Error updating HO fields:', error);
      toast.error('Failed to update value. Please try again.');
      setEditingCell(null);
    }
  };

  const handleBranchClick = (branch: BranchHOData) => {
    setSelectedBranch(branch);
    modalForm.setFieldsValue({
      frmHO: branch.cashbook1.frmHO,
      frmBR: branch.cashbook1.frmBR,
      prevDis: branch.disbursementRoll.prevDis,
      prevTotalSav: branch.currentBranchRegister.prevTotalSav,
      prevTotalLoan: branch.currentBranchRegister.prevTotalLoan,
    });
    setModalVisible(true);
  };

  const handleModalSave = async (values: {
    frmHO: number;
    frmBR: number;
    prevDis: number;
    prevTotalSav: number;
    prevTotalLoan: number;
  }) => {

    if (selectedBranch) {
      console.log("branch id", selectedBranch.branchId )
      try {
        // Call the API with all the updated values
        await updateHOFieldsMutation.mutateAsync({
          branchId: selectedBranch.branchId,
          frmHO: values.frmHO || 0,
          frmBR: values.frmBR || 0,
          previousDisbursement: values.prevDis || 0,
          previousSavingsTotal: values.prevTotalSav || 0,
          previousLoanTotal: values.prevTotalLoan || 0,
          // Map branch-specific fields based on branch ID
          field1: selectedBranch.branchId === 'br-001' ? values.frmHO : undefined,
          field2: selectedBranch.branchId === 'br-002' ? values.frmHO : undefined,
          field3: selectedBranch.branchId === 'br-003' ? values.frmHO : undefined,
        });

        // Update local state
        setBranchData(prev => prev.map(branch => 
          branch.branchId === selectedBranch.branchId 
            ? {
                ...branch,
                cashbook1: {
                  frmHO: values.frmHO || 0,
                  frmBR: values.frmBR || 0,
                },
                disbursementRoll: {
                  prevDis: values.prevDis || 0,
                },
                currentBranchRegister: {
                  prevTotalSav: values.prevTotalSav || 0,
                  prevTotalLoan: values.prevTotalLoan || 0,
                },
                lastUpdated: dayjs().toISOString(),
              }
            : branch
        ));
        
        toast.success(`${selectedBranch.branchName} data updated successfully`);
        setModalVisible(false);
        setSelectedBranch(null);
      } catch (error) {
        console.error('Error updating branch data:', error);
        toast.error('Failed to update branch data. Please try again.');
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refetchBranches();
      // Re-fetch operations data by updating the date
      setSelectedDate(dayjs(selectedDate));
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const totals = branchData.reduce((acc, branch) => ({
    totalFrmHO: acc.totalFrmHO + branch.cashbook1.frmHO,
    totalFrmBR: acc.totalFrmBR + branch.cashbook1.frmBR,
    totalPrevDis: acc.totalPrevDis + branch.disbursementRoll.prevDis,
    totalPrevSav: acc.totalPrevSav + branch.currentBranchRegister.prevTotalSav,
    totalPrevLoan: acc.totalPrevLoan + branch.currentBranchRegister.prevTotalLoan,
  }), {
    totalFrmHO: 0,
    totalFrmBR: 0,
    totalPrevDis: 0,
    totalPrevSav: 0,
    totalPrevLoan: 0,
  });

  // Show error if branches failed to load
  if (branchesError) {
    return (
      <div className="page-container" style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Branches"
          description="Failed to load branch data. Please refresh the page or contact support."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      </div>
    );
  }

  const EditableCell: React.FC<{
    value: number;
    branchId: string;
    field: string;
  }> = ({ value, branchId, field }) => {
    const isEditing = editingCell?.branchId === branchId && editingCell?.field === field;
    const [editValue, setEditValue] = useState(value.toString());
    const isUpdating = updateHOFieldsMutation.isPending && isEditing;

    const handleClick = () => {
      if (!isUpdating) {
        setEditingCell({ branchId, field });
        setEditValue(value.toString());
      }
    };

    const handleSave = () => {
      if (!isUpdating) {
        const numValue = parseFloat(editValue) || 0;
        handleCellUpdate(branchId, field, numValue);
      }
    };

    if (isEditing) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onPressEnter={handleSave}
          onBlur={handleSave}
          autoFocus
          disabled={isUpdating}
          style={{ width: '100%' }}
          placeholder={isUpdating ? 'Updating...' : 'Enter value'}
        />
      );
    }

    return (
      <div
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {calculations.formatCurrency(value)}
      </div>
    );
  };

  const columns: ColumnsType<BranchHOData> = [
    {
      title: 'Branch',
      key: 'branch',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <div
          onClick={() => handleBranchClick(record)}
          style={{
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.3s',
            border: '1px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e6f7ff';
            e.currentTarget.style.borderColor = '#1890ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: '#1890ff' }}>{record.branchName}</Text>
            <Text type="secondary">{record.branchCode}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>Click to edit</Text>
          </Space>
        </div>
      ),
    },
    {
      title: 'Fund from HO (₦)',
      key: 'frmHO',
      width: 150,
      render: (_, record) => (
        <EditableCell
          value={record.cashbook1.frmHO}
          branchId={record.branchId}
          field="frmHO"
        />
      ),
    },
    {
      title: 'Fund from Branch (₦)',
      key: 'frmBR',
      width: 150,
      render: (_, record) => (
        <EditableCell
          value={record.cashbook1.frmBR}
          branchId={record.branchId}
          field="frmBR"
        />
      ),
    },
    {
      title: 'Previous Disbursement (₦)',
      key: 'prevDis',
      width: 180,
      render: (_, record) => (
        <EditableCell
          value={record.disbursementRoll.prevDis}
          branchId={record.branchId}
          field="prevDis"
        />
      ),
    },
    {
      title: 'Previous Total Savings (₦)',
      key: 'prevTotalSav',
      width: 200,
      render: (_, record) => (
        <EditableCell
          value={record.currentBranchRegister.prevTotalSav}
          branchId={record.branchId}
          field="prevTotalSav"
        />
      ),
    },
    {
      title: 'Previous Total Loan (₦)',
      key: 'prevTotalLoan',
      width: 180,
      render: (_, record) => (
        <EditableCell
          value={record.currentBranchRegister.prevTotalLoan}
          branchId={record.branchId}
          field="prevTotalLoan"
        />
      ),
    },
    {
      title: 'Last Updated',
      key: 'lastUpdated',
      width: 150,
      render: (_, record) => (
        <Text type="secondary">
          {record.lastUpdated 
            ? dayjs(record.lastUpdated).format('HH:mm:ss')
            : 'Not updated'
          }
        </Text>
      ),
    },
  ];

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <SettingOutlined /> Head Office Operations
            </Title>
            <Text type="secondary">
              Manage daily operational inputs for all branches
            </Text>
          </Col>
          <Col>
            <Space>
              <DatePicker
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                format="YYYY-MM-DD"
                allowClear={false}
              />
              <Button 
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Alert */}
        <Alert
          message="Daily HO Operations"
          description={`Configure operational parameters for ${selectedDate.format('MMMM DD, YYYY')}. These values will be used in calculations across all branch operations.`}
          type="info"
          showIcon
          icon={<FileTextOutlined />}
        />

        {/* Overview Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8} xl={4.8}>
            <Card>
              <Statistic
                title="Total Fund from HO"
                value={totals.totalFrmHO}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4.8}>
            <Card>
              <Statistic
                title="Total Fund from BR"
                value={totals.totalFrmBR}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4.8}>
            <Card>
              <Statistic
                title="Total Prev Disbursement"
                value={totals.totalPrevDis}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4.8}>
            <Card>
              <Statistic
                title="Total Prev Savings"
                value={totals.totalPrevSav}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4.8}>
            <Card>
              <Statistic
                title="Total Prev Loan"
                value={totals.totalPrevLoan}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#fa541c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Operations Form */}
        <Card 
          title={
            <Space>
              <CalculatorOutlined />
              <span>Branch Operations Data - {selectedDate.format('YYYY-MM-DD')}</span>
            </Space>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Click on any cell to edit values directly, or click on a branch name to open the edit modal. Changes are saved automatically.
            </Text>
          </div>

          <Table
            columns={columns}
            dataSource={branchData}
            rowKey="branchId"
            pagination={false}
            scroll={{ x: 1200 }}
            loading={loading || branchesLoading}
            size="middle"
            bordered
          />
        </Card>

        {/* Branch Edit Modal */}
        <Modal
          title={
            selectedBranch ? (
              <Space>
                <BankOutlined />
                <span>Edit {selectedBranch.branchName} Operations</span>
              </Space>
            ) : 'Edit Branch Operations'
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedBranch(null);
          }}
          footer={null}
          width={600}
          destroyOnClose
        >
          {selectedBranch && (
            <Form
              form={modalForm}
              onFinish={handleModalSave}
              layout="vertical"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Fund from HO (₦)"
                    name="frmHO"
                    rules={[{ required: true, message: 'Please enter Fund from HO' }]}
                  >
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      prefix="₦"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Fund from Branch (₦)"
                    name="frmBR"
                    rules={[{ required: true, message: 'Please enter Fund from Branch' }]}
                  >
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      prefix="₦"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Previous Disbursement (₦)"
                    name="prevDis"
                    rules={[{ required: true, message: 'Please enter Previous Disbursement' }]}
                  >
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      prefix="₦"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Previous Total Savings (₦)"
                    name="prevTotalSav"
                    rules={[{ required: true, message: 'Please enter Previous Total Savings' }]}
                  >
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      prefix="₦"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Previous Total Loan (₦)"
                name="prevTotalLoan"
                rules={[{ required: true, message: 'Please enter Previous Total Loan' }]}
              >
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  prefix="₦"
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ float: 'right' }}>
                  <Button 
                    onClick={() => {
                      setModalVisible(false);
                      setSelectedBranch(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updateHOFieldsMutation.isPending}
                    disabled={updateHOFieldsMutation.isPending}
                  >
                    {updateHOFieldsMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>

        {/* Help Section */}
        <Card title="Field Descriptions" size="small">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space direction="vertical">
                <Text strong><DollarOutlined /> Fund from HO (FRM HO)</Text>
                <Text type="secondary">Amount received from Head Office for this branch.</Text>
                
                <Text strong><BankOutlined /> Fund from Branch (FRM BR)</Text>
                <Text type="secondary">Amount transferred between branches.</Text>
                
                <Text strong><FileTextOutlined /> Previous Disbursement</Text>
                <Text type="secondary">Total disbursement amount from previous period for roll calculation.</Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical">
                <Text strong><DollarOutlined /> Previous Total Savings</Text>
                <Text type="secondary">Cumulative savings balance from previous period.</Text>
                
                <Text strong><CalculatorOutlined /> Previous Total Loan</Text>
                <Text type="secondary">Total loan disbursed amount from previous period.</Text>
              </Space>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};