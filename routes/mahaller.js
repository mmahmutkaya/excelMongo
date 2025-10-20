const express = require('express')
const {
  createMahal, getMahaller
} = require('../controllers/mahalController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()



router.use(requireAuthAndNecessary)



// GET all pozlar
router.get('/', getMahaller)

// // GET a single poz
// router.get('/:id', getPoz)

// POST a new poz
router.post('/', createMahal)

// // DELETE a poz
// router.delete('/:id', deletePoz)

// // UPDATE a poz
// router.patch('/:id', updatePoz)

module.exports = router