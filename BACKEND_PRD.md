# Dominion Seedstars Financial Management System - Backend PRD

## Product Requirements Document (PRD) for Backend Implementation

**Project**: Dominion Seedstars Financial Management System Backend  
**Client**: Dominion Seedstars Nigeria Limited  
**Date**: November 2025  
**Prepared by**: Based on comprehensive frontend codebase analysis  

---

## 1. Executive Summary

This document outlines the complete backend implementation requirements for the Dominion Seedstars Financial Management System. The system serves as a comprehensive financial operations management platform for a multi-branch financial institution operating across Nigeria, with Head Office (HO) oversight and Branch (BR) operations.

### 1.1 System Architecture Overview
- **Frontend**: React/TypeScript with Ant Design (Already implemented)
- **Backend**: Node.js/Express.js with TypeScript (To be implemented)
- **Database**: PostgreSQL with audit trails
- **Authentication**: JWT-based with role-based access control
- **Currency**: Nigerian Naira (kobo-based calculations for precision)
- **Email Service**: Brevo integration for notifications

---

## 2. Business Context & Core Objectives

### 2.1 Business Model
Dominion Seedstars operates as a microfinance institution with:
- **Head Office**: Central oversight and control
- **Multiple Branches**: Distributed across Nigeria
- **Financial Products**: Savings, loans, disbursements
- **Daily Operations**: Real-time cash flow management

### 2.2 Key Business Requirements
1. **Real-time Financial Tracking**: All financial transactions tracked in real-time
2. **Automated Calculations**: Complex financial calculations automated
3. **Role-based Access**: Strict separation between HO and BR operations
4. **Audit Trail**: Complete audit logging for compliance
5. **Nigerian Financial Context**: Kobo-based calculations (1 Naira = 100 kobo)

---

## 3. System Roles & Permissions

### 3.1 Head Office (HO) Users
**Responsibilities:**
- Oversee all branch operations
- Manage branch profiles and users
- Input HO-controlled financial fields
- View consolidated reports
- Configure system settings

**Permissions:**
- Full access to all modules
- Create/edit/delete branches and users
- Access all reports and analytics
- System configuration access
- Export capabilities

### 3.2 Branch (BR) Users
**Responsibilities:**
- Input daily cashbook data
- Manage branch-specific operations
- View branch-specific reports
- Submit predictions and expenses

**Permissions:**
- Access only assigned branch data
- Input daily operational data
- View branch-specific dashboards
- Read-only access to calculated fields

---

## 4. Core Data Models & Database Schema

### 4.1 Authentication & User Management

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(2) NOT NULL CHECK (role IN ('HO', 'BR')),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP WITH TIME ZONE,
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### JWT Sessions Table
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Branch Management

#### Branches Table
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    location TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- For branch-specific login
    manager_name VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    operation_hours VARCHAR(100),
    daily_limit_kobo BIGINT DEFAULT 500000000, -- 5 million naira in kobo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 Financial Data Models

#### Cashbook 1 (Daily Collections)
```sql
CREATE TABLE cashbook1_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    pcih_kobo BIGINT NOT NULL DEFAULT 0, -- Previous Cash in Hand
    savings_kobo BIGINT NOT NULL DEFAULT 0,
    loan_collection_kobo BIGINT NOT NULL DEFAULT 0,
    charges_kobo BIGINT NOT NULL DEFAULT 0,
    collection_total_kobo BIGINT GENERATED ALWAYS AS (savings_kobo + loan_collection_kobo + charges_kobo) STORED,
    frm_ho_kobo BIGINT NOT NULL DEFAULT 0, -- Fund from HO (HO-editable)
    frm_br_kobo BIGINT NOT NULL DEFAULT 0, -- Fund from BR (HO-editable)
    cb_total1_kobo BIGINT GENERATED ALWAYS AS (pcih_kobo + savings_kobo + loan_collection_kobo + charges_kobo + frm_ho_kobo + frm_br_kobo) STORED,
    submitted_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(branch_id, entry_date)
);
```

#### Cashbook 2 (Daily Disbursements & Expenses)
```sql
CREATE TABLE cashbook2_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    dis_no INTEGER NOT NULL DEFAULT 0, -- Number of disbursements
    dis_amt_kobo BIGINT NOT NULL DEFAULT 0, -- Disbursement amount
    dis_with_int_kobo BIGINT NOT NULL DEFAULT 0, -- Disbursement with interest
    sav_with_kobo BIGINT NOT NULL DEFAULT 0, -- Savings withdrawal
    domi_bank_kobo BIGINT NOT NULL DEFAULT 0, -- Bank balance
    pos_t_kobo BIGINT NOT NULL DEFAULT 0, -- POS transfers
    cb_total2_kobo BIGINT GENERATED ALWAYS AS (dis_amt_kobo + sav_with_kobo + domi_bank_kobo + pos_t_kobo) STORED,
    submitted_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(branch_id, entry_date)
);
```

#### Online Cash in Hand (Calculated View)
```sql
CREATE VIEW online_cih AS
SELECT 
    c1.branch_id,
    c1.entry_date,
    c1.cb_total1_kobo - COALESCE(c2.cb_total2_kobo, 0) AS online_cih_kobo,
    c1.updated_at
FROM cashbook1_entries c1
LEFT JOIN cashbook2_entries c2 ON c1.branch_id = c2.branch_id AND c1.entry_date = c2.entry_date
WHERE c1.status = 'submitted';
```

### 4.4 Bank Statements

#### Bank Statement 1
```sql
CREATE TABLE bank_statement1 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    opening_kobo BIGINT NOT NULL DEFAULT 0, -- Always 0
    rec_ho_kobo BIGINT NOT NULL DEFAULT 0, -- From Cashbook1.frm_ho
    rec_bo_kobo BIGINT NOT NULL DEFAULT 0, -- From Cashbook1.frm_br
    domi_kobo BIGINT NOT NULL DEFAULT 0, -- From Cashbook2.domi_bank
    pa_kobo BIGINT NOT NULL DEFAULT 0, -- From Cashbook2.pos_t
    bs1_total_kobo BIGINT GENERATED ALWAYS AS (opening_kobo + rec_ho_kobo + rec_bo_kobo + domi_kobo + pa_kobo) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(branch_id, entry_date)
);
```

#### Bank Statement 2
```sql
CREATE TABLE bank_statement2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    withd_kobo BIGINT NOT NULL DEFAULT 0, -- From Cashbook1.frm_ho
    tbo_kobo BIGINT NOT NULL DEFAULT 0, -- Transfer between offices (HO-editable)
    tbo_to_branch_id UUID REFERENCES branches(id), -- Target branch for transfer
    ex_amt_kobo BIGINT NOT NULL DEFAULT 0, -- Expense amount (BR-editable)
    ex_purpose TEXT, -- Expense description (BR-editable)
    bs2_total_kobo BIGINT GENERATED ALWAYS AS (withd_kobo + tbo_kobo + ex_amt_kobo) STORED,
    entered_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(branch_id, entry_date)
);
```

### 4.5 HO Operations Data

#### HO Control Fields
```sql
CREATE TABLE ho_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    
    -- Previous totals for register calculations
    prev_total_savings_kobo BIGINT NOT NULL DEFAULT 0,
    prev_total_loan_kobo BIGINT NOT NULL DEFAULT 0,
    prev_disbursement_kobo BIGINT NOT NULL DEFAULT 0,
    
    -- Inter-branch transfers
    tbo_amount_kobo BIGINT NOT NULL DEFAULT 0,
    tbo_to_branch_id UUID REFERENCES branches(id),
    
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(branch_id, entry_date)
);
```

### 4.6 Predictions

#### Daily Predictions
```sql
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL, -- Date being predicted for
    prediction_no INTEGER NOT NULL DEFAULT 0, -- Number of expected clients
    prediction_amount_kobo BIGINT NOT NULL DEFAULT 0, -- Expected disbursement
    submitted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(branch_id, prediction_date)
);
```

### 4.7 System Settings

#### System Configuration
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default settings
INSERT INTO system_settings (key, value, description) VALUES
('app_name', '"Dominion Seedstars"', 'Application name'),
('company_name', '"Seedstars Nigeria Limited"', 'Company name'),
('default_currency', '"NGN"', 'Default currency code'),
('financial_year_start', '"2024-01-01"', 'Financial year start date'),
('max_daily_transaction_limit_kobo', '1000000000', 'Maximum daily transaction limit in kobo'),
('session_timeout_minutes', '30', 'User session timeout in minutes'),
('audit_trail_enabled', 'true', 'Enable audit trail logging');
```

### 4.8 Audit & Compliance

#### Audit Logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    resource_type VARCHAR(100) NOT NULL, -- 'user', 'branch', 'cashbook1', etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## 5. Business Logic Implementation

### 5.1 Authentication Business Logic

#### Password Security
```javascript
// Password requirements (configurable)
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 90
};

// Login attempt tracking
const loginAttempts = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  trackByIP: true
};
```

#### Branch Login Email Notifications
```javascript
// Brevo email integration
const sendBranchLoginNotification = async (branchUser, loginDetails) => {
  const emailData = {
    to: getHOEmails(),
    template: 'branch_login_notification',
    params: {
      branchName: branchUser.branch.name,
      branchCode: branchUser.branch.code,
      username: branchUser.username,
      loginTime: loginDetails.timestamp,
      ipAddress: loginDetails.ipAddress
    }
  };
  
  await brevoClient.sendTransactionalEmail(emailData);
};
```

### 5.2 Cashbook Business Logic

#### Automatic PCIH Calculation
```javascript
// PCIH (Previous Cash in Hand) = Previous day's Online CIH
const calculatePCIH = async (branchId, currentDate) => {
  const previousDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
  
  const previousOnlineCIH = await db.query(`
    SELECT (c1.cb_total1_kobo - COALESCE(c2.cb_total2_kobo, 0)) as online_cih_kobo
    FROM cashbook1_entries c1
    LEFT JOIN cashbook2_entries c2 ON c1.branch_id = c2.branch_id AND c1.entry_date = c2.entry_date
    WHERE c1.branch_id = $1 AND c1.entry_date = $2 AND c1.status = 'submitted'
  `, [branchId, previousDate]);
  
  return previousOnlineCIH.rows[0]?.online_cih_kobo || 0;
};
```

#### Financial Calculations
```javascript
// Cashbook 1 totals
const calculateCashbook1Totals = (cashbook1Data) => {
  const collectionTotal = cashbook1Data.savings_kobo + 
                         cashbook1Data.loan_collection_kobo + 
                         cashbook1Data.charges_kobo;
  
  const cbTotal1 = cashbook1Data.pcih_kobo + 
                   collectionTotal + 
                   cashbook1Data.frm_ho_kobo + 
                   cashbook1Data.frm_br_kobo;
  
  return { collectionTotal, cbTotal1 };
};

// Cashbook 2 totals
const calculateCashbook2Totals = (cashbook2Data) => {
  const cbTotal2 = cashbook2Data.dis_amt_kobo + 
                   cashbook2Data.sav_with_kobo + 
                   cashbook2Data.domi_bank_kobo + 
                   cashbook2Data.pos_t_kobo;
  
  return { cbTotal2 };
};

// Online CIH calculation
const calculateOnlineCIH = (cbTotal1, cbTotal2) => {
  return cbTotal1 - cbTotal2;
};
```

### 5.3 Bank Statement Auto-Generation

#### Bank Statement 1 Generation
```javascript
const generateBankStatement1 = async (branchId, entryDate) => {
  // Get data from cashbook entries
  const cashbook1 = await getCashbook1Entry(branchId, entryDate);
  const cashbook2 = await getCashbook2Entry(branchId, entryDate);
  
  if (!cashbook1 || !cashbook2) {
    throw new Error('Cashbook entries required for bank statement generation');
  }
  
  const bs1Data = {
    branch_id: branchId,
    entry_date: entryDate,
    opening_kobo: 0, // Always starts at 0
    rec_ho_kobo: cashbook1.frm_ho_kobo,
    rec_bo_kobo: cashbook1.frm_br_kobo,
    domi_kobo: cashbook2.domi_bank_kobo,
    pa_kobo: cashbook2.pos_t_kobo
    // bs1_total_kobo calculated automatically by database
  };
  
  return await upsertBankStatement1(bs1Data);
};
```

#### Bank Statement 2 Generation
```javascript
const generateBankStatement2 = async (branchId, entryDate, hoInputs = {}) => {
  const cashbook1 = await getCashbook1Entry(branchId, entryDate);
  
  const bs2Data = {
    branch_id: branchId,
    entry_date: entryDate,
    withd_kobo: cashbook1.frm_ho_kobo, // From FRM HO
    tbo_kobo: hoInputs.tbo_kobo || 0, // HO-editable
    tbo_to_branch_id: hoInputs.tbo_to_branch_id || null,
    ex_amt_kobo: hoInputs.ex_amt_kobo || 0, // BR-editable
    ex_purpose: hoInputs.ex_purpose || null
    // bs2_total_kobo calculated automatically by database
  };
  
  return await upsertBankStatement2(bs2Data);
};
```

### 5.4 Branch Register Calculations

#### Current Branch Register (Savings)
```javascript
const calculateCurrentBranchRegisterSavings = async (branchId, entryDate) => {
  const hoOperation = await getHOOperation(branchId, entryDate);
  const cashbook1 = await getCashbook1Entry(branchId, entryDate);
  const cashbook2 = await getCashbook2Entry(branchId, entryDate);
  
  if (!hoOperation || !cashbook1 || !cashbook2) {
    throw new Error('Required data missing for savings register calculation');
  }
  
  // Formula: Previous Total Savings + New Savings - Savings Withdrawal
  const currentSavings = hoOperation.prev_total_savings_kobo + 
                        cashbook1.savings_kobo - 
                        cashbook2.sav_with_kobo;
  
  return currentSavings;
};
```

#### Current Branch Register (Loans)
```javascript
const calculateCurrentBranchRegisterLoan = async (branchId, entryDate) => {
  const hoOperation = await getHOOperation(branchId, entryDate);
  const cashbook2 = await getCashbook2Entry(branchId, entryDate);
  const cashbook1 = await getCashbook1Entry(branchId, entryDate);
  
  if (!hoOperation || !cashbook1 || !cashbook2) {
    throw new Error('Required data missing for loan register calculation');
  }
  
  // Formula: Previous Total Loan + Disbursement with Interest - Loan Collection
  const currentLoanBalance = hoOperation.prev_total_loan_kobo + 
                            cashbook2.dis_with_int_kobo - 
                            cashbook1.loan_collection_kobo;
  
  return currentLoanBalance;
};
```

### 5.5 Transfer to Senate Office (TSO)

#### TSO Calculation
```javascript
const calculateTSO = async (branchId, entryDate) => {
  const bs1 = await getBankStatement1(branchId, entryDate);
  const bs2 = await getBankStatement2(branchId, entryDate);
  
  if (!bs1 || !bs2) {
    throw new Error('Bank statements required for TSO calculation');
  }
  
  // Formula: BS1 Total - BS2 Total
  const tso = bs1.bs1_total_kobo - bs2.bs2_total_kobo;
  
  return tso;
};
```

### 5.6 Disbursement Roll

#### Monthly Disbursement Roll Calculation
```javascript
const calculateDisbursementRoll = async (branchId, entryDate) => {
  const hoOperation = await getHOOperation(branchId, entryDate);
  const cashbook2 = await getCashbook2Entry(branchId, entryDate);
  
  if (!hoOperation || !cashbook2) {
    throw new Error('Required data missing for disbursement roll calculation');
  }
  
  // Formula: Previous Disbursement + Daily Disbursement (DIS AMT)
  const disbursementRoll = hoOperation.prev_disbursement_kobo + 
                          cashbook2.dis_amt_kobo;
  
  return disbursementRoll;
};
```

---

## 6. API Endpoints Specification

### 6.1 Authentication Endpoints

#### POST `/api/auth/login`
**Business Logic:**
- Validate credentials against users table
- Check account status and branch assignment
- Create JWT session
- Log authentication attempt
- Send email notification for branch logins
- Update last_login timestamp

**Implementation:**
```javascript
const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user and validate password
    const user = await User.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      await logFailedLoginAttempt(req.ip, username);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Account is not active' });
    }
    
    // Create session
    const sessionToken = await createUserSession(user.id, req);
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    // Send branch login notification
    if (user.role === 'BR') {
      await emailService.sendBranchLoginNotification(user, req);
    }
    
    // Log successful login
    await auditLog.create({
      user_id: user.id,
      action: 'LOGIN',
      resource_type: 'session',
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token: sessionToken,
        expiresIn: JWT_EXPIRY_SECONDS
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
```

### 6.2 Cashbook Endpoints

#### POST `/api/cashbook/submit`
**Business Logic:**
- Validate user permissions (branch access only)
- Auto-calculate PCIH from previous day's Online CIH
- Validate all required fields
- Perform financial calculations
- Save to database with audit trail
- Auto-generate bank statements
- Update related calculations

**Implementation:**
```javascript
const submitCashbook = async (req, res) => {
  const { cashbook1, cashbook2, entryDate } = req.body;
  const userId = req.user.id;
  const branchId = req.user.branch_id;
  
  if (!branchId) {
    return res.status(403).json({ success: false, error: 'Branch access required' });
  }
  
  const transaction = await db.beginTransaction();
  
  try {
    // Auto-calculate PCIH if not provided
    if (!cashbook1.pcih_kobo) {
      cashbook1.pcih_kobo = await calculatePCIH(branchId, entryDate);
    }
    
    // Validate and save Cashbook 1
    const cb1Result = await saveCashbook1Entry({
      ...cashbook1,
      branch_id: branchId,
      entry_date: entryDate,
      submitted_by: userId,
      status: 'submitted'
    }, transaction);
    
    // Validate and save Cashbook 2
    const cb2Result = await saveCashbook2Entry({
      ...cashbook2,
      branch_id: branchId,
      entry_date: entryDate,
      submitted_by: userId,
      status: 'submitted'
    }, transaction);
    
    // Auto-generate bank statements
    await generateBankStatement1(branchId, entryDate, transaction);
    await generateBankStatement2(branchId, entryDate, {}, transaction);
    
    // Calculate and store derived values
    const onlineCIH = await calculateOnlineCIH(branchId, entryDate);
    const tso = await calculateTSO(branchId, entryDate);
    
    await transaction.commit();
    
    // Log the submission
    await auditLog.create({
      user_id: userId,
      action: 'SUBMIT',
      resource_type: 'cashbook',
      resource_id: cb1Result.id,
      new_values: { cashbook1: cb1Result, cashbook2: cb2Result }
    });
    
    res.json({
      success: true,
      data: {
        cashbook1: cb1Result,
        cashbook2: cb2Result,
        calculations: { onlineCIH, tso }
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Cashbook submission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 6.3 HO Operations Endpoints

#### PUT `/api/ho-operations/:branchId/:date`
**Business Logic:**
- Validate HO user permissions
- Update HO-controlled fields only
- Trigger recalculation of dependent values
- Maintain audit trail
- Validate business rules

**Implementation:**
```javascript
const updateHOOperations = async (req, res) => {
  const { branchId, date } = req.params;
  const { field, value } = req.body;
  const userId = req.user.id;
  
  if (req.user.role !== 'HO') {
    return res.status(403).json({ success: false, error: 'HO access required' });
  }
  
  const allowedFields = [
    'frm_ho_kobo',
    'frm_br_kobo', 
    'prev_total_savings_kobo',
    'prev_total_loan_kobo',
    'prev_disbursement_kobo',
    'tbo_kobo',
    'tbo_to_branch_id'
  ];
  
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ success: false, error: 'Invalid field' });
  }
  
  try {
    const oldValue = await getHOOperationField(branchId, date, field);
    
    // Update the field based on its target table
    if (field.startsWith('frm_')) {
      await updateCashbook1Field(branchId, date, field, value);
    } else if (field.startsWith('tbo_')) {
      await updateBankStatement2Field(branchId, date, field, value);
    } else {
      await updateHOOperationField(branchId, date, field, value);
    }
    
    // Trigger recalculations
    await recalculateDependentValues(branchId, date);
    
    // Log the change
    await auditLog.create({
      user_id: userId,
      action: 'UPDATE',
      resource_type: 'ho_operation',
      resource_id: `${branchId}-${date}`,
      old_values: { [field]: oldValue },
      new_values: { [field]: value }
    });
    
    res.json({
      success: true,
      data: {
        branchId,
        date,
        field,
        oldValue,
        newValue: value,
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('HO operations update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### 6.4 Reports Endpoints

#### GET `/api/reports/branch-daily`
**Business Logic:**
- Aggregate daily data across all branches
- Calculate grand totals
- Apply date range filters
- Include calculated fields (Online CIH, TSO, etc.)
- Support branch-specific filtering

**Implementation:**
```javascript
const getBranchDailyReport = async (req, res) => {
  const { startDate, endDate, branchId = 'all' } = req.query;
  
  if (req.user.role !== 'HO') {
    return res.status(403).json({ success: false, error: 'HO access required' });
  }
  
  try {
    const query = `
      SELECT 
        b.id as branch_id,
        b.name as branch_name,
        cb1.entry_date as date,
        
        -- Cashbook 1 data
        cb1.pcih_kobo,
        cb1.savings_kobo,
        cb1.loan_collection_kobo,
        cb1.charges_kobo,
        cb1.collection_total_kobo,
        cb1.frm_ho_kobo,
        cb1.frm_br_kobo,
        cb1.cb_total1_kobo,
        
        -- Cashbook 2 data
        cb2.dis_no,
        cb2.dis_amt_kobo,
        cb2.dis_with_int_kobo,
        cb2.sav_with_kobo,
        cb2.domi_bank_kobo,
        cb2.pos_t_kobo,
        cb2.cb_total2_kobo,
        
        -- Calculated values
        (cb1.cb_total1_kobo - COALESCE(cb2.cb_total2_kobo, 0)) as online_cih_kobo,
        (bs1.bs1_total_kobo - COALESCE(bs2.bs2_total_kobo, 0)) as tso_kobo,
        
        -- Bank statements
        bs1.bs1_total_kobo,
        bs2.bs2_total_kobo,
        
        -- Registers
        ho.prev_total_savings_kobo + cb1.savings_kobo - cb2.sav_with_kobo as cbr_savings_kobo,
        ho.prev_total_loan_kobo + cb2.dis_with_int_kobo - cb1.loan_collection_kobo as cbr_loan_kobo,
        ho.prev_disbursement_kobo + cb2.dis_amt_kobo as disbursement_roll_kobo,
        
        cb1.status as submission_status
        
      FROM branches b
      LEFT JOIN cashbook1_entries cb1 ON b.id = cb1.branch_id 
        AND cb1.entry_date BETWEEN $1 AND $2
      LEFT JOIN cashbook2_entries cb2 ON cb1.branch_id = cb2.branch_id 
        AND cb1.entry_date = cb2.entry_date
      LEFT JOIN bank_statement1 bs1 ON cb1.branch_id = bs1.branch_id 
        AND cb1.entry_date = bs1.entry_date
      LEFT JOIN bank_statement2 bs2 ON cb1.branch_id = bs2.branch_id 
        AND cb1.entry_date = bs2.entry_date
      LEFT JOIN ho_operations ho ON cb1.branch_id = ho.branch_id 
        AND cb1.entry_date = ho.entry_date
        
      WHERE b.status = 'active'
        AND ($3 = 'all' OR b.id = $3::uuid)
        AND cb1.entry_date IS NOT NULL
      
      ORDER BY cb1.entry_date DESC, b.name
    `;
    
    const params = [startDate, endDate, branchId];
    const result = await db.query(query, params);
    
    // Calculate grand totals
    const grandTotals = result.rows.reduce((totals, row) => {
      totals.totalInflow += row.cb_total1_kobo || 0;
      totals.totalOutflow += row.cb_total2_kobo || 0;
      totals.netCashFlow += row.online_cih_kobo || 0;
      totals.totalTransferToSenate += row.tso_kobo || 0;
      return totals;
    }, {
      totalInflow: 0,
      totalOutflow: 0,
      netCashFlow: 0,
      totalTransferToSenate: 0
    });
    
    res.json({
      success: true,
      data: result.rows,
      grandTotals
    });
    
  } catch (error) {
    console.error('Branch daily report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 7. Data Validation & Business Rules

### 7.1 Financial Data Validation

```javascript
const validateCashbook1Entry = (data) => {
  const errors = [];
  
  // All amounts must be positive
  const amountFields = ['pcih_kobo', 'savings_kobo', 'loan_collection_kobo', 'charges_kobo'];
  amountFields.forEach(field => {
    if (data[field] < 0) {
      errors.push(`${field} must be a positive number`);
    }
  });
  
  // Daily transaction limits
  const dailyTotal = data.savings_kobo + data.loan_collection_kobo + data.charges_kobo;
  const MAX_DAILY_LIMIT = 100000000000; // 1 billion kobo = 10 million naira
  if (dailyTotal > MAX_DAILY_LIMIT) {
    errors.push('Daily transaction total exceeds maximum limit');
  }
  
  return errors;
};

const validateCashbook2Entry = (data) => {
  const errors = [];
  
  // Disbursement number validation
  if (data.dis_no < 0 || data.dis_no > 1000) {
    errors.push('Disbursement number must be between 0 and 1000');
  }
  
  // Disbursement with interest should be >= disbursement amount
  if (data.dis_with_int_kobo < data.dis_amt_kobo) {
    errors.push('Disbursement with interest cannot be less than disbursement amount');
  }
  
  return errors;
};
```

### 7.2 Business Rules Enforcement

```javascript
const enforceBusinessRules = {
  // Cashbook entries can only be modified on the same day
  canModifyCashbook: (entryDate, currentDate) => {
    return dayjs(entryDate).isSame(dayjs(currentDate), 'day');
  },
  
  // Only HO can access settings and user management
  requiresHOAccess: (userRole, resource) => {
    const hoOnlyResources = ['users', 'branches', 'settings', 'ho_operations'];
    return userRole === 'HO' || !hoOnlyResources.includes(resource);
  },
  
  // Branch users can only access their own branch data
  canAccessBranchData: (userRole, userBranchId, requestedBranchId) => {
    if (userRole === 'HO') return true;
    return userBranchId === requestedBranchId;
  },
  
  // PCIH must equal previous day's Online CIH
  validatePCIH: async (branchId, entryDate, providedPCIH) => {
    const calculatedPCIH = await calculatePCIH(branchId, entryDate);
    return Math.abs(providedPCIH - calculatedPCIH) < 100; // Allow 1 kobo tolerance
  }
};
```

---

## 8. Security Implementation

### 8.1 JWT Authentication
```javascript
const generateJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'dominion-seedstars',
    audience: 'dominion-users'
  });
};

const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

### 8.2 Role-Based Access Control
```javascript
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    
    next();
  };
};

const branchAccessMiddleware = (req, res, next) => {
  const requestedBranchId = req.params.branchId || req.body.branchId;
  
  if (req.user.role === 'HO') {
    return next(); // HO can access all branches
  }
  
  if (req.user.branch_id !== requestedBranchId) {
    return res.status(403).json({ success: false, error: 'Branch access denied' });
  }
  
  next();
};
```

### 8.3 Data Encryption
```javascript
// Sensitive data encryption
const encrypt = (text) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

---

## 9. Integration Requirements

### 9.1 Email Service Integration (Brevo)

```javascript
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
brevoClient.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const emailTemplates = {
  branchLoginNotification: {
    templateId: 1,
    subject: 'Branch Login Notification - {{params.branchName}}'
  },
  dailyReport: {
    templateId: 2,
    subject: 'Daily Financial Report - {{params.date}}'
  },
  lowBalanceAlert: {
    templateId: 3,
    subject: 'Low Balance Alert - {{params.branchName}}'
  }
};

const sendEmail = async (templateKey, to, params) => {
  const template = emailTemplates[templateKey];
  if (!template) {
    throw new Error('Email template not found');
  }
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.templateId = template.templateId;
  sendSmtpEmail.to = Array.isArray(to) ? to : [{ email: to }];
  sendSmtpEmail.params = params;
  
  return await brevoClient.sendTransacEmail(sendSmtpEmail);
};
```

### 9.2 File Export Services

```javascript
// Excel export using exceljs
const generateExcelReport = async (reportData, reportType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${reportType} Report`);
  
  // Configure worksheet headers based on report type
  const headers = getReportHeaders(reportType);
  worksheet.addRow(headers);
  
  // Add data rows
  reportData.forEach(row => {
    worksheet.addRow(getReportRowData(row, reportType));
  });
  
  // Apply styling
  styleWorksheet(worksheet, reportType);
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

// PDF export using puppeteer
const generatePDFReport = async (reportData, reportType) => {
  const html = await generateReportHTML(reportData, reportType);
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    landscape: reportType === 'branch_daily_report',
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  });
  
  await browser.close();
  return pdf;
};
```

---

## 10. Performance & Scalability

### 10.1 Database Optimization

```sql
-- Indexes for performance
CREATE INDEX idx_cashbook1_branch_date ON cashbook1_entries(branch_id, entry_date);
CREATE INDEX idx_cashbook2_branch_date ON cashbook2_entries(branch_id, entry_date);
CREATE INDEX idx_bank_statement1_branch_date ON bank_statement1(branch_id, entry_date);
CREATE INDEX idx_bank_statement2_branch_date ON bank_statement2(branch_id, entry_date);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Materialized view for reporting performance
CREATE MATERIALIZED VIEW daily_branch_summary AS
SELECT 
  b.id as branch_id,
  b.name as branch_name,
  cb1.entry_date,
  cb1.cb_total1_kobo,
  cb2.cb_total2_kobo,
  (cb1.cb_total1_kobo - COALESCE(cb2.cb_total2_kobo, 0)) as online_cih_kobo,
  cb1.status,
  cb1.updated_at
FROM branches b
JOIN cashbook1_entries cb1 ON b.id = cb1.branch_id
LEFT JOIN cashbook2_entries cb2 ON cb1.branch_id = cb2.branch_id 
  AND cb1.entry_date = cb2.entry_date
WHERE b.status = 'active';

-- Refresh materialized view regularly
CREATE OR REPLACE FUNCTION refresh_daily_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_branch_summary;
END;
$$ LANGUAGE plpgsql;
```

### 10.2 Caching Strategy

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const cacheService = {
  // Cache daily calculations for 1 hour
  async getCachedCalculation(cacheKey) {
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  },
  
  async setCachedCalculation(cacheKey, data, expiry = 3600) {
    await redis.setex(cacheKey, expiry, JSON.stringify(data));
  },
  
  // Generate cache keys
  getDailyCalculationKey: (branchId, date) => `calc:${branchId}:${date}`,
  getBranchReportKey: (branchId, startDate, endDate) => `report:${branchId}:${startDate}:${endDate}`,
  
  // Invalidate related caches when data changes
  async invalidateBranchCache(branchId, date) {
    const pattern = `*${branchId}*${date}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};
```

---

## 11. Monitoring & Logging

### 11.1 Application Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log all API requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.user?.id
    });
  });
  
  next();
};
```

### 11.2 Business Metrics Monitoring

```javascript
// Track business metrics
const metrics = {
  // Daily transaction volumes
  async recordDailyVolume(branchId, date, totals) {
    await db.query(`
      INSERT INTO business_metrics (branch_id, metric_date, metric_type, value)
      VALUES 
        ($1, $2, 'daily_savings', $3),
        ($1, $2, 'daily_disbursements', $4),
        ($1, $2, 'daily_collections', $5)
      ON CONFLICT (branch_id, metric_date, metric_type) 
      DO UPDATE SET value = EXCLUDED.value
    `, [branchId, date, totals.savings, totals.disbursements, totals.collections]);
  },
  
  // System performance metrics
  async recordSystemMetric(metricName, value) {
    await db.query(`
      INSERT INTO system_metrics (metric_name, metric_value, recorded_at)
      VALUES ($1, $2, NOW())
    `, [metricName, value]);
  }
};
```

---

## 12. Testing Strategy

### 12.1 Unit Tests
```javascript
// Example unit test for cashbook calculations
describe('Cashbook Calculations', () => {
  test('should calculate Cashbook 1 totals correctly', () => {
    const cashbook1Data = {
      pcih_kobo: 100000,      // 1000 naira
      savings_kobo: 500000,   // 5000 naira
      loan_collection_kobo: 300000, // 3000 naira
      charges_kobo: 25000,    // 250 naira
      frm_ho_kobo: 200000,    // 2000 naira
      frm_br_kobo: 50000      // 500 naira
    };
    
    const { collectionTotal, cbTotal1 } = calculateCashbook1Totals(cashbook1Data);
    
    expect(collectionTotal).toBe(825000); // 8250 naira
    expect(cbTotal1).toBe(1175000);       // 11750 naira
  });
  
  test('should validate PCIH against previous day Online CIH', async () => {
    const branchId = 'test-branch-id';
    const currentDate = '2024-11-20';
    const expectedPCIH = 500000;
    
    // Mock previous day's Online CIH
    jest.spyOn(db, 'query').mockResolvedValue({
      rows: [{ online_cih_kobo: 500000 }]
    });
    
    const calculatedPCIH = await calculatePCIH(branchId, currentDate);
    expect(calculatedPCIH).toBe(expectedPCIH);
  });
});
```

### 12.2 Integration Tests
```javascript
describe('Cashbook Submission Integration', () => {
  test('should successfully submit complete cashbook entry', async () => {
    const mockUser = { id: 'user-1', role: 'BR', branch_id: 'branch-1' };
    const mockCashbookData = {
      cashbook1: {
        savings_kobo: 1000000,
        loan_collection_kobo: 500000,
        charges_kobo: 25000
      },
      cashbook2: {
        dis_no: 10,
        dis_amt_kobo: 800000,
        dis_with_int_kobo: 880000,
        sav_with_kobo: 100000,
        domi_bank_kobo: 200000,
        pos_t_kobo: 50000
      },
      entryDate: '2024-11-20'
    };
    
    const response = await request(app)
      .post('/api/cashbook/submit')
      .set('Authorization', `Bearer ${generateTestJWT(mockUser)}`)
      .send(mockCashbookData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.calculations.onlineCIH).toBeDefined();
    expect(response.body.data.calculations.tso).toBeDefined();
  });
});
```

---

## 13. Deployment & DevOps

### 13.1 Environment Configuration
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dominion_seedstars
DATABASE_SSL=true
DATABASE_POOL_SIZE=10

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h
ENCRYPTION_KEY=your-encryption-key

# External Services
BREVO_API_KEY=your-brevo-api-key
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.dominion-seedstars.com
FRONTEND_URL=https://app.dominion-seedstars.com

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=dominion-exports

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 13.2 Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 13.3 Database Migrations
```javascript
// migrations/001_initial_schema.js
exports.up = async (knex) => {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 50).unique().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['HO', 'BR']).notNullable();
    table.uuid('branch_id').references('id').inTable('branches').onDelete('SET NULL');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.timestamp('last_login');
    table.boolean('is_first_login').defaultTo(true);
    table.timestamps(true, true);
  });
  
  // Create other tables...
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users');
  // Drop other tables...
};
```

---

## 14. Success Criteria & Acceptance Tests

### 14.1 Functional Requirements Validation

**✅ Authentication & Authorization:**
- [ ] Users can login with role-based access
- [ ] Branch users can only access their branch data
- [ ] HO users can access all branches
- [ ] Email notifications sent on branch login
- [ ] Session management with proper timeouts

**✅ Financial Data Management:**
- [ ] Cashbook entries are validated and calculated correctly
- [ ] PCIH auto-populates from previous day's Online CIH
- [ ] Bank statements are auto-generated from cashbook data
- [ ] All financial calculations follow specified business rules
- [ ] Audit trail maintained for all financial operations

**✅ HO Operations:**
- [ ] HO can input control fields (FRM HO, FRM BR, Previous totals)
- [ ] HO field updates trigger dependent recalculations
- [ ] Transfer between offices (T.B.O) functionality
- [ ] Monthly previous total inputs for register calculations

**✅ Reporting & Analytics:**
- [ ] Branch daily reports with grand totals
- [ ] Financial summary reports with date filtering
- [ ] Branch performance analytics
- [ ] Transaction log reports
- [ ] Export functionality (Excel/PDF)

**✅ System Administration:**
- [ ] User management (create, edit, delete users)
- [ ] Branch management (create, edit, manage branches)
- [ ] System settings configuration
- [ ] Security settings and password policies
- [ ] Notification settings and email templates

### 14.2 Performance Requirements
- [ ] API response times < 200ms for standard operations
- [ ] Database queries optimized with proper indexing
- [ ] Caching implemented for frequently accessed data
- [ ] Report generation < 5 seconds for monthly data
- [ ] Support for minimum 100 concurrent users

### 14.3 Security Requirements
- [ ] All sensitive data encrypted at rest and in transit
- [ ] Role-based access control enforced at API level
- [ ] Audit logging for all critical operations
- [ ] Session management with secure JWT implementation
- [ ] Input validation and SQL injection prevention

---

## 15. Maintenance & Support

### 15.1 Backup Strategy
```sql
-- Daily automated backups
pg_dump dominion_seedstars > backup_$(date +%Y%m%d).sql

-- Point-in-time recovery setup
-- Enable WAL archiving for continuous backup
```

### 15.2 Monitoring & Alerts
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    // Check email service
    await brevoClient.getAccount();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        cache: 'connected',
        email: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## Conclusion

This Backend PRD provides a comprehensive implementation guide for the Dominion Seedstars Financial Management System. The specification covers all business logic, data models, API endpoints, security requirements, and operational considerations needed to build a robust, scalable financial management platform.

The implementation follows Nigerian financial industry best practices, implements proper audit trails for compliance, and provides the real-time visibility and control required for multi-branch operations.

**Key Implementation Priorities:**
1. **Phase 1**: Authentication, basic CRUD operations, and cashbook functionality
2. **Phase 2**: Automated calculations, bank statement generation, and HO operations
3. **Phase 3**: Advanced reporting, analytics, and export capabilities
4. **Phase 4**: System administration, monitoring, and optimization

This specification ensures the backend will seamlessly integrate with the existing frontend implementation and provide a solid foundation for the organization's financial operations management.