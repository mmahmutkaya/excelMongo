const Dugum = require('../models/dugumModel')
const Proje = require('../models/projeModel')
const Poz = require('../models/pozModel')
const Mahal = require('../models/mahalModel')


const mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectId;




const createVersiyon_metraj = async (req, res) => {

  const hataBase = "BACKEND - (createVersiyon_metraj) - "

  try {

    const currentTime = new Date();

    const {
      email: userEmail,
      isim: userIsim,
      soyisim: userSoyisim,
      userCode
    } = JSON.parse(req.user)

    const { projeId } = req.body

    if (!projeId) {
      throw new Error("'projeId' verisi db sorgusuna gelmedi");
    }

    let _projeId
    try {
      _projeId = new ObjectId(projeId)
    } catch (error) {
      throw new Error("DB ye gönderilen 'projeId' verisi geçerli bir BSON ObjectId verisine dönüşemedi, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }


    let proje = await Proje.findOne({ _id: _projeId })
    const { metrajVersiyonlar } = proje



    // aşağıda else kısmında değişebiliyor
    let versiyonNumber = 1

    try {


      if (!metrajVersiyonlar) {

        Proje.updateOne({ _id: _projeId }, [
          {
            $set: {
              metrajVersiyonlar: [{ versiyonNumber, createdAt: currentTime }]
            }
          }
        ])

      } else {

        metrajVersiyonlar.map(oneVersiyon => {
          if (oneVersiyon.versiyonNumber >= versiyonNumber) {
            versiyonNumber = oneVersiyon.versiyonNumber + 1
          }
        })

        await Proje.updateOne({ _id: _projeId }, [
          {
            $set: {
              metrajVersiyonlar: {
                $concatArrays: [
                  "$metrajVersiyonlar",
                  [{ versiyonNumber, createdAt: currentTime }]
                ]
              }
            }
          }
        ])

      }



    } catch (error) {
      throw new Error("tryCatch -1- " + error);
    }



    try {

      await Dugum.updateMany({ _projeId }, [
        {
          $set: {
            hazirlananMetrajlar: {
              $map: {
                input: "$hazirlananMetrajlar",
                as: "oneHazirlanan",
                in: {
                  $mergeObjects: [
                    "$$oneHazirlanan",
                    {
                      satirlar: {
                        $map: {
                          input: "$$oneHazirlanan.satirlar",
                          as: "oneSatir",
                          in: {
                            $cond: {
                              if: { $eq: ["$$oneSatir.versiyon", 0] },
                              else: "$$oneSatir",
                              then: {
                                $mergeObjects: [
                                  "$$oneSatir",
                                  { versiyon: versiyonNumber }
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            revizeMetrajlar: {
              $map: {
                input: "$revizeMetrajlar",
                as: "oneMetraj",
                in: {
                  $mergeObjects: [
                    "$$oneMetraj",
                    {
                      satirlar: {
                        $map: {
                          input: "$$oneMetraj.satirlar",
                          as: "oneSatir",
                          in: {
                            $cond: {
                              if: { $eq: ["$$oneSatir.versiyon", 0] },
                              else: "$$oneSatir",
                              then: {
                                $mergeObjects: [
                                  "$$oneSatir",
                                  { versiyon: versiyonNumber }
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            },
            metrajVersiyonlar: { $concatArrays: ["$metrajVersiyonlar", [{ versiyonNumber, metrajOnaylanan: "$metrajOnaylanan" }]] }
          }
        }
      ])


    } catch (error) {
      throw new Error("tryCatch -2- " + error);
    }

    await proje.metrajVersiyonlar.push({ versiyonNumber, createdAt: currentTime })

    return res.status(200).json({ proje })

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}






module.exports = {
  createVersiyon_metraj
}