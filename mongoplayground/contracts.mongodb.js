// MongoDB Playground - Contracts Collection Examples
// Database: rapor724_v2

// ============================================
// 1. CREATE - Insert a new contract
// ============================================
db.contracts.insertOne({
  _projectId: ObjectId("YOUR_PROJECT_ID_HERE"),
  _companyId: ObjectId("YOUR_COMPANY_ID_HERE"),
  contractNumber: "CT-2025-001",
  contractName: "Main Contractor Agreement",
  contractType: "Contractor",
  contractor: "ABC Construction Co.",
  contractorEmail: "contact@abc.com.tr",
  contractorPhone: "+90 212 123 4567",
  contractorAddress: "Istanbul, Turkey",
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-12-31"),
  contractAmount: 500000,
  currency: "TRY",
  paymentSchedule: "3 installments - start, middle, end",
  status: "Active",
  documentUrl: "https://example.com/contracts/CT-2025-001.pdf",
  notes: "Main contract",
  internalNotes: "Internal note: payment to be updated",
  signatories: [
    {
      fullName: "Mahmut Yaya",
      position: "Project Manager",
      signatureDate: new Date("2025-01-15"),
      email: "mahmut@example.com",
      notes: "Signed"
    }
  ],
  contractVersions: [],
  createdBy: "user@example.com",
  createdAt: new Date(),
  updatedAt: null,
  updatedBy: null
})

// ============================================
// 2. READ - Get all contracts for a project
// ============================================
db.contracts.find({
  _projectId: ObjectId("YOUR_PROJECT_ID_HERE")
}).sort({ createdAt: -1 })

// ============================================
// 3. READ - Get contract by contract number
// ============================================
db.contracts.findOne({
  contractNumber: "CT-2025-001"
})

// ============================================
// 4. READ - Get active contracts
// ============================================
db.contracts.find({
  status: "Active"
}).sort({ endDate: 1 })

// ============================================
// 5. READ - Get contracts by date range
// ============================================
db.contracts.find({
  startDate: { $gte: new Date("2025-01-01") },
  endDate: { $lte: new Date("2025-12-31") }
})

// ============================================
// 6. READ - Get contracts by contractor
// ============================================
db.contracts.find({
  contractor: "ABC Construction Co."
})

// ============================================
// 7. UPDATE - Update contract information
// ============================================
db.contracts.updateOne(
  { contractNumber: "CT-2025-001" },
  {
    $set: {
      status: "Completed",
      updatedAt: new Date(),
      updatedBy: "user@example.com"
    }
  }
)

// ============================================
// 8. UPDATE - Add signatory to contract
// ============================================
db.contracts.updateOne(
  { contractNumber: "CT-2025-001" },
  {
    $push: {
      signatories: {
        fullName: "Ahmed Demir",
        position: "General Manager",
        signatureDate: new Date(),
        email: "ahmed@example.com",
        notes: "Final approval signature"
      }
    }
  }
)

// ============================================
// 9. UPDATE - Add attachment to contract
// ============================================
db.contracts.updateOne(
  { contractNumber: "CT-2025-001" },
  {
    $push: {
      attachments: {
        attachmentName: "Technical Specifications",
        attachmentUrl: "https://example.com/contracts/CT-2025-001-tech.pdf",
        attachmentType: "PDF",
        uploadDate: new Date()
      }
    }
  }
)

// ============================================
// 10. DELETE - Remove a signatory
// ============================================
db.contracts.updateOne(
  { contractNumber: "CT-2025-001" },
  {
    $pull: {
      signatories: { _id: ObjectId("SIGNATORY_ID_HERE") }
    }
  }
)

// ============================================
// 11. AGGREGATION - Get contract statistics by status
// ============================================
db.contracts.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 },
      totalAmount: { $sum: "$contractAmount" }
    }
  },
  {
    $sort: { _id: 1 }
  }
])

// ============================================
// 12. AGGREGATION - Get contracts nearing expiration
// ============================================
db.contracts.aggregate([
  {
    $match: {
      status: "Active",
      endDate: {
        $gte: new Date(),
        $lte: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    }
  },
  {
    $sort: { endDate: 1 }
  },
  {
    $project: {
      contractNumber: 1,
      contractName: 1,
      contractor: 1,
      endDate: 1,
      daysUntilExpiry: {
        $divide: [
          { $subtract: ["$endDate", new Date()] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  }
])

// ============================================
// 13. AGGREGATION - Join with projects
// ============================================
db.contracts.aggregate([
  {
    $match: { status: "Active" }
  },
  {
    $lookup: {
      from: "projeler",
      localField: "_projectId",
      foreignField: "_id",
      as: "projectDetails"
    }
  },
  {
    $unwind: "$projectDetails"
  },
  {
    $project: {
      contractNumber: 1,
      contractName: 1,
      contractor: 1,
      projectName: "$projectDetails.name",
      contractAmount: 1,
      currency: 1
    }
  }
])

// ============================================
// 14. DELETE - Remove entire contract
// ============================================
db.contracts.deleteOne({
  contractNumber: "CT-2025-001"
})

// ============================================
// 15. CREATE INDEXES - For performance
// ============================================
db.contracts.createIndex({ _projectId: 1 })
db.contracts.createIndex({ _companyId: 1 })
db.contracts.createIndex({ contractNumber: 1 }, { unique: true })
db.contracts.createIndex({ status: 1 })
db.contracts.createIndex({ startDate: 1 })
db.contracts.createIndex({ endDate: 1 })
db.contracts.createIndex({ createdAt: 1 })
db.contracts.createIndex({ _projectId: 1, status: 1 })

// ============================================
// Show collection statistics
// ============================================
db.contracts.stats()
