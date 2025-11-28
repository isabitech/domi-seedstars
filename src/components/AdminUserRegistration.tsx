import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  Space,
  Typography,
  message,
  Divider
} from 'antd';
import {
  UserAddOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { RegisterComponent } from './RegisterComponent';

const { Title, Text } = Typography;

interface UserRegistrationModalProps {
  visible?: boolean;
  onClose?: () => void;
}

export const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({
  visible = false,
  onClose
}) => {
  const [isModalVisible, setIsModalVisible] = useState(visible);

  const handleSuccess = () => {
    message.success('New user registered successfully!');
    setIsModalVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          Register New User
        </Space>
      }
      open={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <RegisterComponent
        onSuccess={handleSuccess}
        redirectTo=""
      />
    </Modal>
  );
};

interface AdminUserRegistrationProps {
  showAsCard?: boolean;
}

export const AdminUserRegistration: React.FC<AdminUserRegistrationProps> = ({ 
  showAsCard = true 
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!showAsCard) {
    return (
      <>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          Register New User
        </Button>
        
        <UserRegistrationModal
          visible={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <TeamOutlined />
          User Registration
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Register New System User
          </Title>
          <Text type="secondary">
            Add new Head Office or Branch users to the system
          </Text>
        </div>
        
        <Divider />
        
        <div>
          <Text strong>Registration Guidelines:</Text>
          <ul style={{ marginTop: 8, marginBottom: 16 }}>
            <li><Text>Head Office users have system-wide access and administrative privileges</Text></li>
            <li><Text>Branch users are assigned to specific branches for daily operations</Text></li>
            <li><Text>All passwords must contain uppercase, lowercase, and numeric characters</Text></li>
            <li><Text>Email addresses must be unique across the system</Text></li>
          </ul>
        </div>

        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setShowModal(true)}
          size="large"
          style={{ minWidth: '200px' }}
        >
          Register New User
        </Button>

        <UserRegistrationModal
          visible={showModal}
          onClose={() => setShowModal(false)}
        />
      </Space>
    </Card>
  );
};