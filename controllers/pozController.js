const Poz = require('../models/pozModel')
const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')

const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;

// get all pozlar
const getPozlar = async (req, res) => {

  // const _projeId = ObjectId("688a206443a0c8eaeadd8140")

  const projeId = req.header('projeId')
  const _projeId = new ObjectId(projeId)


  const proje = await Proje.aggregate([
    {
      $match: {
        _id: _projeId,
      }
    }
  ])

  let metrajYapabilenler = proje[0]?.yetki?.metrajYapabilenler


  let pozlar = await Poz.aggregate([
    {
      $match: {
        _projeId,
        isDeleted: false
      }
    },
    {
      $project: {
        _projeId: 1,
        _wbsId: 1,
        pozNo: 1,
        pozName: 1,
        pozBirimId: 1,
        pozMetrajTipId: 1
      }
    }
  ])


  let pozlar2 = await Dugum.aggregate([
    {
      $match: {
        _projeId,
        openMetraj: true
      }
    },
    {
      $project: {
        _pozId: 1,
        _mahalId: 1,
        hazirlananMetrajlar: 1,
        onaylananMetraj: 1
      }
    },
    {
      $group: {
        _id: "$_pozId",
        hazirlananMetrajlar: { $push: "$hazirlananMetrajlar" },
        onaylananMetraj: { $sum: "$onaylananMetraj" }
      }
    }
  ])



  pozlar = pozlar?.map(onePoz => {

    const onePoz2 = pozlar2?.find(onePoz2 => onePoz2._id.toString() === onePoz._id.toString())

    if (!onePoz2) {

      onePoz.hasDugum = false

    } else {

      onePoz.hasDugum = true

      onePoz.onaylananMetraj = onePoz2.onaylananMetraj

      onePoz.hazirlananMetrajlar = metrajYapabilenler?.map(oneYapabilen => {
        let toplam = 0
        onePoz2.hazirlananMetrajlar.map(oneArray => {
          toplam = oneArray.find(x => x.userEmail === oneYapabilen.userEmail)?.metraj + toplam
        })
        return ({
          userEmail: oneYapabilen.userEmail,
          metraj: toplam
        })
      })

    }

    return onePoz

  })

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