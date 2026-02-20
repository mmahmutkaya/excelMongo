const express = require('express')
const {
  createContract,
  getContractsByProject,
  getContract,
  updateContract,
  deleteContract,
  updateContractStatus,
  addSignatory,
  removeSignatory
} = require('../controllers/contractController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()

// All routes require authentication and necessary user data
router.use(requireAuthAndNecessary)

// Get contracts by project
router.get('/byproject/:projectId', getContractsByProject)

// Get single contract
router.get('/:id', getContract)

// Create new contract
router.post('/', createContract)

// Update contract
router.patch('/:id', updateContract)

// Delete contract
router.delete('/:id', deleteContract)

// Update contract status
router.patch('/:id/status', updateContractStatus)

// Add signatory to contract
router.post('/:id/signatory', addSignatory)

// Remove signatory from contract
router.delete('/:id/signatory/:signatoryId', removeSignatory)

module.exports = router
