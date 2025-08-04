const express = require('express')
const Poz = require('../models/pozModel')

const router = express.Router()

// GET all projeler
router.get('/', (req, res) => {
  res.json({mssg: 'GET all projeler'})
})

// GET a single proje
router.get('/:id', (req, res) => {
  res.json({mssg: 'GET a single proje'})
})

// POST a new proje
router.post('/', async (req, res) => {
  const {pozName, pozNo} = req.body
  
  try {
    const proje = await Poz.create({pozName, pozNo})
    res.status(200).json(proje)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
})

// DELETE a proje
router.delete('/:id', (req, res) => {
  res.json({mssg: 'DELETE a proje'})
})

// UPDATE a proje
router.patch('/:id', (req, res) => {
  res.json({mssg: 'UPDATE a proje'})
})

module.exports = router