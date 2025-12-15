const express = require('express')
const {
  createDugum,
  getDugumler_pozlar,
  getDugumler_mahallerByPoz,
  getDugumler_byPoz,
  getHazirlananMetraj,
  getOnaylananMetraj,
  getHazirlananMetrajlar,
  addMetrajSatiri,
  update_hazirlananMetraj_peparing,
  update_hazirlananMetraj_ready,
  update_onaylananMetraj_revize,
  update_onaylananMetraj_sil,
  update_hazirlananMetrajlar_seen,
  update_hazirlananMetrajlar_selected,
  update_hazirlananMetrajlar_selectedFull,
  update_hazirlananMetrajlar_unReady
} = require('../controllers/dugumController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()



router.use(requireAuthAndNecessary)


router.post('/', createDugum)

router.get('/pozlar', getDugumler_pozlar)
router.get('/mahallerbypoz', getDugumler_mahallerByPoz)
router.get('/bypoz', getDugumler_byPoz)
router.get('/hazirlananmetraj', getHazirlananMetraj)
router.get('/onaylananmetraj', getOnaylananMetraj)
router.get('/hazirlananmetrajlar', getHazirlananMetrajlar)

router.post('/addmetrajsatiri', addMetrajSatiri)

router.post('/updatehazirlananmetrajpreparing', update_hazirlananMetraj_peparing)
router.post('/updatehazirlananmetrajready', update_hazirlananMetraj_ready)

router.post('/updateonaylananmetrajrevize', update_onaylananMetraj_revize)
router.post('/updateonaylananmetrajsil', update_onaylananMetraj_sil)

router.post('/updatehazirlananmetrajlarseen', update_hazirlananMetrajlar_seen)
router.post('/updatehazirlananmetrajlarselected', update_hazirlananMetrajlar_selected)
router.post('/updatehazirlananmetrajlarselectedfull', update_hazirlananMetrajlar_selectedFull)
router.post('/updatehazirlananmetrajlarunready', update_hazirlananMetrajlar_unReady)


// // // POST a new firma
// router.post('/', createFirma)

// // DELETE a firma
// router.delete('/:id', deleteFirma)

// // UPDATE a firma
// router.patch('/:id', updateFirma)

module.exports = router