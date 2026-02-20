const express = require('express')
const {
  createSozlesmele,
  getSozlesmeler_byProje,
  getSozlesmele,
  updateSozlesmele,
  deleteSozlesmele,
  updateSozlesmeleStatus,
  addImzaci,
  removeImzaci
} = require('../controllers/sozlesmelerController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()

// All routes require authentication and necessary user data
router.use(requireAuthAndNecessary)

// Get contracts by project
router.get('/byproje/:projeId', getSozlesmeler_byProje)

// Get single contract
router.get('/:id', getSozlesmele)

// Create new contract
router.post('/', createSozlesmele)

// Update contract
router.patch('/:id', updateSozlesmele)

// Delete contract
router.delete('/:id', deleteSozlesmele)

// Update contract status
router.patch('/:id/status', updateSozlesmeleStatus)

// Add signatory to contract
router.post('/:id/imzaci', addImzaci)

// Remove signatory from contract
router.delete('/:id/imzaci/:imzaciId', removeImzaci)

module.exports = router
