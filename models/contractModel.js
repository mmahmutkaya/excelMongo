const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Sub-schema for contract versions
const contractVersionSchema = mongoose.Schema(
  {
    versionNumber: Number,
    description: String,
    createdAt: Date,
    createdBy: String
  }
)

// Sub-schema for signatories
const signatorySchema = mongoose.Schema(
  {
    fullName: String,
    position: String,
    signatureDate: Date,
    email: String,
    notes: String
  }
)

// Main contracts schema
const contractSchema = new Schema(
  {
    _projectId: mongoose.ObjectId,
    _companyId: mongoose.ObjectId,
    contractNumber: String,
    contractName: String,
    contractType: String,
    contractor: String,
    contractorEmail: String,
    contractorPhone: String,
    contractorAddress: String,

    // Contract dates
    startDate: Date,
    endDate: Date,
    renewalDate: Date,

    // Financial details
    contractAmount: Number,
    currency: String,
    paymentSchedule: String,

    // Status tracking
    status: String,
    initialApproval: {
      approvedBy: String,
      approvalDate: Date,
      approved: Boolean
    },
    finalApproval: {
      approvedBy: String,
      approvalDate: Date,
      approved: Boolean
    },

    // Signatories
    signatories: [signatorySchema],

    // Versions
    contractVersions: [contractVersionSchema],

    // Additional data
    documentUrl: String,
    attachments: [
      {
        attachmentName: String,
        attachmentUrl: String,
        attachmentType: String,
        uploadDate: Date
      }
    ],

    // Notes and comments
    notes: String,
    internalNotes: String,

    // Audit trail
    createdBy: String,
    createdAt: Date,
    updatedAt: Date,
    updatedBy: String
  },
  {
    collection: 'contracts',
    versionKey: false
  }
)

// Add indexes for commonly searched fields
contractSchema.index({ _projectId: 1 })
contractSchema.index({ _companyId: 1 })
contractSchema.index({ contractNumber: 1 })
contractSchema.index({ status: 1 })
contractSchema.index({ startDate: 1 })
contractSchema.index({ endDate: 1 })
contractSchema.index({ createdAt: 1 })
contractSchema.index({ _projectId: 1, status: 1 })

module.exports = mongoose.model('Contract', contractSchema)
