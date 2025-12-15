// const Firma = require('../models/firmaModel')
// const Proje = require('../models/projeModel')
const IsPaket = require('../models/isPaketModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;


const createIsPaket = async (req, res) => {

  const hataBase = "BACKEND - (createIsPaket) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    // const { email: userEmail } = req.headers
    const { projeId, isPaketName, aciklama } = req.body


    if (typeof isPaketName != "string") {
      throw new Error("DB ye gönderilen sorguda 'isPaketName' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    let _projeId
    try {
      _projeId = new ObjectId(projeId)
    } catch (error) {
      throw new Error("Sorguya gelen 'projeId' türü doğru değil, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
    }

    let errorObject = {}

    if (isPaketName.length == 0 && !errorObject.isPaketNameError) {
      errorObject.isPaketNameError = "Boş bırakılamaz"
    }

    if (isPaketName.length < 3 && !errorObject.isPaketNameError) {
      errorObject.isPaketNameError = "Çok kısa"

    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) {
      res.status(200).json({ errorObject })
      return
    }


    let isPaketlerVersiyon0 = await IsPaket.findOne({ _projeId, versiyon: 0 })
    let isPaketler = isPaketlerVersiyon0?.isPaketler

    if (isPaketler?.find(x => x.name === isPaketName) && !errorObject.isPaketNameError) {
      errorObject.isPaketNameError = "Bu isimde ispaketi mevcut"
    }

    // VALIDATE KONTROL
    if (Object.keys(errorObject).length > 0) {
      res.status(200).json({ errorObject })
      return
    }

    let newIsPaket = {
      _id: new ObjectId(),
      name: isPaketName,
      isActive: true,
      aciklama
    }

    let newIsPaketler


    if (isPaketler?.length > 0) {
      newIsPaketler = [...isPaketler, newIsPaket]
    } else {
      newIsPaketler = [newIsPaket]
    }


    try {

      await IsPaket.findOneAndUpdate(
        { _projeId, versiyon: 0 },
        { 'isPaketler': newIsPaketler },
        { upsert: true }
      )

    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }

    res.status(200).json({ newIsPaketler })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}


const getIsPaketlerByProjeByVersiyon = async (req, res) => {

  const hataBase = "BACKEND - (getIsPaketlerByProjeByVersiyon) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const {
      projeid,
      ispaketversiyontext
    } = req.headers


    let _projeId
    try {
      _projeId = new ObjectId(projeid)
    } catch (error) {
      throw new Error("Sorguya gelen 'projeId' türü doğru değil, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
    }

    let isPaketVersiyon
    try {
      isPaketVersiyon = Number(ispaketversiyontext)
    } catch (error) {
      throw new Error("Sorguya gelen 'ispaketversiyontext' türü doğru değil, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
    }

    const isPaketlerObject = await IsPaket.findOne({ _projeId, versiyon: isPaketVersiyon }, { isPaketler: 1 })
    let isPaketler
    if (isPaketlerObject) {
      isPaketler = isPaketlerObject.isPaketler
    } else {
      isPaketler = []
    }

    res.status(200).json({ isPaketler })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}





module.exports = {
  createIsPaket,
  getIsPaketlerByProjeByVersiyon
}