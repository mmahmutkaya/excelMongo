const express = require('express')

const {
  createVersiyon_metraj
} = require('../controllers/versiyonController')

const requireAuthAndNecessary = require('../middleware/requireAuthAndNecessary')

const router = express.Router()


// kullanıcı yetki sorgulama ve sorgunun devamına kullanıcı bilgilerini yükleme
router.use(requireAuthAndNecessary)



//  VERSİYONLAR
router.post('/metraj', createVersiyon_metraj)




module.exports = router