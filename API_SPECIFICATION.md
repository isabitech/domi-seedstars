# Dominion Seedstars API Specification

## Overview
This document defines the API endpoints and data structures for the Dominion Seedstars Financial Management System. All endpoints return JSON responses and use standard HTTP status codes.

## Base Configuration
- **Base URL**: `https://api.dominion-seedstars.com/v1`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Currency**: Nigerian Naira (NGN) - amounts in kobo (smallest unit)

---

## 1. Authentication & User Management

### 1.1 Authentication Endpoints

#### POST `/auth/login`
**Description**: User login
```json
// Request Body
{
  "username": "string",
  "password": "string"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "HO" | "BR",
      "branchId": "string | null",
      "branchName": "string | null",
      "permissions": ["string"],
      "lastLogin": "ISO8601 string",
      "isFirstLogin": "boolean"
    },
    "token": "string",
    "expiresIn": "number (seconds)"
  }
}

// Error Response (401 Unauthorized)
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

#### POST `/auth/logout`
**Description**: User logout
```json
// Request Headers: Authorization: Bearer <token>
// Response (200 OK)
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/auth/me`
**Description**: Get current user info
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "HO" | "BR",
    "branchId": "string | null",
    "branchName": "string | null",
    "permissions": ["string"],
    "lastLogin": "ISO8601 string"
  }
}
```

### 1.2 User Management (HO Only)

#### GET `/users`
**Description**: Get all users
```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "HO" | "BR",
      "branchId": "string | null",
      "branchName": "string | null",
      "status": "active" | "inactive" | "suspended",
      "lastLogin": "ISO8601 string",
      "createdAt": "ISO8601 string",
      "updatedAt": "ISO8601 string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### POST `/users`
**Description**: Create new user
```json
// Request Body
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "HO" | "BR",
  "branchId": "string | null"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "HO" | "BR",
    "branchId": "string | null",
    "status": "active",
    "createdAt": "ISO8601 string"
  }
}
```

#### PUT `/users/:id`
**Description**: Update user
```json
// Request Body (all fields optional)
{
  "username": "string",
  "email": "string",
  "role": "HO" | "BR",
  "branchId": "string | null",
  "status": "active" | "inactive" | "suspended"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "HO" | "BR",
    "branchId": "string | null",
    "status": "active" | "inactive" | "suspended",
    "updatedAt": "ISO8601 string"
  }
}
```

#### DELETE `/users/:id`
**Description**: Delete user
```json
// Response (200 OK)
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 2. Branch Management

### 2.1 Branch Operations

#### GET `/branches`
**Description**: Get all branches
```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "code": "string",
      "address": "string",
      "phone": "string",
      "email": "string",
      "manager": "string",
      "managerEmail": "string",
      "managerPassword": "string", // For branch login
      "status": "active" | "inactive",
      "operationHours": "string",
      "dailyLimit": "number (in kobo)",
      "createdAt": "ISO8601 string",
      "updatedAt": "ISO8601 string"
    }
  ]
}
```

#### POST `/branches`
**Description**: Create new branch
```json
// Request Body
{
  "name": "string",
  "code": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "manager": "string",
  "managerEmail": "string",
  "managerPassword": "string",
  "operationHours": "string",
  "dailyLimit": "number (in kobo)"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "code": "string",
    // ... all fields from request
    "status": "active",
    "createdAt": "ISO8601 string"
  }
}
```

#### PUT `/branches/:id`
**Description**: Update branch
```json
// Request Body (all fields optional)
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "manager": "string",
  "managerEmail": "string",
  "managerPassword": "string",
  "operationHours": "string",
  "dailyLimit": "number (in kobo)",
  "status": "active" | "inactive"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    // Updated branch object
  }
}
```

---

## 3. Cashbook Operations

### 3.1 Daily Cashbook Entries

#### GET `/cashbook/:branchId/:date`
**Description**: Get cashbook data for specific branch and date
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "date": "YYYY-MM-DD",
    "branchId": "string",
    "branchName": "string",
    "cashbook1": {
      "savings": "number (in kobo)",
      "loanCollection": "number (in kobo)",
      "charges": "number (in kobo)",
      "frmHO": "number (in kobo)",
      "frmBR": "number (in kobo)",
      "total": "number (in kobo)"
    },
    "cashbook2": {
      "disbursements": "number (in kobo)",
      "expenses": "number (in kobo)",
      "total": "number (in kobo)"
    },
    "onlineCIH": "number (in kobo)",
    "transferToSenate": "number (in kobo)",
    "netCashFlow": "number (in kobo)",
    "createdAt": "ISO8601 string",
    "updatedAt": "ISO8601 string",
    "submittedBy": "string (user ID)",
    "status": "draft" | "submitted" | "approved"
  }
}
```

#### POST `/cashbook`
**Description**: Create/Update daily cashbook entry
```json
// Request Body
{
  "date": "YYYY-MM-DD",
  "branchId": "string",
  "cashbook1": {
    "savings": "number (in kobo)",
    "loanCollection": "number (in kobo)",
    "charges": "number (in kobo)",
    "frmHO": "number (in kobo)",
    "frmBR": "number (in kobo)"
  },
  "cashbook2": {
    "disbursements": "number (in kobo)",
    "expenses": "number (in kobo)"
  },
  "transferToSenate": "number (in kobo)",
  "status": "draft" | "submitted"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    // Complete cashbook entry with calculated totals
  }
}
```

### 3.2 HO Operations Data

#### GET `/ho-operations/:date`
**Description**: Get HO operations data for all branches on specific date
```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "branchId": "string",
      "branchName": "string",
      "date": "YYYY-MM-DD",
      "operationalData": {
        "field1": "number (in kobo)",
        "field2": "number (in kobo)",
        "field3": "number (in kobo)"
        // Add actual field names based on your HO operations requirements
      },
      "lastUpdated": "ISO8601 string",
      "updatedBy": "string (user ID)"
    }
  ]
}
```

#### PUT `/ho-operations/:branchId/:date`
**Description**: Update HO operations data for specific branch
```json
// Request Body
{
  "field": "string (field name)",
  "value": "number (in kobo)"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "branchId": "string",
    "date": "YYYY-MM-DD",
    "field": "string",
    "oldValue": "number",
    "newValue": "number",
    "updatedAt": "ISO8601 string"
  }
}
```

---

## 4. Reports & Analytics

### 4.1 Financial Reports

#### GET `/reports/financial`
**Description**: Get financial report data
```json
// Query Parameters
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "branchId": "string | 'all'"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": "number (in kobo)",
      "totalExpenses": "number (in kobo)",
      "netProfit": "number (in kobo)",
      "totalSavings": "number (in kobo)",
      "totalLoans": "number (in kobo)",
      "totalDisbursements": "number (in kobo)",
      "totalCharges": "number (in kobo)",
      "totalTransferToSenate": "number (in kobo)",
      "profitMargin": "number (percentage)",
      "growthRate": "number (percentage)"
    },
    "details": [
      {
        "branchId": "string",
        "branchName": "string",
        "date": "YYYY-MM-DD",
        "cashbook1Total": "number (in kobo)",
        "cashbook2Total": "number (in kobo)",
        "onlineCIH": "number (in kobo)",
        "savings": "number (in kobo)",
        "loanCollection": "number (in kobo)",
        "disbursements": "number (in kobo)",
        "charges": "number (in kobo)",
        "expenses": "number (in kobo)",
        "transferToSenate": "number (in kobo)",
        "frmHO": "number (in kobo)",
        "frmBR": "number (in kobo)",
        "netCashFlow": "number (in kobo)"
      }
    ]
  }
}
```

### 4.2 Branch Performance Reports

#### GET `/reports/performance`
**Description**: Get branch performance data
```json
// Query Parameters
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "branchId": "string | 'all'"
}

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "branchId": "string",
      "branchName": "string",
      "branchCode": "string",
      "totalIncome": "number (in kobo)",
      "totalExpenses": "number (in kobo)",
      "netProfit": "number (in kobo)",
      "profitMargin": "number (percentage)",
      "collectionEfficiency": "number (percentage)",
      "disbursementVolume": "number (in kobo)",
      "customerCount": "number",
      "averageTransactionSize": "number (in kobo)",
      "growthRate": "number (percentage)",
      "performanceScore": "number (percentage)",
      "ranking": "number",
      "status": "excellent" | "good" | "average" | "poor",
      "lastUpdated": "ISO8601 string"
    }
  ]
}
```

### 4.3 Transaction Log Reports

#### GET `/reports/transactions`
**Description**: Get transaction log data
```json
// Query Parameters
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "branchId": "string | 'all'",
  "type": "savings" | "loan_collection" | "disbursement" | "expense" | "transfer" | "all",
  "status": "completed" | "pending" | "failed" | "all",
  "page": "number",
  "limit": "number"
}

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "date": "YYYY-MM-DD",
      "time": "HH:mm:ss",
      "branchId": "string",
      "branchName": "string",
      "type": "savings" | "loan_collection" | "disbursement" | "expense" | "transfer",
      "category": "string",
      "amount": "number (in kobo)",
      "description": "string",
      "referenceNo": "string",
      "userId": "string",
      "userName": "string",
      "status": "completed" | "pending" | "failed",
      "balanceBefore": "number (in kobo)",
      "balanceAfter": "number (in kobo)",
      "createdAt": "ISO8601 string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

### 4.4 Branch Daily Reports

#### GET `/reports/branch-daily`
**Description**: Get comprehensive branch daily report
```json
// Query Parameters
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "branchId": "string | 'all'"
}

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "branchId": "string",
      "branchName": "string",
      "date": "YYYY-MM-DD",
      "openingBalance": "number (in kobo)",
      "closingBalance": "number (in kobo)",
      "totalInflow": "number (in kobo)",
      "totalOutflow": "number (in kobo)",
      "cashbook1Total": "number (in kobo)",
      "cashbook2Total": "number (in kobo)",
      "onlineCIH": "number (in kobo)",
      "transferToSenate": "number (in kobo)",
      "netCashFlow": "number (in kobo)",
      "submissionStatus": "draft" | "submitted" | "approved",
      "submittedAt": "ISO8601 string | null",
      "submittedBy": "string | null"
    }
  ],
  "grandTotals": {
    "totalInflow": "number (in kobo)",
    "totalOutflow": "number (in kobo)",
    "netCashFlow": "number (in kobo)",
    "totalTransferToSenate": "number (in kobo)"
  }
}
```

---

## 5. Dashboard Data

### 5.1 Head Office Dashboard

#### GET `/dashboard/ho`
**Description**: Get Head Office dashboard data
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "summary": {
      "totalBranches": "number",
      "activeBranches": "number",
      "totalRevenue": "number (in kobo)",
      "totalExpenses": "number (in kobo)",
      "netProfit": "number (in kobo)",
      "profitMargin": "number (percentage)"
    },
    "recentActivity": [
      {
        "id": "string",
        "type": "cashbook_submission" | "branch_created" | "user_login",
        "description": "string",
        "branchId": "string | null",
        "branchName": "string | null",
        "timestamp": "ISO8601 string",
        "status": "success" | "warning" | "error"
      }
    ],
    "branchPerformance": [
      {
        "branchId": "string",
        "branchName": "string",
        "revenue": "number (in kobo)",
        "growth": "number (percentage)",
        "status": "excellent" | "good" | "average" | "poor"
      }
    ],
    "alerts": [
      {
        "id": "string",
        "type": "low_balance" | "pending_approval" | "system_warning",
        "message": "string",
        "severity": "high" | "medium" | "low",
        "branchId": "string | null",
        "createdAt": "ISO8601 string"
      }
    ]
  }
}
```

### 5.2 Branch Dashboard

#### GET `/dashboard/branch/:branchId`
**Description**: Get Branch dashboard data
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "summary": {
      "todayRevenue": "number (in kobo)",
      "monthlyRevenue": "number (in kobo)",
      "currentBalance": "number (in kobo)",
      "pendingDisbursements": "number (in kobo)",
      "customerCount": "number",
      "transactionCount": "number"
    },
    "todayCashbook": {
      "status": "draft" | "submitted" | "approved",
      "cashbook1Total": "number (in kobo)",
      "cashbook2Total": "number (in kobo)",
      "netCashFlow": "number (in kobo)",
      "lastUpdated": "ISO8601 string"
    },
    "recentTransactions": [
      {
        "id": "string",
        "type": "savings" | "loan_collection" | "disbursement",
        "amount": "number (in kobo)",
        "description": "string",
        "time": "HH:mm:ss",
        "status": "completed" | "pending"
      }
    ],
    "monthlyTrends": [
      {
        "date": "YYYY-MM-DD",
        "revenue": "number (in kobo)",
        "expenses": "number (in kobo)"
      }
    ]
  }
}
```

---

## 6. System Settings (HO Only)

### 6.1 System Configuration

#### GET `/settings/system`
**Description**: Get system configuration
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "appName": "string",
    "companyName": "string",
    "defaultCurrency": "NGN" | "USD" | "EUR",
    "financialYearStart": "YYYY-MM-DD",
    "maxDailyTransactionLimit": "number (in kobo)",
    "autoBackupTime": "HH:mm",
    "sessionTimeoutMinutes": "number",
    "auditTrailEnabled": "boolean"
  }
}
```

#### PUT `/settings/system`
**Description**: Update system configuration
```json
// Request Body (all fields optional)
{
  "appName": "string",
  "companyName": "string",
  "defaultCurrency": "NGN" | "USD" | "EUR",
  "financialYearStart": "YYYY-MM-DD",
  "maxDailyTransactionLimit": "number (in kobo)",
  "autoBackupTime": "HH:mm",
  "sessionTimeoutMinutes": "number",
  "auditTrailEnabled": "boolean"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    // Updated system configuration
  }
}
```

### 6.2 Financial Settings

#### GET `/settings/financial`
**Description**: Get financial settings
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "defaultLoanInterestRate": "number (percentage)",
    "savingsInterestRate": "number (percentage)",
    "processingFeePercentage": "number (percentage)",
    "latePaymentPenalty": "number (percentage)",
    "minimumSavingsAmount": "number (in kobo)",
    "maximumLoanAmount": "number (in kobo)",
    "dailyWithdrawalLimit": "number (in kobo)",
    "transactionApprovalsEnabled": "boolean"
  }
}
```

#### PUT `/settings/financial`
**Description**: Update financial settings
```json
// Request Body (all fields optional)
{
  "defaultLoanInterestRate": "number (percentage)",
  "savingsInterestRate": "number (percentage)",
  "processingFeePercentage": "number (percentage)",
  "latePaymentPenalty": "number (percentage)",
  "minimumSavingsAmount": "number (in kobo)",
  "maximumLoanAmount": "number (in kobo)",
  "dailyWithdrawalLimit": "number (in kobo)",
  "transactionApprovalsEnabled": "boolean"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    // Updated financial settings
  }
}
```

### 6.3 Security Settings

#### GET `/settings/security`
**Description**: Get security settings
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "minPasswordLength": "number",
    "passwordRequirements": {
      "uppercase": "boolean",
      "lowercase": "boolean",
      "numbers": "boolean",
      "specialChars": "boolean"
    },
    "passwordExpiryDays": "number",
    "twoFactorAuthEnabled": "boolean",
    "loginAttemptLimit": "number",
    "accountLockoutMinutes": "number",
    "ipWhitelistEnabled": "boolean"
  }
}
```

### 6.4 Notification Settings

#### GET `/settings/notifications`
**Description**: Get notification settings
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "emailNotifications": {
      "dailyReports": "boolean",
      "lowBalanceAlerts": "boolean",
      "transactionAlerts": "boolean",
      "systemMaintenance": "boolean"
    },
    "reportSchedule": "daily" | "weekly" | "monthly",
    "recipients": ["email1@example.com", "email2@example.com"],
    "smsGateway": "disabled" | "twilio" | "nexmo" | "local"
  }
}
```

---

## 7. Audit & Compliance

### 7.1 Audit Logs

#### GET `/audit-logs`
**Description**: Get audit logs
```json
// Query Parameters
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "userId": "string",
  "action": "string",
  "page": "number",
  "limit": "number"
}

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "username": "string",
      "action": "string",
      "resource": "string",
      "resourceId": "string | null",
      "oldValue": "object | null",
      "newValue": "object | null",
      "ipAddress": "string",
      "userAgent": "string",
      "timestamp": "ISO8601 string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

---

## 8. Data Export

### 8.1 Export Endpoints

#### POST `/export/financial-report`
**Description**: Export financial report
```json
// Request Body
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "branchId": "string | 'all'",
  "format": "excel" | "csv" | "pdf"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "downloadUrl": "string",
    "filename": "string",
    "expiresAt": "ISO8601 string"
  }
}
```

---

## 9. Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "object | null", // Additional error details
    "timestamp": "ISO8601 string"
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Authentication failed
- `UNAUTHORIZED` - Access denied
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `SERVER_ERROR` - Internal server error
- `RATE_LIMITED` - Too many requests

---

## 10. Data Validation Rules

### Field Validation
- **Amounts**: Always in kobo (smallest currency unit)
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **Phone Numbers**: Nigeria format (+234-XXX-XXX-XXXX)
- **Email**: Standard email format validation
- **Branch Code**: Alphanumeric, 5 characters (e.g., LG001)
- **Username**: Alphanumeric, 3-50 characters
- **Password**: Minimum 8 characters, configurable requirements

### Business Rules
- Branch daily limits must be positive numbers
- Interest rates must be between 0-100%
- Financial year start must be a valid date
- Session timeout must be between 5-120 minutes
- Cashbook entries can only be modified on the same day
- Only HO users can access settings and user management
- Branch users can only access their own branch data

---

## 11. Rate Limiting

- **Authentication**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **Reports**: 10 requests per minute per user
- **Export**: 5 requests per minute per user

---

## 12. Deployment Notes

### Environment Variables
```env
DB_CONNECTION_STRING=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
API_BASE_URL=https://api.dominion-seedstars.com
FRONTEND_URL=https://app.dominion-seedstars.com
EMAIL_SERVICE_API_KEY=your-email-service-key
SMS_SERVICE_API_KEY=your-sms-service-key
FILE_STORAGE_BUCKET=your-s3-bucket
ENCRYPTION_KEY=your-encryption-key
```

### Database Considerations
- Use proper indexing on frequently queried fields (userId, branchId, date)
- Implement soft deletes for audit purposes
- Use transactions for financial operations
- Regular backups with point-in-time recovery
- Encrypt sensitive data (passwords, personal info)

### Security Requirements
- HTTPS only in production
- JWT token expiration and refresh mechanism
- Input validation and sanitization
- SQL injection prevention
- Rate limiting per endpoint
- Audit logging for all operations
- Data encryption at rest and in transit

This API specification provides a complete backend structure that matches your frontend implementation and supports all the features you've built!