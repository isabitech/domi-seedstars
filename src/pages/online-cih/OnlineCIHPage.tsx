import { Space, Typography, Row, Col } from 'antd';
import { OnlineCIHComponent } from '../../components/OnlineCIH';

const { Title } = Typography;

export const OnlineCIHPage: React.FC = () => {


  return (
    <div className="page-container" style={{ 
      padding: window.innerWidth <= 768 ? '16px' : '24px' 
    }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        <div>
          <Title level={2} style={{ fontSize: window.innerWidth <= 768 ? '20px' : '28px' }}>Online Cash in Hand</Title>
          <p style={{ 
            color: '#666', 
            marginBottom: 0,
            fontSize: window.innerWidth <= 768 ? '14px' : '16px'
          }}>
            Monitor your current cash position in real-time. This shows the difference between your daily collections and disbursements.
          </p>
        </div>

        <Row gutter={[window.innerWidth <= 768 ? 16 : 24, window.innerWidth <= 768 ? 16 : 24]}>
          <Col xs={24} lg={16}>
            <OnlineCIHComponent />
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ 
              background: '#f9f9f9',
              padding: window.innerWidth <= 768 ? '16px' : '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              marginTop: window.innerWidth <= 768 ? '16px' : '0'
            }}>
              <Title level={4} style={{ 
                marginBottom: '16px',
                fontSize: window.innerWidth <= 768 ? '16px' : '20px'
              }}>Understanding Online CIH</Title>
              <Space direction="vertical" size="small">
                <div>
                  <strong style={{ fontSize: window.innerWidth <= 768 ? '13px' : '14px' }}>Formula:</strong>
                  <br />
                  <code style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Online CIH = CB TOTAL 1 - CB TOTAL 2</code>
                </div>
                <div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                  <strong>CB TOTAL 1:</strong> Previous cash + Collections (Savings + Loans + Charges) + Funds from HO/BR
                </div>
                <div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                  <strong>CB TOTAL 2:</strong> Disbursements + Withdrawals + Available cash + POS transfers
                </div>
                <div style={{ marginTop: '16px' }}>
                  <strong style={{ fontSize: window.innerWidth <= 768 ? '13px' : '14px' }}>Status Indicators:</strong>
                  <ul style={{ 
                    margin: '8px 0', 
                    paddingLeft: '20px',
                    fontSize: window.innerWidth <= 768 ? '12px' : '14px'
                  }}>
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