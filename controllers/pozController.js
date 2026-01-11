const Poz = require('../models/pozModel')
const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')
const _ = require('lodash');

const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;





const createPoz = async (req, res) => {

  const hataBase = "BACKEND - (createPoz) - "

  try {

    const dateNow = new Date()

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    let { newPoz } = req.body

    if (!newPoz) {
      throw new Error("DB ye gönderilen sorguda 'newPoz' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    // veri düzeltme
    if (newPoz.pozMetrajTipId === "insaatDemiri") {
      newPoz.pozBirimId = "ton"
    }


    if (!newPoz._firmaId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'firmaId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!newPoz._projeId) {
      // form alanına değil - direkt ekrana uyarı veren hata - (fonksiyon da durduruluyor)
      throw new Error("DB ye gönderilen sorguda 'projeId' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    ////// form validation - backend
    // form alanına uyarı veren hatalar

    let errorObject = {}
    let isFormError = false

    let wbsIdError
    let pozNameError
    let pozNoError
    let pozBirimIdError
    let pozMetrajTipIdError


    if (!newPoz._wbsId && !wbsIdError) {
      errorObject.wbsIdError = "Zorunlu"
      wbsIdError = true
      isFormError = true
    }


    if (typeof newPoz.pozName !== "string" && !pozNameError) {
      errorObject.pozNameError = "Zorunlu"
      pozNameError = true
      isFormError = true
    }

    if (typeof newPoz.pozName === "string" && !pozNameError) {
      if (newPoz.pozName.length === 0) {
        errorObject.pozNameError = "Zorunlu"
        pozNameError = true
        isFormError = true
      }
    }

    if (typeof newPoz.pozName === "string" && !pozNameError) {
      let minimumHaneSayisi = 3
      if (newPoz.pozName.length > 0 && newPoz.pozName.length < minimumHaneSayisi) {
        errorObject.pozNameError = `${minimumHaneSayisi} haneden az olamaz`
        pozNameError = true
        isFormError = true
      }
    }


    const poz = await Poz.findOne({
      _projeId: newPoz._projeId,
      $or: [
        { pozName: newPoz.pozName },
        { pozNo: newPoz.pozNo }
      ]
    })


    if (poz?.pozName === newPoz.pozName && !pozNameError) {
      errorObject.pozNameError = `Bu poz ismi kullanılmış`
      pozNameError = true
      isFormError = true
    }

    if (!newPoz.pozNo && !pozNoError) {
      errorObject.pozNoError = `Zorunlu`
      pozNoError = true
      isFormError = true
    }

    if (poz?.pozNo === newPoz.pozNo && !pozNoError) {
      errorObject.pozNoError = `Bu poz numarası kullanılmış`
      pozNoError = true
      isFormError = true
    }


    if (!newPoz.pozBirimId && !pozBirimIdError) {
      errorObject.pozBirimIdError = `Zorunlu`
      pozBirimIdError = true
      isFormError = true
    }


    if (!newPoz.pozMetrajTipId) {
      errorObject.pozMetrajTipIdError = `Zorunlu`
      pozMetrajTipIdError = true
      isFormError = true
    }


    // form alanına uyarı veren hatalar olmuşsa burda durduralım
    if (isFormError) {
      return res.status(200).json({ errorObject })
    }

    newPoz = {
      ...newPoz,
      birimFiyatlar: [],
      createdAt: dateNow,
      createdBy: userEmail
    }

    const result = await Poz.create(newPoz)

    newPoz = {
      ...newPoz,
      _id: result.insertedId
    }

    res.status(200).json({ newPoz })

  } catch (error) {
    res.status(400).json({ error: hataBase + error })
  }

}






const getPozlar = async (req, res) => {

  const hataBase = "BACKEND - (getPozlar) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const { projeid, selectedbirimfiyatversiyonnumber } = req.headers


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
    if (!proje) {
      throw new Error("DB ye gönderilen 'projeid' sistemde bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    // sorguya gelen bir birim fiyat versiyon varsa o aranıyor, yoksa en yükseği seçiliyor ve aranıyor
    let selectedBirimFiyatVersiyon = proje.birimFiyatVersiyonlar.find(x => x.versiyonNumber === Number(selectedbirimfiyatversiyonnumber))
    if (!selectedBirimFiyatVersiyon) {
      selectedBirimFiyatVersiyon = proje.birimFiyatVersiyonlar.reduce((acc, cur) => cur.versiyonNumber > acc.versiyonNumber ? cur : acc, { versiyonNumber: 0 })
    }


    let pozlar

    try {

      pozlar = await Poz.aggregate([
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
            pozMetrajTipId: 1,
            birimFiyatlar: 1,
            birimFiyatVersiyonlar: {
              $reduce: {
                "input": "$birimFiyatVersiyonlar",
                "initialValue": { "versiyonNumber": 0, birimFiyatlar: [] },
                "in": {
                  "$cond": {
                    "if": {
                      $eq: [
                        "$$this.versiyonNumber",
                        selectedBirimFiyatVersiyon?.versiyonNumber
                      ]
                    },
                    "then": "$$this",
                    "else": "$$value"
                  }
                }
              }
            }
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
                  },
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
        },
        {
          $group: {
            _id: "$_pozId",
            hazirlananMetrajlar: { $push: "$hazirlananMetrajlar" },
            revizeMetrajlar: { $push: "$revizeMetrajlar" },
            metrajPreparing: { $sum: "$metrajPreparing" },
            metrajReady: { $sum: "$metrajReady" },
            metrajOnaylanan: { $sum: "$metrajOnaylanan" }
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
          onePoz.hasVersiyonZero = false

          onePoz.metrajOnaylanan = onePoz2.metrajOnaylanan
          // return onePoz2.hazirlanan
          onePoz.hazirlananMetrajlar = metrajYapabilenler.map(oneYapabilen => {

            let metrajPreparing = 0
            let metrajReady = 0
            let metrajOnaylanan = 0

            let hasReadyUnSeen_Array = []
            let hasReady_Array = []
            let hasSelected_Array = []
            let hasUnSelected_Array = []
            let hasVersiyonZero_Array = []


            onePoz2.hazirlananMetrajlar.map(oneArray => {

              let oneHazirlanan = oneArray.find(x => x.userEmail === oneYapabilen.userEmail)

              // if (oneHazirlanan?.satirlar?.filter(x => x.isReady).length > 0) {
              if (oneHazirlanan) {

                let metrajPreparing2 = oneHazirlanan?.metrajPreparing ? Number(oneHazirlanan?.metrajPreparing) : 0
                let metrajReady2 = oneHazirlanan?.metrajReady ? Number(oneHazirlanan?.metrajReady) : 0
                let metrajOnaylanan2 = oneHazirlanan?.metrajOnaylanan ? Number(oneHazirlanan?.metrajOnaylanan) : 0

                metrajPreparing += metrajPreparing2
                metrajReady += metrajReady2
                metrajOnaylanan += metrajOnaylanan2

                hasReadyUnSeen_Array = [...hasReadyUnSeen_Array, oneHazirlanan?.hasReadyUnSeen]
                hasReady_Array = [...hasReady_Array, oneHazirlanan?.hasReady]
                hasSelected_Array = [...hasSelected_Array, oneHazirlanan?.hasSelected]
                hasUnSelected_Array = [...hasUnSelected_Array, oneHazirlanan?.hasUnSelected]
                hasVersiyonZero_Array = [...hasVersiyonZero_Array, oneHazirlanan?.hasVersiyonZero]
              }

            })

            let hasReadyUnSeen = hasReadyUnSeen_Array.find(x => x === true)
            let hasReady = hasReady_Array.find(x => x === true)
            let hasSelected = hasSelected_Array.find(x => x === true)
            let hasUnSelected = hasUnSelected_Array.find(x => x === true)
            let hasVersiyonZero = hasVersiyonZero_Array.find(x => x === true)

            if (hasVersiyonZero) {
              onePoz.hasVersiyonZero = true
            }

            return ({
              userEmail: oneYapabilen.userEmail,
              metrajPreparing,
              metrajReady,
              metrajOnaylanan,
              hasReadyUnSeen,
              hasReady,
              hasSelected,
              hasUnSelected,
              hasVersiyonZero
            })

          })

          // onePoz.revizeMetrajlar = onePoz2.revizeMetrajlar
          onePoz2.revizeMetrajlar.map(oneMetraj => {
            oneMetraj.map(oneSatir => {
              if (oneSatir.hasVersiyonZero) {
                onePoz.hasVersiyonZero = true
              }
            })
          })

        }

        return onePoz

      })


    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }

    let anySelectable
    try {

      anySelectable
      pozlar.map(onePoz => {
        onePoz?.hazirlananMetrajlar?.map(oneHazirlanan => {
          if (oneHazirlanan) {
            if (oneHazirlanan.hasUnSelected) {
              anySelectable = true
            }
          }
        })
      })

    } catch (error) {
      throw new Error("tryCatch -2- " + error);
    }

    let { paraBirimleri, birimFiyatVersiyonlar } = proje

    return res.status(200).json({ pozlar, anySelectable, selectedBirimFiyatVersiyon, paraBirimleri, birimFiyatVersiyonlar })

  } catch (error) {
    return res.status(400).json({ hatayeri: hataBase, error: hataBase + error })
  }

}







const updateBirimFiyatlar = async (req, res) => {

  const hataBase = "BACKEND - (updateBirimFiyatlar) - "


  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)


    let { projeId, pozlar_newPara, paraBirimleri, wasChangedForNewVersion } = req.body


    if (!pozlar_newPara) {
      throw new Error("'pozlar_newPara' verisi db sorgusuna gelmedi");
    }


    if (paraBirimleri && !projeId) {
      throw new Error("Proje para birimlerinde aktif edilecekler var fakat 'projeId' db sorgusuna gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.");
    }

    let theProje = await Proje.findOne({ _id: projeId })
    if (!theProje) {
      throw new Error("sorguya gönderilen 'projeId' ile sistemde 'proje' bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const currentTime = new Date()



    // yetki kontrol
    try {
      let arananYetkiler = ["birimFiyatEdit", "owner"]

      let hasYetki
      arananYetkiler.map(oneAranan => {
        theProje.yetkiliKisiler.find(x => x.email === userEmail)?.yetkiler?.map(oneYetki => {
          if (oneYetki.name === oneAranan) {
            hasYetki = true
          }
        })
      })
      if (!hasYetki) {
        return res.status(200).json({ message: "Bu işlem için yetkiniz yok görünüyor, Rapor7/24 ile iletişime geçebilirsiniz." })
      }


    } catch (error) {
      throw new Error("tryCatch -yetki- " + error)
    }




    try {

      const bulkArray1 = pozlar_newPara.map(onePoz => {
        return (
          {
            updateOne: {
              filter: { _id: onePoz._id },
              update: { $set: { birimFiyatlar: onePoz.birimFiyatlar } }
            }
          }
        )
      })

      await Poz.bulkWrite(
        bulkArray1,
        { ordered: false }
      )


    } catch (error) {
      throw new Error("tryCatch -1- " + error)
    }




    try {

      if (paraBirimleri && !wasChangedForNewVersion) {
        console.log("parabirimleri ve waschanged")
        await Proje.updateOne({ _id: projeId },
          {
            $set: { paraBirimleri },
            $addToSet: { birimFiyatVersiyonlar: { wasChangedForNewVersion: true } }
          }
        )
      }

      if (paraBirimleri && wasChangedForNewVersion) {
        console.log("parabirimleri")
        await Proje.updateOne({ _id: projeId },
          {
            $set: { paraBirimleri }
          }
        )
      }


      if (!paraBirimleri && !wasChangedForNewVersion) {
        console.log("waschanged")
        await Proje.updateOne({ _id: projeId },
          {
            $addToSet: { birimFiyatVersiyonlar: { wasChangedForNewVersion: true } }
          }
        )
      }


    } catch (error) {
      throw new Error("tryCatch -2- " + error)
    }


    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}






const ispaketpozmetrajlar = async (req, res) => {

  const hataBase = "BACKEND - (ispaketpozmetrajlar) - "

  try {

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim
    } = JSON.parse(req.user)

    const {
      projeid,
      ispaketversiyontext,
      metrajversiyontext
    } = req.headers

    const selectedIsPaketVersiyon = Number(ispaketversiyontext)
    // const versiyonMetraj = Number(versiyonmetrajtext)

    if (!projeid) {
      throw new Error("DB ye gönderilen sorguda 'projeid' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!ispaketversiyontext) {
      throw new Error("DB ye gönderilen sorguda 'ispaketversiyontext' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!metrajversiyontext) {
      throw new Error("DB ye gönderilen sorguda 'metrajversiyontext' verisi bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    let _projeId
    try {
      _projeId = new ObjectId(projeid)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeid' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    const proje = await Proje.findOne({ _id: _projeId })
    let maxMetrajVersiyon = proje.metrajVersiyonlar.reduce((acc, oneVersiyon) => Math.max(acc, oneVersiyon.versiyonNumber), 0)

    let pozlar

    try {

      pozlar = await Poz.aggregate([
        {
          $match: {
            _projeId
          }
        },
        {
          $project: {
            _wbsId: 1
          }
        }
      ])


      const pozlar2 = await Dugum.aggregate([
        {
          $match: {
            _projeId,
          }
        },
        {
          $project: {
            _pozId: 1,
            _paketIds: {
              $reduce: {
                input: "$isPaketVersiyonlar",
                initialValue: null,
                in: {
                  $cond: {
                    if: { $eq: ["$$this.versiyon", selectedIsPaketVersiyon] },
                    else: "$$value",
                    then: "$$this.isPaketler"
                  }
                }
              }
            },
            metrajOnaylanan: {
              $reduce: {
                input: "$metrajVersiyonlar",
                initialValue: null,
                in: {
                  $cond: {
                    if: { $eq: ["$$this.versiyonNumber", maxMetrajVersiyon] },
                    else: "$$value",
                    then: "$$this.metrajOnaylanan"
                  }
                }
              }

            }
          }
        },
        {
          $group: {
            _id: "$_pozId",
            pozPaketMetrajlar: {
              $push: { $mergeObjects: [{ _paketIds: "$_paketIds" }, { metrajOnaylanan: "$metrajOnaylanan" }] }
            }
          }
        }
      ])



      return res.status(200).json({ pozlar2 })


      let isPaketler_byVersiyon = []
      proje.isPaketVersiyonlar.map(oneVersiyon => {
        if (oneVersiyon.versiyon === selectedIsPaketVersiyon) {
          oneVersiyon.isPaketler.map(onePaket => {
            isPaketler_byVersiyon = [...isPaketler_byVersiyon, { _id: onePaket._id }]
          })
        }
      })

      // return res.status(200).json({ isPaketler_byVersiyon })


      pozlar = pozlar.map(onePoz => {

        let pozPaketMetrajlar = pozlar2.find(onePoz2 => onePoz2._id.toString() === onePoz._id.toString())?.pozPaketMetrajlar

        if (!pozPaketMetrajlar?.length > 0) {
          return
        }

        onePoz.isPaketler_byVersiyon = _.cloneDeep(isPaketler_byVersiyon)

        // let paketMetrajlar = isPaketMetrajlar_byPoz.filter(oneVersiyon3 => oneVersiyon3.basliklar.find(oneBaslik3 => oneBaslik3._paketId?.toString() === onePaket._id.toString()))

        // let array2 = []
        onePoz.isPaketler_byVersiyon = onePoz.isPaketler_byVersiyon.map(onePaket => {
          onePaket.metrajOnaylanan = pozPaketMetrajlar.reduce((acc, oneMetraj) => oneMetraj._paketIds.find(x => x?.toString() === onePaket._id.toString()) ? acc + oneMetraj.metrajOnaylanan : acc + 0, 0)
          return onePaket
          // array2 = [...array2, { _id: onePaket._id, metraj }]
        })
        // return res.status(200).json({ array2 })

        // oneVersiyon?.basliklar.map(oneBaslik => {
        //   oneBaslik.ispaketler.map(onePaket => {
        //     let paketMetrajlar = isPaketMetrajlar_byPoz.filter(oneVersiyon3 => oneVersiyon3.basliklar.find(oneBaslik3 => oneBaslik3._paketId?.toString() === onePaket._id.toString()))
        //     if (paketMetrajlar.length > 0) {
        //       let paketMetraj = paketMetrajlar.reduce((acc, onePaket) => acc + onePaket.metrajVersiyonlar[0].metrajOnaylanan, 0)
        //       onePaket.metrajOnaylanan = paketMetraj
        //     }
        //     return onePaket
        //   })
        //   return oneBaslik
        // })

        return onePoz

      })

    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }

    return res.status(200).json({ ispaketpozmetrajlar: pozlar })


    // let anySelectable
    // try {

    //   anySelectable
    //   pozlar.map(onePoz => {
    //     onePoz?.hazirlananMetrajlar?.map(oneHazirlanan => {
    //       if (oneHazirlanan) {
    //         if (oneHazirlanan.hasUnSelected) {
    //           anySelectable = true
    //         }
    //       }
    //     })
    //   })

    // } catch (error) {
    //   throw new Error("tryCatch -2- " + error);
    // }

    // return res.status(200).json({ pozlar, anySelectable })

  } catch (error) {
    return res.status(400).json({ hatayeri: hataBase, error: hataBase + error })
  }

}




module.exports = {
  createPoz,
  getPozlar,
  updateBirimFiyatlar,
  ispaketpozmetrajlar
}