const express = require('express')

const {
  getProjeler_byFirma,
  getProje,
  createProje,
  createWbs,
  updateWbs,
  toggleWbsForPoz,
  deleteWbs,
  moveWbsUp,
  moveWbsDown,
  moveWbsLeft,
  moveWbsRight,
  createLbs,
  updateLbs,
  toggleLbsForMahal,
  deleteLbs,
  moveLbsUp,
  moveLbsDown,
  moveLbsLeft,
  moveLbsRight
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
router.post('/movewbsup', moveWbsUp)
router.post('/movewbsdown', moveWbsDown)
router.post('/movewbsleft', moveWbsLeft)
router.post('/movewbsright', moveWbsRight)




// LBS
router.post('/createlbs', createLbs)
router.post('/updatelbs', updateLbs)
router.post('/togglelbsformahal', toggleLbsForMahal)
router.post('/deletelbs', deleteLbs)
router.post('/movelbsup', moveLbsUp)
router.post('/movelbsdown', moveLbsDown)
router.post('/movelbsleft', moveLbsLeft)
router.post('/movelbsright', moveLbsRight)





module.exports = router