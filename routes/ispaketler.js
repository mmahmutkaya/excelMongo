const express = require('express')
const {
  createIsPaket,
  getIsPaketlerByProjeByVersiyon
} = require('../controllers/isPaketController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


router.use(requireAuthAndNecessary)



router.post('/', createIsPaket)

router.get('/', getIsPaketlerByProjeByVersiyon)

// router.get('/:id', getFirma)

// router.delete('/:id', deleteFirma)
// router.patch('/:id', updateFirma)

// router.patch('/parabirimleri', updateParaBirimleri)


module.exports = router