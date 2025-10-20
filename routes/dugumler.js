const express = require('express')
const {
  getDugumler_pozlar,
  getDugumler_mahallerByPoz,
  createDugum
} = require('../controllers/dugumController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()



router.use(requireAuthAndNecessary)



router.get('/pozlar', getDugumler_pozlar)


router.get('/mahallerbypoz', getDugumler_mahallerByPoz)


router.post('/', createDugum)



// // // POST a new firma
// router.post('/', createFirma)

// // DELETE a firma
// router.delete('/:id', deleteFirma)

// // UPDATE a firma
// router.patch('/:id', updateFirma)

module.exports = router