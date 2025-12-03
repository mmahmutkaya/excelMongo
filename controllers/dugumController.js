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

    const proje = await Proje.findOne({ _id: _projeId })
    // let { isPaketVersiyonlar } = proje

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


    // mahaller = mahaller.filter(x => x.newSelected)

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

      //   // BUNA GEREK KALMADI ÇÜNKÜ MONGOOSE dugumModel de yazdığı için hazirlananMetraj vb. ekliyor ilk oluşturmada fakat isPaketVerisyonlar projeden geldiği için eklenmeli
      //   // const bulkArray2 = mahaller.map(oneMahal => {
      //   //   return (
      //   //     {
      //   //       updateOne: {
      //   //         filter: { _projeId, _mahalId: oneMahal._id, _pozId, hazirlananMetrajlar: { $exists: false } },
      //   //         update: { $set: { hazirlananMetrajlar: [], revizeMetrajlar: [], metrajVersiyonlar: [], isPaketVersiyonlar } },
      //   //       }
      //   //     }
      //   //   )
      //   // })


      // BURADA YENİ OLUŞAN DUGUMLERİN İÇERİKLERİ GÜNCELLENİYOR
      const bulkArray2 = mahaller.map(oneMahal => {
        return (
          {
            updateOne: {
              filter: { _projeId, _mahalId: oneMahal._id, _pozId, isPaketVersiyonlar: [] },
              update: {
                $set: {
                  isPaketVersiyonlar: [
                    {
                      versiyon: 0,
                      isPaketler: []
                    }
                  ],
                  metrajVersiyonlar: [
                    {
                      "versiyonNumber": 0
                    }
                  ]
                }
              },
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
            isPaketVersiyonlar: 1,
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
                  },
                  hasVersiyonZero: {
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
                                  "$$this.versiyon",
                                  0
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
            },
            revizeMetrajlar: {
              $map: {
                input: "$revizeMetrajlar",
                as: "oneMetraj",
                in: {
                  hasVersiyonZero: {
                    "$reduce": {
                      "input": "$$oneMetraj.satirlar",
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
                                  "$$this.versiyon",
                                  0
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
                }
              }
            }
          }
        }
      ])


      if (!dugumler_byPoz.length > 0) {
        return res.status(200).json({})
      }

      // return res.status(200).json({dugumler_byPoz})

      dugumler_byPoz = dugumler_byPoz.map(oneDugum => {
        oneDugum.hasVersiyonZero = false
        oneDugum?.hazirlananMetrajlar?.map(oneHazirlanan => {
          if (oneHazirlanan) {
            if (oneHazirlanan.hasVersiyonZero) {
              oneDugum.hasVersiyonZero = true
            }
          }
        })
        oneDugum.revizeMetrajlar.map(oneMetraj => {
          if (oneMetraj.hasVersiyonZero) {
            oneDugum.hasVersiyonZero = true
          }
        })

        return oneDugum
      })

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




const getOnaylananMetraj = async (req, res) => {

  const hataBase = "BACKEND - (getOnaylananMetraj) - "

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
          metrajOnaylanan: 1,
          hazirlananMetrajlar: 1,
          revizeMetrajlar: 1
        }
      },
      { $limit: 1 }
    ])


    let { metrajOnaylanan, hazirlananMetrajlar, revizeMetrajlar } = result[0]


    let satirlar = []

    hazirlananMetrajlar?.map(oneHazirlanan => {
      let userEmail = oneHazirlanan.userEmail
      let onayliSatirlar = oneHazirlanan.satirlar.filter(x => x.isSelected).map(oneSatir => {
        oneSatir.userEmail = userEmail
        return oneSatir
      })
      if (onayliSatirlar.length > 0) {
        satirlar = [...satirlar, ...onayliSatirlar]
      }
    })

    revizeMetrajlar?.map(oneMetraj => {
      if (satirlar.filter(x => x.hasSelectedCopy).find(x => x.satirNo === oneMetraj.satirNo)) {
        if (oneMetraj.satirlar.length > 0) {
          satirlar = [...satirlar, ...oneMetraj.satirlar]
        }
      }
    })


    let onaylananMetraj = {
      metrajOnaylanan,
      satirlar
    }

    return res.status(200).json({ onaylananMetraj })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}





const getHazirlananMetraj = async (req, res) => {

  const hataBase = "BACKEND - (getHazirlananMetraj) - "

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




const getHazirlananMetrajlar = async (req, res) => {

  const hataBase = "BACKEND - (getHazirlananMetrajlar) - "

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




const addMetrajSatiri = async (req, res) => {

  const hataBase = "BACKEND - (addMetrajSatiri) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
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

    let siraNo = 1
    hazirlananMetraj.satirlar.map(oneSatir => {
      let satirNo = oneSatir.satirNo
      let siraNo2 = satirNo.substring(satirNo.indexOf("-") + 1, satirNo.length)
      if (Number(siraNo2) >= siraNo) {
        siraNo = Number(siraNo2) + 1
      }
    })



    let satirlar = [
      { satirNo: userCode + "-" + siraNo, aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
      { satirNo: userCode + "-" + (siraNo + 1), aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true },
      { satirNo: userCode + "-" + (siraNo + 2), aciklama: "", carpan1: "", carpan2: "", carpan3: "", carpan4: "", carpan5: "", metraj: "", isPreparing: true }
    ]

    let revizeMetrajlar = [
      { satirNo: userCode + "-" + siraNo, isPreparing: true, satirlar: [] },
      { satirNo: userCode + "-" + (siraNo + 1), isPreparing: true, satirlar: [] },
      { satirNo: userCode + "-" + (siraNo + 2), isPreparing: true, satirlar: [] }
    ]


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
                    if: { $eq: ["$$oneHazirlanan.userEmail", userEmail] },
                    else: "$$oneHazirlanan",
                    then: {
                      $mergeObjects: [
                        "$$oneHazirlanan",
                        {
                          satirlar: {
                            $concatArrays: [
                              "$$oneHazirlanan.satirlar",
                              satirlar
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
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

    return res.status(200).json({ ok: true })

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




const update_onaylananMetraj_revize = async (req, res) => {

  const hataBase = "BACKEND - (update_onaylananMetraj_revize) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, onaylananMetraj_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!onaylananMetraj_state) {
      throw new Error("'onaylananMetraj_state' verisi db sorgusuna gelmedi");
    }


    try {

      let bulkArray = []
      let oneBulk

      onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && x.newSelected).map(oneSatir => {

        if (oneSatir) {

          let originalSatirNo = oneSatir.satirNo
          let satirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo)
          let userEmail = oneSatir.userEmail

          oneBulk = {
            updateOne: {
              filter: { _id: _dugumId },
              update: {
                $set: {
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": true,
                  "revizeMetrajlar.$[oneMetraj].satirlar": satirlar,
                }
              },
              arrayFilters: [
                {
                  "oneHazirlanan.userEmail": userEmail
                },
                {
                  "oneSatir.satirNo": originalSatirNo,
                  "oneSatir.isSelected": true
                },
                {
                  "oneMetraj.satirNo": originalSatirNo,
                  "oneMetraj.isSelected": true
                }
              ]
            }
          }
          bulkArray = [...bulkArray, oneBulk]

        }
      })


      if (bulkArray.length > 0) {
        await Dugum.bulkWrite(
          bulkArray,
          { ordered: false }
        )
      }


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
                        metrajOnaylanan: {
                          $sum: {
                            $concatArrays: [
                              {
                                "$map": {
                                  "input": "$$oneHazirlanan.satirlar",
                                  "as": "oneSatir",
                                  "in": {
                                    "$cond": {
                                      "if": { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $ne: ["$$oneSatir.hasSelectedCopy", true] }] },
                                      "then": "$$oneSatir.metraj",
                                      "else": 0
                                    }
                                  }
                                }
                              },
                              {
                                "$concatArrays": [
                                  {
                                    "$map": {
                                      "input": "$revizeMetrajlar",
                                      "as": "oneMetraj",
                                      "in": {
                                        "$cond": {
                                          "if": {
                                            $eq: [
                                              "$$oneMetraj.isSelected",
                                              true
                                            ]
                                          },
                                          "then": {
                                            "$reduce": {
                                              "input": "$$oneMetraj.satirlar",
                                              "initialValue": 0,
                                              "in": {
                                                $add: [
                                                  "$$value",
                                                  {
                                                    "$cond": {
                                                      "if": {
                                                        $and: [
                                                          { $ne: ["$$this.metraj", ""] },
                                                          { $eq: ["$$this.userEmail", "$$oneHazirlanan.userEmail"] },
                                                          { $ne: ["$$this.isPasif", true] }
                                                        ]
                                                      },
                                                      "then": {
                                                        "$toDouble": "$$this.metraj"
                                                      },
                                                      "else": 0
                                                    }
                                                  }
                                                ]
                                              }
                                            }
                                          },
                                          "else": 0
                                        }
                                      }
                                    }
                                  }
                                ]
                              }
                            ]
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
              "metrajOnaylanan": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajOnaylanan"
                  }
                }
              }
            }
          },
          {
            $set: {
              "metrajVersiyonlar": {
                $map: {
                  input: "$metrajVersiyonlar",
                  as: "oneVersiyon",
                  in: {
                    $cond: {
                      if: { $eq: ["$$oneVersiyon.versiyonNumber", 0] },
                      else: "$$oneVersiyon",
                      then: {
                        versiyonNumber: 0,
                        metrajOnaylanan: "$metrajOnaylanan"
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
      throw new Error("tryCatch -2- " + error);
    }

    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}




const update_onaylananMetraj_sil = async (req, res) => {

  const hataBase = "BACKEND - (update_onaylananMetraj_sil) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, onaylananMetraj_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!onaylananMetraj_state) {
      throw new Error("'onaylananMetraj_state' verisi db sorgusuna gelmedi");
    }


    try {

      let bulkArray = []
      let oneBulk
      onaylananMetraj_state.satirlar.filter(x => x.isSelected && x.newSelected).map(oneSatir => {

        if (oneSatir) {
          let userEmail = oneSatir.userEmail
          let originalSatirNo = oneSatir.satirNo

          oneBulk = {
            updateOne: {
              filter: { _id: _dugumId },
              update: {
                $set: {
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": true,
                  "revizeMetrajlar.$[oneMetraj].isReady": true,
                  "revizeMetrajlar.$[oneMetraj].satirlar": [],
                },
                $unset: {
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": "",
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": "",
                  "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].versiyon": "",
                  "revizeMetrajlar.$[oneMetraj].isSelected": "",
                }
              },
              arrayFilters: [
                {
                  "oneHazirlanan.userEmail": userEmail
                },
                {
                  "oneSatir.satirNo": originalSatirNo,
                  "oneSatir.isSelected": true,
                  "oneSatir.versiyon": 0
                },
                {
                  "oneMetraj.satirNo": originalSatirNo,
                  "oneMetraj.isSelected": true
                }
              ]
            }
          }
          bulkArray = [...bulkArray, oneBulk]

        }

      })

      if (bulkArray.length > 0) {
        await Dugum.bulkWrite(
          bulkArray,
          { ordered: false }
        )
      }


    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }


    try {

      let bulkArray = []
      let oneBulk
      onaylananMetraj_state.satirlar.filter(x => x.hasSelectedCopy && !x.newSelected).map(oneSatir => {

        let originalSatirNo = oneSatir.satirNo
        let userEmail = oneSatir.userEmail
        let silinecekSatirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo && x.newSelected)
        let silinmeyecekSatirlar = onaylananMetraj_state.satirlar.filter(x => x.originalSatirNo === originalSatirNo && !x.newSelected)

        if (silinecekSatirlar.length > 0) {

          // revizelerin bazısı siliniyorsa
          if (silinmeyecekSatirlar.length > 0) {

            let siraNo = 1
            // versiyon 0 olup silinecek satırlar içerisinde  
            silinmeyecekSatirlar = silinmeyecekSatirlar.map(oneSatir => {
              let silinecekSatir = silinecekSatirlar.find(x => x.satirNo === oneSatir.satirNo)
              let silinecekSatirNo = silinecekSatir?.satirNo
              let pasifEdilenVersiyon = silinecekSatir?.pasifEdilenVersiyon
              if (oneSatir.satirNo === silinecekSatirNo && pasifEdilenVersiyon === oneSatir.versiyon) {
                delete oneSatir.isPasif
              }
              if (oneSatir.versiyon !== 0) {
                let siraNo2 = oneSatir.satirNo.substring(oneSatir.satirNo.indexOf(".") + 1, oneSatir.satirNo.length)
                if (siraNo2 >= siraNo) {
                  siraNo = siraNo2 + 1
                }
              }
              return oneSatir
            })

            silinmeyecekSatirlar = silinmeyecekSatirlar.map(oneSatir => {
              if (oneSatir.versiyon === 0) {
                oneSatir.satirNo = originalSatirNo + "." + siraNo
                siraNo += 1
              }
              return oneSatir
            })

            oneBulk = {
              updateOne: {
                filter: { _id: _dugumId },
                update: {
                  $set: {
                    "revizeMetrajlar.$[oneMetraj].satirlar": silinmeyecekSatirlar,
                  }
                },
                arrayFilters: [
                  {
                    "oneMetraj.satirNo": originalSatirNo,
                    "oneMetraj.isSelected": true
                  }
                ]
              }
            }
            bulkArray = [...bulkArray, oneBulk]


            // revizelerin hepsi siliniyorsa
          } else {
            oneBulk = {
              updateOne: {
                filter: { _id: _dugumId },
                update: {
                  $set: {
                    "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
                    "revizeMetrajlar.$[oneMetraj].satirlar": [],
                  }
                },
                arrayFilters: [
                  {
                    "oneHazirlanan.userEmail": userEmail
                  },
                  {
                    "oneSatir.satirNo": originalSatirNo,
                    "oneSatir.isSelected": true
                  },
                  {
                    "oneMetraj.satirNo": originalSatirNo,
                    "oneMetraj.isSelected": true
                  }
                ]
              }
            }
            bulkArray = [...bulkArray, oneBulk]
          }
        }

      })

      if (bulkArray.length > 0) {
        await Dugum.bulkWrite(
          bulkArray,
          { ordered: false }
        )
      }


    } catch (error) {
      throw new Error("tryCatch -2- " + error);
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
                        metrajOnaylanan: {
                          $sum: {
                            $concatArrays: [
                              {
                                "$map": {
                                  "input": "$$oneHazirlanan.satirlar",
                                  "as": "oneSatir",
                                  "in": {
                                    "$cond": {
                                      "if": { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $ne: ["$$oneSatir.hasSelectedCopy", true] }] },
                                      "then": "$$oneSatir.metraj",
                                      "else": 0
                                    }
                                  }
                                }
                              },
                              {
                                "$concatArrays": [
                                  {
                                    "$map": {
                                      "input": "$revizeMetrajlar",
                                      "as": "oneMetraj",
                                      "in": {
                                        "$cond": {
                                          "if": {
                                            $eq: [
                                              "$$oneMetraj.isSelected",
                                              true
                                            ]
                                          },
                                          "then": {
                                            "$reduce": {
                                              "input": "$$oneMetraj.satirlar",
                                              "initialValue": 0,
                                              "in": {
                                                $add: [
                                                  "$$value",
                                                  {
                                                    "$cond": {
                                                      "if": {
                                                        $and: [
                                                          { $ne: ["$$this.metraj", ""] },
                                                          { $eq: ["$$this.userEmail", "$$oneHazirlanan.userEmail"] },
                                                          { $ne: ["$$this.isPasif", true] }
                                                        ]
                                                      },
                                                      "then": {
                                                        "$toDouble": "$$this.metraj"
                                                      },
                                                      "else": 0
                                                    }
                                                  }
                                                ]
                                              }
                                            }
                                          },
                                          "else": 0
                                        }
                                      }
                                    }
                                  }
                                ]
                              }
                            ]
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
              "metrajOnaylanan": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajOnaylanan"
                  }
                }
              }
            }
          },
          {
            $set: {
              "metrajVersiyonlar": {
                $map: {
                  input: "$metrajVersiyonlar",
                  as: "oneVersiyon",
                  in: {
                    $cond: {
                      if: { $eq: ["$$oneVersiyon.versiyonNumber", 0] },
                      else: "$$oneVersiyon",
                      then: {
                        versiyonNumber: 0,
                        metrajOnaylanan: "$metrajOnaylanan"
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
      throw new Error("tryCatch -3- " + error);
    }


    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}






const update_hazirlananMetrajlar_seen = async (req, res) => {

  const hataBase = "BACKEND - (update_hazirlananMetrajlar_seen) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, hazirlananMetrajlar_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!hazirlananMetrajlar_state) {
      throw new Error("'hazirlananMetrajlar_state' verisi db sorgusuna gelmedi");
    }


    try {

      let bulkArray = []
      hazirlananMetrajlar_state.map(oneHazirlanan => {

        let oneHazirlanan_seen_satirNolar = oneHazirlanan.satirlar.filter(x => x.isReady && x.isReadyUnSeen == false && x.newSelected).map(oneSatir => {
          return oneSatir.satirNo
        })

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": ""
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": oneHazirlanan.userEmail
              },
              {
                "oneSatir.satirNo": { $in: oneHazirlanan_seen_satirNolar },
                "oneSatir.isReady": true,
                "oneSatir.isReadyUnSeen": true,
              }
            ]
          }
        }
        bulkArray = [...bulkArray, oneBulk]

      })


      await Dugum.bulkWrite(
        bulkArray,
        { ordered: false }
      )

    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }


    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



const update_hazirlananMetrajlar_selected = async (req, res) => {

  const hataBase = "BACKEND - (update_hazirlananMetrajlar_selected) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, hazirlananMetrajlar_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!hazirlananMetrajlar_state) {
      throw new Error("'hazirlananMetrajlar_state' verisi db sorgusuna gelmedi");
    }



    try {

      let bulkArray = []
      let oneHazirlanan_selected_satirNolar
      hazirlananMetrajlar_state.map(oneHazirlanan => {

        oneHazirlanan_selected_satirNolar = oneHazirlanan.satirlar.filter(x => x.isSelected && x.newSelected).map(oneSatir => {
          return oneSatir.satirNo
        })

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $set: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": true,
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].versiyon": 0,
                // "hazirlananMetrajlar.$[oneSatir].satirlar": true,
                "revizeMetrajlar.$[oneMetraj].isSelected": true,
                "revizeMetrajlar.$[oneMetraj].satirlar": [],
              },
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": "",
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": "",
                "revizeMetrajlar.$[oneMetraj].isReady": "",
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": oneHazirlanan.userEmail
              },
              {
                "oneSatir.satirNo": { $in: oneHazirlanan_selected_satirNolar },
                "oneSatir.isReady": true
              },
              {
                "oneMetraj.satirNo": { $in: oneHazirlanan_selected_satirNolar },
                "oneMetraj.isReady": true
              }
            ]
          }
        }
        bulkArray = [...bulkArray, oneBulk]

      })



      await Dugum.bulkWrite(
        bulkArray,
        { ordered: false }
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
                        metrajOnaylanan: {
                          $sum: {
                            $concatArrays: [
                              {
                                "$map": {
                                  "input": "$$oneHazirlanan.satirlar",
                                  "as": "oneSatir",
                                  "in": {
                                    "$cond": {
                                      "if": { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $ne: ["$$oneSatir.hasSelectedCopy", true] }] },
                                      "then": "$$oneSatir.metraj",
                                      "else": 0
                                    }
                                  }
                                }
                              },
                              {
                                "$concatArrays": [
                                  {
                                    "$map": {
                                      "input": "$revizeMetrajlar",
                                      "as": "oneMetraj",
                                      "in": {
                                        "$cond": {
                                          "if": {
                                            $eq: [
                                              "$$oneMetraj.isSelected",
                                              true
                                            ]
                                          },
                                          "then": {
                                            "$reduce": {
                                              "input": "$$oneMetraj.satirlar",
                                              "initialValue": 0,
                                              "in": {
                                                $add: [
                                                  "$$value",
                                                  {
                                                    "$cond": {
                                                      "if": {
                                                        $and: [
                                                          { $ne: ["$$this.metraj", ""] },
                                                          { $eq: ["$$this.userEmail", "$$oneHazirlanan.userEmail"] },
                                                          { $ne: ["$$this.isPasif", true] }
                                                        ]
                                                      },
                                                      "then": {
                                                        "$toDouble": "$$this.metraj"
                                                      },
                                                      "else": 0
                                                    }
                                                  }
                                                ]
                                              }
                                            }
                                          },
                                          "else": 0
                                        }
                                      }
                                    }
                                  }
                                ]
                              }
                            ]
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
              "metrajOnaylanan": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajOnaylanan"
                  }
                }
              }
            }
          },
          {
            $set: {
              "metrajVersiyonlar": {
                $map: {
                  input: "$metrajVersiyonlar",
                  as: "oneVersiyon",
                  in: {
                    $cond: {
                      if: { $eq: ["$$oneVersiyon.versiyonNumber", 0] },
                      else: "$$oneVersiyon",
                      then: {
                        versiyonNumber: 0,
                        metrajOnaylanan: "$metrajOnaylanan"
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
      throw new Error("tryCatch -2- " + error);
    }

    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



const update_hazirlananMetrajlar_selectedFull = async (req, res) => {

  const hataBase = "BACKEND - (update_hazirlananMetrajlar_selectedFull) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumler_byPoz_state } = req.body

    if (!dugumler_byPoz_state) {
      throw new Error("'dugumler_byPoz_state' verisi db sorgusuna gelmedi");
    }



    try {

      let bulkArray = []
      dugumler_byPoz_state.map(oneDugum => {

        oneDugum.hazirlananMetrajlar.map(oneHazirlanan => {

          if (oneHazirlanan.hasSelectedFull_aday) {

            oneBulk = {
              updateOne: {
                filter: { _id: oneDugum._id },
                update: {
                  $set: {
                    "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isSelected": true,
                    "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].hasSelectedCopy": false,
                    "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].versiyon": 0,
                    "revizeMetrajlar.$[oneMetraj].isSelected": true,
                    "revizeMetrajlar.$[oneMetraj].satirlar": [],
                  },
                  $unset: {
                    "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": "",
                    "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": "",
                    "revizeMetrajlar.$[oneMetraj].isReady": "",
                  }
                },
                arrayFilters: [
                  {
                    "oneHazirlanan.userEmail": oneHazirlanan.userEmail
                  },
                  {
                    "oneSatir.isReady": true
                  },
                  {
                    "oneMetraj.isReady": true
                  }
                ]
              }
            }

            bulkArray = [...bulkArray, oneBulk]
          }

        })

      })


      await Dugum.bulkWrite(
        bulkArray,
        { ordered: false }
      )


    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }



    let metrajGuncellenecekDugumIdler = dugumler_byPoz_state.map(oneDugum => {
      return oneDugum._id
    })




    // metraj güncelleme
    try {
      await Dugum.updateMany({ _id: { $in: metrajGuncellenecekDugumIdler } },
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
                        metrajOnaylanan: {
                          $sum: {
                            $concatArrays: [
                              {
                                "$map": {
                                  "input": "$$oneHazirlanan.satirlar",
                                  "as": "oneSatir",
                                  "in": {
                                    "$cond": {
                                      "if": { $and: [{ $eq: ["$$oneSatir.isSelected", true] }, { $ne: ["$$oneSatir.hasSelectedCopy", true] }] },
                                      "then": "$$oneSatir.metraj",
                                      "else": 0
                                    }
                                  }
                                }
                              },
                              {
                                "$concatArrays": [
                                  {
                                    "$map": {
                                      "input": "$revizeMetrajlar",
                                      "as": "oneMetraj",
                                      "in": {
                                        "$cond": {
                                          "if": {
                                            $eq: [
                                              "$$oneMetraj.isSelected",
                                              true
                                            ]
                                          },
                                          "then": {
                                            "$reduce": {
                                              "input": "$$oneMetraj.satirlar",
                                              "initialValue": 0,
                                              "in": {
                                                $add: [
                                                  "$$value",
                                                  {
                                                    "$cond": {
                                                      "if": {
                                                        $and: [
                                                          { $ne: ["$$this.metraj", ""] },
                                                          { $eq: ["$$this.userEmail", "$$oneHazirlanan.userEmail"] },
                                                          { $ne: ["$$this.isPasif", true] }
                                                        ]
                                                      },
                                                      "then": {
                                                        "$toDouble": "$$this.metraj"
                                                      },
                                                      "else": 0
                                                    }
                                                  }
                                                ]
                                              }
                                            }
                                          },
                                          "else": 0
                                        }
                                      }
                                    }
                                  }
                                ]
                              }
                            ]
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
              "metrajOnaylanan": {
                $sum: {
                  "$map": {
                    "input": "$hazirlananMetrajlar",
                    "as": "oneHazirlanan",
                    "in": "$$oneHazirlanan.metrajOnaylanan"
                  }
                }
              }
            }
          },
          {
            $set: {
              "metrajVersiyonlar": {
                $map: {
                  input: "$metrajVersiyonlar",
                  as: "oneVersiyon",
                  in: {
                    $cond: {
                      if: { $eq: ["$$oneVersiyon.versiyonNumber", 0] },
                      else: "$$oneVersiyon",
                      then: {
                        versiyonNumber: 0,
                        metrajOnaylanan: "$metrajOnaylanan"
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
      throw new Error("tryCatch -2- " + error);
    }


    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



const update_hazirlananMetrajlar_unReady = async (req, res) => {

  const hataBase = "BACKEND - (update_hazirlananMetrajlar_unReady) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { dugumId, hazirlananMetrajlar_state } = req.body

    if (!dugumId) {
      throw new Error("'dugumId' verisi db sorgusuna gelmedi");
    }

    let _dugumId
    try {
      _dugumId = new ObjectId(dugumId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'dugumId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!hazirlananMetrajlar_state) {
      throw new Error("'hazirlananMetrajlar_state' verisi db sorgusuna gelmedi");
    }



    try {


      let bulkArray = []
      hazirlananMetrajlar_state.map(oneHazirlanan => {

        // let azalacakMetraj = 0
        let oneHazirlanan_unReady_satirNolar = oneHazirlanan.satirlar.filter(x => x.isReady === false && x.newSelected).map(oneSatir => {
          // azalacakMetraj += Number(oneSatir.metraj)
          return oneSatir.satirNo
        })
        // azalacakMetraj = azalacakMetraj * -1

        oneBulk = {
          updateOne: {
            filter: { _id: _dugumId },
            update: {
              $unset: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReady": "",
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyUnSeen": "",
              },
              $set: {
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isPreparing": true,
                "hazirlananMetrajlar.$[oneHazirlanan].satirlar.$[oneSatir].isReadyBack": true,
              }
            },
            arrayFilters: [
              {
                "oneHazirlanan.userEmail": oneHazirlanan.userEmail
              },
              {
                "oneSatir.satirNo": { $in: oneHazirlanan_unReady_satirNolar },
                "oneSatir.isReady": true
              },
            ]
          }
        }
        bulkArray = [...bulkArray, oneBulk]

      })

      await Dugum.bulkWrite(
        bulkArray,
        { ordered: false }
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





const update_isPaketleri = async (req, res) => {

  const hataBase = "BACKEND - (update_isPaketleri) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    let {
      selectedIsPaketVersiyon,
      selectedIsPaketBaslik,
      selectedIsPaket,
      dugumler
    } = req.body

    if (!dugumler || dugumler.length === 0) {
      throw new Error("'dugumler' verisi db sorgusuna gelmedi");
    }



    try {

      let bulkArray = []
      dugumler.map(oneDugum => {

        oneBulk = {
          updateOne: {
            filter: { _id: oneDugum._id },
            update: {
              $set: {
                "isPaketVersiyonlar.$[oneVersiyon].basliklar.$[oneBaslik]._paketId": oneDugum.newSelectedValue ? new ObjectId(selectedIsPaket._id) : null,
              }
            },
            arrayFilters: [
              {
                "oneVersiyon.versiyon": selectedIsPaketVersiyon
              },
              {
                "oneBaslik._id": new ObjectId(selectedIsPaketBaslik._id)
              }
            ]
          }
        }
        bulkArray = [...bulkArray, oneBulk]

      })

      await Dugum.bulkWrite(
        bulkArray,
        { ordered: false }
      )


    } catch (error) {
      throw new Error("tryCatch -1- " + error);
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
  getHazirlananMetraj,
  getOnaylananMetraj,
  getHazirlananMetrajlar,
  addMetrajSatiri,
  update_hazirlananMetraj_peparing,
  update_hazirlananMetraj_ready,
  update_onaylananMetraj_revize,
  update_onaylananMetraj_sil,
  update_hazirlananMetrajlar_selected,
  update_hazirlananMetrajlar_selectedFull,
  update_hazirlananMetrajlar_unReady,
  update_hazirlananMetrajlar_seen,
  update_isPaketleri
}