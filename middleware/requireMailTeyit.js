
const User = require('../models/userModel')


const requireMailTeyit = async (req, res, next) => {

  const hataBase = "BACKEND - (requireMailTeyit) - "

  try {

    const { email } = req.headers

    let user = await User.findOne({ email })

    if (user.mailTeyit) {
      next()
    } else {
      throw new Error('Email adresi teyit edilmemiş')
    }

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }
}

module.exports = requireMailTeyit