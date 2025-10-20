const Mahal = require('../models/mahalModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;




const createMahal = async (req, res) => {

  const hataBase = "BACKEND - (createMahal) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    let { newMahal } = req.body

    const dateNow = new Date()

    // gelen veri kontrol
    if (!newMahal._firmaId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newMahal._projeId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'projeId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }



    ////// form validation - backend
    // form alanına uyarı veren hatalar

    let errorObject = {}
    let isFormError = false

    let lbsIdError
    let mahalNameError
    let mahalNoError



    if (!newMahal._lbsId && !lbsIdError) {
      errorObject.lbsIdError = "Zorunlu"
      lbsIdError = true
      isFormError = true
    }


    if (typeof newMahal.mahalName !== "string" && !mahalNameError) {
      errorObject.mahalNameError = "Zorunlu"
      mahalNameError = true
      isFormError = true
    }

    if (typeof newMahal.mahalName === "string" && !mahalNameError) {
      if (newMahal.mahalName.length === 0) {
        errorObject.mahalNameError = "Zorunlu"
        mahalNameError = true
        isFormError = true
      }
    }

    if (typeof newMahal.mahalName === "string" && !mahalNameError) {
      let minimumHaneSayisi = 3
      if (newMahal.mahalName.length > 0 && newMahal.mahalName.length < minimumHaneSayisi) {
        errorObject.mahalNameError = `${minimumHaneSayisi} haneden az olamaz`
        mahalNameError = true
        isFormError = true
      }
    }


    const mahal = await Mahal.findOne({
      _projeId: newMahal._projeId,
      $or: [
        { mahalName: newMahal.mahalName },
        { mahalNo: newMahal.mahalNo }
      ]
    })


    if (mahal?.mahalName === newMahal.mahalName && !mahalNameError) {
      errorObject.mahalNameError = `Bu mahal ismi kullanılmış`
      mahalNameError = true
      isFormError = true
    }


    if (!newMahal.mahalNo && !mahalNoError) {
      errorObject.mahalNoError = `Zorunlu`
      mahalNoError = true
      isFormError = true
    }


    if (mahal?.mahalNo === newMahal.mahalNo && !mahalNoError) {
      errorObject.mahalNoError = `Bu mahal numarası kullanılmış`
      mahalNoError = true
      isFormError = true
    }




    // form alanına uyarı veren hatalar olmuşsa burda durduralım
    if (isFormError) {
      return res.status(200).json({ errorObject })
    }

    newMahal = {
      ...newMahal,
      createdAt: dateNow,
      createdBy: userEmail
    }

    const result = await Mahal.create(newMahal)

    newMahal = {
      ...newMahal,
      _id: result._id
    }

    return res.status(200).json({ newMahal })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}






const getMahaller = async (req, res) => {

  const hataBase = "BACKEND - (getMahaller) - "

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

    const mahaller = await Mahal.find({ _projeId: projeid })

    return res.status(200).json({ mahaller })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}







// const createMahal = async (req, res) => {

//   const hataBase = "BACKEND - (createMahal) - "

//   const {
//     email: userEmail,
//     isim: userIsim,
//     soyisim: userSoyisim
//   } = JSON.parse(req.user)

//   let { newMahal } = req.body


//   try {



//   } catch (error) {
//     return res.status(400).json({ error: hataBase + error })
//   }

// }






module.exports = {
  createMahal,
  getMahaller
}