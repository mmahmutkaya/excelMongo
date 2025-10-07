const jwt = require('jsonwebtoken')
const User = require('../models/userModel')


const requireAuthAndNecessary = async (req, res, next) => {
  // verify user is authenticated
  const { email: req_email, token } = req.headers

  if (!req_email) {
    res.status(401).json({ error: 'Header without email' })
    return
  }

  if (!token) {
    res.status(401).json({ error: 'Header without token' })
    return
  }

  try {

    const { email } = jwt.verify(token, process.env.SECRET)

    if (email !== req_email) {
      res.status(401).json({ error: 'Token is not valid' })
      return
    }

    let user = await User.findOne({ email })

    if (!user.mailTeyit) {
      res.status(401).json({ error: 'Email adresi teyit edilmemiş' })
      return
    }

    if (!user.isim) {
      res.status(401).json({ error: 'İsim girilmemiş' })
      return
    }

    if (!user.soyisim) {
      res.status(401).json({ error: 'Soyisim girilmemiş' })
      return
    }

    next()

  } catch (error) {
    res.status(401).json({ error: 'Not authorized or incomplete data' })
    return
  }
}

module.exports = requireAuthAndNecessary