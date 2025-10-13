const Proje = require('../models/projeModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;



const getProjeler_byFirma = async (req, res) => {

  const hataBase = "BACKEND - getProjeler_byFirma - "

  try {

    const { firmaId } = req.body
    if (!firmaId) {
      throw new Error("Sorguya 'firmaId' gönderilmemiş.")
    }

    const _firmaId = new ObjectId(firmaId)
    if (!mongoose.Types.ObjectId.isValid(_firmaId)) {
      throw new Error("Sorguya gelen 'firmaId' türü doğru değil.")
    }

    const projeler = await Proje.find({ _firmaId }, { name: 1, yetkiliKisiler: 1, yetkiliFirmalar: 1 })

    res.status(200).json({ projeler })

  } catch (error) {
    res.status(400).json({ error: hataBase + error.message })
  }

}



// const getFirma = async (req, res) => {

//   const hataBase = "BACKEND - getFirma - "

//   const _firmaId = new ObjectId(req.params.id)

//   try {

//     const firma = await Firma.findOne({ _id: _firmaId })

//     res.status(200).json({ firma })

//   } catch (error) {
//     res.status(400).json({ error: hataBase + error.message })
//   }

// }




const createProje = async (req, res) => {

  const hataBase = "BACKEND - createProje - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { firmaId, projeName } = req.body
    if (!firmaId) {
      throw new Error("Sorguya 'firmaId' gönderilmemiş.")
    }
    if (!projeName) {
      throw new Error("Sorguya 'projeName' gönderilmemiş.")
    }

    const _firmaId = new ObjectId(firmaId)
    if (!mongoose.Types.ObjectId.isValid(_firmaId)) {
      throw new Error("Sorguya gelen firmaId türü doğru değil.")
    }

    const currentTime = new Date()


    let errorObject = {}

    if (typeof projeName != "string" && !errorObject.projeNameError) {
      errorObject.projeNameError = "Proje adı verisi 'yazı' türünde değil"
    }

    if (projeName.length == 0 && !errorObject.projeNameError) {
      errorObject.projeNameError = "Proje adı girilmemiş"
    }

    if (projeName.length < 3 && !errorObject.projeNameError) {
      errorObject.projeNameError = "Proje adı çok kısa"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }


    const isExist = await Proje.findOne({ name: projeName, _firmaId })
    return res.status(200).json({ isExist })

    if (isExist && !errorObject.projeNameError) {
      errorObject.projeNameError = "Firmanın bu isimde projesi mevcut"
    }

    // VALIDATE KONTROL
    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }



    const pozMetrajTipleri = [
      { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
      { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
    ]



    // const pozBasliklari = [
    //   { _id: new BSON.ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
    //   { _id: new BSON.ObjectId(), platform: "web", sira: 2, referans: "pozName", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
    // ]



    const pozBirimleri = [
      { id: "mt", name: "mt" },
      { id: "m2", name: "m2" },
      { id: "m3", name: "m3" },
      { id: "kg", name: "kg" },
      { id: "ton", name: "ton" },
      { id: "ad", name: "ad" },
      { id: "set", name: "set" },
      { id: "sa", name: "sa" },
      { id: "gun", name: "gün" },
      { id: "hafta", name: "hafta" },
      { id: "ay", name: "ay" },
      { id: "yil", name: "yıl" },
    ]



    // const mahalBasliklari = [
    //   { _id: new BSON.ObjectId(), sira: 1, referans: "mahalNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal Kod", dataType: "metin" },
    //   { _id: new BSON.ObjectId(), sira: 2, referans: "mahalName", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal İsmi", dataType: "metin" },
    // ]


    // const mahalBirimleri = [
    //   { id: "mt", name: "mt" },
    //   { id: "m2", name: "m2" },
    //   { id: "m3", name: "m3" },
    //   { id: "ad", name: "ad" },
    //   { id: "set", name: "set" },
    //   { id: "tl", name: "TL" },
    //   { id: "usd", name: "USD" },
    //   { id: "eur", name: "EUR" },
    //   { id: "tarih", name: "TARİH" },
    // ]


    // const veriTurleri = [
    //   {
    //     "id": "sayi",
    //     "name": "SAYI"
    //   },
    //   {
    //     "id": "tarih",
    //     "name": "TARİH"
    //   },
    //   {
    //     "id": "metin",
    //     "name": "METİN"
    //   }
    // ]

    // const haneSayilari = [
    //   {
    //     "id": "0",
    //     "name": "0"
    //   },
    //   {
    //     "id": "0,0",
    //     "name": "0,0"
    //   },
    //   {
    //     "id": "0,00",
    //     "name": "0,00"
    //   },
    //   {
    //     "id": "0,000",
    //     "name": "0,000"
    //   },
    //   {
    //     "id": "0,0000",
    //     "name": "0,0000"
    //   }
    // ]

    const yetkiliKisiler = [{
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      yetkiler: [{ name: "owner", createdAt: currentTime, createdBy: userEmail }]
    }]


    let newProje = {
      _firmaId,
      name: projeName,
      wbs: [],
      lbs: [],
      paraBirimleri: [],
      isPaketBasliklari: [],
      isPaketleri: [],
      // pozBasliklari,
      // mahalBasliklari,
      pozMetrajTipleri,
      pozBirimleri,
      yetkiliKisiler,
      yetkiliFirmalar: [{ _firmaId, yetkiler: { name: "owner", createdAt: currentTime, createdBy: userEmail } }],
      createdBy: userEmail,
      createdAt: currentTime,
      isDeleted: false
    }

    const result_newProje = await Proje.create(newProje)

    // tüm proje verileri gönderilmiyor, gerekli veriler gönderiliyor
    newProje = {
      _id: result_newProje.insertedId,
      _firmaId,
      yetkiliKisiler,
      yetkiliFirmalar,
      name: projeName
    }

    return res.status(401).json({ newProje })

  } catch (error) {
    return res.status(401).json({ error: hataBase + error.message })
  }

}



module.exports = {
  getProjeler_byFirma, createProje
}