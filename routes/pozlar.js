const express = require('express')
const {
  createPoz, getPozlar
} = require('../controllers/pozController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()



router.use(requireAuthAndNecessary)



// GET all pozlar
router.get('/', getPozlar)

// // GET a single poz
// router.get('/:id', getPoz)

// POST a new poz
router.post('/', createPoz)

// // DELETE a poz
// router.delete('/:id', deletePoz)

// // UPDATE a poz
// router.patch('/:id', updatePoz)

module.exports = router