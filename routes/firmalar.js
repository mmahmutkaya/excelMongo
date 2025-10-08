const express = require('express')
const {
  getFirmalar, createFirma, getFirma
} = require('../controllers/firmaController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


router.use(requireAuthAndNecessary)


// GET all firmalar names
router.get('/', getFirmalar)

// // GET a single firma
router.get('/:id', getFirma)

// // POST a new firma
router.post('/', createFirma)

// // DELETE a firma
// router.delete('/:id', deleteFirma)

// // UPDATE a firma
// router.patch('/:id', updateFirma)

module.exports = router