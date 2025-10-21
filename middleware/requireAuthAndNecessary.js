const jwt = require('jsonwebtoken')
const User = require('../models/userModel')


const requireAuthAndNecessary = async (req, res, next) => {

  const hataBase = "BACKEND - (requireAuthAndNecessary) - "

  // verify user is authenticated

  try {

    const { email: req_email, token } = req.headers

    if (!req_email) {
      throw new Error('Request HEADER, "email" eksik')
    }

    if (!token) {
      throw new Error('Request HEADER da "token" yok')
    }

    const { email } = jwt.verify(token, process.env.SECRET)

    if (email !== req_email) {
      throw new Error('Request HEADER "token" geçerli değil')
    }

    let user = await User.findOne({ email })
    req.user = JSON.stringify(user)

    if (!user.mailTeyit) {
      throw new Error('Kullanıcı email adresi teyit edilmemiş')
    }

    if (!user.isim) {
      throw new Error('Kullanıcı "isim" kayıtlı değil')
    }

    if (!user.soyisim) {
      throw new Error('Kullanıcı "soyisim" kayıtlı değil')
    }

    if (!user.userCode) {
      throw new Error('Kullanıcı "userCode" kayıtlı değil')
    }

    next()

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }
}

module.exports = requireAuthAndNecessary