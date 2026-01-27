const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')
const Poz = require('../models/pozModel')
const Mahal = require('../models/mahalModel')
const _ = require('lodash');

const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;



// const createVersiyon_metraj = async (req, res) => {

//   const hataBase = "BACKEND - (createVersiyon_metraj) - "

//   try {

//     const currentTime = new Date();

//     const {
//       email: userEmail,
//       isim: userIsim,
//       soyisim: userSoyisim,
//       userCode
//     } = JSON.parse(req.user)


//     const { projeId, pozlar_metraj, versiyonNumber, aciklama } = req.body


//     let _projeId
//     try {
//       _projeId = new ObjectId(projeId)
//     } catch (error) {
//       throw new Error("DB ye gönderilen 'projeId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
//     }

//     if (!pozlar_metraj.length > 0) {
//       throw new Error("'pozlar_metraj' verisi db sorgusuna gelmedi")
//     }

//     if (!versiyonNumber) {
//       throw new Error("'versiyonNumber' verisi db sorgusuna gelmedi")
//     }


//     let theProje = await Proje.findOne({ _id: projeId })
//     if (!theProje) {
//       throw new Error("sorguya gönderilen 'collectionId' ile sistemde 'document' bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
//     }


//     // yetki kontrol
//     try {
//       let arananYetkiler = ["birimFiyatEdit", "owner"]

//       let hasYetki
//       arananYetkiler.map(oneAranan => {
//         theProje.yetkiliKisiler.find(x => x.email === userEmail)?.yetkiler?.map(oneYetki => {
//           if (oneYetki.name === oneAranan) {
//             hasYetki = true
//           }
//         })
//       })
//       if (!hasYetki) {
//         return res.status(200).json({ message: "Bu işlem için yetkiniz yok görünüyor, Rapor7/24 ile iletişime geçebilirsiniz." })
//       }


//     } catch (error) {
//       throw new Error("tryCatch -yetki- " + error)
//     }



//     let proje = await Proje.findOne({ _id: _projeId })
//     const { metrajVersiyonlar } = proje




//     try {

//       await Dugum.updateMany({ _projeId }, [
//         {
//           $set: {
//             hazirlananMetrajlar: {
//               $map: {
//                 input: "$hazirlananMetrajlar",
//                 as: "oneHazirlanan",
//                 in: {
//                   $mergeObjects: [
//                     "$$oneHazirlanan",
//                     {
//                       satirlar: {
//                         $map: {
//                           input: "$$oneHazirlanan.satirlar",
//                           as: "oneSatir",
//                           in: {
//                             $cond: {
//                               if: { $eq: ["$$oneSatir.versiyon", 0] },
//                               else: "$$oneSatir",
//                               then: {
//                                 $mergeObjects: [
//                                   "$$oneSatir",
//                                   { versiyon: versiyonNumber }
//                                 ]
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   ]
//                 }
//               }
//             },
//             revizeMetrajlar: {
//               $map: {
//                 input: "$revizeMetrajlar",
//                 as: "oneMetraj",
//                 in: {
//                   $mergeObjects: [
//                     "$$oneMetraj",
//                     {
//                       satirlar: {
//                         $map: {
//                           input: "$$oneMetraj.satirlar",
//                           as: "oneSatir",
//                           in: {
//                             $cond: {
//                               if: { $eq: ["$$oneSatir.versiyon", 0] },
//                               else: "$$oneSatir",
//                               then: {
//                                 $mergeObjects: [
//                                   "$$oneSatir",
//                                   { versiyon: versiyonNumber }
//                                 ]
//                               }
//                             }
//                           }
//                         }
//                       }
//                     }
//                   ]
//                 }
//               }
//             },
//             metrajVersiyonlar: { $concatArrays: ["$metrajVersiyonlar", [{ versiyonNumber, metrajOnaylanan: "$metrajOnaylanan" }]] }
//           }
//         }
//       ])


//     } catch (error) {
//       throw new Error("tryCatch -2- " + error);
//     }

//     await proje.metrajVersiyonlar.push({ versiyonNumber, createdAt: currentTime })

//     return res.status(200).json({ proje })

//   } catch (error) {
//     return res.status(400).json({ error: hataBase + error })
//   }

// }




// try {


//   if (!metrajVersiyonlar) {

//     Proje.updateOne({ _id: _projeId }, [
//       {
//         $set: {
//           metrajVersiyonlar: [{ versiyonNumber, createdAt: currentTime }]
//         }
//       }
//     ])

//   } else {

//     metrajVersiyonlar.map(oneVersiyon => {
//       if (oneVersiyon.versiyonNumber >= versiyonNumber) {
//         versiyonNumber = oneVersiyon.versiyonNumber + 1
//       }
//     })

//     await Proje.updateOne({ _id: _projeId }, [
//       {
//         $set: {
//           metrajVersiyonlar: {
//             $concatArrays: [
//               "$metrajVersiyonlar",
//               [{ versiyonNumber, createdAt: currentTime }]
//             ]
//           }
//         }
//       }
//     ])

//   }



// } catch (error) {
//   throw new Error("tryCatch -1- " + error);
// }




const createVersiyon_metraj = async (req, res) => {

  const hataBase = "BACKEND - (createVersiyon_metraj) - "


  try {

    const currentTime = new Date()

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { projeId, pozlar, versiyonNumber, aciklama } = req.body

    let _projeId
    try {
      _projeId = new ObjectId(projeId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!pozlar.length > 0) {
      throw new Error("'pozlar' verisi db sorgusuna gelmedi");
    }

    if (!versiyonNumber) {
      throw new Error("'versiyonNumber' verisi db sorgusuna gelmedi");
    }


    let theProje = await Proje.findOne({ _id: projeId })
    if (!theProje) {
      throw new Error("sorguya gönderilen 'collectionId' ile sistemde 'document' bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }



    // yetki kontrol
    try {
      if (!theProje.aktifYetkiliKisiler.find(x => x.yetki === "metrajOnay" && x.email === userEmail)) {
        return res.status(200).json({ message: "Gerekli süre içerisinde işlem yapmadınız ya da bu işlem için yetkiniz yok, sayfayı yenileyip tekrar deneyiniz, Rapor7/24 ile iletişime geçebilirsiniz." })
      }
    } catch (error) {
      throw new Error("tryCatch -yetki- " + error)
    }




    // try {

    //   await Dugum.updateMany({ _projeId }, [
    //     {
    //       $set: {
    //         hazirlananMetrajlar: {
    //           $map: {
    //             input: "$hazirlananMetrajlar",
    //             as: "oneHazirlanan",
    //             in: {
    //               $mergeObjects: [
    //                 "$$oneHazirlanan",
    //                 {
    //                   satirlar: {
    //                     $map: {
    //                       input: "$$oneHazirlanan.satirlar",
    //                       as: "oneSatir",
    //                       in: {
    //                         $cond: {
    //                           if: { $eq: ["$$oneSatir.versiyon", 0] },
    //                           else: "$$oneSatir",
    //                           then: {
    //                             $mergeObjects: [
    //                               "$$oneSatir",
    //                               { versiyon: versiyonNumber }
    //                             ]
    //                           }
    //                         }
    //                       }
    //                     }
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         revizeMetrajlar: {
    //           $map: {
    //             input: "$revizeMetrajlar",
    //             as: "oneMetraj",
    //             in: {
    //               $mergeObjects: [
    //                 "$$oneMetraj",
    //                 {
    //                   satirlar: {
    //                     $map: {
    //                       input: "$$oneMetraj.satirlar",
    //                       as: "oneSatir",
    //                       in: {
    //                         $cond: {
    //                           if: { $eq: ["$$oneSatir.versiyon", 0] },
    //                           else: "$$oneSatir",
    //                           then: {
    //                             $mergeObjects: [
    //                               "$$oneSatir",
    //                               { versiyon: versiyonNumber }
    //                             ]
    //                           }
    //                         }
    //                       }
    //                     }
    //                   }
    //                 }
    //               ]
    //             }
    //           }
    //         },
    //         metrajVersiyonlar: { $concatArrays: ["$metrajVersiyonlar", [{ versiyonNumber, metrajOnaylanan: "$metrajOnaylanan" }]] }
    //       }
    //     }
    //   ])


    // } catch (error) {
    //   throw new Error("tryCatch -1- " + error);
    // }




    try {

      const bulkArray1 = pozlar.map(onePoz => {

        return (
          {
            updateOne: {
              filter: { _id: onePoz._id },
              update: {
                $push: {
                  metrajVersiyonlar: {
                    versiyonNumber,
                    metrajOnaylanan: onePoz.metrajOnaylanan,
                    isProgress: onePoz?.hasVersiyonZero ? true : false
                  }
                }
              }
            }
          }
        )

        // return (
        //   {
        //     updateOne: {
        //       filter: { _id: onePoz._id },
        //       update: {
        //         $set: { birimFiyatlar: birimFiyatlar_noProgress },
        //         $push: { birimFiyatVersiyonlar: { versiyonNumber, birimFiyatlar: birimFiyatlar_saveAs_versiyon } }
        //       }
        //     }
        //   }
        // )

      })

      // return res.status(200).json({ bulkArray1 })

      await Poz.bulkWrite(
        bulkArray1,
        { ordered: false }
      )


    } catch (error) {
      throw new Error("tryCatch -2- " + error)
    }



    try {

      await Proje.updateOne({ _id: _projeId }, [
        {
          $set: {
            metrajVersiyonlar: {
              $concatArrays: [
                "$metrajVersiyonlar",
                [{ versiyonNumber, aciklama, createdAt: currentTime, createdBy: userEmail }]
              ]
            },
            aktifYetkiliKisiler: {
              $filter: {
                input: "$aktifYetkiliKisiler",
                as: "oneAktif",
                cond: { $ne: ["$$oneAktif.yetki", "metrajOnay"] }
              }
            }
          }
        }
      ])

    } catch (error) {
      throw new Error("tryCatch -3- " + error)
    }



    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}





const createVersiyon_birimFiyat = async (req, res) => {

  const hataBase = "BACKEND - (createVersiyon_birimFiyat) - "


  try {

    const currentTime = new Date()

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { projeId, pozlar_birimFiyat, versiyonNumber, aciklama } = req.body

    let _projeId
    try {
      _projeId = new ObjectId(projeId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (!pozlar_birimFiyat.length > 0) {
      throw new Error("'pozlar_birimFiyat' verisi db sorgusuna gelmedi");
    }

    if (!versiyonNumber) {
      throw new Error("'versiyonNumber' verisi db sorgusuna gelmedi");
    }


    let theProje = await Proje.findOne({ _id: projeId })
    if (!theProje) {
      throw new Error("sorguya gönderilen 'collectionId' ile sistemde 'document' bulunamadı, lütfen sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }



    // yetki kontrol
    try {
      if (!theProje.aktifYetkiliKisiler.find(x => x.yetki === "birimFiyatEdit" && x.email === userEmail)) {
        return res.status(200).json({ message: "Gerekli süre içerisinde işlem yapmadınız ya da bu işlem için yetkiniz yok, sayfayı yenileyip tekrar deneyiniz, Rapor7/24 ile iletişime geçebilirsiniz." })
      }
    } catch (error) {
      throw new Error("tryCatch -yetki- " + error)
    }



    let versiyonKaydiGereklimi

    try {

      const bulkArray1 = pozlar_birimFiyat.map(onePoz => {

        // bir önceki versiyonda tutarı 0 olup, tutar girilip kaydedildikten sonra tekrar 0 yapılanların yeni versiyonda yeri olmasın 
        let birimFiyatlar_saveAs_versiyon = _.cloneDeep(onePoz.birimFiyatlar.filter(oneFiyat => {
          if (!oneFiyat.isProgress && Number(oneFiyat.fiyat) === 0) {
            return false
          } else {
            delete oneFiyat.eskiFiyat
            return true
          }
        }))

        let birimFiyatlar_noProgress = onePoz.birimFiyatlar.map(oneFiyat => {
          if (oneFiyat.isProgress) {
            delete oneFiyat.isProgress
            delete oneFiyat.eskiFiyat
            versiyonKaydiGereklimi = true
          }
          return oneFiyat
        })

        return (
          {
            updateOne: {
              filter: { _id: onePoz._id },
              update: {
                $set: { birimFiyatlar: birimFiyatlar_noProgress },
                $push: { birimFiyatVersiyonlar: { versiyonNumber, birimFiyatlar: birimFiyatlar_saveAs_versiyon } }
              }
            }
          }
        )
      })

      if (versiyonKaydiGereklimi) {
        await Poz.bulkWrite(
          bulkArray1,
          { ordered: false }
        )
      }

    } catch (error) {
      throw new Error("tryCatch -1- " + error)
    }



    if (versiyonKaydiGereklimi) {

      try {

        await Proje.updateOne({ _id: _projeId }, [
          {
            $set: {
              birimFiyatVersiyonlar: {
                $concatArrays: [
                  "$birimFiyatVersiyonlar",
                  [{ versiyonNumber, aciklama, createdAt: currentTime, createdBy: userEmail }]
                ]
              },
              birimFiyatVersiyon_isProgress: false,
              aktifYetkiliKisiler: {
                $filter: {
                  input: "$aktifYetkiliKisiler",
                  as: "oneAktif",
                  cond: { $ne: ["$$oneAktif.yetki", "birimFiyatEdit"] }
                }
              }
            }
          }
        ])

      } catch (error) {
        throw new Error("tryCatch -2- " + error)
      }

    } else {

      try {

        await Proje.updateOne({ _id: _projeId }, [
          {
            $set: {
              birimFiyatVersiyon_isProgress: false,
              aktifYetkiliKisiler: {
                $filter: {
                  input: "$aktifYetkiliKisiler",
                  as: "oneAktif",
                  cond: { $ne: ["$$oneAktif.yetki", "birimFiyatEdit"] }
                }
              }
            }
          }
        ])

        return res.status(200).json({ message: "Son kayıtlı versiyon ile yeni kaydedilmek istenen versiyon arasında herhangi bir fark tespit edilemedi, kayıt işlemi iptal edildi." })

      } catch (error) {
        throw new Error("tryCatch -3- " + error)
      }

    }

    return res.status(200).json({ ok: true })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}



module.exports = {
  createVersiyon_metraj,
  createVersiyon_birimFiyat
}