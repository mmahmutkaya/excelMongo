const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' })
}

// signup a user
const signupUser = async (req, res) => {

  const { email, password } = req.body

  try {
    const result = await User.signup(email, password)

    if (result.errorObject) {
      res.status(200).json({ errorObject: result.errorObject })
      return
    }

    if (result.user) {
      const token = jwt.sign({ email: result.user.email }, process.env.SECRET, { expiresIn: '3d' })
      res.status(200).json({ email, token })
      return
    }

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}



// login a user
const loginUser = async (req, res) => {

  const { email, password } = req.body

  try {

    const result = await User.login(email, password)

    if (result.errorObject) {
      res.status(200).json({ errorObject: result.errorObject })
      return
    }

    if (result.user) {
      const token = jwt.sign({ email: result.user.email }, process.env.SECRET, { expiresIn: '3d' })
      res.status(200).json({ email, token })
      return
    }

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}


module.exports = { signupUser, loginUser }