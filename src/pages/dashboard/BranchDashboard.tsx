import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Space, Typography, Alert, Button } from 'antd';
import { 
  DollarOutlined, 
  BankOutlined, 
  CalculatorOutlined,
  FileTextOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { calculations } from '../../utils/calculations';
import { DisbursementRollDisplay } from '../../components/DisbursementRollDisplay';
import { CurrentBranchRegisterDisplay } from '../../components/CurrentBranchRegisterDisplay';
import type { Cashbook1, Cashbook2 } from '../../types';

const { Title, Text } = Typography;

export const BranchDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Mock data - in real app this would come from API/store
  const [cashbook1] = useState<Cashbook1 | null>(null);
  const [cashbook2] = useState<Cashbook2 | null>(null);
  
  // Mock HO inputs - these would come from HO dashboard/API in real app
  const [previousDisbursement] = useState<number>(50000); // Previous Disbursement for the month
  const [previousTotalSavings] = useState<number>(150000); // Previous total savings
  
  const date = new Date().toLocaleDateString();

  // Calculate derived values
  const onlineCIH = cashbook1 && cashbook2 
    ? calculations.calculateOnlineCIH(cashbook1.cbTotal1, cashbook2.cbTotal2)
    : 0;

  const bs1Total = cashbook1 && cashbook2
    ? calculations.calculateBS1Total({
        opening: 0,
        recHO: cashbook1.frmHO || 0,
        recBO: cashbook1.frmBR || 0,
        domi: cashbook2.domiBank || 0,
        pa: cashbook2.posT || 0
      })
    : 0;

  const bs2Total = cashbook1
    ? calculations.calculateBS2Total({
        withd: cashbook1.frmHO || 0,
        tbo: 0, // This would come from HO input
        exAmt: 0 // This would come from branch input
      })
    : 0;

  const transferToSenate = calculations.calculateTSO(bs1Total, bs2Total);

  // New calculations
  const disbursementRoll = cashbook2
    ? calculations.calculateDisbursementRoll(previousDisbursement, cashbook2.disAmt || 0)
    : previousDisbursement;

  const currentBranchRegister = cashbook1 && cashbook2
    ? calculations.calculateCurrentSavings(
        previousTotalSavings,
        cashbook1.savings || 0,
        cashbook2.savWith || 0
      )
    : previousTotalSavings;

  const hasData = cashbook1 || cashbook2;

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>
            <CalculatorOutlined /> Branch Dashboard
          </Title>
          <Text type="secondary">
            Daily operations overview for {date}
          </Text>
        </div>

        {!hasData && (
          <Alert
            message="Get Started with Today's Operations"
            description={
              <Space direction="vertical" style={{ marginTop: 12 }}>
                <Text>Complete your daily cashbook entries to see automated calculations and insights.</Text>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    onClick={() => navigate('/app/cashbook')}
                  >
                    Start Daily Cashbook
                  </Button>
                  <Button 
                    icon={<RiseOutlined />}
                    onClick={() => navigate('/app/predictions')}
                  >
                    Add Predictions
                  </Button>
                </Space>
              </Space>
            }
            type="info"
            showIcon
          />
        )}

        <Row gutter={[16, 16]}>
          {/* Online Cash in Hand */}
          <Col xs={24} sm={12} lg={8}>
            <Card className="stats-card">
              <Statistic
                title="Online Cash in Hand (CIH)"
                value={onlineCIH}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: onlineCIH >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '18px'
                }}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    CB1 - CB2
                  </div>
                }
              />
            </Card>
          </Col>

          {/* Bank Statement 1 Total */}
          <Col xs={24} sm={12} lg={8}>
            <Card className="stats-card">
              <Statistic
                title="Bank Statement 1 Total"
                value={bs1Total}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Inflows
                  </div>
                }
              />
            </Card>
          </Col>

          {/* Bank Statement 2 Total */}
          <Col xs={24} sm={12} lg={8}>
            <Card className="stats-card">
              <Statistic
                title="Bank Statement 2 Total"
                value={bs2Total}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Outflows
                  </div>
                }
              />
            </Card>
          </Col>

          {/* Transfer to Senate Office */}
          <Col xs={24} sm={12} lg={8}>
            <Card className="stats-card">
              <Statistic
                title="Transfer to Senate Office"
                value={transferToSenate}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: transferToSenate >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    BS1 - BS2
                  </div>
                }
              />
            </Card>
          </Col>

          {/* Use new read-only components for branch registers */}
          <Col xs={24} lg={12}>
            <DisbursementRollDisplay 
              cashbook2Data={cashbook2 || undefined}
              previousDisbursement={previousDisbursement}
              loading={!hasData}
            />
          </Col>

          <Col xs={24} lg={12}>
            <CurrentBranchRegisterDisplay 
              cashbook1Data={cashbook1 || undefined}
              cashbook2Data={cashbook2 || undefined}
              previousTotalSavings={previousTotalSavings}
              loading={!hasData}
            />
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/app/cashbook')}
              >
                Daily Cashbook Entry
              </Button>
            </Col>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<RiseOutlined />}
                onClick={() => navigate('/app/predictions')}
              >
                Tomorrow's Predictions
              </Button>
            </Col>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<BankOutlined />}
                onClick={() => navigate('/app/bank-statements')}
              >
                Bank Statements
              </Button>
            </Col>
            <Col xs={24} sm={6}>
              <Button 
                block 
                size="large" 
                icon={<CalculatorOutlined />}
                disabled={!hasData}
              >
                View Calculations
              </Button>
            </Col>
          </Row>
        </Card>

        {hasData && (
          <>
            {/* Detailed Breakdown */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title={<span><DollarOutlined /> Cashbook Summary</span>}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Cashbook 1 Total"
                        value={cashbook1?.cbTotal1 || 0}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Cashbook 2 Total"
                        value={cashbook2?.cbTotal2 || 0}
                        precision={2}
                        prefix="₦"
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title={<span><BankOutlined /> Bank Statement Breakdown</span>}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong>BS1 Components:</Text>
                      <br />
                      <Text>Opening: ₦0.00</Text>
                      <br />
                      <Text>From HO: ₦{(cashbook1?.frmHO || 0).toFixed(2)}</Text>
                      <br />
                      <Text>From BR: ₦{(cashbook1?.frmBR || 0).toFixed(2)}</Text>
                      <br />
                      <Text>DOMI: ₦{(cashbook2?.domiBank || 0).toFixed(2)}</Text>
                      <br />
                      <Text>POS/T: ₦{(cashbook2?.posT || 0).toFixed(2)}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* New calculations breakdown */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title={<span><DollarOutlined /> Disbursement Roll Breakdown</span>}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Formula: Previous Disbursement + Daily Disbursement</Text>
                      <br />
                      <Text>Previous Disbursement (HO Input): ₦{previousDisbursement.toFixed(2)}</Text>
                      <br />
                      <Text>Daily Disbursement (DIS AMT): ₦{(cashbook2?.disAmt || 0).toFixed(2)}</Text>
                      <br />
                      <Text strong style={{ color: '#fa8c16' }}>
                        Total Disbursement Roll: ₦{disbursementRoll.toFixed(2)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title={<span><BankOutlined /> Current Branch Register (Savings)</span>}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Formula: Previous Savings + New Savings - Withdrawals</Text>
                      <br />
                      <Text>Previous Total Savings (HO Input): ₦{previousTotalSavings.toFixed(2)}</Text>
                      <br />
                      <Text>New Savings (SAVINGS): ₦{(cashbook1?.savings || 0).toFixed(2)}</Text>
                      <br />
                      <Text>Savings Withdrawal (SAV WITH): ₦{(cashbook2?.savWith || 0).toFixed(2)}</Text>
                      <br />
                      <Text strong style={{ color: '#52c41a' }}>
                        Current Register: ₦{currentBranchRegister.toFixed(2)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Important Note */}
        <Alert
          message="Calculation Note"
          description={
            <Space direction="vertical">
              <Text>• Online CIH = Cashbook 1 Total - Cashbook 2 Total</Text>
              <Text>• Transfer to Senate Office = Bank Statement 1 Total - Bank Statement 2 Total</Text>
              <Text>• Disbursement Roll = Previous Disbursement (HO Input) + Daily Disbursement (DIS AMT)</Text>
              <Text>• Current Branch Register = Previous Total Savings (HO Input) + New Savings (SAVINGS) - Savings Withdrawal (SAV WITH)</Text>
              <Text>• All calculations are performed automatically based on your inputs and HO configurations</Text>
            </Space>
          }
          type="info"
          showIcon
        />
      </Space>
    </div>
  );
};