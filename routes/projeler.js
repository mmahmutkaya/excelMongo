const express = require('express')
const {
  getProjeler_byFirma, createProje
} = require('../controllers/projeController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


router.use(requireAuthAndNecessary)


// GET all getProjeler_byFirma
router.get('/byfirma', getProjeler_byFirma)

// // // GET a single proje
// router.get('/:id', getProje)

// // POST a new proje
router.post('/', createProje)

// // DELETE a proje
// router.delete('/:id', deleteProje)

// // UPDATE a proje
// router.patch('/:id', updateProje)

module.exports = router