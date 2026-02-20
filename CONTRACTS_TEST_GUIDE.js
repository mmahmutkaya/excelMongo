/**
 * CONTRACTS Collection - Integration Test Guide
 *
 * This file demonstrates how to test the contracts API endpoints
 * after the server is running
 */

// ============================================================
// 1. SETUP - Start the backend server
// ============================================================
// Run in terminal:
// cd /c/mahmut/excelMongo
// npm start
//
// Expected output:
// connected to database
// listening for requests on port 4000

// ============================================================
// 2. GET JWT TOKEN (Required for all requests)
// ============================================================

// You need to authenticate first:
// POST http://localhost:4000/api/user/login
//
// Request body:
// {
//   "email": "your@email.com",
//   "password": "YourPassword123!"
// }
//
// Response will include JWT token - copy it for next tests

// ============================================================
// 3. TEST CREATE CONTRACT
// ============================================================

const testCreateContract = async () => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"
  const projectId = "YOUR_PROJECT_ID_HERE" // Get from existing project

  try {
    const response = await fetch('http://localhost:4000/api/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({
        _projectId: projectId,
        contractNumber: "CT-2025-001",
        contractName: "Main Contractor Agreement",
        contractType: "Contractor",
        contractor: "ABC Construction Co.",
        contractorEmail: "contact@abc.com.tr",
        contractorPhone: "+90 212 123 4567",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        contractAmount: 500000,
        currency: "TRY",
        paymentSchedule: "3 installments",
        status: "Active",
        notes: "Test contract"
      })
    })

    const data = await response.json()
    console.log('Create Contract Response:', data)

    // Save the _id for subsequent tests:
    // const contractId = data._id
    // console.log('Created contract ID:', contractId)

    return data._id
  } catch (error) {
    console.error('Error creating contract:', error)
  }
}

// ============================================================
// 4. TEST GET CONTRACTS BY PROJECT
// ============================================================

const testGetContractsByProject = async (projectId) => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"

  try {
    const response = await fetch(`http://localhost:4000/api/contracts/byproject/${projectId}`, {
      method: 'GET',
      headers: {
        'email': email,
        'token': token
      }
    })

    const data = await response.json()
    console.log('Contracts for project:', data)
    return data
  } catch (error) {
    console.error('Error fetching contracts:', error)
  }
}

// ============================================================
// 5. TEST GET SINGLE CONTRACT
// ============================================================

const testGetContract = async (contractId) => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"

  try {
    const response = await fetch(`http://localhost:4000/api/contracts/${contractId}`, {
      method: 'GET',
      headers: {
        'email': email,
        'token': token
      }
    })

    const data = await response.json()
    console.log('Single contract:', data)
    return data
  } catch (error) {
    console.error('Error fetching contract:', error)
  }
}

// ============================================================
// 6. TEST UPDATE CONTRACT
// ============================================================

const testUpdateContract = async (contractId) => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"

  try {
    const response = await fetch(`http://localhost:4000/api/contracts/${contractId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({
        contractAmount: 600000,
        paymentSchedule: "4 installments - improved"
      })
    })

    const data = await response.json()
    console.log('Updated contract:', data)
    return data
  } catch (error) {
    console.error('Error updating contract:', error)
  }
}

// ============================================================
// 7. TEST UPDATE CONTRACT STATUS
// ============================================================

const testUpdateStatus = async (contractId) => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"

  try {
    const response = await fetch(`http://localhost:4000/api/contracts/${contractId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({
        status: "Completed"
      })
    })

    const data = await response.json()
    console.log('Status updated:', data)
    return data
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

// ============================================================
// 8. TEST ADD SIGNATORY
// ============================================================

const testAddSignatory = async (contractId) => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"

  try {
    const response = await fetch(`http://localhost:4000/api/contracts/${contractId}/signatory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({
        fullName: "Ahmed Demir",
        position: "General Manager",
        email: "ahmed@example.com",
        notes: "Final approval signature"
      })
    })

    const data = await response.json()
    console.log('Signatory added:', data)

    // Save signatory ID from the response to test remove:
    // const signatoryId = data.signatories[data.signatories.length - 1]._id

    return data
  } catch (error) {
    console.error('Error adding signatory:', error)
  }
}

// ============================================================
// 9. TEST DELETE CONTRACT
// ============================================================

const testDeleteContract = async (contractId) => {
  const email = "user@example.com"
  const token = "YOUR_JWT_TOKEN_HERE"

  try {
    const response = await fetch(`http://localhost:4000/api/contracts/${contractId}`, {
      method: 'DELETE',
      headers: {
        'email': email,
        'token': token
      }
    })

    const data = await response.json()
    console.log('Contract deleted:', data)
    return data
  } catch (error) {
    console.error('Error deleting contract:', error)
  }
}

// ============================================================
// TEST EXECUTION ORDER
// ============================================================

/**
 * 1. Start backend server:
 *    npm start
 *
 * 2. Get JWT token:
 *    POST /api/user/login with valid credentials
 *
 * 3. Run tests in this order:
 *
 *    const projectId = "YOUR_PROJECT_ID" // Replace with actual ID
 *
 *    // Create contract
 *    const contractId = await testCreateContract()
 *
 *    // Get all contracts for project
 *    await testGetContractsByProject(projectId)
 *
 *    // Get single contract
 *    await testGetContract(contractId)
 *
 *    // Update contract details
 *    await testUpdateContract(contractId)
 *
 *    // Update contract status
 *    await testUpdateStatus(contractId)
 *
 *    // Add signatory
 *    await testAddSignatory(contractId)
 *
 *    // Delete contract
 *    await testDeleteContract(contractId)
 */

// ============================================================
// USING POSTMAN (Alternative)
// ============================================================

/**
 * 1. Get JWT Token:
 *    - Method: POST
 *    - URL: http://localhost:4000/api/user/login
 *    - Headers: Content-Type: application/json
 *    - Body:
 *      {
 *        "email": "your@email.com",
 *        "password": "YourPassword123!"
 *      }
 *
 * 2. Create Contract:
 *    - Method: POST
 *    - URL: http://localhost:4000/api/contracts
 *    - Headers:
 *      - Content-Type: application/json
 *      - email: your@email.com
 *      - token: [JWT_TOKEN_FROM_STEP_1]
 *    - Body: (see testCreateContract above)
 *
 * 3. Get Contracts:
 *    - Method: GET
 *    - URL: http://localhost:4000/api/contracts/byproject/[PROJECT_ID]
 *    - Headers:
 *      - email: your@email.com
 *      - token: [JWT_TOKEN]
 *
 * 4. Other operations follow same pattern with appropriate method and body
 */

// ============================================================
// USING CURL (Alternative)
// ============================================================

/**
 * Get JWT Token:
 * curl -X POST http://localhost:4000/api/user/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"your@email.com","password":"YourPassword123!"}'
 *
 * Create Contract:
 * curl -X POST http://localhost:4000/api/contracts \
 *   -H "Content-Type: application/json" \
 *   -H "email: your@email.com" \
 *   -H "token: [JWT_TOKEN]" \
 *   -d '{
 *     "_projectId": "[PROJECT_ID]",
 *     "contractNumber": "CT-2025-001",
 *     "contractName": "Main Contractor Agreement",
 *     "contractor": "ABC Construction Co.",
 *     "contractAmount": 500000,
 *     "currency": "TRY",
 *     "status": "Active"
 *   }'
 *
 * Get Contracts by Project:
 * curl -X GET http://localhost:4000/api/contracts/byproject/[PROJECT_ID] \
 *   -H "email: your@email.com" \
 *   -H "token: [JWT_TOKEN]"
 *
 * Update Contract:
 * curl -X PATCH http://localhost:4000/api/contracts/[CONTRACT_ID] \
 *   -H "Content-Type: application/json" \
 *   -H "email: your@email.com" \
 *   -H "token: [JWT_TOKEN]" \
 *   -d '{"contractAmount": 600000}'
 *
 * Update Status:
 * curl -X PATCH http://localhost:4000/api/contracts/[CONTRACT_ID]/status \
 *   -H "Content-Type: application/json" \
 *   -H "email: your@email.com" \
 *   -H "token: [JWT_TOKEN]" \
 *   -d '{"status": "Completed"}'
 *
 * Add Signatory:
 * curl -X POST http://localhost:4000/api/contracts/[CONTRACT_ID]/signatory \
 *   -H "Content-Type: application/json" \
 *   -H "email: your@email.com" \
 *   -H "token: [JWT_TOKEN]" \
 *   -d '{
 *     "fullName": "Ahmed Demir",
 *     "position": "General Manager",
 *     "email": "ahmed@example.com"
 *   }'
 *
 * Delete Contract:
 * curl -X DELETE http://localhost:4000/api/contracts/[CONTRACT_ID] \
 *   -H "email: your@email.com" \
 *   -H "token: [JWT_TOKEN]"
 */

// ============================================================
// VERIFICATION CHECKLIST
// ============================================================

/**
 * After implementation, verify:
 *
 * ✅ Server starts without errors
 *    - Check: "connected to database" and "listening on port 4000"
 *
 * ✅ Can create contracts
 *    - Returns contract object with _id
 *    - Validates required fields
 *
 * ✅ Can retrieve contracts
 *    - By project (byproject endpoint)
 *    - By ID (single contract)
 *
 * ✅ Can update contracts
 *    - Update data fields
 *    - Update status
 *
 * ✅ Can manage signatories
 *    - Add signatory
 *    - Retrieve added signatories
 *
 * ✅ Can delete contracts
 *    - Contract removed from database
 *
 * ✅ MongoDB indexes working
 *    - Queries are fast
 *    - No duplicate contract numbers per project
 *
 * ✅ Error handling works
 *    - Missing fields return validation errors
 *    - Invalid IDs return appropriate errors
 *    - Authentication failures handled
 */

module.exports = {
  testCreateContract,
  testGetContractsByProject,
  testGetContract,
  testUpdateContract,
  testUpdateStatus,
  testAddSignatory,
  testDeleteContract
}
