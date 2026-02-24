
const express = require('express')
const {
  createPoz,
  getPozlar,
  updateBirimFiyatlar,
  getIsPaketlerDugumler
} = require('../controllers/pozController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()



router.use(requireAuthAndNecessary)


// GET all pozlar
router.get('/', getPozlar)
router.post('/', createPoz)

router.patch('/birimfiyatlar', updateBirimFiyatlar)
router.get('/ispaketlerdugumler', getIsPaketlerDugumler)

// // DELETE a poz
// router.delete('/:id', deletePoz)

// // UPDATE a poz
// router.patch('/:id', updatePoz)

module.exports = router