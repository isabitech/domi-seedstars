/* @typescript-eslint/no-explicit-any */
export interface Root {
  success: boolean;
  data: Data;
  message: string;
  timestamp: string;
}

export interface Data {
  id: string;
  username: string;
  email: string;
  role: string;
  branchId: string | null;
  branchName: string | null;
  permissions: string[];
  lastLogin: string;
  isFirstLogin: boolean;
}

export const HOPermissionsList = [
  "cashbook:view",
  "cashbook:create",
  "reports:view",
  "registers:view",
  "bankstatements:view",
  "prediction:view",
  "disbursement:view",
  "dashboard:branch",
  "operations:daily:view",
  "operations:daily:modify",
  "prediction:modify",
  "cashbook:approve",
  "reports:consolidated",
  "dashboard:ho",
  "reports:export",
  "metrics:view",
  "registers:modify",
  "bankstatements:modify",
  "disbursement:modify",
  "branch:create",
  "branch:update",
  "branch:delete",
  "branch:toggle",
];
