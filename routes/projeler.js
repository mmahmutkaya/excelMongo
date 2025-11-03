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
  moveLbsRight,
  createIsPaketBaslik,
  createIsPaket
} = require('../controllers/projeController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


// kullanıcı yetki sorgulama ve sorgunun devamına kullanıcı bilgilerini yükleme
router.use(requireAuthAndNecessary)


// PROJE TEMEL FONKSİYONLAR
router.get('/byfirma/:id', getProjeler_byFirma)
router.get('/:id', getProje)
router.post('/', createProje)


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



// LBS
router.post('/createispaketbaslik', createIsPaketBaslik)
router.post('/createispaket', createIsPaket)


module.exports = router