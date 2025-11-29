import { Space, Typography, Row, Col } from 'antd';
import { OnlineCIHComponent } from '../../components/OnlineCIH';

const { Title } = Typography;

export const OnlineCIHPage: React.FC = () => {


  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        <div>
          <Title level={2}>Online Cash in Hand</Title>
          <p style={{ color: '#666', marginBottom: 0 }}>
            Monitor your current cash position in real-time. This shows the difference between your daily collections and disbursements.
          </p>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={16}>
            <OnlineCIHComponent />
          </Col>
          <Col span={8}>
            <div style={{ 
              background: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <Title level={4} style={{ marginBottom: '16px' }}>Understanding Online CIH</Title>
              <Space direction="vertical" size="small">
                <div>
                  <strong>Formula:</strong>
                  <br />
                  <code>Online CIH = CB TOTAL 1 - CB TOTAL 2</code>
                </div>
                <div>
                  <strong>CB TOTAL 1:</strong> Previous cash + Collections (Savings + Loans + Charges) + Funds from HO/BR
                </div>
                <div>
                  <strong>CB TOTAL 2:</strong> Disbursements + Withdrawals + Available cash + POS transfers
                </div>
                <div style={{ marginTop: '16px' }}>
                  <strong>Status Indicators:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li><span style={{ color: '#52c41a' }}>Green:</span> Positive balance</li>
                    <li><span style={{ color: '#ff4d4f' }}>Red:</span> Cash deficit</li>
                    <li><span style={{ color: '#faad14' }}>Yellow:</span> Balanced</li>
                  </ul>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Space>
    </div>
  );
};