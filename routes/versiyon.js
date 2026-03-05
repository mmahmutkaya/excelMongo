const express = require('express')

const {
  createVersiyon_metraj,
  createVersiyon_birimFiyat,
  createVersiyon_isPaket,
  createVersiyon_butce,
} = require('../controllers/versiyonController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


// kullanıcı yetki sorgulama ve sorgunun devamına kullanıcı bilgilerini yükleme
router.use(requireAuthAndNecessary)



//  VERSİYONLAR
router.post('/metraj', createVersiyon_metraj)
router.post('/birimfiyat', createVersiyon_birimFiyat)
router.post('/ispaket', createVersiyon_isPaket)
router.post('/butce', createVersiyon_butce)



module.exports = router