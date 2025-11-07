const express = require('express')
const {
  createFirma,
  getFirmalar,
  getFirma,
  updateParaBirimleri
} = require('../controllers/firmaController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


router.use(requireAuthAndNecessary)



router.get('/', getFirmalar)
router.get('/:id', getFirma)
router.post('/', createFirma)
// router.delete('/:id', deleteFirma)
// router.patch('/:id', updateFirma)

router.patch('/parabirimleri', updateParaBirimleri)


module.exports = router