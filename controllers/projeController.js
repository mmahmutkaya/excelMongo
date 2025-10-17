const Proje = require('../models/projeModel')
const Poz = require('../models/pozModel')
const Mahal = require('../models/mahalModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;



const getProjeler_byFirma = async (req, res) => {

  const hataBase = "BACKEND - (getProjeler_byFirma) - "

  try {

    const firmaId = req.params.id
    if (!firmaId) {
      throw new Error("Sorguya 'firmaId' gönderilmemiş.")
    }

    const projeler = await Proje.find({ _firmaId: firmaId }, { name: 1, _firmaId: 1, yetkiliKisiler: 1, yetkiliFirmalar: 1 })

    res.status(200).json({ projeler })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}



const getProje = async (req, res) => {

  const hataBase = "BACKEND - (getProje) - "

  try {

    const projeId = req.params.id
    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })

    if (proje) {
      res.status(200).json({ proje })
    } else {
      throw new Error("Sorguya gönderilen 'projeId' ile Proje bulunamadı")
    }

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
      throw new Error("Sorguya 'firmaId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
    }
    if (!projeName) {
      throw new Error("Sorguya 'projeName' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
    }

    const _firmaId = new ObjectId(firmaId)
    if (!mongoose.Types.ObjectId.isValid(_firmaId)) {
      throw new Error("Sorguya gelen firmaId türü doğru değil, sayfayı yenileyiniz, sorun devam ederse rapor7/24 ile iletişime geçebilirsiniz.")
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
      createdAt: currentTime
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
    return res.status(400).json({ error: hataBase + error })
  }

}







// WBS BAŞLANGIÇ

const createWbs = async (req, res) => {

  const hataBase = "BACKEND - (createWbs) - "

  try {

    const { projeId, upWbsId, newWbsName, newWbsCodeName } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!upWbsId) {
      throw new Error("'upWbsId' sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newWbsName) {
      throw new Error("Sorguya 'newWbsName' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newWbsCodeName) {
      throw new Error("'newWbsCodeName' sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
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


    const proje = await Proje.findOne({ _id: projeId })
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
      let snackMessage = "Daha fazla alt başlık oluşturamazsınız. (B)"
      return res.status(200).json({ snackMessage })
    }

    if (upWbs.openForPoz == true) {
      let snackMessage = "Poz eklemeye açılan başlıklara alt başlık eklenemez. (B)"
      return res.status(200).json({ snackMessage })
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


  try {

    const { projeId, wbsId, newWbsName, newWbsCodeName } = req.body

    if (!projeId) {
      throw new Error("db ye 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("db ye 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (!newWbsName) {
      throw new Error("db ye 'newWbsName' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (!newWbsCodeName) {
      throw new Error("db ye 'newWbsCodeName' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
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


    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("dorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    if (!proje.wbs.find(x => x._id == wbsId)) throw new Error("güncellenmek istenen wbsId sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    const newWbsArray = proje.wbs.map(item => {
      if (item._id.toString() === wbsId) {
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

  try {

    const { projeId, wbsId, switchValue } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!(switchValue === true || switchValue === false)) {
      throw new Error("Sorguya 'switchValue' değeri gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: projeId })
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
    return res.status(400).json({ error: hataBase + error })
  }


}



const deleteWbs = async (req, res) => {

  const hataBase = "BACKEND - (deleteWbs) - "

  try {

    const { projeId, wbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = proje
    if (!currentWbsArray) throw new Error("Projeye ait WBS bulunamadı")

    let oneWbs = await currentWbsArray.find(item => item._id == wbsId)

    if (!oneWbs) throw new Error("Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda pozlar collection da poz var mı diye sorgulama yapmaya gerek kalmadı
    if (oneWbs.openForPoz) {
      let snackMessage = "Poz eklemeye açık başlıklar silinemez. (B)"
      return res.status(200).json({ snackMessage })
    }

    // wbs in alt seviyeleri mevcutsa silinmesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let { code: oneWbsCode } = oneWbs
    if (currentWbsArray.find(item => item.code.indexOf(oneWbsCode + ".") === 0)) {
      let snackMessage = "Alt başlığı bulunan başlıklar silinemez. (B)"
      return res.status(200).json({ snackMessage })
    }

    const poz = await Poz.findOne({ wbsId })

    // wbs altına poz eklenmişse silinmesin, pozlara ulaşamayız
    if (poz) {
      let snackMessage = "Poz içeren başlıklar silinemez. (B)"
      return res.status(200).json({ snackMessage })
    }


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

      } catch (error) {
        return res.status(400).json({ error: hataBase + error })
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
        return res.status(400).json({ error: hataBase + error })
      }

    }

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}



const moveWbsUp = async (req, res) => {

  const hataBase = "BACKEND - (moveWbsUp) - "

  try {

    const { projeId, wbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
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
      let snackMessage = "Zaten en üstte (B)"
      return res.status(200).json({ snackMessage })
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

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        // ya da bu döner
        return res.status(200).json({ result, wbs: _wbs2 })

      } else {

        // ya da değişiklik olmadan bu döner
        return res.status(200).json({ wbs: currentWbsArray })
      }

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



const moveWbsDown = async (req, res) => {

  const hataBase = "BACKEND - (moveWbsDown) - "

  try {

    const { projeId, wbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
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

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _wbs2 = _wbs.map(item => {

        let leftPart2
        let level2
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


        // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber + 1) {
          let deneme = { ...item, code: (sortNumber).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber + 1) {
          let deneme2 = { ...item, code: (sortNumber) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }

        // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (sortNumber + 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: (sortNumber + 1) + "." + rightPart2 }
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

          // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
          if (level2 == level && theNumber2 == sortNumber + 1) {
            let deneme = { ...item, code: leftPart + "." + (sortNumber) }
            // console.log("deneme", deneme)
            switch1 = true
            return deneme
          }

          // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber + 1) {
            let deneme2 = { ...item, code: leftPart + "." + (sortNumber) + "." + rightPart2 }
            // console.log("deneme2", deneme2)
            return deneme2
          }

          // taşınacak wbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak wbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber) {
            let deneme4 = { ...item, code: leftPart + "." + (sortNumber + 1) + "." + rightPart2 }
            // console.log("deneme4", deneme4)
            return deneme4
          }

        }

        return item

      })

    }



    try {

      if (switch1) {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        return res.status(200).json({ result, wbs: _wbs2 })

      } else {

        // ya da değişiklik olmadan bu döner
        return res.status(200).json({ wbs: currentWbsArray })

      }

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}





const moveWbsLeft = async (req, res) => {

  const hataBase = "BACKEND - (moveWbsLeft) - "

  try {

    const { projeId, wbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = proje
    if (!currentWbsArray) throw new Error("Projeye ait WBS bulunamadı")

    let oneWbs = await currentWbsArray.find(item => item._id == wbsId)

    if (!oneWbs) throw new Error("Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2


    let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    let level = _selectedWbs.code.split(".").length - 1
    let sortNumber = Number(_selectedWbs.code.split(".")[level])
    let longText = _selectedWbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart

    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en sol seviyede ise daha fazla sola alınamaz
    if (!leftPart) {
      return res.status(200).json({ wbs: currentWbsArray })
    }


    let switch1 = false

    let snackMessage


    _wbs2 = _wbs.map(item => {

      let leftPart2
      let level2
      let longText2
      let rightPartWithTheNumber2
      let rightPart2
      let theNumberText2
      let theNumber2

      longText2 = item.code



      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst ise
      if (!leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (level2 == 0) {

          if (item.name === _selectedWbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedWbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }


      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst değil ise
      if (leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (longText2.indexOf(leftPartB + ".") === 0 && level2 == level - 1) {

          if (item.name === _selectedWbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedWbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }



      if (name_Match) {
        snackMessage = "Aynı seviyede mükerrer isim olamaz. (B)"
      }

      if (codeName_Match) {
        snackMessage = "Aynı seviyede mükerrer kod olamaz. (B)"
      }




      // taşınacak başlığın kendi seviyesindekiler ve onların alt başlıkları - bu kısmın aşağısında sadece kendi ve onun alt başlıklarını ayırıyoruz ve onlara işlem yapıyoruz
      if (longText2.indexOf(leftPart + ".") === 0) {

        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)

        // taşınacak başlığın kendisinin bir üst seviyeye alınması
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) : (sortNumberB + 1).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // taşınacak başlığın alt başlıklarının taşınması
        if (longText2.indexOf(longText + ".") === 0) {
          let rightPartWithTheNumber = longText2.substring(longText.length + 1, longText2.length)
          let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) + "." + rightPartWithTheNumber : (sortNumberB + 1).toString() + "." + rightPartWithTheNumber }
          switch1 = true
          return deneme
        }

      }


      // taşınacak başlığın kendi seviyesindeki başlıkların ve onların alt başlıklarının bir üste taşınması
      if (longText2.indexOf(leftPart + ".") === 0) {
        let rightPartWithTheNumber = longText2.substring(leftPart.length + 1, longText2.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber > sortNumber) {
          return { ...item, code: rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1) }
        } else {
          return item
        }
      }

      // taşınacak başlığın taşındığı seviyedeki başlıkların ve onların alt başlıklarının bir alta taşınması - (taşınacak seviye en üst seviye ise)
      if (!leftPartB) {

        let rightPartWithTheNumber = longText2
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber >= sortNumberB + 1) {
          return { ...item, code: rightPart ? (theNumber + 1) + "." + rightPart : (theNumber + 1).toString() }
        } else {
          return item
        }
      }


      // taşınacak başlığın taşındığı seviyedeki kendinden küçük kodların bir alt seviyelere taşınması - (taşınacak seviye en üst seviye değilse)
      if (leftPartB && longText2.indexOf(leftPartB + ".") === 0) {

        let rightPartWithTheNumber = longText2.substring(leftPartB.length + 1, longText2.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber >= sortNumberB + 1) {
          return { ...item, code: rightPart ? leftPartB + "." + (theNumber + 1) + "." + rightPart : leftPartB + "." + (theNumber + 1) }
        } else {
          return item
        }
      }

      return item

    })



    if (snackMessage) {
      return res.status(200).json({ snackMessage })
    }





    try {

      if (switch1) {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { wbs: _wbs2 } }
          ]
        );

        return res.status(200).json({ result, wbs: _wbs2 })

      } else {

        // ya da bu döner
        return res.status(200).json({ wbs: currentWbsArray })

      }

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}






const moveWbsRight = async (req, res) => {

  const hataBase = "BACKEND - (moveWbsRight) - "

  try {

    const { projeId, wbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!wbsId) {
      throw new Error("Sorguya 'wbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { wbs: currentWbsArray } = proje
    if (!currentWbsArray) throw new Error("Projeye ait WBS bulunamadı")

    let oneWbs = await currentWbsArray.find(item => item._id == wbsId)

    if (!oneWbs) throw new Error("Sorguya gönderilen wbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _wbs = currentWbsArray
    let _selectedWbs = oneWbs
    let _wbs2
    let snackMessage


    let leftPart = _selectedWbs.code.substring(0, _selectedWbs.code.lastIndexOf("."))
    let level = _selectedWbs.code.split(".").length - 1
    let sortNumber = Number(_selectedWbs.code.split(".")[level])
    let longText = _selectedWbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart


    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en üst seviyede ise daha fazla sağa alınamaz
    if (sortNumber == 1) {
      return res.status(200).json({ wbs: currentWbsArray })
    }


    // seçilen başlığın en alt seviyede alt başlığı varsa daha fazla sağa kaydırma yapılamaz - işlem iptal
    let maxLevel = level
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (longText2.indexOf(longText + ".") === 0 && level2 > maxLevel) {
        maxLevel = level2
      }
    })

    if (maxLevel == 7) {
      snackMessage = "Maksimum seviyede alt başlık oluşturulmuş"
      return res.status(200).json({ snackMessage })
    }


    // seçilen başlığın üst başlığını tespit etme
    let upWbs = {}
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === leftPart && sortNumber2 === sortNumber - 1) {
        upWbs = item
      }
    })

    // isim benzerliği kontrol - taşınacak seviyede
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === upWbs.code) {
        if (item.name === _selectedWbs.name) {
          name_Match = true
        }
        if (item.codeName === _selectedWbs.codeName) {
          codeName_Match = true
          codeName_Match_name = item.name
        }
      }
    })





    if (name_Match) {
      snackMessage = "Aynı seviyede mükerrer isim olamaz. (B)"
      return res.status(200).json({ snackMessage })
    }

    if (codeName_Match) {
      snackMessage = "Aynı seviyede mükerrer kod olamaz. (B)"
      return res.status(200).json({ snackMessage })
    }

    // üst başlık poza açıksa iptal
    if (upWbs.openForPoz) {
      let snackMessage = "Poza açık başlıkların alt başlığı olamaz. (B)"
      return res.status(200).json({ snackMessage })
    }


    // tespit edilen üst başlığın mevcut alt başlıkları varsa en sonuncusunu bulma
    let maxNumber = 0
    _wbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code

      if (longText2.indexOf((upWbs.code + ".")) === 0 && level2 === level + 1) {
        if (maxNumber < sortNumber2) {
          maxNumber = sortNumber2
        }
      }
    })


    // 1 artırıp newCode numaramızı bulma
    const newCode = upWbs.code + "." + (maxNumber + 1)


    // _wbs içinde kullanıcı tarafından seçilen başlığın kodunu değiştirerek yeni yerine taşıyoruz
    _wbs = _wbs.map(item => {
      if (item._id.toString() === _selectedWbs._id.toString()) {
        return { ...item, code: newCode }
      } else {
        return item
      }
    })


    // seçilen başlığın varsa alt başlıklarının da kodunu değiştirerek onları da beraberinde taşıyoruz
    _wbs = _wbs.map(item => {
      if (item.code.indexOf(_selectedWbs.code + ".") === 0) {
        let rightPartWithTheNumber = item.code.substring(_selectedWbs.code.length + 1, item.code.length)
        // console.log("rightPartWithTheNumber", rightPartWithTheNumber)
        return { ...item, code: newCode + "." + rightPartWithTheNumber }
      } else {
        return item
      }
    })


    // seçilen başlık taşındıığ için altındaki başlıkların numaralarını bir azaltıyoruz
    _wbs = _wbs.map(item => {


      // taşınmak istenen, seçilen başlık - en üst seviyede ise
      if (!leftPart) {
        let rightPartWithTheNumber = item.code
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

        if (theNumber > sortNumber) {
          let newCode = rightPart ? (theNumber - 1) + "." + rightPart : (theNumber - 1).toString()
          return { ...item, code: newCode }
        }
      }

      // taşınmak istenen, seçilen başlık - en üst seviyede değilse
      if (leftPart) {
        let rightPartWithTheNumber = item.code.substring(leftPart.length + 1, item.code.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

        if (leftPart && item.code.indexOf(leftPart + ".") === 0 && theNumber > sortNumber) {
          let newCode = rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1).toString()
          return { ...item, code: newCode }
        }
      }

      // yukarıdaki hiç bir if den dönmediyse burada değişiklik yapmadan item gönderiyoruz
      return item


    })

    try {

      const result = await Proje.updateOne(
        { _id: projeId },
        [
          { $set: { wbs: _wbs } }
        ]
      );

      return res.status(200).json({ result, wbs: _wbs })

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}

// WBS BİTİŞ





























// LBS BAŞLANGIÇ

const createLbs = async (req, res) => {

  const hataBase = "BACKEND - (createLbs) - "

  try {

    const { projeId, upLbsId, newLbsName, newLbsCodeName } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!upLbsId) {
      throw new Error("'upLbsId' sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newLbsName) {
      throw new Error("Sorguya 'newLbsName' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newLbsCodeName) {
      throw new Error("'newLbsCodeName' sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    // aşağıdaki form verilerinden birinde hata tespit edilmişse
    // alt satırda oluşturulan errorObject objesine form verisi ile ilişkilendirilmiş  property oluşturulup, içine yazı yazılıyor
    // property isimleri yukarıda ilk satırda frontend den gelen verileri yakalarken kullanılanlar ile aynı 
    // fonksiyon returnü olarak errorObject objesi döndürülüyor, frontenddeki form ekranında form verisine ait ilgili alanda bu yazı gösteriliyor
    // form ile ilişkilendirilmiş ilgili alana ait bir ke hata yazısı yazılmışsa yani null değilse üstüne yazı yazılmıyor, ilk tespit edilen hata değiştirilmmeiş oluyor

    const errorObject = {}

    // newLbsName
    if (typeof newLbsName !== "string") {
      throw new Error("db ye gelen lbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsName.length < 1) {
      errorObject.lbsNameError = "Boş bırakılamaz"
    }


    // newLbsCodeName
    if (typeof newLbsCodeName !== "string") {
      throw new Error("db ye gelen lbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsCodeName.length < 1) {
      errorObject.lbsCodeNameError = "Boş bırakılamaz"
    }

    if (newLbsCodeName.includes(" ")) {
      errorObject.lbsCodeNameError = "Boşluk içermemeli"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }


    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) {
      throw new Error("talep edilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    // 1/3.seçenek
    //ilk defa lbs kaydı yapılacaksa, yani henüz "proje.lbs" yoksa
    if (!proje.lbs || proje.lbs.length === 0) {

      const newLbsItem = {
        _id: new ObjectId(),
        code: "1",
        name: newLbsName,
        codeName: newLbsCodeName,
        includesMahal: false,
        openForMahal: false
      }

      try {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: [newLbsItem] } }
          ]
        );

        return res.status(200).json({ result, lbs: [newLbsItem] })

      } catch (error) {
        return res.status(400).json({ error: hataBase + "bölüm 1/3 - " + error })
      }

    }



    // 2/3.seçenek - yukarıda bitmemiş
    // ilk kayıt değil ama en üst düzeye kayıt yapılacaksa - aşağıdaki fonksiyonlar en üst seviyeye göre hazırlanmış 
    if (upLbsId === "0") {

      let newNumber = 1
      let number

      proje.lbs.filter(item => !item.code.includes(".")).map(item => {

        item.name === newLbsName ? errorObject.lbsNameError = "Aynı grup içinde kullanılmış" : null
        item.codeName === newLbsCodeName ? errorObject.lbsCodeNameError = "Aynı grup içinde kullanılmış" : null

        number = parseInt(item.code)

        if (number >= newNumber) {
          return newNumber = number + 1
        }

      })

      if (Object.keys(errorObject).length > 0) {
        return res.status(200).json({ errorObject })
      }


      const newLbsItem = {
        _id: new ObjectId(),
        code: newNumber.toString(),
        name: newLbsName,
        codeName: newLbsCodeName,
        includesMahal: false,
        openForMahal: false
      }


      try {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: { $concatArrays: ["$lbs", [newLbsItem]] } } }
          ]
        );

        let currentLbsArray = proje.lbs
        let newLbsArray = [...currentLbsArray, newLbsItem]

        return res.status(200).json({ result, lbs: newLbsArray })

      } catch (error) {
        return res.status(400).json({ error: hataBase + "bölüm 2/3 - " + error })
      }

    }




    // 3/3.seçenek - yukarıda bitmemiş
    // en üst düzey olmayıp mevcut lbs kaydına ekleme yapılacaksa

    let upLbs = proje.lbs.find(item => item._id == upLbsId)
    if (!upLbs) {
      throw new Error("'upLbsId' sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (upLbs.code?.split(".").length === 8) {
      let snackMessage = "Daha fazla alt başlık oluşturamazsınız. (B)"
      return res.status(200).json({ snackMessage })
    }

    if (upLbs.openForMahal == true) {
      let snackMessage = "Mahal eklemeye açılan başlıklara alt başlık eklenemez. (B)"
      return res.status(200).json({ snackMessage })
    }

    let upLbsCode = upLbs.code

    let text = upLbsCode + "."
    let level = text.split(".").length - 1
    let newNumber = 1
    let number

    proje.lbs.filter(item => item.code.indexOf(text) == 0 && item.code.split(".").length - 1 == level).map(item => {

      item.name === newLbsName ? errorObject.lbsNameError = "Aynı grup içinde kullanılmış" : null
      item.codeName === newLbsCodeName ? errorObject.lbsCodeNameError = "Aynı grup içinde kullanılmış" : null

      // yeni eklenecek lbs son hane numarasını belirlemek için aynı seviyedeki diğer lbs son numaraları kontrol ediliyor
      number = parseInt(item.code.split(text)[1])
      if (number >= newNumber) {
        return newNumber = number + 1
      }

    })

    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }


    let newLbsItem = {
      _id: new ObjectId(),
      code: text + newNumber,
      name: newLbsName,
      codeName: newLbsCodeName,
      includesMahal: false,
      openForMahal: false
    }

    try {

      const result = await Proje.updateOne(
        { _id: projeId },
        [
          { $set: { lbs: { $concatArrays: ["$lbs", [newLbsItem]] } } }
        ]
      );

      let currentLbsArray = proje.lbs
      let newLbsArray = [...currentLbsArray, newLbsItem]

      return res.status(200).json({ result, lbs: newLbsArray })

    } catch (error) {
      return res.status(400).json({ error: hataBase + "bölüm 3/3 - " + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}



const updateLbs = async (req, res) => {

  const hataBase = "BACKEND - (updateLbs) - "

  try {

    const { projeId, lbsId, newLbsName, newLbsCodeName } = req.body

    if (!projeId) {
      throw new Error("db ye 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("db ye 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (!newLbsName) {
      throw new Error("Sorguya 'newLbsName' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newLbsCodeName) {
      throw new Error("'newLbsCodeName' sorguya, gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const errorObject = {}

    // newLbsName
    if (typeof newLbsName !== "string") {
      throw new Error("db ye gelen lbsName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsName.length < 1) {
      errorObject.lbsNameError = "Boş bırakılamaz"
    }


    // newLbsCodeName
    if (typeof newLbsCodeName !== "string") {
      throw new Error("db ye gelen lbsCodeName türü 'string' türünde değil, sayfayı yenileyiniz, sorun devam ederse Rapor724 ile iritbata geçiniz.")
    }

    if (newLbsCodeName.length < 1) {
      errorObject.lbsCodeNameError = "Boş bırakılamaz"
    }

    if (newLbsCodeName.includes(" ")) {
      errorObject.lbsCodeNameError = "Boşluk içermemeli"
    }

    // ARA VALIDATE KONTROL - VALIDATE HATA VARSA BOŞUNA DEVAM EDİP AŞAĞIDAKİ SORGUYU YAPMASIN
    if (Object.keys(errorObject).length > 0) {
      return res.status(200).json({ errorObject })
    }


    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("dorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    if (!proje.lbs.find(x => x._id == lbsId)) throw new Error("güncellenmek istenen lbsId sistemde bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")




    const newLbsArray = proje.lbs.map(item => {
      if (item._id.toString() === lbsId) {
        return { ...item, name: newLbsName, codeName: newLbsCodeName }
      } else {
        return item
      }
    })

    const result = await Proje.updateOne(
      { _id: projeId },
      [
        { $set: { lbs: newLbsArray } }
      ]
    );


    return res.status(200).json({ result, lbs: newLbsArray })


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}


const toggleLbsForMahal = async (req, res) => {

  const hataBase = "BACKEND - (toggleLbsForMahal) - "

  const { projeId, lbsId, switchValue } = req.body


  try {

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("Sorguya 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!(switchValue === true || switchValue === false)) {
      throw new Error("Sorguya 'switchValue' değeri gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    if (!proje.lbs) throw new Error("projeye ait herhangi bir mahal başlığı olmadığı görüldü, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let lbs = proje.lbs.find(item => item._id == lbsId)
    if (!lbs) {
      throw new Error("sorguya gönderilen 'lbsId' ile projeye ait LBS bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // lbsCode un alt seviyeleri mevcutsa direk mahal eklenemesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let text = lbs.code + "."
    if (proje.lbs.find(item => item.code.indexOf(text) === 0)) {
      throw new Error("Alt başlığı bulunan başlıklar mahal eklemeye açılamaz.")
    }


    const newLbsArray = proje.lbs.map(item => {
      if (item.code === lbs.code) {
        return { ...item, openForMahal: switchValue }
      } else {
        return item
      }
    })

    const result = await Proje.updateOne(
      { _id: projeId },
      [
        { $set: { lbs: newLbsArray } }
      ]
    );

    return res.status(200).json({ result, lbs: newLbsArray })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}



const deleteLbs = async (req, res) => {

  const hataBase = "BACKEND - (deleteLbs) - "

  try {

    const { projeId, lbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("Sorguya 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("Projeye ait LBS bulunamadı")

    let oneLbs = await currentLbsArray.find(item => item._id == lbsId)

    if (!oneLbs) throw new Error("Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    // aşağıda mahaller collection da mahal var mı diye sorgulama yapmaya gerek kalmadı
    if (oneLbs.openForMahal) {
      let snackMessage = "Mahal eklemeye açık başlıklar silinemez. (B)"
      return res.status(200).json({ snackMessage })
    }

    // lbs in alt seviyeleri mevcutsa silinmesin
    // burada includes kullanamayız çünkü içinde değil başında arıyoruz
    let { code: oneLbsCode } = oneLbs
    if (currentLbsArray.find(item => item.code.indexOf(oneLbsCode + ".") === 0)) {
      let snackMessage = "Alt başlığı bulunan başlıklar silinemez. (B)"
      return res.status(200).json({ snackMessage })
    }

    const mahal = await Mahal.findOne({ lbsId })

    // lbs altına mahal eklenmişse silinmesin, mahallere ulaşamayız
    if (mahal) {
      let snackMessage = "Mahal içeren başlıklar silinemez. (B)"
      return res.status(200).json({ snackMessage })
    }


    // 1/2. seçenek -- en üst seviyede silme yapılacaksa
    if (!oneLbsCode.includes(".")) {

      try {

        const willBeDeletedLbsCode = oneLbsCode
        // const leftPart = willBeDeletedLbsCode.substring(0, willBeDeletedLbsCode.lastIndexOf("."))

        // seçili lbs i listeden çıkarma
        const newLbsArray = currentLbsArray.filter(item => {
          if (item.code != willBeDeletedLbsCode) {
            return item
          }
        })


        // silinme işleminden sonra komşu lbs lerin code numarasını düzenleme, silinenden sonrakilerin code numarasında ilgili kısmı 1 azaltma
        // değişecek lbs code ların alt lbs leri de olabilir, alt lbs lerinde ilgili haneleri 1 azalmalı
        // unutma bu kısım en üst lbs ler için aşağıdan farklı

        // en üst (0) seviye olduğu için tek hane ve kendisi silinecek sayı zaten
        let willBeDeletedNumber = parseInt(willBeDeletedLbsCode)
        let longText
        let rightPart
        let theNumberText
        let theNumber

        const newLbsArray2 = newLbsArray.map(item => {

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

        // return newLbsArray2

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: newLbsArray2 } }
          ]
        );

        return res.status(200).json({ result, lbs: newLbsArray2 })

      } catch (error) {
        return res.status(400).json({ error: hataBase + error })
      }

    }





    // 2/2. seçenek -- en üst seviye değilse
    if (oneLbsCode.includes(".")) {

      try {

        const willBeDeletedLbsCode = oneLbsCode

        // seçili lbs i listeden çıkarma
        const newLbsArray = currentLbsArray.filter(item => {
          if (item.code != willBeDeletedLbsCode) {
            return item
          }
        })



        let level = willBeDeletedLbsCode.split(".").length - 1
        // silinecek lbs numarasının en son hanede olduğunu biliyoruz çünkü son haneden önceki hanesi silinecek olsa alt seviyesi olmuş olurdu, yukarıdaki kontrolden geçmezdi
        let willBeDeletedNumber = parseInt(willBeDeletedLbsCode.split(".")[level])

        // leftPart - değişecek hane son hane demiştik, sabit baş kısmını alıyoruz, aşağıda işlem yapacağız -- 11.23.45 --> 11.23
        const leftPart = willBeDeletedLbsCode.substring(0, willBeDeletedLbsCode.lastIndexOf("."))
        let longText
        let rightPartWithTheNumber
        let rightPart
        let theNumberText
        let theNumber
        //
        const newLbsArray2 = newLbsArray.map(item => {

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

        // return newLbsArray2

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: newLbsArray2 } }
          ]
        );

        return res.status(200).json({ result, lbs: newLbsArray2 })

      } catch (error) {
        return res.status(400).json({ error: hataBase + error })
      }

    }

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}



const moveLbsUp = async (req, res) => {

  const hataBase = "BACKEND - (moveLbsUp) - "

  try {

    const { projeId, lbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("Sorguya 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("Projeye ait LBS bulunamadı")

    let oneLbs = await currentLbsArray.find(item => item._id == lbsId)

    if (!oneLbs) throw new Error("Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    level = _selectedLbs.code.split(".").length - 1
    sortNumber = Number(_selectedLbs.code.split(".")[level])
    longText = _selectedLbs.code

    // bu kontrol fromtend de ayrıca yapılmalı - kontrol
    if (sortNumber == 1) {
      let snackMessage = "Zaten en üstte (B)"
      return res.status(200).json({ snackMessage })
    }

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _lbs2 = _lbs.map(item => {

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

        // taşınacak lbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (theNumber2 - 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak lbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

      _lbs2 = _lbs.map(item => {

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

          // taşınacak lbs i bir üste alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (theNumber2 - 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak lbs in alt başlıklarını bir üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
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

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        // ya da bu döner
        return res.status(200).json({ result, lbs: _lbs2 })

      } else {

        // ya da değişiklik olmadan bu döner
        return res.status(200).json({ lbs: currentLbsArray })
      }

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



const moveLbsDown = async (req, res) => {

  const hataBase = "BACKEND - (moveLbsDown) - "

  const { projeId, lbsId } = req.body

  try {

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("Sorguya 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("Projeye ait LBS bulunamadı")

    let oneLbs = await currentLbsArray.find(item => item._id == lbsId)

    if (!oneLbs) throw new Error("Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart
    let level
    let sortNumber
    let longText

    leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    level = _selectedLbs.code.split(".").length - 1
    sortNumber = Number(_selectedLbs.code.split(".")[level])
    longText = _selectedLbs.code

    let switch1 = false


    // taşınacak başlık en üst seviyede ise
    if (!leftPart) {

      _lbs2 = _lbs.map(item => {

        let leftPart2
        let level2
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


        // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
        if (level2 == level && theNumber2 == sortNumber + 1) {
          let deneme = { ...item, code: (sortNumber).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber + 1) {
          let deneme2 = { ...item, code: (sortNumber) + "." + rightPart2 }
          // console.log("deneme2", deneme2)
          return deneme2
        }

        // taşınacak lbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme3 = { ...item, code: (sortNumber + 1).toString() }
          // console.log("deneme3", deneme3)
          return deneme3
        }

        // taşınacak lbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
        if (level2 > level && theNumber2 == sortNumber) {
          let deneme4 = { ...item, code: (sortNumber + 1) + "." + rightPart2 }
          // console.log("deneme4", deneme4)
          return deneme4
        }

        return item

      })
    }


    // taşınacak başlık en üst seviyede değilse
    if (leftPart) {

      _lbs2 = _lbs.map(item => {

        let leftPart2
        let level2
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

          // aynı seviyede bir altında varsa onu üste alma işlemi, switch kontrlün yapılıyor, altında yoksa işlem yok diye
          if (level2 == level && theNumber2 == sortNumber + 1) {
            let deneme = { ...item, code: leftPart + "." + (sortNumber) }
            // console.log("deneme", deneme)
            switch1 = true
            return deneme
          }

          // aynı seviyede bir altında varsa onun alt başlıklarını üste alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber + 1) {
            let deneme2 = { ...item, code: leftPart + "." + (sortNumber) + "." + rightPart2 }
            // console.log("deneme2", deneme2)
            return deneme2
          }

          // taşınacak lbs i bir alta alma işlemi, switch kontrlüne gerek yok, zaten bu var kendisi
          if (level2 == level && theNumber2 == sortNumber) {
            let deneme3 = { ...item, code: leftPart + "." + (sortNumber + 1) }
            // console.log("deneme3", deneme3)
            return deneme3
          }

          // taşınacak lbs in alt başlıklarını bir alta alma işlemi, switch kontrlüne gerek yok, zaten üst başlığında yapıldı
          if (level2 > level && theNumber2 == sortNumber) {
            let deneme4 = { ...item, code: leftPart + "." + (sortNumber + 1) + "." + rightPart2 }
            // console.log("deneme4", deneme4)
            return deneme4
          }

        }

        return item

      })

    }



    try {

      if (switch1) {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        return res.status(200).json({ result, lbs: _lbs2 })

      } else {

        // ya da değişiklik olmadan bu döner
        return res.status(200).json({ lbs: currentLbsArray })

      }

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}





const moveLbsLeft = async (req, res) => {

  const hataBase = "BACKEND - (moveLbsLeft) - "

  try {

    const { projeId, lbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("Sorguya 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("Projeye ait LBS bulunamadı")

    let oneLbs = await currentLbsArray.find(item => item._id == lbsId)

    if (!oneLbs) throw new Error("Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2


    let leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    let level = _selectedLbs.code.split(".").length - 1
    let sortNumber = Number(_selectedLbs.code.split(".")[level])
    let longText = _selectedLbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart

    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en sol seviyede ise daha fazla sola alınamaz
    if (!leftPart) {
      return res.status(200).json({ lbs: currentLbsArray })
    }


    let switch1 = false

    let snackMessage


    _lbs2 = _lbs.map(item => {

      let leftPart2
      let level2
      let longText2
      let rightPartWithTheNumber2
      let rightPart2
      let theNumberText2
      let theNumber2

      longText2 = item.code



      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst ise
      if (!leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (level2 == 0) {

          if (item.name === _selectedLbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedLbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }


      // taşınacağı seviyede isim benzerliği varsa - taşınacak seviye en üst değil ise
      if (leftPartB) {

        let level2 = longText2.split(".").length - 1

        if (longText2.indexOf(leftPartB + ".") === 0 && level2 == level - 1) {

          if (item.name === _selectedLbs.name) {
            name_Match = true
          }

          if (item.codeName === _selectedLbs.codeName) {
            codeName_Match = true
            codeName_Match_name = item.name
          }

        }

      }



      if (name_Match) {
        snackMessage = "Aynı seviyede mükerrer isim olamaz. (B)"
      }

      if (codeName_Match) {
        snackMessage = "Aynı seviyede mükerrer kod olamaz. (B)"
      }




      // taşınacak başlığın kendi seviyesindekiler ve onların alt başlıkları - bu kısmın aşağısında sadece kendi ve onun alt başlıklarını ayırıyoruz ve onlara işlem yapıyoruz
      if (longText2.indexOf(leftPart + ".") === 0) {

        level2 = longText2.split(".").length - 1
        rightPartWithTheNumber2 = longText2.substring(leftPart.length + 1, longText2.length)
        theNumberText2 = rightPartWithTheNumber2.split(".")[0]
        theNumber2 = parseInt(theNumberText2)
        rightPart2 = rightPartWithTheNumber2.substring(theNumberText2.length + 1, rightPartWithTheNumber2.length)

        // taşınacak başlığın kendisinin bir üst seviyeye alınması
        if (level2 == level && theNumber2 == sortNumber) {
          let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) : (sortNumberB + 1).toString() }
          // console.log("deneme", deneme)
          switch1 = true
          return deneme
        }

        // taşınacak başlığın alt başlıklarının taşınması
        if (longText2.indexOf(longText + ".") === 0) {
          let rightPartWithTheNumber = longText2.substring(longText.length + 1, longText2.length)
          let deneme = { ...item, code: leftPartB ? leftPartB + "." + (sortNumberB + 1) + "." + rightPartWithTheNumber : (sortNumberB + 1).toString() + "." + rightPartWithTheNumber }
          switch1 = true
          return deneme
        }

      }


      // taşınacak başlığın kendi seviyesindeki başlıkların ve onların alt başlıklarının bir üste taşınması
      if (longText2.indexOf(leftPart + ".") === 0) {
        let rightPartWithTheNumber = longText2.substring(leftPart.length + 1, longText2.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber > sortNumber) {
          return { ...item, code: rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1) }
        } else {
          return item
        }
      }

      // taşınacak başlığın taşındığı seviyedeki başlıkların ve onların alt başlıklarının bir alta taşınması - (taşınacak seviye en üst seviye ise)
      if (!leftPartB) {

        let rightPartWithTheNumber = longText2
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber >= sortNumberB + 1) {
          return { ...item, code: rightPart ? (theNumber + 1) + "." + rightPart : (theNumber + 1).toString() }
        } else {
          return item
        }
      }


      // taşınacak başlığın taşındığı seviyedeki kendinden küçük kodların bir alt seviyelere taşınması - (taşınacak seviye en üst seviye değilse)
      if (leftPartB && longText2.indexOf(leftPartB + ".") === 0) {

        let rightPartWithTheNumber = longText2.substring(leftPartB.length + 1, longText2.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)
        if (theNumber >= sortNumberB + 1) {
          return { ...item, code: rightPart ? leftPartB + "." + (theNumber + 1) + "." + rightPart : leftPartB + "." + (theNumber + 1) }
        } else {
          return item
        }
      }

      return item

    })



    if (snackMessage) {
      return res.status(200).json({ snackMessage })
    }





    try {

      if (switch1) {

        const result = await Proje.updateOne(
          { _id: projeId },
          [
            { $set: { lbs: _lbs2 } }
          ]
        );

        return res.status(200).json({ result, lbs: _lbs2 })

      } else {

        // ya da bu döner
        return res.status(200).json({ lbs: currentLbsArray })

      }

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }


}






const moveLbsRight = async (req, res) => {

  const hataBase = "BACKEND - (moveLbsRight) - "

  try {

    const { projeId, lbsId } = req.body

    if (!projeId) {
      throw new Error("Sorguya 'projeId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!lbsId) {
      throw new Error("Sorguya 'lbsId' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: projeId })
    if (!proje) throw new Error("sorguya gönderilen 'projeId' ile sistemde proje bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")

    let { lbs: currentLbsArray } = proje
    if (!currentLbsArray) throw new Error("Projeye ait LBS bulunamadı")

    let oneLbs = await currentLbsArray.find(item => item._id == lbsId)

    if (!oneLbs) throw new Error("Sorguya gönderilen lbsId sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")


    let _lbs = currentLbsArray
    let _selectedLbs = oneLbs
    let _lbs2
    let snackMessage


    let leftPart = _selectedLbs.code.substring(0, _selectedLbs.code.lastIndexOf("."))
    let level = _selectedLbs.code.split(".").length - 1
    let sortNumber = Number(_selectedLbs.code.split(".")[level])
    let longText = _selectedLbs.code

    let leftPartB = leftPart.substring(0, leftPart.lastIndexOf("."))
    let levelB = leftPart.split(".").length - 1
    let sortNumberB = Number(leftPart.split(".")[levelB])
    let longTextB = leftPart


    let name_Match = false
    let codeName_Match = false
    let codeName_Match_name

    // zaten en üst seviyede ise daha fazla sağa alınamaz
    if (sortNumber == 1) {
      return res.status(200).json({ lbs: currentLbsArray })
    }


    // seçilen başlığın en alt seviyede alt başlığı varsa daha fazla sağa kaydırma yapılamaz - işlem iptal
    let maxLevel = level
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (longText2.indexOf(longText + ".") === 0 && level2 > maxLevel) {
        maxLevel = level2
      }
    })

    if (maxLevel == 7) {
      snackMessage = "Maksimum seviyede alt başlık oluşturulmuş"
      return res.status(200).json({ snackMessage })
    }


    // seçilen başlığın üst başlığını tespit etme
    let upLbs = {}
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === leftPart && sortNumber2 === sortNumber - 1) {
        upLbs = item
      }
    })

    // isim benzerliği kontrol - taşınacak seviyede
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code
      if (leftPart2 === upLbs.code) {
        if (item.name === _selectedLbs.name) {
          name_Match = true
        }
        if (item.codeName === _selectedLbs.codeName) {
          codeName_Match = true
          codeName_Match_name = item.name
        }
      }
    })



    if (name_Match) {
      snackMessage = "Aynı seviyede mükerrer isim olamaz. (B)"
      return res.status(200).json({ snackMessage })
    }

    if (codeName_Match) {
      snackMessage = "Aynı seviyede mükerrer kod olamaz. (B)"
      return res.status(200).json({ snackMessage })
    }


    // üst başlık mahale açıksa iptal
    if (upLbs.openForMahal) {
      let snackMessage = "Mahale açık başlıkların alt başlığı olamaz. (B)"
      return res.status(200).json({ snackMessage })
    }


    // tespit edilen üst başlığın mevcut alt başlıkları varsa en sonuncusunu bulma
    let maxNumber = 0
    _lbs.map(item => {
      let leftPart2 = item.code.substring(0, item.code.lastIndexOf("."))
      let level2 = item.code.split(".").length - 1
      let sortNumber2 = Number(item.code.split(".")[level2])
      let longText2 = item.code

      if (longText2.indexOf((upLbs.code + ".")) === 0 && level2 === level + 1) {
        if (maxNumber < sortNumber2) {
          maxNumber = sortNumber2
        }
      }
    })


    // 1 artırıp newCode numaramızı bulma
    const newCode = upLbs.code + "." + (maxNumber + 1)


    // _lbs içinde kullanıcı tarafından seçilen başlığın kodunu değiştirerek yeni yerine taşıyoruz
    _lbs = _lbs.map(item => {
      if (item._id.toString() === _selectedLbs._id.toString()) {
        return { ...item, code: newCode }
      } else {
        return item
      }
    })


    // seçilen başlığın varsa alt başlıklarının da kodunu değiştirerek onları da beraberinde taşıyoruz
    _lbs = _lbs.map(item => {
      if (item.code.indexOf(_selectedLbs.code + ".") === 0) {
        let rightPartWithTheNumber = item.code.substring(_selectedLbs.code.length + 1, item.code.length)
        // console.log("rightPartWithTheNumber", rightPartWithTheNumber)
        return { ...item, code: newCode + "." + rightPartWithTheNumber }
      } else {
        return item
      }
    })


    // seçilen başlık taşındıığ için altındaki başlıkların numaralarını bir azaltıyoruz
    _lbs = _lbs.map(item => {


      // taşınmak istenen, seçilen başlık - en üst seviyede ise
      if (!leftPart) {
        let rightPartWithTheNumber = item.code
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

        if (theNumber > sortNumber) {
          let newCode = rightPart ? (theNumber - 1) + "." + rightPart : (theNumber - 1).toString()
          return { ...item, code: newCode }
        }
      }

      // taşınmak istenen, seçilen başlık - en üst seviyede değilse
      if (leftPart) {
        let rightPartWithTheNumber = item.code.substring(leftPart.length + 1, item.code.length)
        let theNumberText = rightPartWithTheNumber.split(".")[0]
        let theNumber = parseInt(theNumberText)
        // rightPart 11.23.45 --> 23.45
        let rightPart = rightPartWithTheNumber.substring(theNumberText.length + 1, rightPartWithTheNumber.length)

        if (leftPart && item.code.indexOf(leftPart + ".") === 0 && theNumber > sortNumber) {
          let newCode = rightPart ? leftPart + "." + (theNumber - 1) + "." + rightPart : leftPart + "." + (theNumber - 1).toString()
          return { ...item, code: newCode }
        }
      }

      // yukarıdaki hiç bir if den dönmediyse burada değişiklik yapmadan item gönderiyoruz
      return item


    })

    try {

      const result = await Proje.updateOne(
        { _id: projeId },
        [
          { $set: { lbs: _lbs } }
        ]
      );

      return res.status(200).json({ result, lbs: _lbs })

    } catch (error) {
      return res.status(400).json({ error: hataBase + error })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}

// LBS BİTİŞ




module.exports = {
  getProjeler_byFirma,
  getProje,
  createProje,
  createWbs,
  updateWbs,
  toggleWbsForPoz,
  deleteWbs,
  moveWbsUp,
  moveWbsDown,
  moveWbsLeft,
  moveWbsRight,
  createLbs,
  updateLbs,
  toggleLbsForMahal,
  deleteLbs,
  moveLbsUp,
  moveLbsDown,
  moveLbsLeft,
  moveLbsRight
}