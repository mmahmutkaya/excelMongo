const jwt = require('jsonwebtoken')

const requireAuth = async (req, res, next) => {

  const hataBase = "BACKEND - (requireAuthAndNecessary) - "

  try {

    // verify user is authenticated
    const { email: req_email, token } = req.headers

    if (!req_email) {
      throw new Error('Header without email')
    }

    if (!token) {
      throw new Error('Header without token')
    }

    const { email } = jwt.verify(token, process.env.SECRET)

    if (email === req_email) {
      next()
    } else {
      throw new Error('Request is not authorized')
    }

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }
}

module.exports = requireAuth