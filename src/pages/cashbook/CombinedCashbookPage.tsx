import React, { useState, useEffect } from "react";
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
  Spin,
  notification,
} from "antd";
import { toast } from 'sonner';
import { CheckCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { Cashbook1Component } from "../../components/Cashbook1";
import { Cashbook2Component } from "../../components/Cashbook2";
import { calculations } from "../../utils/calculations";
import { useCreateEntry } from "../../hooks/Branch/Cashbook/useCreateEntry";
import { useGetEntry } from "../../hooks/Branch/Cashbook/useGetEntry";
import { useGetMe } from "../../hooks/Auth/useGetMe";
import {
  useCashbookStore,
  type CB1Type,
  type CB2Type,
} from "../../store/cashbookStore";
import type {
  Cashbook1,
  Cashbook2,
} from "../../hooks/Branch/Cashbook/get-daily-ops-types";

const { Title, Text } = Typography;

export const CombinedCashbookPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cashbook1Data, setCashbook1Data] = useState<Cashbook1 | null>(null);
  const [cashbook2Data, setCashbook2Data] = useState<Cashbook2 | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [todaysSummary, setTodaysSummary] = useState<{
    operations: {
      onlineCIH: number;
      tso: number;
      cashbook1: Cashbook1 | null;
      cashbook2: Cashbook2 | null;
    } | null;
    collectionTotal: number;
    cbTotal1: number;
    cbTotal2: number;
    onlineCIH: number;
  } | null>(null);

  // Zustand store
  const {
    cashbook1: storeCB1,
    cashbook2: storeCB2,
    setCashbook1,
    setCashbook2,
  } = useCashbookStore();

  const { data: currentUser } = useGetMe();

  const user = currentUser?.data;

  const currentDate = new Date().toISOString().split("T")[0];

  const getDailyEntry = useGetEntry(user?.branchId || "", currentDate);

  const createDailyEntry = useCreateEntry();

  const [operationIsCompleted, setOperationIsCompleted] = useState(false);

  useEffect(() => {
    if (getDailyEntry.data?.data?.operations) {
      console.log(getDailyEntry.data.data);
      setOperationIsCompleted(
        getDailyEntry.data.data.operations.isCompleted
      );
      const operations = getDailyEntry.data.data.operations;

      setCashbook1Data(operations?.cashbook1 || null);
      setCashbook2Data(operations?.cashbook2 || null);

      // Calculate summary values
      const cashbook1 = operations?.cashbook1;
      const cashbook2 = operations?.cashbook2;

      const collectionTotal = cashbook1
        ? (cashbook1.savings || 0) +
          (cashbook1.loanCollection || 0) +
          (cashbook1.chargesCollection || 0)
        : 0;
      const cbTotal1 = cashbook1?.cbTotal1 || 0;
      const cbTotal2 = cashbook2?.cbTotal2 || 0;
      const onlineCIH = operations?.onlineCIH || 0;

      setTodaysSummary({
        operations: {
          onlineCIH: operations?.onlineCIH || 0,
          tso: operations?.tso || 0,
          cashbook1: operations?.cashbook1 || null,
          cashbook2: operations?.cashbook2 || null,
        },
        collectionTotal,
        cbTotal1,
        cbTotal2,
        onlineCIH,
      });

      // Always start at step 0 when component mounts, regardless of existing data
      // User should manually navigate through the steps
      setCurrentStep(0);
    }
  }, [getDailyEntry.data]);
  useEffect(() => {
    if (currentUser) {
      console.log("current User", currentUser);
    }
  }, [currentUser]);


  const handleCashbook1Submit = (data: CB1Type) => {
    console.log("Cashbook 1 form data received:", data);

    // Save to Zustand store
    setCashbook1(data);

    // Convert component data to backend format for local state (for API compatibility)
    const cashbook1Data: Cashbook1 = {
      _id: "",
      pcih: data.pcih || 0,
      savings: data.savings || 0,
      loanCollection: data.loanCollection || 0,
      chargesCollection: data.chargesCollection || 0,
      total: data.total || 0,
      frmHO: data.frmHO || 0,
      frmBR: data.frmBR || 0,
      cbTotal1: data.cbTotal1 || 0,
      isSubmitted: false,
      date: currentDate,
      branch: user?.branchId || "",
      user: user?.id || "",
      createdAt: "",
      updatedAt: "",
      __v: 0,
    };

    setCashbook1Data(cashbook1Data);

    // Update todaysSummary with new CB1 data
    const collectionTotal =
      cashbook1Data.savings +
      cashbook1Data.loanCollection +
      cashbook1Data.chargesCollection;
    setTodaysSummary((prev) => ({
      ...prev,
      operations: {
        ...prev?.operations,
        cashbook1: cashbook1Data,
        onlineCIH: prev?.operations?.onlineCIH || 0,
        tso: prev?.operations?.tso || 0,
        cashbook2: prev?.operations?.cashbook2 || null,
      },
      collectionTotal,
      cbTotal1: cashbook1Data.cbTotal1,
      cbTotal2: prev?.cbTotal2 || 0,
      onlineCIH: prev?.onlineCIH || 0,
    }));

    setCurrentStep(1); // Move to Cashbook 2
    toast.success("Cashbook 1 completed! Please proceed to Cashbook 2.");
  };

  const handleCashbook2Submit = (data: CB2Type) => {
    console.log("Cashbook 2 form data received:", data);

    // Save to Zustand store
    setCashbook2(data);

    // Convert component data to backend format for local state (for API compatibility)
    const cashbook2Data: Cashbook2 = {
      _id: "",
      disNo: data.disNo || 0,
      disAmt: data.disAmt || 0,
      disWithInt: data.disWithInt || 0,
      savWith: data.savWith || 0,
      domiBank: data.domiBank || 0,
      posT: data.posT || 0,
      cbTotal2: data.cbTotal2 || 0,
      isSubmitted: false,
      date: currentDate,
      branch: user?.branchId || "",
      user: user?.id || "",
      createdAt: "",
      updatedAt: "",
      __v: 0,
    };

    setCashbook2Data(cashbook2Data);

    // Update todaysSummary with new CB2 data
    setTodaysSummary((prev) => ({
      ...prev,
      operations: {
        ...prev?.operations,
        cashbook2: cashbook2Data,
        onlineCIH: prev?.operations?.onlineCIH || 0,
        tso: prev?.operations?.tso || 0,
        cashbook1: prev?.operations?.cashbook1 || null,
      },
      collectionTotal: prev?.collectionTotal || 0,
      cbTotal1: prev?.cbTotal1 || 0,
      cbTotal2: cashbook2Data.cbTotal2,
      onlineCIH: prev?.onlineCIH || 0,
    }));

    setCurrentStep(2); // Move to summary
    toast.success("Cashbook 2 completed! Ready to submit complete entry.");
  };

  const handleFinalSubmit = async () => {
    if (!storeCB1 || !storeCB2 || !user?.branchId) {
      toast.error(
        "Please complete both Cashbook 1 and Cashbook 2 before submitting."
      );
      return;
    }
    setSummaryLoading(true);

    // Prepare payload with data from Zustand store
    const payload = {
      date: currentDate,
      ...storeCB1,
       ...storeCB2,
      onlineCIH:
        (todaysSummary && todaysSummary.operations
          ? todaysSummary.operations.onlineCIH
          : 0) || 0,
    };

    await createDailyEntry.mutate(payload, {
      onSuccess: (data: any) => {
       toast.success(data.message || "Daily entry submitted successfully!");
        getDailyEntry.refetch();
        setSummaryLoading(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "An error occurred while submitting the daily entry.");
        setSummaryLoading(false);
      },
    });

  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const steps = [
    {
      title: "Cashbook 1",
      description: "Daily Collections",
      icon: currentStep > 0 ? <CheckCircleOutlined /> : undefined,
    },
    {
      title: "Cashbook 2",
      description: "Disbursements & Withdrawals",
      icon: currentStep > 1 ? <CheckCircleOutlined /> : undefined,
    },
    {
      title: "Summary",
      description: "Daily Overview",
      icon: currentStep > 1 ? <CheckCircleOutlined /> : undefined,
    },
  ];

  if (summaryLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading today's cashbook data...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2}>
            Daily Cashbook Entry - {new Date(currentDate).toLocaleDateString()}
          </Title>
          <Text type="secondary">
            Complete both Cashbook 1 and Cashbook 2 entries for today's
            operations
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
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Collection Total"
                  value={todaysSummary.collectionTotal || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: "#3f8600", fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="CB Total 1"
                  value={todaysSummary.cbTotal1 || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: "#1890ff", fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="CB Total 2"
                  value={todaysSummary.cbTotal2 || 0}
                  precision={2}
                  prefix="₦"
                  valueStyle={{ color: "#722ed1", fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Online Cash in Hand"
                  value={todaysSummary.cbTotal1 - (todaysSummary.cbTotal2 || 0)}
                  precision={2}
                  prefix="₦"
                  valueStyle={{
                    color: (todaysSummary.cbTotal1 - (todaysSummary.cbTotal2 || 0)) >= 0 ? "#3f8600" : "#cf1322",
                    fontSize: window.innerWidth <= 768 ? '16px' : '20px'
                  }}
                />
              </Col>
            </Row>
          )}
        </Card>

        {/* Step Content */}
        {currentStep === 0 && user && (
          <Cashbook1Component
            onSubmit={handleCashbook1Submit}
            initialData={cashbook1Data || undefined}
            date={currentDate}
            user={user}
            existingEntry={getDailyEntry.data?.data?.operations?.cashbook1 || undefined}
          />
        )}

        {currentStep === 1 && user && (
          <Cashbook2Component
            onSubmit={handleCashbook2Submit}
            initialData={cashbook2Data || undefined}
            date={currentDate}
            cashbook1CBTotal={todaysSummary?.cbTotal1 || 0}
            user={user}
            existingEntry={getDailyEntry.data?.data?.operations?.cashbook2 || undefined}
          />
        )}

        {currentStep === 2 && (
          <Card title="Daily Summary" className="summary-section">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Alert
                message="Daily Cashbook Entry Completed"
                description="Both Cashbook 1 and Cashbook 2 have been successfully submitted for today."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    title="Cashbook 1 - Collections"
                    size="small"
                    type="inner"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {cashbook1Data && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Previous Cash in Hand:</Text>
                            <Text strong>
                              {calculations.formatCurrency(cashbook1Data.pcih || 0)}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Savings:</Text>
                            <Text strong>
                              {calculations.formatCurrency(
                                cashbook1Data.savings || 0
                              )}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Loan Collection:</Text>
                            <Text strong>
                              {calculations.formatCurrency(
                                cashbook1Data.loanCollection || 0
                              )}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Charges Collection:</Text>
                            <Text strong>
                              {calculations.formatCurrency(
                                cashbook1Data.chargesCollection || 0
                              )}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Fund from HO:</Text>
                            <Text strong>
                              {calculations.formatCurrency(cashbook1Data.frmHO || 0)}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Fund from BR:</Text>
                            <Text strong>
                              {calculations.formatCurrency(cashbook1Data.frmBR || 0)}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderTop: "1px solid #d9d9d9",
                              paddingTop: 8,
                              marginTop: 8,
                            }}
                          >
                            <Text strong style={{ color: "#1890ff" }}>
                              CB Total 1:
                            </Text>
                            <Text
                              strong
                              style={{ color: "#1890ff", fontSize: "16px" }}
                            >
                              {calculations.formatCurrency(
                                cashbook1Data.cbTotal1 || 0
                              )}
                            </Text>
                          </div>
                        </>
                      )}
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    title="Cashbook 2 - Disbursements"
                    size="small"
                    type="inner"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {cashbook2Data && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Disbursement Number:</Text>
                            <Text strong>{cashbook2Data.disNo || 0}</Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Disbursement Amount:</Text>
                            <Text strong>
                              {calculations.formatCurrency(
                                cashbook2Data.disAmt || 0
                              )}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Savings Withdrawal:</Text>
                            <Text strong>
                              {calculations.formatCurrency(
                                cashbook2Data.savWith || 0
                              )}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>DOMI Bank:</Text>
                            <Text strong>
                              {calculations.formatCurrency(
                                cashbook2Data.domiBank || 0
                              )}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>POS/Transfer:</Text>
                            <Text strong>
                              {calculations.formatCurrency(cashbook2Data.posT || 0)}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderTop: "1px solid #d9d9d9",
                              paddingTop: 8,
                              marginTop: 8,
                            }}
                          >
                            <Text strong style={{ color: "#722ed1" }}>
                              CB Total 2:
                            </Text>
                            <Text
                              strong
                              style={{ color: "#722ed1", fontSize: "16px" }}
                            >
                              {calculations.formatCurrency(
                                cashbook2Data.cbTotal2 || 0
                              )}
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
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title={
                        <span style={{ color: "rgba(255,255,255,0.8)" }}>
                          Collection Total
                        </span>
                      }
                      value={todaysSummary?.collectionTotal || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: "#52c41a", fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title={
                        <span style={{ color: "rgba(255,255,255,0.8)" }}>
                          CB Total 1
                        </span>
                      }
                      value={todaysSummary?.cbTotal1 || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{ color: "#1890ff", fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Statistic
                      title={
                        <span style={{ color: "rgba(255,255,255,0.8)" }}>
                          Online Cash in Hand
                        </span>
                      }
                      value={todaysSummary?.cbTotal1 - (todaysSummary?.cbTotal2 || 0) || 0}
                      precision={2}
                      prefix="₦"
                      valueStyle={{
                        color:
                          (todaysSummary?.cbTotal1 - (todaysSummary?.cbTotal2 || 0)) >= 0
                            ? "#52c41a"
                            : "#ff4d4f",
                        fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                        fontWeight: "bold",
                      }}
                    />
                  </Col>
                </Row>
              </Card>

              <div style={{ textAlign: "center" }}>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleFinalSubmit}
                    loading={summaryLoading}
                    disabled={operationIsCompleted}
                    style={{
                      background: "linear-gradient(45deg, #52c41a, #73d13d)",
                      border: "none",
                      minWidth: "160px",
                    }}
                  >
                    {summaryLoading ? "Submitting..." : "Submit Daily Entry"}
                  </Button>
                </Space>

                <div style={{ marginTop: "16px" }}>
                  <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} sm={12} md={8}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => goToStep(0)}
                        block
                      >
                        Edit Cashbook 1
                      </Button>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => goToStep(1)}
                        block
                      >
                        Edit Cashbook 2
                      </Button>
                    </Col>
                  </Row>
                </div>
              </div>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};
