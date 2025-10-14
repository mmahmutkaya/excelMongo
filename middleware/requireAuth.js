const jwt = require('jsonwebtoken')

const requireAuth = async (req, res, next) => {

  const hataBase = "BACKEND - (requireAuthAndNecessary) - "

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