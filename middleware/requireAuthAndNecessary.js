const jwt = require('jsonwebtoken')
const User = require('../models/userModel')


const requireAuthAndNecessary = async (req, res, next) => {
  // verify user is authenticated
  const { email: req_email, token } = req.headers

  const hataBase = "BACKEND - requireAuthAndNecessary - "

  try {

    if (!req_email) {
      throw new Error('Request HEADER, "email" eksik')
    }

    if (!token) {
      throw new Error('BACKEND - Request HEADER da "token" yok')
    }

    const { email } = jwt.verify(token, process.env.SECRET)

    if (email !== req_email) {
      throw new Error('BACKEND - Request HEADER "token" geçerli değil')
    }

    let user = await User.findOne({ email })

    if (!user.mailTeyit) {
      throw new Error('BACKEND - Kullanıcı email adresi teyit edilmemiş')
    }

    if (!user.isim) {
      throw new Error('BACKEND - Kullanıcı "isim" kayıtlı değil')
    }

    if (!user.soyisim) {
      throw new Error('BACKEND - Kullanıcı "soyisim" kayıtlı değil')
    }

    next()

  } catch (error) {
    res.status(401).json({ error: hataBase + error.message })
    return
  }
}

module.exports = requireAuthAndNecessary