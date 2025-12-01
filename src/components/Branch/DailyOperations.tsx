import React, { useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Alert,
  Spin,
  Statistic,
  Divider,
  Tag,
  Empty,
  Descriptions,
  Modal,
} from "antd";
import {
  CalendarOutlined,
  ReloadOutlined,
  HistoryOutlined,
  CalendarFilled,
  BankOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  RiseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useGetMyBranchDailyOperations } from "../../hooks/Branch/Operations/useGetOperations";
import { CURRENT_DATE } from "../../lib/utils";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useSubmitOperations } from "../../hooks/Branch/Operations/useSubmitOperations";

const { Title, Text } = Typography;

const DailyOperations = () => {
  // State for selected date
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE);
  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [operationId, setOperationId] = useState<string>("");

  // Hook to fetch operations data
  const {
    data: operationsData,
    isLoading,
    error,
    refetch,
  } = useGetMyBranchDailyOperations(selectedDate);

  const submitTodayOperations = useSubmitOperations(
    operationId || ""
  );

  useEffect(() => {
    if (operationsData) {
      toast.success(
        `${operationsData.message} || Loaded operations for ${selectedDate}`
      );
    }
    if (operationsData?.data?.operations?._id) {
      setOperationId(operationsData.data.operations._id);
    }
  }, [operationsData, selectedDate]);

  // Handle date change
  const handleDateChange = (date: any) => {
    if (date) {
      const formattedDate = date.format("YYYY-MM-DD");
      setSelectedDate(formattedDate);
    }
  };

  // Quick date selection handlers
  const handleTodayClick = () => {
    setSelectedDate(CURRENT_DATE);
  };

  const handleYesterdayClick = () => {
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    setSelectedDate(yesterday);
  };

  // Disable future dates
  const disabledDate = (current: any) => {
    return current && current > dayjs().endOf("day");
  };

  const handleSubmitOperations = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
    submitTodayOperations.mutate(undefined, {
      onSuccess: () => {
        toast.success("Today's operations submitted successfully!");
      },
      onError: () => {
        toast.error("Failed to submit today's operations.");
      },
    });
  };

  const handleCancelSubmit = () => {
    setIsConfirmModalOpen(false);
  };

  // Format date for display
  const getFormattedDate = () => {
    const selected = dayjs(selectedDate);
    const today = dayjs();
    const yesterday = today.subtract(1, "day");

    if (selected.isSame(today, "day")) {
      return `Today - ${selected.format("MMM DD, YYYY")}`;
    } else if (selected.isSame(yesterday, "day")) {
      return `Yesterday - ${selected.format("MMM DD, YYYY")}`;
    } else {
      return selected.format("MMMM DD, YYYY");
    }
  };

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={3}>
            <CalendarOutlined /> Daily Operations
          </Title>
          <Text type="secondary">
            View and manage daily branch operations for any date
          </Text>
        </div>

        {/* Date Selection Controls */}
        <Card title="Select Date" className="shadow-sm">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text strong>Choose Date</Text>
                <DatePicker
                  value={dayjs(selectedDate)}
                  onChange={handleDateChange}
                  disabledDate={disabledDate}
                  style={{ width: "100%" }}
                  size="large"
                  format="YYYY-MM-DD"
                  placeholder="Select date"
                />
              </Space>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text strong>Quick Select</Text>
                <Space>
                  <Button
                    icon={<CalendarFilled />}
                    onClick={handleTodayClick}
                    type={selectedDate === CURRENT_DATE ? "primary" : "default"}
                  >
                    Today
                  </Button>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={handleYesterdayClick}
                    type={
                      selectedDate ===
                      dayjs().subtract(1, "day").format("YYYY-MM-DD")
                        ? "primary"
                        : "default"
                    }
                  >
                    Yesterday
                  </Button>
                </Space>
              </Space>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Text strong>Actions</Text>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  loading={isLoading}
                  size="large"
                >
                  Refresh Data
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Selected Date Display */}
        <Card size="small">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ fontSize: "16px" }}>
                  Selected Date: {getFormattedDate()}
                </Text>
                {selectedDate === CURRENT_DATE && (
                  <Tag color="green">Current Day</Tag>
                )}
                {selectedDate ===
                  dayjs().subtract(1, "day").format("YYYY-MM-DD") && (
                  <Tag color="orange">Yesterday</Tag>
                )}
                {dayjs(selectedDate).isBefore(
                  dayjs().subtract(1, "day"),
                  "day"
                ) && <Tag color="blue">Historical</Tag>}
              </Space>
            </Col>
            <Col
              xs={24}
              sm={8}
              style={{ textAlign: window.innerWidth <= 576 ? "left" : "right" }}
            >
              <Statistic
                title="Days Ago"
                value={dayjs().diff(dayjs(selectedDate), "days")}
                suffix="days"
                valueStyle={{
                  fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Loading operations data for {getFormattedDate()}...</Text>
              </div>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert
            message="Error Loading Operations"
            description={`Failed to load operations for ${getFormattedDate()}. Please try again.`}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        )}

        {/* Operations Data Display */}
        {operationsData?.success &&
          operationsData.data?.operations &&
          !isLoading &&
          !error && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Operation Summary Header */}
              <Card
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Operations for {getFormattedDate()}</span>
                    <Tag
                      color={
                        operationsData.data.operations.isCompleted
                          ? "green"
                          : "orange"
                      }
                    >
                      {operationsData.data.operations.isCompleted
                        ? "Completed"
                        : "In Progress"}
                    </Tag>
                  </Space>
                }
                extra={
                  <Space>
                    <Text type="secondary">
                      {dayjs(operationsData.data.operations.updatedAt).format(
                        "HH:mm:ss"
                      )}
                    </Text>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Online CIH"
                      value={operationsData.data.operations.onlineCIH}
                      precision={2}
                      prefix="₦"
                      valueStyle={{
                        color:
                          operationsData.data.operations.onlineCIH >= 0
                            ? "#3f8600"
                            : "#cf1322",
                        fontSize: window.innerWidth <= 768 ? "14px" : "18px",
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="TSO"
                      value={operationsData.data.operations.tso}
                      precision={2}
                      prefix="₦"
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: window.innerWidth <= 768 ? "14px" : "18px",
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Branch"
                      value={operationsData.data.operations.branch.name}
                      formatter={(value) => (
                        <div>
                          <div
                            style={{
                              fontSize:
                                window.innerWidth <= 768 ? "14px" : "16px",
                              fontWeight: "bold",
                            }}
                          >
                            {value}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {operationsData.data.operations.branch.code}
                          </div>
                        </div>
                      )}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Operator"
                      value={operationsData.data.operations.user.name}
                      formatter={(value) => (
                        <div>
                          <div
                            style={{
                              fontSize:
                                window.innerWidth <= 768 ? "14px" : "16px",
                              fontWeight: "bold",
                            }}
                          >
                            {value}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {operationsData.data.operations.user.email}
                          </div>
                        </div>
                      )}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Cashbook Section */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <FileTextOutlined />
                        <span>Cashbook 1 - Collections</span>
                        <Tag
                          color={
                            operationsData.data.operations.cashbook1.isSubmitted
                              ? "green"
                              : "orange"
                          }
                        >
                          {operationsData.data.operations.cashbook1.isSubmitted
                            ? "Submitted"
                            : "Draft"}
                        </Tag>
                      </Space>
                    }
                    size="small"
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Previous CIH"
                          value={operationsData.data.operations.cashbook1.pcih}
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Savings"
                          value={
                            operationsData.data.operations.cashbook1.savings
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Loan Collection"
                          value={
                            operationsData.data.operations.cashbook1
                              .loanCollection
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Charges Collection"
                          value={
                            operationsData.data.operations.cashbook1
                              .chargesCollection
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="From HO"
                          value={operationsData.data.operations.cashbook1.frmHO}
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="From BR"
                          value={operationsData.data.operations.cashbook1.frmBR}
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Statistic
                      title="CB Total 1"
                      value={operationsData.data.operations.cashbook1.cbTotal1}
                      precision={2}
                      prefix="₦"
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <FileTextOutlined />
                        <span>Cashbook 2 - Disbursements</span>
                        <Tag
                          color={
                            operationsData.data.operations.cashbook2.isSubmitted
                              ? "green"
                              : "orange"
                          }
                        >
                          {operationsData.data.operations.cashbook2.isSubmitted
                            ? "Submitted"
                            : "Draft"}
                        </Tag>
                      </Space>
                    }
                    size="small"
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Disbursement No."
                          value={operationsData.data.operations.cashbook2.disNo}
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Disbursement Amt"
                          value={
                            operationsData.data.operations.cashbook2.disAmt
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Savings Withdrawal"
                          value={
                            operationsData.data.operations.cashbook2.savWith
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="DOMI Bank"
                          value={
                            operationsData.data.operations.cashbook2.domiBank
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="POS/Transfer"
                          value={operationsData.data.operations.cashbook2.posT}
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                    </Row>
                    <Divider style={{ margin: "12px 0" }} />
                    <Statistic
                      title="CB Total 2"
                      value={operationsData.data.operations.cashbook2.cbTotal2}
                      precision={2}
                      prefix="₦"
                      valueStyle={{
                        color: "#722ed1",
                        fontSize: window.innerWidth <= 768 ? "16px" : "18px",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Additional Information Row */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <RiseOutlined />
                        Prediction
                      </Space>
                    }
                    size="small"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Statistic
                        title="Prediction No."
                        value={
                          operationsData.data.operations.prediction.predictionNo
                        }
                        valueStyle={{
                          fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                        }}
                      />
                      <Statistic
                        title="Amount"
                        value={
                          operationsData.data.operations.prediction
                            .predictionAmount
                        }
                        precision={2}
                        prefix="₦"
                        valueStyle={{
                          color: "#fa8c16",
                          fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                        }}
                      />
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <BankOutlined />
                        Bank Statement 1
                      </Space>
                    }
                    size="small"
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Opening"
                          value={
                            operationsData.data.operations.bankStatement1
                              .opening
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Received HO"
                          value={
                            operationsData.data.operations.bankStatement1.recHO
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="DOMI"
                          value={
                            operationsData.data.operations.bankStatement1.domi
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="BS1 Total"
                          value={
                            operationsData.data.operations.bankStatement1
                              .bs1Total
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            color: "#52c41a",
                            fontWeight: "bold",
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <BankOutlined />
                        Bank Statement 2
                      </Space>
                    }
                    size="small"
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Withdrawal"
                          value={
                            operationsData.data.operations.bankStatement2.withd
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="To BO"
                          value={
                            operationsData.data.operations.bankStatement2.tbo
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Expenses"
                          value={
                            operationsData.data.operations.bankStatement2.exAmt
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="BS2 Total"
                          value={
                            operationsData.data.operations.bankStatement2
                              .bs2Total
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            color: "#f5222d",
                            fontWeight: "bold",
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Registers Section */}
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <DollarOutlined />
                        Loan Register
                      </Space>
                    }
                    size="small"
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Previous Total"
                          value={
                            operationsData.data.operations.loanRegister
                              .previousLoanTotal
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "10px" : "12px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Disbursement + Interest"
                          value={
                            operationsData.data.operations.loanRegister
                              .loanDisbursementWithInterest
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Collection"
                          value={
                            operationsData.data.operations.loanRegister
                              .loanCollection
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Current Balance"
                          value={
                            operationsData.data.operations.loanRegister
                              .currentLoanBalance
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            color: "#722ed1",
                            fontWeight: "bold",
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    type="inner"
                    title={
                      <Space>
                        <DollarOutlined />
                        Savings Register
                      </Space>
                    }
                    size="small"
                  >
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Previous Total"
                          value={
                            operationsData.data.operations.savingsRegister
                              .previousSavingsTotal
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Savings"
                          value={
                            operationsData.data.operations.savingsRegister
                              .savings
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Withdrawal"
                          value={
                            operationsData.data.operations.savingsRegister
                              .savingsWithdrawal
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                      <Col xs={12} sm={12}>
                        <Statistic
                          title="Current Balance"
                          value={
                            operationsData.data.operations.savingsRegister
                              .currentSavings
                          }
                          precision={2}
                          prefix="₦"
                          valueStyle={{
                            color: "#52c41a",
                            fontWeight: "bold",
                            fontSize:
                              window.innerWidth <= 768 ? "18px" : "24px",
                          }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Operation Status */}
              <Card>
                <Descriptions
                  title="Operation Details"
                  bordered
                  column={window.innerWidth <= 768 ? 1 : 2}
                  size="small"
                >
                  <Descriptions.Item label="Operation ID">
                   {operationId && <Text code>{operationId}</Text>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {operationsData.data.operations.isCompleted ? (
                      <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <Text style={{ color: "#52c41a" }}>Completed</Text>
                      </Space>
                    ) : (
                      <Space>
                        <ClockCircleOutlined style={{ color: "#faad14" }} />
                        <Text style={{ color: "#faad14" }}>In Progress</Text>
                      </Space>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {dayjs(operationsData.data.operations.createdAt).format(
                      "MMMM DD, YYYY HH:mm:ss"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {dayjs(operationsData.data.operations.updatedAt).format(
                      "MMMM DD, YYYY HH:mm:ss"
                    )}
                  </Descriptions.Item>
                  {operationsData.data.operations.submittedAt && (
                    <Descriptions.Item label="Submitted At" span={2}>
                      {dayjs(operationsData.data.operations.submittedAt).format(
                        "MMMM DD, YYYY HH:mm:ss"
                      )}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Action Buttons */}
              <Card>
                <div style={{ textAlign: "center" }}>
                  <Space>
                    {/* <Button 
                    onClick={() => {
                      const dataStr = JSON.stringify(operationsData, null, 2);
                      navigator.clipboard.writeText(dataStr);
                    }}
                    type="default"
                  >
                    Copy to Clipboard
                  </Button> */}
                    {!operationsData.data.operations.isCompleted &&
                       (
                        <Button
                          type="primary"
                          onClick={() => handleSubmitOperations()}
                          loading={submitTodayOperations.isPending}
                        >
                          Submit Todays Operations
                        </Button>
                      )}
                  </Space>
                </div>
              </Card>
            </Space>
          )}

        {/* No Operations Found */}
        {operationsData?.success &&
          !operationsData.data?.operations &&
          !isLoading &&
          !error && (
            <Card>
              <Empty
                description={
                  <span>
                    No operations found for {getFormattedDate()}
                    <br />
                    <Text type="secondary">
                      Try selecting a different date or check if operations
                      exist for this day
                    </Text>
                  </span>
                }
              />
            </Card>
          )}

        {/* API Error Response */}
        {operationsData && !operationsData.success && !isLoading && (
          <Card>
            <Alert
              message="No Operations Data"
              description={
                operationsData.message ||
                `No operations found for ${getFormattedDate()}`
              }
              type="info"
              showIcon
              action={
                <Button size="small" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          </Card>
        )}

        {/* No Data State */}
        {!operationsData && !isLoading && !error && (
          <Card>
            <Empty
              description={
                <span>
                  No operations data available
                  <br />
                  <Text type="secondary">
                    Select a date and click refresh to load operations
                  </Text>
                </span>
              }
            />
          </Card>
        )}

        {/* Instructions */}
        <Card title="How to Use" type="inner" size="small">
          <Space direction="vertical" size="small">
            <Text>
              • <strong>Select Date:</strong> Use the date picker to choose any
              date up to today
            </Text>
            <Text>
              • <strong>Quick Access:</strong> Use "Today" and "Yesterday"
              buttons for common dates
            </Text>
            <Text>
              • <strong>View Data:</strong> Operations data will be displayed
              and logged to console
            </Text>
            <Text>
              • <strong>Historical Data:</strong> Access previous days'
              operations for review
            </Text>
          </Space>
        </Card>

        {/* Confirmation Modal */}
        <Modal
          title="Confirm Operations Submission"
          open={isConfirmModalOpen}
          onOk={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
          okText="Yes, Submit"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            loading: submitTodayOperations.isPending,
          }}
          cancelButtonProps={{
            disabled: submitTodayOperations.isPending,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ExclamationCircleOutlined
                style={{ color: "#faad14", fontSize: "20px" }}
              />
              <Text strong>
                Are you sure you want to submit today's daily operations?
              </Text>
            </div>
            <Alert
              message="Warning"
              description="Once submitted, you won't be able to edit or update any data for this day."
              type="warning"
              showIcon
              banner
            />
          </Space>
        </Modal>
      </Space>
    </div>
  );
};

export default DailyOperations;
