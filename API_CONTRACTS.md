# Contracts Collection - API Documentation

## Overview
The `contracts` collection manages contracts and agreements for projects. Each contract is linked to a project (`_projectId`) and can optionally be linked to a company (`_companyId`).

## Base URL
```
http://localhost:4000/api/contracts
```

## Authentication
All endpoints require:
- Headers: `email`, `token`
- Middleware: `requireAuthAndNecessary` (user must be verified)

---

## Endpoints

### 1. Create Contract
**POST** `/api/contracts`

**Request Body:**
```json
{
  "_projectId": "ObjectId",
  "_companyId": "ObjectId (optional)",
  "contractNumber": "CT-2025-001",
  "contractName": "Main Contractor Agreement",
  "contractType": "Contractor",
  "contractor": "ABC Construction Co.",
  "contractorEmail": "contact@abc.com.tr",
  "contractorPhone": "+90 212 123 4567",
  "contractorAddress": "Istanbul, Turkey",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "contractAmount": 500000,
  "currency": "TRY",
  "paymentSchedule": "3 installments - start, middle, end",
  "status": "Active",
  "documentUrl": "https://example.com/contracts/CT-2025-001.pdf",
  "notes": "Main contract",
  "internalNotes": "Internal note: payment to be updated"
}
```

**Response:**
```json
{
  "_id": "ObjectId",
  "_projectId": "ObjectId",
  "contractNumber": "CT-2025-001",
  "status": "Active",
  "createdBy": "user@example.com",
  "createdAt": "2025-02-20T10:00:00Z",
  ...
}
```

**Status Codes:**
- `200` - Success
- `200` with `errorObject` - Validation errors

---

### 2. Get Contracts by Project
**GET** `/api/contracts/byproject/:projectId`

**Response:**
```json
[
  {
    "_id": "ObjectId",
    "_projectId": "ObjectId",
    "contractNumber": "CT-2025-001",
    "contractName": "Main Contractor Agreement",
    "status": "Active",
    ...
  },
  ...
]
```

---

### 3. Get Single Contract
**GET** `/api/contracts/:id`

**Response:**
```json
{
  "_id": "ObjectId",
  "_projectId": "ObjectId",
  "contractNumber": "CT-2025-001",
  "signatories": [
    {
      "_id": "ObjectId",
      "fullName": "Mahmut Yaya",
      "position": "Project Manager",
      "signatureDate": "2025-01-15T00:00:00Z",
      "email": "mahmut@example.com"
    }
  ],
  "attachments": [
    {
      "_id": "ObjectId",
      "attachmentName": "Technical Specifications",
      "attachmentUrl": "https://example.com/contracts/CT-2025-001-tech.pdf",
      "attachmentType": "PDF"
    }
  ],
  ...
}
```

---

### 4. Update Contract
**PATCH** `/api/contracts/:id`

**Request Body:**
```json
{
  "contractName": "Updated name",
  "contractAmount": 600000,
  "paymentSchedule": "4 installments"
}
```

**Response:** Updated contract object

---

### 5. Delete Contract
**DELETE** `/api/contracts/:id`

**Response:**
```json
{
  "message": "Contract deleted successfully"
}
```

---

### 6. Update Contract Status
**PATCH** `/api/contracts/:id/status`

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Valid Status Values:**
- `Active` - Active contract
- `Completed` - Completed
- `Pending` - Pending
- `Terminated` - Terminated
- `In Progress` - In Progress

**Response:** Updated contract object

---

### 7. Add Signatory
**POST** `/api/contracts/:id/signatory`

**Request Body:**
```json
{
  "fullName": "Ahmed Demir",
  "position": "General Manager",
  "email": "ahmed@example.com",
  "notes": "Final approval signature"
}
```

**Response:** Updated contract with new signatory

---

### 8. Remove Signatory
**DELETE** `/api/contracts/:id/signatory/:signatoryId`

**Response:** Updated contract with signatory removed

---

## Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `_projectId` | ObjectId | Project reference (required) |
| `_companyId` | ObjectId | Company reference (optional) |
| `contractNumber` | String | Contract number (unique per project) |
| `contractName` | String | Contract title |
| `contractType` | String | Type: Contractor, Supplier, HR, etc. |
| `contractor` | String | Contractor/Supplier name |
| `contractorEmail` | String | Contact email |
| `contractorPhone` | String | Contact phone |
| `contractorAddress` | String | Address |
| `startDate` | Date | Start date |
| `endDate` | Date | End date |
| `renewalDate` | Date | Renewal date |
| `contractAmount` | Number | Contract amount/value |
| `currency` | String | Currency (TRY, USD, EUR) |
| `paymentSchedule` | String | Payment schedule description |
| `status` | String | Status |
| `initialApproval` | Object | Initial approval info |
| `finalApproval` | Object | Final approval info |
| `signatories` | Array | Signatories list |
| `contractVersions` | Array | Version history |
| `documentUrl` | String | Main document URL |
| `attachments` | Array | Attachments |
| `notes` | String | Public notes |
| `internalNotes` | String | Internal notes |
| `createdBy` | String | User who created |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |
| `updatedBy` | String | User who updated |

---

## Indexes
Automatically created for performance:
- `_projectId` - Query by project
- `_companyId` - Query by company
- `contractNumber` - Unique contract number
- `status` - Query by status
- `startDate` - Query by start date
- `endDate` - Query by end date (useful for expiry tracking)
- `createdAt` - Sort by creation
- `_projectId + status` - Composite index for filtering

---

## Error Handling

**Validation Errors (HTTP 200 with errorObject):**
```json
{
  "errorObject": {
    "contractNumberError": "This contract number already exists for this project",
    "contractorError": "Contractor name is required"
  }
}
```

**Critical Errors (HTTP 400):**
```json
{
  "error": "BACKEND - (contractsController) - Database connection failed"
}
```

---

## Example Usage

### Create Contract
```bash
curl -X POST http://localhost:4000/api/contracts \
  -H "Content-Type: application/json" \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..." \
  -d '{
    "_projectId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "contractNumber": "CT-2025-001",
    "contractName": "Main Contractor Agreement",
    "contractType": "Contractor",
    "contractor": "ABC Construction Co.",
    "contractAmount": 500000,
    "currency": "TRY",
    "status": "Active"
  }'
```

### Get Contracts by Project
```bash
curl -X GET http://localhost:4000/api/contracts/byproject/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..."
```

### Update Contract Status
```bash
curl -X PATCH http://localhost:4000/api/contracts/65a1b2c3d4e5f/status \
  -H "Content-Type: application/json" \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..." \
  -d '{"status": "Completed"}'
```

### Add Signatory
```bash
curl -X POST http://localhost:4000/api/contracts/65a1b2c3d4e5f/signatory \
  -H "Content-Type: application/json" \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..." \
  -d '{
    "fullName": "Ahmed Demir",
    "position": "General Manager",
    "email": "ahmed@example.com"
  }'
```

---

## Testing the API

### Using MongoDB Playground
Run queries in `/mongoplayground/contracts.mongodb.js` to:
- Create test contracts
- Query by various filters
- Test aggregations
- Verify indexes

### Using Postman/cURL
1. Get valid JWT token from `/api/user/login`
2. Add headers: `email`, `token`
3. Test endpoints with provided examples

---

## Next Steps

1. Create Frontend Components - Build UI forms for contract management
2. Add Validation - Implement more field validations as needed
3. Create Reports - Add endpoints for contract analytics
4. Setup Notifications - Alert users when contracts are expiring
5. Add Versioning - Track contract versions and changes
