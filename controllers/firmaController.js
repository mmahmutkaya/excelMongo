const Firma = require('../models/firmaModel')
const Proje = require('../models/projeModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;





const createFirma = async (req, res) => {

  const hataBase = "BACKEND - (createFirma) - "

  try {

    const simdikiZaman = new Date()

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    // const { email: userEmail } = req.headers
    const { firmaName } = req.body


    if (typeof firmaName != "string") {
      throw new Error("DB ye gönderilen sorguda 'firmaName' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    let errorObject = {}

    if (firmaName.length == 0 && !errorObject.firmaNameError) {
      errorObject.firmaNameError = "Firma adı girilmemiş"
    }

    if (firmaName.length < 3 && !errorObject.firmaNameError) {
      errorObject.firmaNameError = "Firma adı çok kısa"

    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) {
      res.status(200).json({ errorObject })
      return
    }


    const firmalar_byUser = await Firma.find({ name: firmaName, "yetkiliKisiler.email": userEmail })
    let isExist
    firmalar_byUser.map(firma => {
      firma.yetkiliKisiler.find(oneKisi => oneKisi.email == userEmail && oneKisi.yetkiler.find(x => x.name === "owner")) ? isExist = true : null
    })
    if (isExist && !errorObject.firmaNameError) {
      errorObject.firmaNameError = "Bu isimde firmanız mevcut"
    }

    // VALIDATE KONTROL
    if (Object.keys(errorObject).length > 0) {
      res.status(200).json({ errorObject })
      return
    }



    const pozMetrajTipleri = [
      { id: "standartMetrajSayfasi", name: "Standart Metraj Sayfası", birimId: "" },
      { id: "insaatDemiri", name: "İnşaat Demiri", birimId: "ton" },
    ]



    // const pozBasliklari = [
    //   { _id: new BSON.ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
    //   { _id: new BSON.ObjectId(), platform: "web", sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
    // ]


    // const metrajYapabilenler = [
    //   {
    //     "harf": "A",
    //     _userId
    //   }
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
    //   { _id: new BSON.ObjectId(), sira: 1, referans: "kod", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal Kod", dataType: "metin" },
    //   { _id: new BSON.ObjectId(), sira: 2, referans: "name", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal İsmi", dataType: "metin" },
    // ]


    const paraBirimleri = [
      { id: "TRY", name: "Türk Lirası", isActive: false, sembol: "₺" },
      { id: "USD", name: "Amerikan Doları", isActive: false, sembol: "$" },
      { id: "EUR", name: "Euro", isActive: false, sembol: "€" },
      { id: "UZS", name: "Özbekistan Sum", isActive: false }
    ]


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


    let newFirma = {
      name: firmaName,
      wbs: [],
      lbs: [],
      paraBirimleri,
      pozMetrajTipleri,
      pozBirimleri,
      yetkiliKisiler: [{
        email: userEmail,
        isim: userIsim,
        soyisim: userSoyisim,
        yetkiler: [{ name: "owner", createdAt: simdikiZaman, createdBy: userEmail }]
      }],
      createdBy: userEmail,
      createdAt: simdikiZaman
    }

    const resultNewFirma = await Firma.create(newFirma)

    // tüm firma verilerini göndermek yerine ihtiyaç duyulan veriler gönderiliyor
    newFirma = {
      _id: resultNewFirma._id,
      name: firmaName,
      yetkiliKisiler: [{ email: userEmail }]
    }

    res.status(200).json({ newFirma })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}


const getFirmalar = async (req, res) => {

  const hataBase = "BACKEND - (getFirmalar) - "

  try {

    const { email: userEmail } = req.headers

    if (!userEmail) {
      throw new Error("DB ye gönderilen sorguda 'email' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const firmalar = await Firma.find({ "yetkiliKisiler.email": userEmail }, { name: 1, yetkiliKisiler: 1 })

    res.status(200).json({ firmalar })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}



const getFirma = async (req, res) => {

  const hataBase = "BACKEND - (getFirma) - "

  try {

    const firmaId = req.params.id

    if (!firmaId) {
      throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const firma = await Firma.findOne({ _id: firmaId })

    if (firma) {
      return res.status(200).json({ firma })
    } else {
      throw new Error("Sorguya gönderilen 'firmaId' ile Firma bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}





const updateParaBirimleri = async (req, res) => {

  const hataBase = "BACKEND - (updateParaBirimleri) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { firmaId, oneBirim, showValue } = req.body

    let _firmaId
    try {
      _firmaId = new ObjectId(firmaId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'firmaId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    let paraBirimiId = oneBirim.id
    let paraBirimiName = oneBirim.name
    let sembol = oneBirim.sembol


    if (!(showValue === true || showValue === false)) {
      throw new Error(
        "Para birimini aktif ya da pasif etmek istediniz fakat db ye 'showValue' gelmedi, sayfayı yenileyiniz, sorun devam ederse lütfen Rapor 724 ile iletişime geçiniz."
      );
    }

    if (showValue) {

      await Firma.updateOne(
        { _id: _firmaId },
        { $set: { "paraBirimleri.$[oneBirim].isActive": true } },
        { arrayFilters: [{ "oneBirim.id": paraBirimiId }] }
      )

      // // DAHA ÖNCEDEN KAYITLI İSE
      // await Proje.updateMany(
      //   { _firmaId: _firmaId },
      //   { $set: { "paraBirimleri.$[oneBirim].isFirmaActive": true } },
      //   { arrayFilters: [{ "oneBirim.id": paraBirimiId }] }
      // )

      // İLK DEFA KAYDEDİLECEKSE
      await Proje.updateMany(
        { _firmaId, "paraBirimleri.id": { $nin: [paraBirimiId] } },
        { $addToSet: { paraBirimleri: { id: paraBirimiId, name: paraBirimiName, sembol, isActive: false, isShow: true } } }
      )


    } else {

      await Firma.updateOne(
        { _id: _firmaId },
        { $set: { "paraBirimleri.$[oneBirim].isActive": false } },
        { arrayFilters: [{ "oneBirim.id": paraBirimiId }] }
      )

      // HENÜZ KULLANMAMIŞ OLAN PROJELERDE PASİF HALE GETİRMEK
      await Proje.updateMany(
        { _firmaId },
        { $pull: { paraBirimleri: { id: paraBirimiId, isActive: false } } }
      )


      // await Proje.updateMany({ _firmaId }, [
      //   {
      //     $set: {
      //       paraBirimleri: {
      //         $filter: {
      //           input: "$paraBirimleri",
      //           as: "oneBirim",
      //           cond: {
      //             $or: [
      //               { $ne: ["$$oneBirim.id", paraBirimiId] },
      //               { $and: [{ $eq: ["$$oneBirim.id", paraBirimiId] }, { $eq: ["$$oneBirim.isActive", true] }] }
      //             ]
      //           }
      //         }
      //       }
      //     }
      //   }
      // ])

    }

    res.status(200).json({ ok: true })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}






module.exports = {
  getFirmalar,
  createFirma,
  getFirma,
  updateParaBirimleri
}