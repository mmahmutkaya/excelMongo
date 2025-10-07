
const User = require('../models/userModel')


const requireMailTeyit = async (req, res, next) => {
  // verify user is authenticated
  const { email } = req.headers

  try {

    let user = await User.findOne({ email })

    if (user.mailTeyit) {
      next()
    } else {
      throw new Error('Email adresi teyit edilmemiş')
    }

  } catch (error) {
    res.status(401).json({ error: 'Email adresi teyit edilmemiş' })
  }
}

module.exports = requireMailTeyit