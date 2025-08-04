const Poz = require('../models/pozModel')
const mongoose = require('mongoose')

// get all pozlar
const getPozlar = async (req, res) => {
  const pozlar = await Poz.find({}).sort({ createdAt: -1 })

  res.status(200).json(pozlar)
}

// get a single poz
const getPoz = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No such poz' })
  }

  const poz = await Poz.findById(id)

  if (!poz) {
    return res.status(404).json({ error: 'No such poz' })
  }

  res.status(200).json(poz)
}

// create a new poz
const createPoz = async (req, res) => {
  const { pozNo, pozName } = req.body

  // add to the database
  try {
    const poz = await Poz.create({ pozNo, pozName })
    res.status(200).json(poz)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// delete a poz
const deletePoz = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such poz' })
  }

  const poz = await Poz.findOneAndDelete({ _id: id })

  if (!poz) {
    return res.status(400).json({ error: 'No such poz' })
  }

  res.status(200).json(poz)
}

// update a poz
const updatePoz = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such poz' })
  }

  const poz = await Poz.findOneAndUpdate({ _id: id }, {
    ...req.body
  })

  if (!poz) {
    return res.status(400).json({ error: 'No such poz' })
  }

  res.status(200).json(poz)
}

module.exports = {
  getPozlar,
  getPoz,
  createPoz,
  deletePoz,
  updatePoz
}