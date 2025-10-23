const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')
const Poz = require('../models/pozModel')
const Mahal = require('../models/mahalModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;




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
              update: { $set: { openMetraj: oneMahal.hasDugum } },
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
          let toplamPreparing = 0
          let toplamReady = 0
          onePoz2.hazirlananMetrajlar.map(oneArray => {
            toplamPreparing += oneArray.find(x => x.userEmail === oneYapabilen.userEmail)?.metrajPreparing ? oneArray.find(x => x.userEmail === oneYapabilen.userEmail)?.metrajPreparing : 0
            toplamReady += oneArray.find(x => x.userEmail === oneYapabilen.userEmail)?.metrajPreparing ? oneArray.find(x => x.userEmail === oneYapabilen.userEmail)?.metrajReady : 0
          })
          return ({
            userEmail: oneYapabilen.userEmail,
            metrajPreparing: toplamPreparing,
            metrajReady: toplamReady
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
      throw new Error("'_projeId' verisi db sorgusuna gelmedi");
    }

    if (!pozid) {
      throw new Error("'_pozId' verisi db sorgusuna gelmedi");
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




const getDugumler_byPoz = async (req, res) => {

  const hataBase = "BACKEND - (getDugumler_byPoz) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { projeid, pozid } = req.headers

    if (!projeid) {
      throw new Error("'_projeId' verisi db sorgusuna gelmedi");
    }

    let _projeId
    try {
      _projeId = new ObjectId(projeid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }



    if (!pozid) {
      throw new Error("'_pozId' verisi db sorgusuna gelmedi");
    }

    let _pozId
    try {
      _pozId = new ObjectId(pozid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'pozid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }



    let dugumler_byPoz


    // dugumler_byPoz
    try {

      dugumler_byPoz = await Dugum.aggregate([
        { $match: { _pozId, openMetraj: true } },
        {
          $project: {
            _pozId: 1,
            _mahalId: 1,
            openMetraj: 1,
            metrajPreparing: 1,
            metrajReady: 1,
            metrajOnaylanan: 1,
            hazirlananMetrajlar: {
              $map: {
                input: "$hazirlananMetrajlar",
                as: "oneHazirlanan",
                in: {
                  userEmail: "$$oneHazirlanan.userEmail",
                  metrajPreparing: "$$oneHazirlanan.metrajPreparing",
                  metrajReady: "$$oneHazirlanan.metrajReady",
                  metrajOnaylanan: "$$oneHazirlanan.metrajOnaylanan",
                  hasReadyUnSeen: {
                    "$reduce": {
                      "input": "$$oneHazirlanan.satirlar",
                      "initialValue": false,
                      "in": {
                        "$cond": {
                          "if": {
                            "$and": [
                              {
                                $eq: [
                                  "$$value",
                                  false
                                ]
                              },
                              {
                                $eq: [
                                  "$$this.isReadyUnSeen",
                                  true
                                ]
                              }
                            ]
                          },
                          "then": true,
                          "else": "$$value"
                        }
                      }
                    }
                  },
                  hasReady: {
                    "$reduce": {
                      "input": "$$oneHazirlanan.satirlar",
                      "initialValue": false,
                      "in": {
                        "$cond": {
                          "if": {
                            "$and": [
                              {
                                $eq: [
                                  "$$value",
                                  false
                                ]
                              },
                              {
                                $eq: [
                                  "$$this.isReady",
                                  true
                                ]
                              }
                            ]
                          },
                          "then": true,
                          "else": "$$value"
                        }
                      }
                    }
                  },
                  hasSelected: {
                    "$reduce": {
                      "input": "$$oneHazirlanan.satirlar",
                      "initialValue": false,
                      "in": {
                        "$cond": {
                          "if": {
                            "$and": [
                              {
                                $eq: [
                                  "$$value",
                                  false
                                ]
                              },
                              { $or: [{ $eq: ["$$this.isSelected", true] }, { $eq: ["$$this.hasSelectedCopy", true] }] }
                            ]
                          },
                          "then": true,
                          "else": "$$value"
                        }
                      }
                    }
                  },
                  hasUnSelected: {
                    "$reduce": {
                      "input": "$$oneHazirlanan.satirlar",
                      "initialValue": false,
                      "in": {
                        "$cond": {
                          "if": {
                            "$and": [
                              {
                                $eq: [
                                  "$$value",
                                  false
                                ]
                              },
                              {
                                $and: [
                                  {
                                    $eq: [
                                      "$$this.isReady",
                                      true
                                    ]
                                  },
                                  {
                                    $ne: [
                                      "$$this.isSelected",
                                      true
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          "then": true,
                          "else": "$$value"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ])


      if (!dugumler_byPoz.length > 0) {
        throw new Error("'dugumler_byPoz' boş ");
      }

    } catch (error) {
      throw new Error("'dugumler_byPoz' oluşturma sırasında hata oluştu" + error);
    }


    // lbsMetrajlar
    let proje
    try {

      proje = await Proje.findOne({ _id: _projeId }, { lbs: 1, yetkiliKisiler: 1 })
      if (!proje) {
        throw new Error("Sorguya gönderilen 'projeId' ile proje bulunamadı ");
      }

    } catch (error) {
      throw new Error("'proje' verisi elde etme sırasında hata oluştu" + error);
    }

    let metrajYapabilenler = proje.yetkiliKisiler.filter(x => x.yetkiler.find(x => x.name === "owner"))

    // return res.status(200).json({ proje })


    let mahaller
    try {

      mahaller = await Mahal.aggregate([
        { $match: { _projeId } },
        { $project: { mahalNo: 1, mahalName: 1, _lbsId: 1 } }
      ])

      if (!mahaller.length > 0) {
        throw new Error("'mahaller' verisi boş array olarak oluştu");
      }

    } catch (error) {
      throw new Error("'mahaller' verisi elde etme sırasında hata oluştu" + error);
    }


    let lbsMetrajlar
    try {

      lbsMetrajlar = proje?.lbs.map(oneLbs => {

        let mahaller_byLbs = mahaller.filter(x => x._lbsId.toString() === oneLbs._id.toString())
        let metrajPreparing = 0
        let metrajReady = 0
        let metrajOnaylanan = 0
        let hazirlananMetrajlar = metrajYapabilenler.map(oneYapabilen => {
          return { userEmail: oneYapabilen.userEmail, metrajPreparing: 0, metrajReady: 0, metrajOnaylanan: 0 }
        })

        mahaller_byLbs.map(oneMahal => {
          let dugum = dugumler_byPoz.find(x => x._mahalId.toString() === oneMahal._id.toString())
          metrajPreparing += dugum?.metrajPreparing ? dugum.metrajPreparing : 0
          metrajReady += dugum?.metrajReady ? dugum.metrajReady : 0
          metrajOnaylanan += dugum?.metrajOnaylanan ? dugum.metrajOnaylanan : 0

          hazirlananMetrajlar = hazirlananMetrajlar?.map(oneHazirlanan => {
            let hazirlananMetraj_user = dugum?.hazirlananMetrajlar?.find(x => x.userEmail === oneHazirlanan.userEmail)
            oneHazirlanan.metrajPreparing += hazirlananMetraj_user?.metrajPreparing ? hazirlananMetraj_user.metrajPreparing : 0
            oneHazirlanan.metrajReady += hazirlananMetraj_user?.metrajReady ? hazirlananMetraj_user.metrajReady : 0
            oneHazirlanan.metrajOnaylanan += hazirlananMetraj_user?.metrajOnaylanan ? hazirlananMetraj_user.metrajOnaylanan : 0
            return oneHazirlanan
          })

        })
        return { _id: oneLbs._id, metrajPreparing, metrajReady, metrajOnaylanan, hazirlananMetrajlar }
      })


    } catch (error) {
      throw new Error({ hatayeri: "lbsMetrajlar", error });
    }



    let anySelectable
    try {

      anySelectable
      dugumler_byPoz.map(oneDugum => {
        oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
          if (oneHazirlanan) {
            if (oneHazirlanan.hasUnSelected) {
              anySelectable = true
            }
          }
        })
      })

    } catch (error) {
      throw new Error({ hatayeri: "anySelectable", error });
    }


    let metrajOnaylanan = 0
    let hazirlananMetrajlar = metrajYapabilenler.map(oneYapabilen => {
      return { userEmail: oneYapabilen.userEmail, metrajPreparing: 0, metrajReady: 0, metrajOnaylanan: 0 }
    })

    try {
      // lbsMetrajlar, dugumler_byPoz dan daha az satur içerdiği için loop için seçildi
      lbsMetrajlar.map(oneLbs => {
        metrajOnaylanan += oneLbs.metrajOnaylanan
        hazirlananMetrajlar = hazirlananMetrajlar?.map(oneHazirlanan => {
          let hazirlananMetraj_user = oneLbs?.hazirlananMetrajlar?.find(x => x.userEmail === oneHazirlanan.userEmail)
          oneHazirlanan.metrajPreparing += hazirlananMetraj_user?.metrajPreparing ? hazirlananMetraj_user.metrajPreparing : 0
          oneHazirlanan.metrajReady += hazirlananMetraj_user?.metrajReady ? hazirlananMetraj_user.metrajReady : 0
          oneHazirlanan.metrajOnaylanan += hazirlananMetraj_user?.metrajOnaylanan ? hazirlananMetraj_user.metrajOnaylanan : 0
          return oneHazirlanan
        })
      })

    } catch (error) {
      throw new Error({ hatayeri: "metrajOnaylanan", error });
    }

    return res.status(200).json({ dugumler_byPoz, lbsMetrajlar, anySelectable, metrajOnaylanan, hazirlananMetrajlar })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}




const getHazirlananmetraj = async (req, res) => {

  const hataBase = "BACKEND - (getHazirlananmetraj) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumid } = req.headers

    if (!dugumid) {
      throw new Error("'dugumid' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const result = await Dugum.aggregate([
      { $match: { _id: _dugumId } },
      {
        $project: {
          hazirlananMetrajlar_filtered: {
            $filter: {
              input: "$hazirlananMetrajlar",
              as: "hazirlananMetraj",
              cond: { $eq: ["$$hazirlananMetraj.userEmail", userEmail] }
            }
          }
        }
      },
      { $limit: 1 }
    ])


    let { hazirlananMetrajlar_filtered } = result[0]
    let hazirlananMetraj = hazirlananMetrajlar_filtered[0]


    if (!hazirlananMetraj) {

      hazirlananMetraj = {
        userEmail,
        metrajPreparing: 0,
        metrajReady: 0,
        metrajOnaylanan: 0,
        satirlar: [
          { satirNo: userCode + "-" + 1, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
          { satirNo: userCode + "-" + 2, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
          { satirNo: userCode + "-" + 3, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
          { satirNo: userCode + "-" + 4, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
          { satirNo: userCode + "-" + 5, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true }
        ]
      }

      revizeMetrajlar = [
        { satirNo: userCode + "-" + 1, isPreparing: true, satirlar: [] },
        { satirNo: userCode + "-" + 2, isPreparing: true, satirlar: [] },
        { satirNo: userCode + "-" + 3, isPreparing: true, satirlar: [] },
        { satirNo: userCode + "-" + 4, isPreparing: true, satirlar: [] },
        { satirNo: userCode + "-" + 5, isPreparing: true, satirlar: [] }
      ]


      await Dugum.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              hazirlananMetrajlar: {
                $concatArrays: [
                  "$hazirlananMetrajlar",
                  [hazirlananMetraj]
                ]
              },
              revizeMetrajlar: {
                $concatArrays: [
                  "$revizeMetrajlar",
                  revizeMetrajlar
                ]
              }
            }
          }
        ]
      )

    }

    return res.status(200).json({ hazirlananMetraj })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}




const getHazirlananmetrajlar = async (req, res) => {

  const hataBase = "BACKEND - (getHazirlananmetrajlar) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumid } = req.headers

    if (!dugumid) {
      throw new Error("'dugumid' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    const result = await Dugum.aggregate([
      { $match: { _id: _dugumId } },
      { $project: { _pozId: 1, _mahalId: 1, hazirlananMetrajlar: 1, metrajPreparing: 1, metrajReady: 1, metrajOnaylanan: 1 } },
      { $limit: 1 }
    ])

    let dugum = result[0]
    // hazirlananMetraj = hazirlananMetrajlar_filtered[0]

    let { hazirlananMetrajlar } = dugum


    hazirlananMetrajlar = hazirlananMetrajlar.map(oneHazirlanan => {
      oneHazirlanan.satirlar = oneHazirlanan.satirlar.filter(x => x.isReady || x.isSelected || x.hasSelectedCopy)
      return oneHazirlanan
    })

    return res.status(200).json({ hazirlananMetrajlar })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}





const update_hazirlananMetraj_peparing = async (req, res) => {

  const hataBase = "BACKEND - (update_hazirlananMetraj_peparing) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, hazirlananMetraj_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!hazirlananMetraj_state) {
      throw new Error("'hazirlananMetraj_state' verisi db sorgusuna gelmedi");
    }


    const currentTime = new Date();


    // ready de bir hazırlanan metrajdır, tüm hazırlanan metraj yani
    // ready'nin metrajını ayrı yapıcaz, ready kısmında
    // new selected temizleme


    hazirlananMetraj_state.satirlar = hazirlananMetraj_state.satirlar.map(oneSatir => {
      delete oneSatir.newSelected
      return oneSatir
    })



    try {

      await Dugum.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              hazirlananMetrajlar: {
                $map: {
                  input: "$hazirlananMetrajlar",
                  as: "oneHazirlanan",
                  in: {
                    $cond: {
                      if: {
                        $ne: [
                          "$$oneHazirlanan.userEmail",
                          userEmail
                        ]
                      },
                      then: "$$oneHazirlanan",
                      else: {
                        $mergeObjects: [
                          "$$oneHazirlanan",
                          {
                            satirlar: {
                              $concatArrays: [
                                {
                                  $filter: {
                                    input: "$$oneHazirlanan.satirlar",
                                    as: "oneSatir",
                                    cond: {
                                      $ne: [
                                        "$$oneSatir.isPreparing",
                                        true
                                      ]
                                    }
                                  }
                                },
                                hazirlananMetraj_state?.satirlar?.filter(x => x.isPreparing)
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          }

        ]
      )


    } catch (error) {
      throw new Error(" lokasyon 'ready varken preparing eklenecekse' - " + error.message);
    }



    // metraj güncelleme
    try {
      await Dugum.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              "hazirlananMetrajlar": {
                $map: {
                  input: "$hazirlananMetrajlar",
                  as: "oneHazirlanan",
                  in: {
                    "$mergeObjects": [
                      "$$oneHazirlanan",
                      {
                        metrajPreparing: {
                          $sum: {
                            "$map": {
                              "input": "$$oneHazirlanan.satirlar",
                              "as": "oneSatir",
                              "in": {
                                "$cond": {
                                  "if": {
                                    $eq: [
                                      "$$oneSatir.isPreparing",
                                      true
                                    ]
                                  },
                                  "then": "$$oneSatir.metraj",
                                  "else": 0
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $set: {
              "metrajPreparing": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajPreparing"
                  }
                }
              }
            }
          }
        ]
      )

    } catch (error) {
      throw new Error("lokasyon 'metraj güncelleme' - " + error);
    }

    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}




const update_hazirlananMetraj_ready = async (req, res) => {

  const hataBase = "BACKEND - (update_hazirlananMetraj_ready) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, hazirlananMetraj_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!hazirlananMetraj_state) {
      throw new Error("'hazirlananMetraj_state' verisi db sorgusuna gelmedi");
    }

    const currentTime = new Date();

    try {

      let oneHazirlanan_ready_satirNolar = hazirlananMetraj_state.satirlar.filter(x => x.isReady && x.newSelected).map(oneSatir => {
        return oneSatir.satirNo
      })

      await Dugum.updateOne(
        { _id: _dugumId },
        {
          $set: {
            "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
            "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": true,
            "revizeMetrajlar.$[oneMetraj].isReady": true,
          },
          $unset: {
            "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isPreparing": "",
            "revizeMetrajlar.$[oneMetraj].isPreparing": "",
          }
        },
        {
          arrayFilters: [
            {
              "oneHazirlanan.userEmail": userEmail
            },
            {
              "oneSatir.satirNo": { $in: oneHazirlanan_ready_satirNolar },
              "oneSatir.isPreparing": true
            },
            {
              "oneMetraj.satirNo": { $in: oneHazirlanan_ready_satirNolar },
              "oneMetraj.isPreparing": true
            }
          ]
        }
      )

    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }




    // metraj güncelleme
    try {
      await Dugum.updateOne({ _id: _dugumId },
        [
          {
            $set: {
              "hazirlananMetrajlar": {
                $map: {
                  input: "$hazirlananMetrajlar",
                  as: "oneHazirlanan",
                  in: {
                    "$mergeObjects": [
                      "$$oneHazirlanan",
                      {
                        metrajPreparing: {
                          $sum: {
                            "$map": {
                              "input": "$$oneHazirlanan.satirlar",
                              "as": "oneSatir",
                              "in": {
                                "$cond": {
                                  "if": {
                                    $eq: [
                                      "$$oneSatir.isPreparing",
                                      true
                                    ]
                                  },
                                  "then": "$$oneSatir.metraj",
                                  "else": 0
                                }
                              }
                            }
                          }
                        }
                      },
                      {
                        metrajReady: {
                          $sum: {
                            "$map": {
                              "input": "$$oneHazirlanan.satirlar",
                              "as": "oneSatir",
                              "in": {
                                "$cond": {
                                  "if": {
                                    $or: [
                                      { $eq: ["$$oneSatir.isReady", true] },
                                      { $eq: ["$$oneSatir.isSelected", true] },
                                      { $eq: ["$$oneSatir.hasSelectedCopy", true] }
                                    ]
                                  },
                                  "then": "$$oneSatir.metraj",
                                  "else": 0
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $set: {
              "metrajPreparing": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajPreparing"
                  }
                }
              },
              "metrajReady": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajReady"
                  }
                }
              }
            }
          },

        ]
      )

    } catch (error) {
      throw new Error("tryCatch -2- " + error);
    }

    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



// const yeniFonksiyon = async (req, res) => {

//   const hataBase = "BACKEND - (yeniFonksiyon) - "

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






module.exports = {
  createDugum,
  getDugumler_pozlar,
  getDugumler_mahallerByPoz,
  getDugumler_byPoz,
  getHazirlananmetraj,
  getHazirlananmetrajlar,
  update_hazirlananMetraj_peparing,
  update_hazirlananMetraj_ready
}