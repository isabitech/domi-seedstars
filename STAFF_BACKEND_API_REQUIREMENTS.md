# Staff Information Backend API Requirements

## Purpose
This document defines backend updates required for the Head Office Staff Information frontend module.

## Scope
Staff Information is Head Office only and supports:

1. List staff records
2. Add staff record
3. Edit staff record
4. Delete staff record
5. Download staff list (frontend XLSX export from API data)

## Required Staff Fields
Each staff record must include:

1. S/N (frontend generated serial, not persisted)
2. Staff name
3. Staff I.D number
4. Employment date
5. Current position
6. Current branch
7. Residential address
8. Guarantor name
9. Guarantor number
10. Gender

## Canonical API Field Names
Use these JSON keys in request/response payloads:

- staffName
- staffIdNumber
- employmentDate (YYYY-MM-DD)
- currentPosition
- currentBranch
- branchId
- residentialAddress
- guarantorName
- guarantorNumber
- gender (`male | female`)

## Required Endpoints

### 1) List Staff
GET /api/v1/staff

Query params:

- page (number, optional)
- limit (number, optional)
- branchId (string, optional)
- search (string, optional)
- gender (`male | female`, optional)

Search should match at least:

- staffName
- staffIdNumber
- currentPosition
- currentBranch
- residentialAddress
- guarantorName
- guarantorNumber

Role rules:

- HO/admin: full access
- BR: no access (return 403)

Response example:

```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "_id": "6877a0e66bbf0f2f9f42a321",
        "staffName": "TOPE JOHN",
        "staffIdNumber": "DS-HO-001",
        "employmentDate": "2024-02-01",
        "currentPosition": "Branch Supervisor",
        "currentBranch": "IBUKUN",
        "branchId": "685fd12f9a1cf02b76127002",
        "residentialAddress": "Akure, Ondo State",
        "guarantorName": "FAVOUR HADASSAH",
        "guarantorNumber": "08025111111",
        "gender": "female",
        "branch": {
          "_id": "685fd12f9a1cf02b76127002",
          "name": "IBUKUN",
          "code": "IBK001"
        },
        "createdAt": "2026-07-16T09:30:00.000Z",
        "updatedAt": "2026-07-16T09:30:00.000Z"
      }
    ],
    "count": 10,
    "total": 42,
    "pagination": {
      "page": 1,
      "limit": 10,
      "pages": 5,
      "total": 42,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Staff records fetched successfully"
}
```

### 2) Create Staff Record
POST /api/v1/staff

Request body:

```json
{
  "staffName": "TOPE JOHN",
  "staffIdNumber": "DS-HO-001",
  "employmentDate": "2024-02-01",
  "currentPosition": "Branch Supervisor",
  "currentBranch": "IBUKUN",
  "branchId": "685fd12f9a1cf02b76127002",
  "residentialAddress": "Akure, Ondo State",
  "guarantorName": "FAVOUR HADASSAH",
  "guarantorNumber": "08025111111",
  "gender": "female"
}
```

Rules:

- HO/admin only
- staffIdNumber should be unique

Response:

```json
{
  "success": true,
  "data": {
    "staff": {
      "_id": "6877a0e66bbf0f2f9f42a321"
    }
  },
  "message": "Staff record created successfully"
}
```

### 3) Update Staff Record
PUT /api/v1/staff/:id

Partial update body example:

```json
{
  "currentPosition": "Regional Supervisor",
  "currentBranch": "MUSTER SEED",
  "branchId": "685fd12f9a1cf02b76127003"
}
```

Rules:

- HO/admin only
- staffIdNumber uniqueness should still be enforced when updated

### 4) Delete Staff Record
DELETE /api/v1/staff/:id

Rules:

- HO/admin only

Response:

```json
{
  "success": true,
  "message": "Staff record deleted successfully"
}
```

## Suggested Data Model
Collection: staff

Fields:

- _id
- staffName (required)
- staffIdNumber (required, unique)
- employmentDate (required)
- currentPosition (required)
- currentBranch (required)
- branch (ObjectId ref branches, required)
- residentialAddress (required)
- guarantorName (required)
- guarantorNumber (required)
- gender (`male | female`, required)
- createdBy (ObjectId ref users)
- updatedBy (ObjectId ref users)
- createdAt
- updatedAt

Recommended indexes:

- { staffIdNumber: 1 } unique
- { branch: 1, employmentDate: -1 }
- { branch: 1, gender: 1 }
- text index: staffName, staffIdNumber, currentPosition, currentBranch, guarantorName

## Validation Rules

- Required: staffName, staffIdNumber, employmentDate, currentPosition, currentBranch, branchId, residentialAddress, guarantorName, guarantorNumber, gender
- employmentDate should be valid ISO date input (frontend sends YYYY-MM-DD)
- gender must be male or female
- guarantorNumber must be valid phone format

## Download Notes
Frontend currently exports fetched table rows to XLSX.
No dedicated export endpoint is required for this iteration.
