import React, { useState, useEffect, useCallback } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Alert,
  Typography,
  Divider,
  // message,
  // Spin,
  Tag,
  Tooltip 
} from 'antd';
import { SaveOutlined, CalculatorOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { calculations } from '../utils/calculations';
import { useCreateEntry } from '../hooks/Branch/Cashbook/useCreateEntry';
import { useUpdateEntry } from '../hooks/Branch/Cashbook/useUpdateEntry';
import type { User } from '../hooks/Auth/useGetMe';
import type { Cashbook1 } from '../hooks/Branch/Cashbook/get-daily-ops-types';
import { useGetOnlineCIHTSO } from '../hooks/Metrics/useGetOnlineCIH-TSO';
import { YESTERDAY_DATE } from '../lib/utils';

const { Title, Text } = Typography;

interface Cashbook1FormProps {
  onSubmit?: (data: Cashbook1) => void;
  initialData?: Partial<Cashbook1>;
  readonly?: boolean;
  date?: string;
  user: User
  existingEntry: Cashbook1;
}

export const Cashbook1Component: React.FC<Cashbook1FormProps> = ({
  onSubmit,
  initialData,
  readonly = false,
  date,
  user,
  existingEntry
}) => {
  const [form] = Form.useForm();
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [calculatedValues, setCalculatedValues] = useState({
    total: 0,
    cbTotal1: 0
  });
  const [pcihValue, setPcihValue] = useState<number>(0);
  
  
  const currentDate = date || new Date().toISOString().split('T')[0];
  
  // Get existing entry for today
  // const { 
  //   data: existingEntry, 
  //   isLoading: dataLoading, 
  //   refetch: refetchEntry 
  // } = useGetByBranchAndDate(user?.branchId || '', currentDate);

  // Mutation hooks

  const getPCIH = useGetOnlineCIHTSO({ date: YESTERDAY_DATE });



  const createEntryMutation = useCreateEntry();
  const updateEntryMutation = useUpdateEntry();



  const handleValuesChange = useCallback(() => {
    try {
      const values = form.getFieldsValue();
      // Convert string values to numbers
      const numericValues = {
        pcih: Number(values.pcih) || 0,
        savings: Number(values.savings) || 0,
        loanCollection: Number(values.loanCollection) || 0,
        charges: Number(values.charges) || 0,
        frmHO: Number(values.frmHO) || 0,
        frmBR: Number(values.frmBR) || 0
      };
      
      const total = calculations.calculateCashbook1Total(numericValues);
      const cbTotal1 = calculations.calculateCashbook1CBTotal(numericValues);
      
      setCalculatedValues({ total, cbTotal1 });
    } catch {
      console.error('Error calculating values');
    }
  }, [form]);

  useEffect(() =>{
    if ( getPCIH.data){
      // console.log("pcih", getPCIH.data);
      setPcihValue(getPCIH.data.data?.raw?.find(
        metric => user?.branchId && metric.branch.id === user.branchId
      )?.onlineCIH || 0);
    };
    if(pcihValue){
      form.setFieldsValue({ pcih: pcihValue });
      handleValuesChange();
    }
  }, [getPCIH.data, pcihValue , form, user, handleValuesChange]);

  // Load existing data when available
  useEffect(() => {
    if (existingEntry) {
      form.setFieldsValue({
        pcih: existingEntry.pcih,
        savings: existingEntry.savings,
        loanCollection: existingEntry.loanCollection,
        charges: existingEntry.chargesCollection,
        frmHO: existingEntry.frmHO,
        frmBR: existingEntry.frmBR
      });
      setExistingEntryId(existingEntry._id);
      handleValuesChange();
    }
  }, [existingEntry, form, handleValuesChange]);

  

  // Calculate values when form values change
  useEffect(() => {
    if (initialData) {
      const total = calculations.calculateCashbook1Total(initialData);
      const cbTotal1 = calculations.calculateCashbook1CBTotal(initialData);
      setCalculatedValues({ total, cbTotal1 });
    }
  }, [initialData]);

  
const handleSubmit = () => {
  const values = form.getFieldsValue();
  const cashbookData: Cashbook1 = {
    _id: existingEntryId || '',
    pcih: Number(values.pcih) || 0,
    savings: Number(values.savings) || 0,
    loanCollection: Number(values.loanCollection) || 0,
    frmHO: Number(values.frmHO) || 0,
    frmBR: Number(values.frmBR) || 0,
    date: currentDate,
    total: calculatedValues.total,
    cbTotal1: calculatedValues.cbTotal1,
    chargesCollection: Number(values.charges) || 0,
    branch: user?.branchId || '',
    user: user?.branchId || '',
    

  };
  onSubmit?.(cashbookData);
}
 

  const hasExistingData = !!existingEntry;
  const loading = createEntryMutation.isPending || updateEntryMutation.isPending;

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3}>
                Cashbook 1 - Daily Input
                {hasExistingData && (
                  <Tag color="green" style={{ marginLeft: 8 }}>Data Exists</Tag>
                )}
              </Title>
              <Text type="secondary">
                Enter daily operations data for {new Date(currentDate).toLocaleDateString()}
              </Text>
            </div>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  Daily Input Form
                  {user?.role === 'BR' && (
                    <Tag color="blue">Branch User</Tag>
                  )}
                  {user?.role === 'HO' && (
                    <Tag color="purple">Head Office</Tag>
                  )}
                </Space>
              } 
              className="form-section"
              extra={
                hasExistingData ? (
                  <Tag color="success">Updated: {hasExistingData ? 'Today' : 'Never'}</Tag>
                ) : null
              }
            >
              {/* {dataLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Loading existing data...</p>
                </div>
              ) : ( */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                initialValues={initialData}
                disabled={readonly}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          Previous Cash in Hand (PCIH)
                          <Tooltip title={user?.role === 'BR' 
                            ? "This value is automatically set from yesterday's Online CIH and cannot be edited" 
                            : "The amount of cash carried over from the previous day"
                          }>
                            <InfoCircleOutlined style={{ 
                              color: user?.role === 'BR' ? '#fa8c16' : '#1890ff' 
                            }} />
                          </Tooltip>
                          {user?.role === 'BR' && (
                            <Tag color="orange">Auto-filled</Tag>
                          )}
                        </Space>
                      }
                      name="pcih"
                      rules={[
                        { required: false, message: 'PCIH is required' },
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder={user?.role === 'BR' ? 'Auto-filled from yesterday\'s Online CIH' : '0.00'}
                        prefix="₦"
                        size="large"
                        step="0.01"
                        disabled={user?.role === 'BR'} // Disable for branches
                        style={{ 
                          backgroundColor: user?.role === 'BR' ? '#fff2e8' : 'white',
                          borderColor: user?.role === 'BR' ? '#ffb366' : '#d9d9d9',
                          width: '100%'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          Savings
                          <Tooltip title="Total savings collected today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="savings"
                      rules={[
                        { required: true, message: 'Savings amount is required' },
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          Loan Collection
                          <Tooltip title="Total loan repayments collected today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="loanCollection"
                      rules={[
                        { required: true, message: 'Loan collection amount is required' },
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          Charges Collection
                          <Tooltip title="Service charges and fees collected today">
                            <InfoCircleOutlined style={{ color: '#1890ff' }} />
                          </Tooltip>
                        </Space>
                      }
                      name="charges"
                      rules={[
                        { required: true, message: 'Charges amount is required' },
                        // { type: 'number', min: 0, message: 'Must be a positive number' }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        prefix="₦"
                        size="large"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left" orientationMargin={0} style={{ textAlign: 'center' }}>
                  <Space>
                    Head Office Only Fields
                    {user?.role !== 'HO' && (
                      <Tag color="orange">View Only</Tag>
                    )}
                  </Space>
                </Divider>
                
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          Fund from HO (FRM HO)
                          <Tooltip title={user?.role !== 'HO' 
                            ? 'Only Head Office can edit this field' 
                            : 'Amount received from Head Office'
                          }>
                            <InfoCircleOutlined style={{ 
                              color: user?.role !== 'HO' ? '#fa8c16' : '#1890ff' 
                            }} />
                          </Tooltip>
                        </Space>
                      }
                      name="frmHO"
                    >
                      <Input
                        type="number"
                        placeholder={user?.role !== 'HO' ? 'HO will fill this' : '0.00'}
                        prefix="₦"
                        size="large"
                        step="0.01"
                        disabled={user?.role !== 'HO'}
                        style={{ 
                          backgroundColor: user?.role !== 'HO' ? '#fff2e8' : 'white',
                          borderColor: user?.role !== 'HO' ? '#ffb366' : '#d9d9d9',
                          width: '100%'
                        }}
                        value={'0'}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          Fund from Branch (FRM BR)
                          <Tooltip title={user?.role !== 'HO' 
                            ? 'Only Head Office can edit this field' 
                            : 'Amount received from other branches'
                          }>
                            <InfoCircleOutlined style={{ 
                              color: user?.role !== 'HO' ? '#fa8c16' : '#1890ff' 
                            }} />
                          </Tooltip>
                        </Space>
                      }
                      name="frmBR"
                    >
                      <Input
                        type="number"
                        placeholder={user?.role !== 'HO' ? 'HO will fill this' : '0.00'}
                        prefix="₦"
                        size="large"
                        step="0.01"
                        disabled={user?.role !== 'HO'}
                        style={{ 
                          backgroundColor: user?.role !== 'HO' ? '#fff2e8' : 'white',
                          borderColor: user?.role !== 'HO' ? '#ffb366' : '#d9d9d9',
                          width: '100%'
                        }}
                        value={'0'}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {user?.role !== 'HO' && (
                  <Alert
                    message="Branch User Guidelines"
                    description={
                      <div>
                        <p>• <strong>PCIH (Previous Cash in Hand):</strong> Automatically filled from yesterday's Online CIH - cannot be edited</p>
                        <p>• <strong>FRM HO and FRM BR:</strong> Can only be edited by Head Office users</p>
                        <p>• <strong>Disbursement Roll, Loan & Savings Registers:</strong> View-only, calculated automatically</p>
                      </div>
                    }
                    type="info"
                    // showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                {!readonly && (
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                      style={{ minWidth: '200px' }}

                    >
                      {hasExistingData ? 'Update Cashbook 1' : 'Submit Cashbook 1'}
                    </Button>
                  </Form.Item>
                )}
              </Form>
              {/* // )} */}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              title={<span><CalculatorOutlined /> Live Calculations</span>}
              className="stats-card"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
              headStyle={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Statistic
                  title={
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Collection Total
                      <br />
                      <small>(Savings + Loan + Charges)</small>
                    </span>
                  }
                  value={calculatedValues.total}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
                />
                
                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '8px 0' }} />
                
                <Statistic
                  title={
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                      CB TOTAL 1
                      <br />
                      <small>(PCIH + Collection + FRM HO + FRM BR)</small>
                    </span>
                  }
                  value={calculatedValues.cbTotal1}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}
                />
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '16px'
                }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    Final Cashbook 1 Total
                  </Text>
                  <br />
                  <Text style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>
                    {calculations.formatCurrency(calculatedValues.cbTotal1)}
                  </Text>
                </div>
              </Space>
            </Card>

            <Card 
              title="Formula Reference" 
              size="small" 
              style={{ marginTop: 16 }}
            >
              <Space direction="vertical" size="small">
                <Text code>Total = Savings + Loan + Charges</Text>
                <Text code>CB TOTAL 1 = PCIH + Total + FRM HO + FRM BR</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};