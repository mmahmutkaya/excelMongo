const express = require('express')
const {
  createDugum,
  getDugumler_pozlar,
  getDugumler_mahallerByPoz,
  getDugumler_byPoz,
  getHazirlananmetraj,
  getHazirlananmetrajlar,
  update_hazirlananMetraj_peparing,
  update_hazirlananMetraj_ready
} = require('../controllers/dugumController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()



router.use(requireAuthAndNecessary)



router.post('/', createDugum)

router.get('/pozlar', getDugumler_pozlar)
router.get('/mahallerbypoz', getDugumler_mahallerByPoz)
router.get('/bypoz', getDugumler_byPoz)
router.get('/hazirlananmetraj', getHazirlananmetraj)
router.get('/hazirlananmetrajlar', getHazirlananmetrajlar)

router.post('/updatehazirlananmetrajpreparing', update_hazirlananMetraj_peparing)
router.post('/updatehazirlananmetrajready', update_hazirlananMetraj_ready)





// // // POST a new firma
// router.post('/', createFirma)

// // DELETE a firma
// router.delete('/:id', deleteFirma)

// // UPDATE a firma
// router.patch('/:id', updateFirma)

module.exports = router