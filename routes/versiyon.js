const express = require('express')

const {
  createVersiyon_metraj,
  createVersiyon_birimFiyat,
  getIsPaketler_byVersiyon
} = require('../controllers/versiyonController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


// kullanıcı yetki sorgulama ve sorgunun devamına kullanıcı bilgilerini yükleme
router.use(requireAuthAndNecessary)



//  VERSİYONLAR
router.post('/metraj', createVersiyon_metraj)
router.post('/birimfiyat', createVersiyon_birimFiyat)

// GET (POST)
router.post('/getispaketlerbyversiyon', getIsPaketler_byVersiyon)




module.exports = router