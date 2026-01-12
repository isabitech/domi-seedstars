import React, { useState } from 'react';
import { Card, Typography, Space, DatePicker } from 'antd';
import { BookOutlined, CalendarOutlined } from '@ant-design/icons';
import SavingsRegister from '../../components/Branch/SavingsRegister';
import { CURRENT_DATE } from '../../lib/utils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const SavingsRegisterPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            <Space>
              <BookOutlined />
              Savings Register
            </Space>
          </Title>
          <Text type="secondary">
            View and manage branch savings register entries
          </Text>
        </div>

        {/* Date Picker */}
        <Card size="small">
          <Space>
            <CalendarOutlined />
            <Text strong>Select Date:</Text>
            <DatePicker
              value={dayjs(selectedDate)}
              onChange={handleDateChange}
              format="DD MMMM YYYY"
              allowClear={false}
              placeholder="Select date"
            />
          </Space>
        </Card>

        {/* Main Content */}
        <Card>
          <SavingsRegister selectedDate={selectedDate} />
        </Card>
      </Space>
    </div>
  );
};