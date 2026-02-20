const Contract = require('../models/contractModel')
const Project = require('../models/projeModel')
const mongoose = require('mongoose')

const errorBase = "BACKEND - (contractsController) - "

// Create new contract
const createContract = async (req, res) => {
  const error = errorBase + "createContract"

  try {
    const { email: userEmail } = JSON.parse(req.user)

    const {
      _projectId,
      _companyId,
      contractNumber,
      contractName,
      contractType,
      contractor,
      contractorEmail,
      contractorPhone,
      contractorAddress,
      startDate,
      endDate,
      contractAmount,
      currency,
      paymentSchedule,
      status,
      documentUrl,
      notes,
      internalNotes
    } = req.body

    let errorObject = {}

    // Validation
    if (!_projectId) {
      errorObject.projectError = "Project not selected"
    }
    if (!contractNumber || contractNumber.trim().length === 0) {
      errorObject.contractNumberError = "Contract number is required"
    }
    if (!contractName || contractName.trim().length === 0) {
      errorObject.contractNameError = "Contract name is required"
    }
    if (!contractor || contractor.trim().length === 0) {
      errorObject.contractorError = "Contractor name is required"
    }

    // Return validation errors if any
    if (Object.keys(errorObject).length > 0) {
      res.status(200).json({ errorObject })
      return
    }

    // Check if contract number already exists for this project
    const existingContract = await Contract.findOne({
      _projectId: new mongoose.Types.ObjectId(_projectId),
      contractNumber: contractNumber
    })

    if (existingContract) {
      errorObject.contractNumberError = "This contract number already exists for this project"
      res.status(200).json({ errorObject })
      return
    }

    const currentDate = new Date()

    const newContract = new Contract({
      _projectId: new mongoose.Types.ObjectId(_projectId),
      _companyId: _companyId ? new mongoose.Types.ObjectId(_companyId) : null,
      contractNumber,
      contractName,
      contractType: contractType || "Other",
      contractor,
      contractorEmail: contractorEmail || "",
      contractorPhone: contractorPhone || "",
      contractorAddress: contractorAddress || "",
      startDate: startDate ? new Date(startDate) : currentDate,
      endDate: endDate ? new Date(endDate) : null,
      contractAmount: contractAmount || 0,
      currency: currency || "TRY",
      paymentSchedule: paymentSchedule || "",
      status: status || "Pending",
      documentUrl: documentUrl || "",
      notes: notes || "",
      internalNotes: internalNotes || "",
      createdBy: userEmail,
      createdAt: currentDate,
      signatories: [],
      contractVersions: []
    })

    const savedContract = await newContract.save()
    res.status(200).json(savedContract)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Get all contracts for a project
const getContractsByProject = async (req, res) => {
  const error = errorBase + "getContractsByProject"

  try {
    const { projectId } = req.params

    if (!projectId) {
      return res.status(400).json({ error: `${error} - Project ID not provided` })
    }

    const contracts = await Contract.find({
      _projectId: new mongoose.Types.ObjectId(projectId)
    }).sort({ createdAt: -1 })

    res.status(200).json(contracts)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Get single contract
const getContract = async (req, res) => {
  const error = errorBase + "getContract"

  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: `${error} - Contract ID not provided` })
    }

    const contract = await Contract.findById(new mongoose.Types.ObjectId(id))

    if (!contract) {
      return res.status(400).json({ error: `${error} - Contract not found` })
    }

    res.status(200).json(contract)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Update contract
const updateContract = async (req, res) => {
  const error = errorBase + "updateContract"

  try {
    const { id } = req.params
    const { email: userEmail } = JSON.parse(req.user)
    const updateData = req.body

    if (!id) {
      return res.status(400).json({ error: `${error} - Contract ID not provided` })
    }

    // Add update metadata
    updateData.updatedAt = new Date()
    updateData.updatedBy = userEmail

    const updatedContract = await Contract.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      updateData,
      { new: true }
    )

    if (!updatedContract) {
      return res.status(400).json({ error: `${error} - Contract not found` })
    }

    res.status(200).json(updatedContract)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Delete contract
const deleteContract = async (req, res) => {
  const error = errorBase + "deleteContract"

  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: `${error} - Contract ID not provided` })
    }

    const deletedContract = await Contract.findByIdAndDelete(new mongoose.Types.ObjectId(id))

    if (!deletedContract) {
      return res.status(400).json({ error: `${error} - Contract not found` })
    }

    res.status(200).json({ message: "Contract deleted successfully" })
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Update contract status
const updateContractStatus = async (req, res) => {
  const error = errorBase + "updateContractStatus"

  try {
    const { id } = req.params
    const { status } = req.body
    const { email: userEmail } = JSON.parse(req.user)

    if (!id || !status) {
      return res.status(400).json({ error: `${error} - ID or status not provided` })
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      {
        status,
        updatedAt: new Date(),
        updatedBy: userEmail
      },
      { new: true }
    )

    res.status(200).json(updatedContract)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Add signatory to contract
const addSignatory = async (req, res) => {
  const error = errorBase + "addSignatory"

  try {
    const { id } = req.params
    const { fullName, position, email, notes } = req.body

    if (!id || !fullName) {
      return res.status(400).json({ error: `${error} - Missing required data` })
    }

    const contract = await Contract.findById(new mongoose.Types.ObjectId(id))

    if (!contract) {
      return res.status(400).json({ error: `${error} - Contract not found` })
    }

    const newSignatory = {
      fullName,
      position: position || "",
      signatureDate: new Date(),
      email: email || "",
      notes: notes || ""
    }

    contract.signatories.push(newSignatory)
    await contract.save()

    res.status(200).json(contract)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

// Remove signatory
const removeSignatory = async (req, res) => {
  const error = errorBase + "removeSignatory"

  try {
    const { id, signatoryId } = req.params

    const contract = await Contract.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      {
        $pull: { signatories: { _id: new mongoose.Types.ObjectId(signatoryId) } }
      },
      { new: true }
    )

    if (!contract) {
      return res.status(400).json({ error: `${error} - Contract not found` })
    }

    res.status(200).json(contract)
  } catch (error) {
    res.status(400).json({ error: `${error} - ${error.message}` })
  }
}

module.exports = {
  createContract,
  getContractsByProject,
  getContract,
  updateContract,
  deleteContract,
  updateContractStatus,
  addSignatory,
  removeSignatory
}
