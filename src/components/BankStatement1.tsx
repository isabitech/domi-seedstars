import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  InputNumber,
  Button,
  Space,
  Typography,
  Alert,
  DatePicker,
  Statistic,
  Row,
  Col,
  Divider,
  Tag,
  Table,
} from "antd";
import {
  BankOutlined,
  SaveOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {  calculateBankStatement1,
} from "../services/bankStatement";
import { useGetMe } from "../hooks/Auth/useGetMe";
import { useGetEntry } from "../hooks/Branch/Cashbook/useGetEntry";
import type { BankStatement1 } from "../hooks/Branch/Cashbook/useCreateEntry";

const { Title, Text } = Typography;

interface BankStatement1Props {
  selectedDate?: string;
  onSubmit?: (openingBal: number) => void;
  loading?: boolean;
}

export const BankStatement1Component: React.FC<BankStatement1Props> = ({
  selectedDate,
  onSubmit,
  loading: externalLoading,
}) => {
  const { data: currentUser } = useGetMe();
  const user = currentUser?.data;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [statement, setStatement] = useState<BankStatement1 | null>(null);
  const [editMode, setEditMode] = useState(true); // Controls whether form is editable
  const [currentDate, setCurrentDate] = useState(
    selectedDate || dayjs().format("YYYY-MM-DD")
  );
  const [error, setError] = useState<string | null>(null);

  // Merge internal and external loading states
  const isLoading = loading || externalLoading;

  const getBankStatement1 = useGetEntry(user.branchId, currentDate);

  // Load existing statement data
  const loadStatement = useCallback(async () => {
    if (user?.branchId || !currentDate) return;

    setLoading(true);
    setError(null);

    try {
      const existingStatement =
        getBankStatement1.data.data.operations.bankStatement1;

      if (existingStatement) {
        setStatement(existingStatement);
        setEditMode(false); // Disable editing if data exists
        form.setFieldsValue({
          opening: existingStatement.opening,
          date: dayjs(existingStatement.date),
        });
      } else {
        setEditMode(true); // Enable editing if no data
      }
    } catch (err) {
      setError("Failed to load bank statement data");
      console.error("Error loading statement:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.branchId, currentDate, form, getBankStatement1.data]);

  // Calculate statement when opening value changes
  const handleRecalculate = useCallback(async () => {
    if (user?.branchId) return;

    const opening = form.getFieldValue("opening") || 0;
    setCalculating(true);

    try {
      const calculatedStatement = await calculateBankStatement1(
        user.branchId,
        currentDate,
        opening
      );
      console.log("Calculated Statement:", calculatedStatement);
      // setStatement(calculatedStatement);
    } catch (err) {
      setError("Failed to calculate bank statement");
      console.error("Error calculating statement:", err);
    } finally {
      setCalculating(false);
    }
  }, [user?.branchId, currentDate, form]);

  // Handle form submission
  const handleSubmit = async (values: {
    opening: number;
    date: dayjs.Dayjs;
  }) => {
    if (!user?.branchId) return;

    setLoading(true);
    setError(null);
    if (onSubmit) {
      try {
         await onSubmit(values.opening);
         setEditMode(false); // Disable editing after successful submission
      } catch (err) {
        setError("Failed to submit bank statement");
        console.error("Error submitting statement:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit mode toggle
  const handleEdit = () => {
    setEditMode(true);
  };

  // Handle date change
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const newDate = date.format("YYYY-MM-DD");
      setCurrentDate(newDate);
    }
  };

  // Effect to reload when date changes
  useEffect(() => {
    loadStatement();
  }, [loadStatement]);

  // Effect to recalculate when opening changes
  const handleValuesChange = useCallback(
    (changedValues: { opening?: number }) => {
      if ("opening" in changedValues) {
        handleRecalculate();
      }
    },
    [handleRecalculate]
  );

  useEffect(() => {
    form.setFieldsValue({ date: dayjs(currentDate) });
  }, [currentDate, form]);

  const statementColumns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "Amount (₦)",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong style={{ color: amount >= 0 ? "#52c41a" : "#ff4d4f" }}>
          {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: string) => (
        <Tag color={source === "Manual" ? "blue" : "green"}>{source}</Tag>
      ),
    },
  ];

  const statementData = statement
    ? [
        {
          key: "opening",
          description: "Opening Balance",
          amount: statement.opening,
          source: "Manual",
        },
        {
          key: "recHO",
          description: "Received from Head Office (REC HO)",
          amount: statement.recHO,
          source: "Cashbook 1",
        },
        {
          key: "recBO",
          description: "Received from Branch Office (REC BO)",
          amount: statement.recBO,
          source: "Cashbook 1",
        },
        {
          key: "domi",
          description: "Dominion Bank",
          amount: statement.domi,
          source: "Cashbook 2",
        },
        {
          key: "pa",
          description: "POS/Transfer",
          amount: statement.pa,
          source: "Cashbook 2",
        },
      ]
    : [];

  return (
    <Card
      title={
        <Space>
          <BankOutlined />
          <span>Bank Statement 1 (BS1)</span>
        </Space>
      }
      loading={isLoading}
      extra={
        <Button icon={<ReloadOutlined />} onClick={loadStatement} size="small">
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          disabled={isLoading || !editMode}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Date is required" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Opening Balance (₦)"
                name="opening"
                rules={[
                  { required: true, message: "Opening balance is required" },
                ]}
                help="Default is 0. Can be changed by branch user."
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Enter opening balance"
                  formatter={(value) =>
                    `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            {editMode ? (
              <>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isLoading}
                >
                  {statement ? 'Update Statement' : 'Save Statement'}
                </Button>
                <Button
                  icon={<CalculatorOutlined />}
                  onClick={handleRecalculate}
                  loading={calculating}
                >
                  Recalculate
                </Button>
              </>
            ) : (
              <Button
                type="default"
                icon={<SaveOutlined />}
                onClick={handleEdit}
              >
                Edit Statement
              </Button>
            )}
          </Space>
        </Form>

        <Divider />

        {statement && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={4}>Bank Statement Details</Title>
              <Text type="secondary">
                Statement for {dayjs(statement.date).format("DD MMMM YYYY")}
              </Text>
            </div>

            <Table
              columns={statementColumns}
              dataSource={statementData}
              pagination={false}
              size="small"
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total Bank Statement 1</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Statistic
                        value={statement.bs1Total}
                        precision={0}
                        valueStyle={{
                          color:
                            statement.bs1Total >= 0 ? "#3f8600" : "#cf1322",
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                        prefix="₦"
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Tag icon={<DollarCircleOutlined />} color="gold">
                        Calculated
                      </Tag>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />

            <Card
              size="small"
              style={{
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
              }}
            >
              <Space direction="vertical" size="small">
                <Text strong>Calculation Formula:</Text>
                <Text code>
                  BS1 Total = Opening + REC HO + REC BO + DOMI + P.A
                </Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  • REC HO & REC BO are automatically pulled from Cashbook 1
                  (FRM HO & FRM BR fields)
                  <br />
                  • DOMI & P.A are automatically pulled from Cashbook 2 (DOMI
                  BANK & POS/T fields)
                  <br />• Only Opening Balance can be manually adjusted by
                  branch users
                </Text>
              </Space>
            </Card>
          </Space>
        )}
      </Space>
    </Card>
  );
};
