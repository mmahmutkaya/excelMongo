const Poz = require('../models/pozModel')
const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')

const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;






const getPozlar = async (req, res) => {

  const hataBase = "BACKEND - (getPozlar) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { projeid } = req.headers

    if (!projeid) {
      throw new Error("DB ye gönderilen sorguda 'projeid' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const pozlar = await Poz.find({ _projeId: projeid })

    res.status(200).json({ pozlar })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}






const createPoz = async (req, res) => {

  const hataBase = "BACKEND - (createPoz) - "

  try {

    const dateNow = new Date()

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    let { newPoz } = req.body

    if (!newPoz) {
      throw new Error("DB ye gönderilen sorguda 'newPoz' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // veri düzeltme
    if (newPoz.pozMetrajTipId === "insaatDemiri") {
      newPoz.pozBirimId = "ton"
    }


    if (!newPoz._firmaId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newPoz._projeId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'projeId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    ////// form validation - backend
    // form alanına uyarı veren hatalar

    let errorObject = {}
    let isFormError = false

    let wbsIdError
    let pozNameError
    let pozNoError
    let pozBirimIdError
    let pozMetrajTipIdError


    if (!newPoz._wbsId && !wbsIdError) {
      errorObject.wbsIdError = "Zorunlu"
      wbsIdError = true
      isFormError = true
    }


    if (typeof newPoz.pozName !== "string" && !pozNameError) {
      errorObject.pozNameError = "Zorunlu"
      pozNameError = true
      isFormError = true
    }

    if (typeof newPoz.pozName === "string" && !pozNameError) {
      if (newPoz.pozName.length === 0) {
        errorObject.pozNameError = "Zorunlu"
        pozNameError = true
        isFormError = true
      }
    }

    if (typeof newPoz.pozName === "string" && !pozNameError) {
      let minimumHaneSayisi = 3
      if (newPoz.pozName.length > 0 && newPoz.pozName.length < minimumHaneSayisi) {
        errorObject.pozNameError = `${minimumHaneSayisi} haneden az olamaz`
        pozNameError = true
        isFormError = true
      }
    }


    const poz = await Poz.findOne({
      _projeId: newPoz._projeId,
      $or: [
        { pozName: newPoz.pozName },
        { pozNo: newPoz.pozNo }
      ]
    })


    if (poz?.pozName === newPoz.pozName && !pozNameError) {
      errorObject.pozNameError = `Bu poz ismi kullanılmış`
      pozNameError = true
      isFormError = true
    }

    if (!newPoz.pozNo && !pozNoError) {
      errorObject.pozNoError = `Zorunlu`
      pozNoError = true
      isFormError = true
    }

    if (poz?.pozNo === newPoz.pozNo && !pozNoError) {
      errorObject.pozNoError = `Bu poz numarası kullanılmış`
      pozNoError = true
      isFormError = true
    }


    if (!newPoz.pozBirimId && !pozBirimIdError) {
      errorObject.pozBirimIdError = `Zorunlu`
      pozBirimIdError = true
      isFormError = true
    }


    if (!newPoz.pozMetrajTipId) {
      errorObject.pozMetrajTipIdError = `Zorunlu`
      pozMetrajTipIdError = true
      isFormError = true
    }


    // form alanına uyarı veren hatalar olmuşsa burda durduralım
    if (isFormError) {
      return res.status(200).json({ errorObject })
    }

    newPoz = {
      ...newPoz,
      birimFiyatlar: [],
      createdAt: dateNow,
      createdBy: userEmail
    }

    const result = await Poz.create(newPoz)

    newPoz = {
      ...newPoz,
      _id: result.insertedId
    }

    res.status(200).json({ newPoz })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}







module.exports = {
  createPoz, getPozlar
}