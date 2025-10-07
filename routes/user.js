const express = require('express')

// controller functions
const { loginUser, signupUser, sendMailCode, confirmMailCode, saveNecessaryUserData } = require('../controllers/userController')

const router = express.Router()
const requireAuth = require('../middleware/requireAuth')
const requireMailTeyit = require('../middleware/requireMailTeyit')


// signup route
router.post('/signup', signupUser)

// login route
router.post('/login', loginUser)




router.use(requireAuth)


// send mail code
router.post('/sendmailcode', sendMailCode)

// confirm mail code
router.post('/confirmmailcode', confirmMailCode)




router.use(requireMailTeyit)


// saveNecessaryUserData
router.post('/savenecessaryuserdata', saveNecessaryUserData)


module.exports = router