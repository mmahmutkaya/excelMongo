const Sozlesmele = require('../models/sozlesmelerModel')
const Proje = require('../models/projeModel')
const mongoose = require('mongoose')

const hataBase = "BACKEND - (sozlesmelerController) - "

// Create new contract
const createSozlesmele = async (req, res) => {
  const hata = hataBase + "createSozlesmele"

  try {
    const { email: userEmail } = JSON.parse(req.user)

    const {
      _projeId,
      _firmaId,
      sozlesmeNo,
      sozlesmeName,
      sozlesmeTipi,
      taraf,
      tarafEmail,
      tarafTelefon,
      tarafAdresi,
      baslangicTarihi,
      bitisTarihi,
      sozlesmeAmount,
      paraBirimi,
      odemeProgrami,
      durum,
      dosyaUrl,
      notlar,
      icNotlar
    } = req.body

    let errorObject = {}

    // Validation
    if (!_projeId) {
      errorObject.projeError = "Proje seçilmemiş"
    }
    if (!sozlesmeNo || sozlesmeNo.trim().length === 0) {
      errorObject.sozlesmeNoError = "Sözleşme numarası girilmemiş"
    }
    if (!sozlesmeName || sozlesmeName.trim().length === 0) {
      errorObject.sozlesmeNameError = "Sözleşme adı girilmemiş"
    }
    if (!taraf || taraf.trim().length === 0) {
      errorObject.tarafError = "Taraf adı girilmemiş"
    }

    // Return validation errors if any
    if (Object.keys(errorObject).length > 0) {
      res.status(200).json({ errorObject })
      return
    }

    // Check if contract number already exists for this project
    const existingSozlesmele = await Sozlesmele.findOne({
      _projeId: new mongoose.Types.ObjectId(_projeId),
      sozlesmeNo: sozlesmeNo
    })

    if (existingSozlesmele) {
      errorObject.sozlesmeNoError = "Bu sözleşme numarası bu proje için zaten kullanılmış"
      res.status(200).json({ errorObject })
      return
    }

    const simdikiZaman = new Date()

    const newSozlesmele = new Sozlesmele({
      _projeId: new mongoose.Types.ObjectId(_projeId),
      _firmaId: _firmaId ? new mongoose.Types.ObjectId(_firmaId) : null,
      sozlesmeNo,
      sozlesmeName,
      sozlesmeTipi: sozlesmeTipi || "Diğer",
      taraf,
      tarafEmail: tarafEmail || "",
      tarafTelefon: tarafTelefon || "",
      tarafAdresi: tarafAdresi || "",
      baslangicTarihi: baslangicTarihi ? new Date(baslangicTarihi) : simdikiZaman,
      bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : null,
      sozlesmeAmount: sozlesmeAmount || 0,
      paraBirimi: paraBirimi || "TRL",
      odemeProgrami: odemeProgrami || "",
      durum: durum || "Bekleme",
      dosyaUrl: dosyaUrl || "",
      notlar: notlar || "",
      icNotlar: icNotlar || "",
      createdBy: userEmail,
      createdAt: simdikiZaman,
      imzacilar: [],
      soslesmeVersiyonlar: []
    })

    const savedSozlesmele = await newSozlesmele.save()
    res.status(200).json(savedSozlesmele)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Get all contracts for a project
const getSozlesmeler_byProje = async (req, res) => {
  const hata = hataBase + "getSozlesmeler_byProje"

  try {
    const { projeId } = req.params

    if (!projeId) {
      return res.status(400).json({ error: `${hata} - Proje ID'si geçilmemiş` })
    }

    const sozlesmeler = await Sozlesmele.find({
      _projeId: new mongoose.Types.ObjectId(projeId)
    }).sort({ createdAt: -1 })

    res.status(200).json(sozlesmeler)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Get single contract
const getSozlesmele = async (req, res) => {
  const hata = hataBase + "getSozlesmele"

  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: `${hata} - Sözleşme ID'si geçilmemiş` })
    }

    const sozlesmele = await Sozlesmele.findById(new mongoose.Types.ObjectId(id))

    if (!sozlesmele) {
      return res.status(400).json({ error: `${hata} - Sözleşme bulunamadı` })
    }

    res.status(200).json(sozlesmele)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Update contract
const updateSozlesmele = async (req, res) => {
  const hata = hataBase + "updateSozlesmele"

  try {
    const { id } = req.params
    const { email: userEmail } = JSON.parse(req.user)
    const updateData = req.body

    if (!id) {
      return res.status(400).json({ error: `${hata} - Sözleşme ID'si geçilmemiş` })
    }

    // Add update metadata
    updateData.guncellemeTarihi = new Date()
    updateData.guncellenenKisi = userEmail

    const updatedSozlesmele = await Sozlesmele.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      updateData,
      { new: true }
    )

    if (!updatedSozlesmele) {
      return res.status(400).json({ error: `${hata} - Sözleşme bulunamadı` })
    }

    res.status(200).json(updatedSozlesmele)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Delete contract
const deleteSozlesmele = async (req, res) => {
  const hata = hataBase + "deleteSozlesmele"

  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: `${hata} - Sözleşme ID'si geçilmemiş` })
    }

    const deletedSozlesmele = await Sozlesmele.findByIdAndDelete(new mongoose.Types.ObjectId(id))

    if (!deletedSozlesmele) {
      return res.status(400).json({ error: `${hata} - Sözleşme bulunamadı` })
    }

    res.status(200).json({ message: "Sözleşme silindi" })
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Update contract status
const updateSozlesmeleStatus = async (req, res) => {
  const hata = hataBase + "updateSozlesmeleStatus"

  try {
    const { id } = req.params
    const { durum } = req.body
    const { email: userEmail } = JSON.parse(req.user)

    if (!id || !durum) {
      return res.status(400).json({ error: `${hata} - ID veya durum geçilmemiş` })
    }

    const updatedSozlesmele = await Sozlesmele.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      {
        durum,
        guncellemeTarihi: new Date(),
        guncellenenKisi: userEmail
      },
      { new: true }
    )

    res.status(200).json(updatedSozlesmele)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Add signatory to contract
const addImzaci = async (req, res) => {
  const hata = hataBase + "addImzaci"

  try {
    const { id } = req.params
    const { kiAdi, unvan, email, notlar } = req.body

    if (!id || !kiAdi) {
      return res.status(400).json({ error: `${hata} - Eksik veri` })
    }

    const sozlesmele = await Sozlesmele.findById(new mongoose.Types.ObjectId(id))

    if (!sozlesmele) {
      return res.status(400).json({ error: `${hata} - Sözleşme bulunamadı` })
    }

    const newImzaci = {
      kiAdi,
      unvan: unvan || "",
      imzaTarihi: new Date(),
      email: email || "",
      notlar: notlar || ""
    }

    sozlesmele.imzacilar.push(newImzaci)
    await sozlesmele.save()

    res.status(200).json(sozlesmele)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

// Remove signatory
const removeImzaci = async (req, res) => {
  const hata = hataBase + "removeImzaci"

  try {
    const { id, imzaciId } = req.params

    const sozlesmele = await Sozlesmele.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      {
        $pull: { imzacilar: { _id: new mongoose.Types.ObjectId(imzaciId) } }
      },
      { new: true }
    )

    if (!sozlesmele) {
      return res.status(400).json({ error: `${hata} - Sözleşme bulunamadı` })
    }

    res.status(200).json(sozlesmele)
  } catch (error) {
    res.status(400).json({ error: `${hata} - ${error.message}` })
  }
}

module.exports = {
  createSozlesmele,
  getSozlesmeler_byProje,
  getSozlesmele,
  updateSozlesmele,
  deleteSozlesmele,
  updateSozlesmeleStatus,
  addImzaci,
  removeImzaci
}
