const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')
const Poz = require('../models/pozModel')
const Mahal = require('../models/mahalModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;




// const createDugum = async (req, res) => {

//   const hataBase = "BACKEND - (createDugum) - "

//   try {

//     const {
//       email: userEmail,
//       isim: userIsim,
//       soyisim: userSoyisim
//     } = JSON.parse(req.user)

//     let { newMahal } = req.body



//   } catch (error) {
//     return res.status(400).json({ error: hataBase + error })
//   }

// }






const getDugumler_pozlar = async (req, res) => {

  const hataBase = "BACKEND - (getDugumler_pozlar) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { projeid } = req.headers

    // return res.status(200).json("buraya geldi")

    if (!projeid) {
      throw new Error("DB ye gönderilen sorguda 'projeid' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    let _projeId
    try {
      _projeId = new ObjectId(projeid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const proje = await Proje.findOne({ _id: _projeId })


    let pozlar = await Poz.aggregate([
      {
        $match: {
          _projeId
        }
      },
      {
        $project: {
          _projeId: 1,
          _wbsId: 1,
          pozNo: 1,
          pozName: 1,
          pozBirimId: 1,
          pozMetrajTipId: 1
        }
      }
    ])


    const pozlar2 = await Dugum.aggregate([
      {
        $match: {
          _projeId,
          openMetraj: true
        }
      },
      {
        $project: {
          _pozId: 1,
          _mahalId: 1,
          hazirlananMetrajlar: 1,
          onaylananMetraj: 1
        }
      },
      {
        $group: {
          _id: "$_pozId",
          hazirlananMetrajlar: { $push: "$hazirlananMetrajlar" },
          onaylananMetraj: { $sum: "$onaylananMetraj" }
        }
      }
    ])




    let metrajYapabilenler = proje.yetkiliKisiler.filter(x => x.yetkiler.find(x => x.name === "owner"))


    pozlar = pozlar.map(onePoz => {

      const onePoz2 = pozlar2.find(onePoz2 => onePoz2._id.toString() === onePoz._id.toString())

      if (!onePoz2) {

        onePoz.hasDugum = false

      } else {

        onePoz.hasDugum = true

        onePoz.onaylananMetraj = onePoz2.onaylananMetraj

        onePoz.hazirlananMetrajlar = metrajYapabilenler.map(oneYapabilen => {
          let toplam = 0
          onePoz2.hazirlananMetrajlar.map(oneArray => {
            toplam = oneArray.find(x => x.userEmail === oneYapabilen.userEmail)?.metraj + toplam
          })
          return ({
            userEmail: oneYapabilen.userEmail,
            metraj: toplam
          })
        })

      }

      return onePoz

    })

    return res.status(200).json({ pozlar })


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}







const getDugumler_mahallerByPoz = async (req, res) => {

  const hataBase = "BACKEND - (getDugumler_mahallerByPoz) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { projeid, pozid } = req.headers

    if (!projeid) {
      throw new Error("MONGO // getMahaller_byPoz // '_projeId' verisi db sorgusuna gelmedi");
    }

    if (!pozid) {
      throw new Error("MONGO // getMahaller_byPoz // '_pozId' verisi db sorgusuna gelmedi");
    }


    let _projeId
    try {
      _projeId = new ObjectId(projeid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    let _pozId
    try {
      _pozId = new ObjectId(pozid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'pozid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }




    const dugumler = await Dugum.aggregate([
      { $match: { _pozId, openMetraj: true } },
      { $project: { _id: 0, _mahalId: 1, onaylananMetraj: 1 } }
    ])


    let mahaller = await Mahal.aggregate([
      { $match: { _projeId } },
      { $project: { mahalNo: 1, mahalName: 1, _lbsId: 1 } }
    ])


    mahaller = mahaller.map(oneMahal => {
      const dugum = dugumler.find(oneDugum => oneDugum._mahalId.toString() === oneMahal._id.toString())
      if (!dugum) {
        oneMahal.hasDugum = false
      } else {
        oneMahal.hasDugum = true
        oneMahal.onaylananMetraj = dugum.onaylananMetraj
      }
      return oneMahal
    })

    return res.status(200).json({ mahaller })


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}





const createDugum = async (req, res) => {

  const hataBase = "BACKEND - (createDugum) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)


    const { projeId, pozId, mahaller } = req.body

    if (!projeId) {
      throw new Error("'_projeId' verisi db sorgusuna gelmedi");
    }

    let _projeId
    try {
      _projeId = new ObjectId(projeId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    if (!pozId) {
      throw new Error("'_pozId' verisi db sorgusuna gelmedi");
    }

    let _pozId
    try {
      _pozId = new ObjectId(pozId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'pozid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    if (!mahaller) {
      throw new Error("'mahaller' verisi db sorgusuna gelmedi");
    }

    if (!mahaller.length > 0) {
      throw new Error("'mahaller' verisi db sorgusuna 'boş array' olarak gelmiş");
    }



    const currentTime = new Date();


    try {

      const bulkArray1 = mahaller.map(oneMahal => {
        return (
          {
            updateOne: {
              filter: { _projeId, _mahalId: oneMahal._id, _pozId, },
              update: { $set: { openMetraj: oneMahal.hasDugum, isDeleted: oneMahal.hasDugum ? false : true } },
              upsert: true
            }
          }
        )
      })

      await Dugum.bulkWrite(
        bulkArray1,
        { ordered: false }
      )

    } catch (error) {
      throw new Error(" (try_catch_A) " + error);
    }





    try {

      const bulkArray2 = mahaller.map(oneMahal => {
        return (
          {
            updateOne: {
              filter: { _projeId, _mahalId: oneMahal._id, _pozId, hazirlananMetrajlar: { $exists: false } },
              update: { $set: { hazirlananMetrajlar: [], revizeMetrajlar: [], metrajVersiyonlari: [] } },
            }
          }
        )
      })


      await Dugum.bulkWrite(
        bulkArray2,
        { ordered: false }
      )

    } catch (error) {
      throw new Error(" (try_catch_B) " + error);
    }

    return res.status(200).json({ ok: true })


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}





// const createDugum = async (req, res) => {

//   const hataBase = "BACKEND - (createDugum) - "

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
  getDugumler_pozlar,
  getDugumler_mahallerByPoz,
  createDugum
}