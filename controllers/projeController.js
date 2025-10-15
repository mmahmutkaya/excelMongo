const Proje = require('../models/projeModel')
const Poz = require('../models/pozModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;



const getProjeler_byFirma = async (req, res) => {

  const hataBase = "BACKEND - (getProjeler_byFirma) - "

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
    res.status(400).json({ error: hataBase + error })
  }

}



const getProje = async (req, res) => {

  const hataBase = "BACKEND - (getProje) - "

  const projeId = req.params.id

  try {

    const proje = await Proje.findOne({ _id: projeId })

    res.status(200).json({ proje })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}




const createProje = async (req, res) => {

  const hataBase = "BACKEND - (createProje) - "

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
    //   { _id: new ObjectId(), platform: "web", sira: 1, referans: "pozNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz No", dataType: "metin" },
    //   { _id: new ObjectId(), platform: "web", sira: 2, referans: "pozName", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Poz İsmi", dataType: "metin" },
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
    //   { _id: new ObjectId(), sira: 1, referans: "mahalNo", goster: true, sabit: true, genislik: 7, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal Kod", dataType: "metin" },
    //   { _id: new ObjectId(), sira: 2, referans: "mahalName", goster: true, sabit: true, genislik: 20, paddingInfo: "0px 1rem 0px 0px", yatayHiza: "center", name: "Mahal İsmi", dataType: "metin" },
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
    return res.status(401).json({ error: hataBase + error })
  }

}






const createWbs = async (req, res) => {

  const hataBase = "BACKEND - (createWbs) - "

  const { projeId, upWbsId, newWbsName, newWbsCodeName } = req.body

  try {


    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!upWbsId) {
      throw new Error("'upWbsId' sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
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


    const proje = await Proje.findOne({ _id: projeId, isDeleted: false })
    if (!proje) {
      throw new Error("talep edilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    // 1/3.seçenek
    //ilk defa wbs kaydı yapılacaksa, yani henüz "proje.wbs" yoksa
    if (!proje.wbs || proje.wbs.length === 0) {

      const newWbsItem = {
        _id: new ObjectId(),
        code: "1",
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }

      try {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: [newWbsItem] } }
          ]
        );

        return res.status(200).json({ result, wbs: [newWbsItem] })

      } catch (error) {
        return res.status(400).json({ error: hataBase + "bölüm 1/3 - " + error })
      }

    }



    // 2/3.seçenek - yukarıda bitmemiş
    // ilk kayıt değil ama en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
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

      if (Object.keys(errorObject).length > 0) {
        return res.status(200).json({ errorObject })
      }


      const newWbsItem = {
        _id: new ObjectId(),
        code: newNumber.toString(),
        name: newWbsName,
        codeName: newWbsCodeName,
        includesPoz: false,
        openForPoz: false
      }


      try {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
          ]
        );

        let currentWbsArray = proje.wbs
        let newWbsArray = [...currentWbsArray, newWbsItem]

        return res.status(200).json({ result, wbs: newWbsArray })

      } catch (error) {
        return res.status(400).json({ error: hataBase + "bölüm 2/3 - " + error })
      }

    }




    // 3/3.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut wbs kaydına ekleme yapılacaksa

    let upWbs = proje.wbs.find(item => item._id == upWbsId)
    if (!upWbs) {
      throw new Error("'upWbsId' sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upWbs.code?.split(".").length === 8) {
      throw new Error("Daha fazla alt başlık oluşturamazsınız.")
    }

    if (upWbs.openForPoz == true) {
      throw new Error("Poz eklemeye açmış olduğunuz başlığa alt başlık ekleyemezsiniz.")
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

    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }


    let newWbsItem = {
      _id: new ObjectId(),
      code: text + newNumber,
      name: newWbsName,
      codeName: newWbsCodeName,
      includesPoz: false,
      openForPoz: false
    }

    try {

      const result = await Proje.updateOne(
        { _id: projeId },
        [
          { $set: { wbs: { $concatArrays: ["$wbs", [newWbsItem]] } } }
        ]
      );

      let currentWbsArray = proje.wbs
      let newWbsArray = [...currentWbsArray, newWbsItem]

      return res.status(200).json({ result, wbs: newWbsArray })

    } catch (error) {
      return res.status(400).json({ error: hataBase + "bölüm 3/3 - " + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}



const updateWbs = async (req, res) => {

  const hataBase = "BACKEND - (updateWbs) - "

  const { projeId, wbsId, newWbsName, newWbsCodeName } = req.body

  try {

    if (!projeId) {
      throw new Error("db ye 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("db ye 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

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


    const proje = await Proje.findOne({ _id: projeId, isDeleted: false })
    if (!proje) throw new Error("dorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    if (!proje.wbs.find(x => x._id == wbsId)) throw new Error("güncellenmek istenen wbsId sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    const newWbsArray = proje.wbs.map(item => {
      if (item._id === wbsId) {
        return { ...item, name: newWbsName, codeName: newWbsCodeName }
      } else {
        return item
      }
    })

    const result = await Proje.updateOne(
      { _id: projeId },
      [
        { $set: { wbs: newWbsArray } }
      ]
    );


    return res.status(200).json({ result, wbs: newWbsArray })


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}


const toggleWbsForPoz = async (req, res) => {

  const hataBase = "BACKEND - (toggleWbsForPoz) - "

  const { projeId, wbsId, switchValue } = req.body


  try {

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!(switchValue === true || switchValue === false)) {
      throw new Error("Sorguya 'switchValue' değeri gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: projeId, isDeleted: false })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!proje.wbs) throw new Error("projeye ait herhangi bir poz başlığı olmadığı görüldü, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let wbs = proje.wbs.find(item => item._id == wbsId)
    if (!wbs) {
      throw new Error("sorguya gönderilen 'wbsId' ile projeye ait WBS bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // wbsCode un alt seviyeleri mevcutsa direk poz eklenemesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let text = wbs.code + "."
    if (proje.wbs.find(item => item.code.indexOf(text) === 0)) {
      throw new Error("Alt başlığı bulunan başlıklar poz eklemeye açılamaz.")
    }


    const newWbsArray = proje.wbs.map(item => {
      if (item.code === wbs.code) {
        return { ...item, openForPoz: switchValue }
      } else {
        return item
      }
    })

    const result = await Proje.updateOne(
      { _id: projeId },
      [
        { $set: { wbs: newWbsArray } }
      ]
    );

    return res.status(200).json({ result, wbs: newWbsArray })

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }


}



const deleteWbs = async (req, res) => {

  const hataBase = "BACKEND - (deleteWbs) - "

  const { projeId, wbsId } = req.body


  try {

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: projeId, isDeleted: false })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = proje
    if (!currentWbsArray) throw new Error("Projeye ait WBS bulunamadı")

    let oneWbs = await currentWbsArray.find(item => item._id == wbsId)

    if (!oneWbs) throw new Error("Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda pozlar collection da poz var mı diye sorgulama yapmaya gerek kalmadı
    if (oneWbs.openForPoz) throw new Error("Poz eklemeye açık başlıklar silinemez.")

    // wbs in alt seviyeleri mevcutsa silinmesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let { code: oneWbsCode } = oneWbs
    if (currentWbsArray.find(item => item.code.indexOf(oneWbsCode + ".") === 0)) {
      throw new Error("Alt başlığı bulunan başlıklar silinemez.")
    }

    const poz = await Poz.findOne({ wbsId, isDeleted: false })

    // wbs altına poz eklenmişse silinmesin, pozlara ulaşamayız
    if (poz) throw new Error("Poz içeren başlıklar silinemez.")




    // 1/2. seçenek -- en üst seviyede silme yapılacaksa
    if (!oneWbsCode.includes(".")) {

      try {

        const willBeDeletedWbsCode = oneWbsCode
        // const leftPart = willBeDeletedWbsCode.substring(0, willBeDeletedWbsCode.lastIndexOf("."))

        // seçili wbs i listeden çıkarma
        const newWbsArray = currentWbsArray.filter(item => {
          if (item.code != willBeDeletedWbsCode) {
            return item
          }
        })


        // silinme işleminden sonra komşu wbs lerin code numarasını düzenleme, silinenden sonrakilerin code numarasında ilgili kısmı 1 azaltma
        // değişecek wbs code ların alt wbs leri de olabilir, alt wbs lerinde ilgili haneleri 1 azalmalı
        // unutma bu kısım en üst wbs ler için aşağıdan farklı

        // en üst (0) seviye olduğu için tek hane ve kendisi silinecek sayı zaten
        let willBeDeletedNumber = parseInt(willBeDeletedWbsCode)
        let longText
        let rightPart
        let theNumberText
        let theNumber

        const newWbsArray2 = newWbsArray.map(item => {

          longText = item.code

          if (longText.includes(".")) {
            theNumberText = longText.split(".")[0]
            theNumber = parseInt(theNumberText)
            // rightPart 11.23.45 --> 23.45
            rightPart = longText.substring(theNumberText.length + 1, longText.length)
            if (theNumber > willBeDeletedNumber) {
              return { ...item, code: (theNumber - 1) + "." + rightPart }
            } else {
              return item
            }
          }

          if (!longText.includes(".")) {
            // theNumberText = longText.split(".")[0]
            // theNumberText = longText
            // theNumber = parseInt(theNumberText)
            theNumber = parseInt(longText)

            if (theNumber > willBeDeletedNumber) {
              return { ...item, code: (theNumber - 1).toString() }
            } else {
              return item
            }
          }


        })

        // return newWbsArray2

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: newWbsArray2 } }
          ]
        );

        return res.status(200).json({ result, wbs: newWbsArray2 })

      } catch (err) {
        return res.status(401).json({ error: hataBase + error })
      }

    }





    // 2/2. seçenek -- en üst seviye değilse
    if (oneWbsCode.includes(".")) {

      try {

        const willBeDeletedWbsCode = oneWbsCode

        // seçili wbs i listeden çıkarma
        const newWbsArray = currentWbsArray.filter(item => {
          if (item.code != willBeDeletedWbsCode) {
            return item
          }
        })



        let level = willBeDeletedWbsCode.split(".").length - 1
        // silinecek wbs numarasının en son hanede olduğunu biliyoruz çünkü son haneden önceki hanesi silinecek olsa alt seviyesi olmuş olurdu, yukarıdaki kontrolden geçmezdi
        let willBeDeletedNumber = parseInt(willBeDeletedWbsCode.split(".")[level])

        // leftPart - değişecek hane son hane demiştik, sabit baş kısmını alıyoruz, aşağıda işlem yapacağız -- 11.23.45 --> 11.23
        const leftPart = willBeDeletedWbsCode.substring(0, willBeDeletedWbsCode.lastIndexOf("."))
        let longText
        let rightPartWithTheNumber
        let rightPart
        let theNumberText
        let theNumber
        //
        const newWbsArray2 = newWbsArray.map(item => {

          if (item.code.indexOf(leftPart) === 0) {
            longText = item.code
            rightPartWithTheNumber = longText.substring(leftPart.length + 1, longText.length)
            theNumberText = rightPartWithTheNumber.split(".")[0]
            theNumber = parseInt(theNumberText)
            rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

            if (theNumber > willBeDeletedNumber) {
              if (rightPart.length) {
                return { ...item, code: leftPart + "." + (theNumber - 1) + "." + rightPart }
              } else {
                return { ...item, code: leftPart + "." + (theNumber - 1) }
              }
            } else {
              return item
            }

          } else {
            return item
          }
        })

        // return newWbsArray2

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: newWbsArray2 } }
          ]
        );

        return res.status(200).json({ result, wbs: newWbsArray2 })

      } catch (error) {
        return res.status(401).json({ error: hataBase + error })
      }

    }

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }


}



const moveWbsUp = async (req, res) => {

  const hataBase = "BACKEND - (moveWbsUp) - "

  const { projeId, wbsId } = req.body

  try {

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId, isDeleted: false })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = proje
    if (!currentWbsArray) throw new Error("Projeye ait WBS bulunamadı")

    let oneWbs = await currentWbsArray.find(item => item._id == wbsId)

    if (!oneWbs) throw new Error("Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    level = _selectedWbs.code.split(".").length - 1
    sortNumber = Number(_selectedWbs.code.split(".")[level])
    longText = _selectedWbs.code

    // bu kontrol fromtend de ayrıca yapılmalı - kontrol
    if (sortNumber == 1) {
      throw new Error("Zaten en üstte")
    }

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let sortNumber2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code


        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)

        // aynı seviyede bir üstünde varsa onu alta alma işlemi, switch kontrolü yapılıyor, üstünde yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber - 1) {
          let deneme = { ...item, code: (theNumber2 + 1).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // aynı seviyede bir üstünde varsa onun alt başlıklarını alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber - 1) {
          let deneme2 = { ...item, code: (theNumber2 + 1) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }

        // taşınacak wbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (theNumber2 - 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak wbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: (theNumber2 - 1) + "." + rightPart2 }
          // console.log("deneme4", deneme4)
          return deneme4
        }

        return item

      })
    }


    // taşınacak başlık en üst seviyede değilse
    if (leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
        let sortNumber2
        let longText2
        let rightPartWithTheNumber2
        let rightPart2
        let theNumberText2
        let theNumber2

        longText2 = item.code

        if (longText2.indexOf(leftPart + ".") === 0) {

          level2 = longText2.split(".").length - 1
          rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
          theNumberText2 = rightPartWithTheNumber2.split(".")[0]
          theNumber2 = parseInt(theNumberText2)
          rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)
          // console.log("rightPartWithTheNumber2", rightPartWithTheNumber2)
          // console.log("theNumber2", theNumber2)
          // console.log("rightPart2", rightPart2)
          // console.log("---")

          // aynı seviyede bir üstünde varsa onu alta alma işlemi, switch kontrolü yapılıyor, üstünde yoksa işlem yok diye
          if (level2 == level && theNumber2 == sortNumber - 1) {
            let deneme = { ...item, code: leftPart + "." + (theNumber2 + 1) }
            // console.log("deneme", deneme)
            switch1 = true
            return deneme
          }

          // aynı seviyede bir üstünde varsa onun alt başlıklarını alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber - 1) {
            let deneme2 = { ...item, code: leftPart + "." + (theNumber2 + 1) + "." + rightPart2 }
            // console.log("deneme2", deneme2)
            return deneme2
          }

          // taşınacak wbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (theNumber2 - 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak wbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber) {
            let deneme4 = { ...item, code: leftPart + "." + (theNumber2 - 1) + "." + rightPart2 }
            // console.log("deneme4", deneme4)
            return deneme4
          }

        }

        return item

      })

    }

    try {

      if (switch1) {

        const result = await collection_projeler.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        // ya da bu döner
        return res.status(401).json({ result, wbs: _wbs2 })

      } else {

        // ya da bu döner
        return res.status(401).json({ wbs: currentWbsArray })
      }

    } catch (error) {
      return res.status(401).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }


}



module.exports = {
  getProjeler_byFirma,
  getProje,
  createProje,
  createWbs,
  updateWbs,
  toggleWbsForPoz,
  deleteWbs,
  moveWbsUp
}