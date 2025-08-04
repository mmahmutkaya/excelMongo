const express = require('express')
const {
  getPozlar, 
  getPoz, 
  createPoz, 
  deletePoz, 
  updatePoz
} = require('../controllers/pozController')

const router = express.Router()

// GET all pozlar
router.get('/', getPozlar)

// GET a single poz
router.get('/:id', getPoz)

// POST a new poz
router.post('/', createPoz)

// DELETE a poz
router.delete('/:id', deletePoz)

// UPDATE a poz
router.patch('/:id', updatePoz)

module.exports = router