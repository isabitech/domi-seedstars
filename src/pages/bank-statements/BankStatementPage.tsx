import React, { useState } from "react";
import { Space, Typography, Breadcrumb, Tabs } from "antd";
import { toast } from 'sonner';
import { HomeOutlined, BankOutlined } from "@ant-design/icons";
import { BankStatement1Component } from "../../components/BankStatement1";
import { BankStatement2Component } from "../../components/BankStatement2";
import { useCreateBankStatement } from "../../hooks/Branch/BankStatement/useCreateBankStatement";

const { Title } = Typography;

export const BankStatementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("bs1");
  const createBankStatementMutation = useCreateBankStatement();

  const handleBankStatement1Submit = async (openingBal: number) => {
    try {
      await createBankStatementMutation.mutateAsync({
        step: 1,
        payload: { openingBal },
      });

      toast.success("Bank Statement 1 created successfully!");

      // Optionally switch to the second tab
      setActiveTab("bs2");
    } catch (error) {
      console.error("Failed to create Bank Statement 1:", error);
      toast.error("Failed to create Bank Statement 1. Please try again.");
    }
  };

  const handleBankStatement2Submit = async (data: {
    tbo: number;
    exAmt: number;
    exPurpose: string;
  }) => {
    try {
      await createBankStatementMutation.mutateAsync({
        step: 2,
        payload: data,
      });

      toast.success("Bank Statement 2 created successfully!");
    } catch (error) {
      console.error("Failed to create Bank Statement 2:", error);
      toast.error("Failed to create Bank Statement 2. Please try again.");
    }
  };

  const tabItems = [
    {
      key: "bs1",
      label: "Bank Statement 1 (BS1)",
      children: (
        <BankStatement1Component
          onSubmit={handleBankStatement1Submit}
          loading={createBankStatementMutation.isPending}
        />
      ),
    },
    {
      key: "bs2",
      label: "Bank Statement 2 (BS2)",
      children: (
        <BankStatement2Component
          onSubmit={handleBankStatement2Submit}
          loading={createBankStatementMutation.isPending}
        />
      ),
    },
  ];

  return (
    <div className="page-container" style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Bank Statements</Title>
          <p style={{ color: "#666", marginBottom: 0 }}>
            Manage and view bank statements with automatic data integration from
            cashbook entries.
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ width: "100%" }}
          type="card"
        />
      </Space>
    </div>
  );
};
