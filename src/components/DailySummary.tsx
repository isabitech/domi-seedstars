import React from 'react';
import { Card, Row, Col, Statistic, Space, Typography, Alert } from 'antd';
import { 
  DollarOutlined, 
  BankOutlined, 
  CalculatorOutlined
} from '@ant-design/icons';
import { calculations } from '../utils/calculations';
import type { Cashbook1, Cashbook2 } from '../types';

const { Title, Text } = Typography;

interface DailySummaryProps {
  cashbook1: Cashbook1 | null;
  cashbook2: Cashbook2 | null;
  date?: string;
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  cashbook1,
  cashbook2,
  date = new Date().toLocaleDateString()
}) => {
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

  const hasData = cashbook1 || cashbook2;

  if (!hasData) {
    return (
      <Alert
        message="No Data Available"
        description="Please complete Cashbook 1 and Cashbook 2 to see calculations"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>
            <CalculatorOutlined /> Daily Summary & Calculations
          </Title>
          <Text type="secondary">
            Automated calculations for {date}
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {/* Online Cash in Hand */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Online Cash in Hand (CIH)"
                value={onlineCIH}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: onlineCIH >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '20px'
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
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Bank Statement 1 Total"
                value={bs1Total}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Inflows
                  </div>
                }
              />
            </Card>
          </Col>

          {/* Bank Statement 2 Total */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Bank Statement 2 Total"
                value={bs2Total}
                precision={2}
                prefix="₦"
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                suffix={
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Outflows
                  </div>
                }
              />
            </Card>
          </Col>

          {/* Transfer to Senate Office */}
          <Col xs={24} sm={12} lg={6}>
            <Card className="stats-card">
              <Statistic
                title="Transfer to Senate Office"
                value={transferToSenate}
                precision={2}
                prefix="₦"
                valueStyle={{ 
                  color: transferToSenate >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '20px',
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
        </Row>

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

        {/* Important Note */}
        <Alert
          message="Calculation Note"
          description={
            <Space direction="vertical">
              <Text>• Online CIH = Cashbook 1 Total - Cashbook 2 Total</Text>
              <Text>• Transfer to Senate Office = Bank Statement 1 Total - Bank Statement 2 Total</Text>
              <Text>• All calculations are performed automatically based on your inputs</Text>
            </Space>
          }
          type="info"
          showIcon
        />
      </Space>
    </div>
  );
};