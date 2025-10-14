const Proje = require('../models/projeModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;



const getProjeler_byFirma = async (req, res) => {

  const hataBase = "BACKEND - getProjeler_byFirma - "


  try {

    const firmaId = req.params.id
    if (!firmaId) {
      throw new Error("Sorguya 'firmaId' gönderilmemiş.")
    }

    const _firmaId = new ObjectId(firmaId)
    if (!mongoose.Types.ObjectId.isValid(_firmaId)) {
      throw new Error("Sorguya gelen 'firmaId' türü doğru değil.")
    }

    const projeler = await Proje.find({ _firmaId }, { name: 1, _firmaId: 1, yetkiliKisiler: 1, yetkiliFirmalar: 1 })

    res.status(200).json({ projeler })

  } catch (error) {
    res.status(400).json({ error: hataBase + error.message })
  }

}



const getProje = async (req, res) => {

  const hataBase = "BACKEND - getProje - "

  const _projeId = new ObjectId(req.params.id)

  try {

    const proje = await Proje.findOne({ _id: _projeId })

    res.status(200).json({ proje })

  } catch (error) {
    res.status(400).json({ error: hataBase + error.message })
  }

}




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

    let yetkiliFirmalar = [{
      _firmaId, yetkiler: { name: "owner", createdAt: currentTime, createdBy: userEmail }
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
      yetkiliFirmalar,
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

    return res.status(200).json({ newProje })

  } catch (error) {
    return res.status(401).json({ error: hataBase + error.message })
  }

}








const createWbs = async (req, res) => {

  const hataBase = "BACKEND - createWbs - "

  const { projeId, upWbsId, newWbsName, newWbsCodeName } = req.body

  try {


    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş.")
    }


    const _projeId = new ObjectId(projeId)
    if (!mongoose.Types.ObjectId.isValid(_projeId)) {
      throw new Error("Sorguya gelen 'projeId' türü doğru değil.")
    }


    if (!(upWbsId === "0" || typeof upWbsId === "object")) {
      throw new Error("--upWbsId-- sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorObject objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorObject objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor

    const errorObject = {}

    // newWbsName
    if (typeof newWbsName !== "string") {
      throw new Error("db ye gelen wbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newWbsName.length < 1) {
      errorObject.wbsNameError = "Boş bırakılamaz"
    }


    // newWbsCodeName
    if (typeof newWbsCodeName !== "string") {
      throw new Error("db ye gelen wbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newWbsCodeName.length < 1) {
      errorObject.wbsCodeNameError = "Boş bırakılamaz"
    }

    if (newWbsCodeName.includes(" ")) {
      errorObject.wbsCodeNameError = "Boşluk içermemeli"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }

    // burada kaldık


    const collection_projeler = context.services.get("mongodb-atlas").db("rapor724_v2").collection("projeler")
    const proje = await collection_projeler.findOne({ _id: _projeId, isDeleted: false })
    if (!proje) throw new Error("MONGO // collection_projeler__wbs // " + functionName + " // _projeId ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    // 1/3.seçenek - yukarıda bitmemiş
    //ilk defa wbs kaydı yapılacaksa, yani henüz "proje.wbs" yoksa
    if (!proje.wbs || proje.wbs.length === 0) {

      const newWbsItem = {
        _id: BSON.ObjectId(),
        code: "1",
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }

      try {

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { wbs: [newWbsItem] } }
          ]
        );

        return { result, wbs: [newWbsItem] }

      } catch (err) {

        throw new Error("MONGO // collection_projeler__wbs // " + functionName + " // bölüm 1/3 " + err.message)
      }

    }



    // 2/3.seçenek - yukarıda bitmemiş
    // en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
    if (upWbsId === "0") {

      let newNumber = 1
      let number

      proje.wbs.filter(item => !item.code.includes(".")).map(item => {

        item.name === newWbsName ? errorObject.wbsNameError = "Aynı grup içinde kullanılmış" : null
        item.codeName === newWbsCodeName ? errorObject.wbsCodeNameError = "Aynı grup içinde kullanılmış" : null

        number = parseInt(item.code)

        if (number >= newNumber) {
          return newNumber = number + 1
        }

      })

      if (Object.keys(errorObject).length) return ({ errorObject })


      const newWbsItem = {
        _id: BSON.ObjectId(),
        code: newNumber.toString(),
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }


      try {

        const result = await collection_projeler.updateOne(
          { _id: _projeId },
          [
            { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
          ]
        );

        let currentWbsArray = proje.wbs
        let newWbsArray = [...currentWbsArray, newWbsItem]

        return { result, wbs: newWbsArray }

      } catch (err) {

        throw new Error("MONGO // collection_projeler__wbs // " + functionName + " // bölüm 2/3 " + err.message)
      }

    }




    // 3/3.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut wbs kaydına ekleme yapılacaksa

    let upWbs = proje.wbs.find(item => item._id.toString() == upWbsId.toString())
    if (!upWbs) {
      throw new Error("MONGO // collection_projeler__wbs // " + functionName + " // upWbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upWbs.code?.split(".").length === 8) {
      throw new Error("MONGO // collection_projeler__wbs // " + functionName + " // __mesajBaslangic__ Daha fazla alt başlık oluşturamazsınız. __mesajBitis__")
    }

    if (upWbs.openForPoz == true) {
      throw new Error("MONGO // collection_projeler__wbs // " + functionName + " // __mesajBaslangic__ Poz eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz. __mesajBitis__")
    }

    let upWbsCode = upWbs.code

    let text = upWbsCode + "."
    let level = text.split(".").length - 1
    let newNumber = 1
    let number

    proje.wbs.filter(item => item.code.indexOf(text) == 0 && item.code.split(".").length - 1 == level).map(item => {

      item.name === newWbsName ? errorObject.wbsNameError = "Aynı grup içinde kullanılmış" : null
      item.codeName === newWbsCodeName ? errorObject.wbsCodeNameError = "Aynı grup içinde kullanılmış" : null

      // yeni eklenecek wbs son hane numarasını belirlemek için aynı seviyedeki diğer wbs son numaraları kontrol ediliyor
      number = parseInt(item.code.split(text)[1])
      if (number >= newNumber) {
        return newNumber = number + 1
      }

    })

    if (Object.keys(errorObject).length) return ({ errorObject })


    let newWbsItem = {
      _id: BSON.ObjectId(),
      code: text + newNumber,
      name: newWbsName,
      codeName: newWbsCodeName,
      includesPoz: false,
      openForPoz: false
    }

    try {

      const result = await collection_projeler.updateOne(
        { _id: _projeId },
        [
          { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
        ]
      );

      let currentWbsArray = proje.wbs
      let newWbsArray = [...currentWbsArray, newWbsItem]

      return { result, wbs: newWbsArray }

    } catch (error) {
      return res.status(401).json({ error: hataBase + " - bölüm 3/3 - " + error.message })
    }


  } catch (error) {
    return res.status(401).json({ error: hataBase + error.message })
  }


}





module.exports = {
  getProjeler_byFirma, getProje, createProje, createWbs
}