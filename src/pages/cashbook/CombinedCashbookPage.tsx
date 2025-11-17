import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Space, 
  Row, 
  Col, 
  Steps, 
  Button, 
  Typography, 
  Statistic,
  Alert,
  message,
  Spin
} from 'antd';
import { 
  CheckCircleOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import { useAuthStore } from '../../store';
import { Cashbook1Component } from '../../components/Cashbook1';
import { Cashbook2Component } from '../../components/Cashbook2';
import { cashbookService } from '../../services/cashbook';
import { calculations } from '../../utils/calculations';
import type { Cashbook1, Cashbook2 } from '../../types';

const { Title, Text } = Typography;

export const CombinedCashbookPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cashbook1Data, setCashbook1Data] = useState<Cashbook1 | null>(null);
  const [cashbook2Data, setCashbook2Data] = useState<Cashbook2 | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [todaysSummary, setTodaysSummary] = useState<{
    cashbook1: Cashbook1 | null;
    cashbook2: Cashbook2 | null;
    collectionTotal: number;
    cbTotal1: number;
    cbTotal2: number;
    onlineCIH: number;
  } | null>(null);
  
  const { user } = useAuthStore();
  const currentDate = new Date().toISOString().split('T')[0];

  // Load today's summary on component mount
  useEffect(() => {
    const loadTodaysSummary = async () => {
      if (user?.branchId) {
        setSummaryLoading(true);
        try {
          const response = await cashbookService.getTodaysCombinedSummary(user.branchId);
          if (response.success && response.data) {
            setTodaysSummary(response.data);
            setCashbook1Data(response.data.cashbook1);
            setCashbook2Data(response.data.cashbook2);
            
            // Set current step based on existing data
            if (response.data.cashbook1 && response.data.cashbook2) {
              setCurrentStep(2); // Both completed
            } else if (response.data.cashbook1) {
              setCurrentStep(1); // CB1 completed, CB2 pending
            } else {
              setCurrentStep(0); // Start with CB1
            }
          }
        } catch (error) {
          console.error('Error loading summary:', error);
        } finally {
          setSummaryLoading(false);
        }
      }
    };

    loadTodaysSummary();
  }, [user?.branchId]);

  const handleCashbook1Submit = async (data: Cashbook1) => {
    setCashbook1Data(data);
    setCurrentStep(1); // Move to Cashbook 2
    message.success('Cashbook 1 completed! Please proceed to Cashbook 2.');
    
    // Refresh summary
    await refreshSummary();
  };

  const handleCashbook2Submit = async (data: Cashbook2) => {
    setCashbook2Data(data);
    setCurrentStep(2); // Move to summary
    message.success('Cashbook 2 completed! Daily cashbook entry is now complete.');
    
    // Refresh summary
    await refreshSummary();
  };

  const refreshSummary = async () => {
    if (user?.branchId) {
      try {
        const response = await cashbookService.getTodaysCombinedSummary(user.branchId);
        if (response.success && response.data) {
          setTodaysSummary(response.data);
        }
      } catch (error) {
        console.error('Error refreshing summary:', error);
      }
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const steps = [
    {
      title: 'Cashbook 1',
      description: 'Daily Collections',
      icon: currentStep > 0 ? <CheckCircleOutlined /> : undefined,
    },
    {
      title: 'Cashbook 2',
      description: 'Disbursements & Withdrawals',
      icon: currentStep > 1 ? <CheckCircleOutlined /> : undefined,
    },
    {
      title: 'Summary',
      description: 'Daily Overview',
      icon: currentStep > 1 ? <CheckCircleOutlined /> : undefined,
    },
  ];

  if (summaryLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading today's cashbook data...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            Daily Cashbook Entry - {new Date(currentDate).toLocaleDateString()}
          </Title>
          <Text type="secondary">
            Complete both Cashbook 1 and Cashbook 2 entries for today's operations
          </Text>
        </div>

        {/* Progress Steps */}
        <Card>
          <Steps 
            current={currentStep} 
            items={steps}
            onChange={goToStep}
            style={{ marginBottom: 20 }}
          />
          
          {todaysSummary && (
            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col span={6}>
                <Statistic
                  title="Collection Total"
                  value={todaysSummary.collectionTotal}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="CB Total 1"
                  value={todaysSummary.cbTotal1}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="CB Total 2"
                  value={todaysSummary.cbTotal2}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Online Cash in Hand"
                  value={todaysSummary.onlineCIH}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ 
                    color: todaysSummary.onlineCIH >= 0 ? '#3f8600' : '#cf1322' 
                  }}
                />
              </Col>
            </Row>
          )}
        </Card>

        {/* Step Content */}
        {currentStep === 0 && (
          <Cashbook1Component
            onSubmit={handleCashbook1Submit}
            initialData={cashbook1Data || undefined}
            date={currentDate}
          />
        )}

        {currentStep === 1 && (
          <Cashbook2Component
            onSubmit={handleCashbook2Submit}
            initialData={cashbook2Data || undefined}
            date={currentDate}
            cashbook1CBTotal={todaysSummary?.cbTotal1 || 0}
          />
        )}

        {currentStep === 2 && (
          <Card title="Daily Summary" className="summary-section">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                message="Daily Cashbook Entry Completed"
                description="Both Cashbook 1 and Cashbook 2 have been successfully submitted for today."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Cashbook 1 - Collections" size="small" type="inner">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {cashbook1Data && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Previous Cash in Hand:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook1Data.pcih)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Savings:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook1Data.savings)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Loan Collection:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook1Data.loanCollection)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Charges:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook1Data.charges)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Fund from HO:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook1Data.frmHO)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Fund from BR:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook1Data.frmBR)}</Text>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            borderTop: '1px solid #d9d9d9',
                            paddingTop: 8,
                            marginTop: 8
                          }}>
                            <Text strong style={{ color: '#1890ff' }}>CB Total 1:</Text>
                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                              {calculations.formatCurrency(cashbook1Data.cbTotal1)}
                            </Text>
                          </div>
                        </>
                      )}
                    </Space>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="Cashbook 2 - Disbursements" size="small" type="inner">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {cashbook2Data && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Disbursement Number:</Text>
                            <Text strong>{cashbook2Data.disNo}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Disbursement Amount:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook2Data.disAmt)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Savings Withdrawal:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook2Data.savWith)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>DOMI Bank:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook2Data.domiBank)}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>POS/Transfer:</Text>
                            <Text strong>{calculations.formatCurrency(cashbook2Data.posT)}</Text>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            borderTop: '1px solid #d9d9d9',
                            paddingTop: 8,
                            marginTop: 8
                          }}>
                            <Text strong style={{ color: '#722ed1' }}>CB Total 2:</Text>
                            <Text strong style={{ color: '#722ed1', fontSize: '16px' }}>
                              {calculations.formatCurrency(cashbook2Data.cbTotal2)}
                            </Text>
                          </div>
                        </>
                      )}
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Card 
                title={
                  <Space>
                    <DollarOutlined />
                    Final Calculations
                  </Space>
                }
                type="inner"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
                headStyle={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Collection Total</span>}
                      value={todaysSummary?.collectionTotal || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>CB Total 1</span>}
                      value={todaysSummary?.cbTotal1 || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Online Cash in Hand</span>}
                      value={todaysSummary?.onlineCIH || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ 
                        color: (todaysSummary?.onlineCIH || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}
                    />
                  </Col>
                </Row>
              </Card>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => goToStep(0)}
                  style={{ marginRight: 16 }}
                >
                  Edit Cashbook 1
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => goToStep(1)}
                >
                  Edit Cashbook 2
                </Button>
              </div>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};