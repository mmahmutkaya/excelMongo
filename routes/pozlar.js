import { Router } from 'express'
import { getPozlar, getPoz, createPoz, deletePoz, updatePoz } from '../controllers/pozController'

const router = Router()

// GET all pozlar
router.get('/', getPozlar)

// GET a single poz
router.get('/:id', getPoz)

// POST a new poz
router.post('/', createPoz)

// DELETE a poz
router.delete('/:id', deletePoz)

// UPDATE a poz
router.patch('/:id', updatePoz)

export default router