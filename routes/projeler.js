const express = require('express')
const {
  getProjeler_byFirma, getProje, createProje, createWbs, updateWbs, toggleWbsForPoz, deleteWbs
} = require('../controllers/projeController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


router.use(requireAuthAndNecessary)


// GET all getProjeler_byFirma
router.get('/byfirma/:id', getProjeler_byFirma)

// GET a single proje
router.get('/:id', getProje)

// // POST a new proje
router.post('/', createProje)

// // DELETE a proje
// router.delete('/:id', deleteProje)

// // UPDATE a proje
// router.patch('/:id', updateProje)



// WBS
router.post('/createwbs', createWbs)
router.post('/updatewbs', updateWbs)
router.post('/togglewbsforpoz', toggleWbsForPoz)
router.post('/deletewbs', deleteWbs)



module.exports = router