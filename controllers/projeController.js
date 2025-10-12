const Proje = require('../models/firmaModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;



// const getProjeler_byFirma = async (req, res) => {

//   const hataBase = "BACKEND - getProjeler_byFirma - "

//   try {

//     const { firmaId } = req.headers
//     const _firmaId = new ObjectId(firmaId)

//     const firmalar = await Firma.find({ _firmaId }, { name: 1, yetkiliKisiler: 1 })

//     res.status(200).json({ firmalar })

//   } catch (error) {
//     res.status(400).json({ error: hataBase + error.message })
//   }

// }



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


    throw new Error("SOrguya gelen firmaId türü doğru değil.")

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { firmaId, projeName } = req.body
    const _firmaId = new ObjectId(firmaId)
    if (!mongoose.Types.ObjectId.isValid(_firmaId)) {
      throw new Error("SOrguya gelen firmaId türü doğru değil.")
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


    const isExist = await collection_Projeler.findOne({ name: projeName, _firmaId })
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


    let newProje = {
      _firmaId,
      name: projeName,
      // wbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
      // lbs: [], // henüz herhangi bir başlık yok fakat yok ama bu property şimdi olmazsa ilk wbs kaydında bir hata yaşıyoruz
      paraBirimleri: [],
      isPaketBasliklari: [],
      isPaketleri: [],
      // pozBasliklari,
      // mahalBasliklari,
      pozMetrajTipleri,
      pozBirimleri,
      yetkiliKisiler: [{
        email: userEmail,
        isim: userIsim,
        soyisim: userSoyisim,
        yetkiler: [{ name: "owner", createdAt: simdikiZaman, createdBy: userEmail }]
      }],
      yetkiliFirmalar: [{ _firmaId, yetkiler: { name: "owner" } }],
      createdBy: userEmail,
      createdAt: currentTime,
      isDeleted: false
    }

    const result_newProje = await collection_Projeler.insertOne(newProje)

    // tüm proje verileri gönderilmiyor, gerekli veriler gönderiliyor
    newProje = {
      _id: result_newProje.insertedId,
      _firmaId,
      name: projeName,
      yetkiliFirmalar: [{ _firmaId, yetki: "owner" }]
    }

    return newProje;

  } catch (error) {
    res.status(401).json({ error: hataBase + error.message })
    return
  }

}



module.exports = {
  createProje
}