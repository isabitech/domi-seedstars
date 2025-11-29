import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Form,
  InputNumber,
  DatePicker,
  Alert,
  Statistic,
  Divider,
  Table,
} from "antd";
import { toast } from 'sonner';
import {
  RiseOutlined,
  SaveOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useCreatePrediction,
} from "../../hooks/Branch/Prediction/useCreatePrediction";

import { TOMMOROW_DATE } from "../../lib/utils";
import { useUpdatePrediction } from "../../hooks/Branch/Prediction/useUpdatePrediction";
import { useGetMe } from "../../hooks/Auth/useGetMe";
import { useGetEntry } from "../../hooks/Branch/Cashbook/useGetEntry";
import type { Prediction } from "../../hooks/Branch/Prediction/useGetPredictions";

const { Title, Text } = Typography;

export const PredictionsPage: React.FC = () => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  const [form] = Form.useForm();
  const [existingPredictionId, setExistingPredictionId] = useState<
    string | null
  >(null);

  const tomorrow = dayjs().add(1, "day");

  // Get all predictions for this branch

  // Get tomorrow's prediction specifically
  // Mutation hooks
  const updatePredictionMutation = useUpdatePrediction();

  const createPredictionEntry = useCreatePrediction();

  const getPrediction = useGetEntry(user?.branchId || "", TOMMOROW_DATE);

  useEffect(()=>{
    if(getPrediction?.data?.data?.operations?.prediction){
      const prediction = getPrediction.data.data.operations.prediction;
      form.setFieldsValue({
        predictionNo: prediction.predictionNo,
        predictionAmount: prediction.predictionAmount,
      });
      setExistingPredictionId(prediction._id);
    }
  },[getPrediction.data])
  // Handle form submission
  const handleSubmit = async (values: {
    predictionNo: number;
    predictionAmount: number;
    date: dayjs.Dayjs;
  }) => {
    if (!user?.branchId) {
      toast.error("User branch information is missing");
      return;
    }

    const predictionData = {
      branchId: user.branchId,
      date: values.date.format("YYYY-MM-DD"),
      predictionNo: values.predictionNo,
      predictionAmount: values.predictionAmount,
    };
    
    createPredictionEntry.mutate(predictionData,{
      onSuccess: () => {
        toast.success("Prediction created successfully");
        getPrediction.refetch();
      },
      onError: () => {
        toast.error("Failed to create prediction");
      }
    })
  };

  const predictions = getPrediction.data?.data?.operations?.prediction
    ? [{
        ...getPrediction.data.data.operations.prediction,
        id: getPrediction.data.data.operations.prediction._id || '',
        branchId: user?.branchId || '',
      }]
    : [];
  const currentPrediction = getPrediction.data?.data?.operations?.prediction;
  const loading =
    createPredictionEntry.isPending || updatePredictionMutation.isPending;

  // Calculate average per client
  const avgPerClient =
    currentPrediction && currentPrediction.predictionNo > 0
      ? currentPrediction.predictionAmount / currentPrediction.predictionNo
      : 0;

  // Table columns for predictions history
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Prediction No.",
      dataIndex: "predictionNo",
      key: "predictionNo",
      align: "center" as const,
      render: (value: number) => <Text strong>{value} clients</Text>,
    },
    {
      title: "Prediction Amount",
      dataIndex: "predictionAmount",
      key: "predictionAmount",
      align: "right" as const,
      render: (value: number) => <Text strong>₦{value.toLocaleString()}</Text>,
    },
    {
      title: "Avg per Client",
      key: "avgPerClient",
      align: "right" as const,
      render: (_: unknown, record: Prediction) => {
        const avg =
          record.predictionNo > 0
            ? record.predictionAmount / record.predictionNo
            : 0;
        return <Text>₦{avg.toLocaleString()}</Text>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: Prediction) => {
        const isToday = dayjs(record.date).isSame(dayjs(), "day");
        const isTomorrow = dayjs(record.date).isSame(tomorrow, "day");
        const isPast = dayjs(record.date).isBefore(dayjs(), "day");

        if (isTomorrow)
          return <span style={{ color: "#1890ff" }}>Tomorrow</span>;
        if (isToday) return <span style={{ color: "#52c41a" }}>Today</span>;
        if (isPast) return <span style={{ color: "#999" }}>Past</span>;
        return <span style={{ color: "#722ed1" }}>Future</span>;
      },
    },
  ];

  return (
    <div className="page-container" style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>
            <RiseOutlined /> Tomorrow's Disbursement Predictions
          </Title>
          <Text type="secondary">
            Plan and predict tomorrow's loan disbursements for{" "}
            {tomorrow.format("dddd, DD MMMM YYYY")}
          </Text>
        </div>

        {/* Remove the error alert and update the loading states */}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Prediction Entry</span>
                </Space>
              }
              loading={createPredictionEntry.isPending}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={
                  createPredictionEntry.isPending ||
                  updatePredictionMutation.isPending
                }
              >
                <Form.Item
                  label="Prediction Date"
                  name="date"
                  rules={[{ required: true, message: "Date is required" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    disabledDate={(current) =>
                      current && current <= dayjs().startOf("day")
                    }
                    defaultValue={tomorrow}
                  />
                </Form.Item>

                <Form.Item
                  label="Prediction No. (Number of Clients)"
                  name="predictionNo"
                  rules={[
                    {
                      required: true,
                      message: "Number of clients is required",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Must be a positive number",
                    },
                  ]}
                  help="Total number of clients you plan to disburse loans to tomorrow"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Enter number of clients"
                    suffix={<UserOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="Prediction Amount (Total Disbursement)"
                  name="predictionAmount"
                  rules={[
                    {
                      required: true,
                      message: "Prediction amount is required",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Must be a positive amount",
                    },
                  ]}
                  help="Total amount you plan to disburse tomorrow"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="Enter total disbursement amount"
                    formatter={(value) =>
                      `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                  size="large"
                >
                  Save Tomorrow's Prediction
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            {currentPrediction && (
              <Card
                title={
                  <Space>
                    <CalculatorOutlined />
                    <span>Prediction Summary</span>
                  </Space>
                }
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Clients to Serve"
                        value={currentPrediction.predictionNo}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Total Amount"
                        value={currentPrediction.predictionAmount}
                        precision={0}
                        prefix="₦"
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Col>
                  </Row>

                  <Divider />

                  <Statistic
                    title="Average Amount per Client"
                    value={avgPerClient}
                    precision={0}
                    prefix="₦"
                    valueStyle={{ color: "#fa8c16", fontSize: "24px" }}
                  />

                  <Alert
                    message="Prediction Insights"
                    description={
                      <Space direction="vertical" size="small">
                        <Text>
                          • This prediction helps plan cash flow and resource
                          allocation
                        </Text>
                        <Text>
                          • Average amount per client: ₦
                          {avgPerClient.toLocaleString()}
                        </Text>
                        <Text>
                          • Prediction date:{" "}
                          {dayjs(currentPrediction.date).format("DD MMMM YYYY")}
                        </Text>
                      </Space>
                    }
                    type="info"
                    showIcon
                  />
                </Space>
              </Card>
            )}
          </Col>
        </Row>

        <Card title="Predictions History">
          <Table
            columns={columns}
            dataSource={predictions}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} predictions`,
            }}
            loading={loading}
          />
        </Card>
      </Space>
    </div>
  );
};
