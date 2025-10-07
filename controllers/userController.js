const User = require('../models/userModel')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')


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
      res.status(200).json({ user: result.user })
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
      res.status(200).json({ user: result.user })
      return
    }

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}




// send mail code
const sendMailCode = async (req, res) => {

  const { email: userEmail } = req.headers

  try {

    //  kod oluşturma
    let mailConfirmationKod = ''
    let length = 6 // kod üretilecek hane sayısı
    var characters = '123456789';
    // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      mailConfirmationKod += characters.charAt(Math.floor(Math.random() * charactersLength));
    }


    //  kodu user db ye kaydetme
    await User.updateOne(
      { email: userEmail },
      { $set: { mailConfirmationKod, mailTeyit: false } }
    );



    // kodu mail atma
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'excel.edu.v1@gmail.com',
        pass: 'bilxoukdqeypmwgk'
      }
    });
    const mailOptions = {
      to: userEmail,
      subject: "Rapor 7/24 - Mail Doğrulama Kodu",
      text: "Mail Doğrulama Kodunuz - " + mailConfirmationKod
    }
    await transporter.sendMail(mailOptions)

    res.status(200).json("Mail adresinize gelen kodu giriniz.")

  } catch (error) {
    res.status(400).json({ error: error.message })
  }

}





// confirm mail code
const confirmMailCode = async (req, res) => {

  const { email: userEmail } = req.headers
  const { mailCode } = req.body

  try {

    //  kodu user db ye kaydetme
    let user = await User.findOne(
      { email: userEmail }
    )


    if (user.mailConfirmationKod === mailCode) {

      await User.updateOne(
        { email: userEmail },
        { $set: { mailTeyit: true } }
      )

      // password eşleşti
      let user2 = JSON.parse(JSON.stringify(user))

      delete user2.password
      delete user2.mailConfirmationKod

      const token = jwt.sign({ email: user2.email }, process.env.SECRET, { expiresIn: '3d' })
      user2.token = token
      user2.mailTeyit = true

      res.status(200).json({ user: user2 })

    } else {
      res.status(200).json({ errorObject: { mailCodeError: "Kod eşleşmedi" } })
    }


  } catch (error) {
    res.status(400).json({ error: error.message })
  }

}




// confirm mail code
const saveNecessaryUserData = async (req, res) => {

  const { email } = req.headers
  const { isim, soyisim } = req.body

  const errorObject = {}


  //  errorObject kontrol-1 - gelen veriler uygun mu?

  // emailError - 1
  if (!isim && !errorObject.isimError) {
    errorObject.isimError = "Boş bırakılamaz."
  }
  if (isim.length < 2 && !errorObject.isimError) {
    errorObject.isimError = "Çok kısa"
  }

  // soyisimError - 1
  if (!soyisim && !errorObject.soyisimError) {
    errorObject.soyisimError = "Boş bırakılamaz."
  }
  if (soyisim.length < 2 && !errorObject.soyisimError) {
    errorObject.soyisimError = "Çok kısa"
  }

  // hata kontrol - 1
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }



  try {

    let user = await User.findOneAndUpdate(
      { email },
      { $set: { isim, soyisim } },
      { new: true }
    )

    if (user) {

      // password eşleşti
      let user2 = JSON.parse(JSON.stringify(user))

      delete user2.password
      delete user2.mailConfirmationKod

      const token = jwt.sign({ email: user2.email }, process.env.SECRET, { expiresIn: '3d' })
      user2.token = token
      user2.mailTeyit = true

      res.status(200).json({ user: user2 })

    } else {
      res.status(400).json({ error: "user not found" })
    }

  } catch (error) {
    res.status(400).json({ error: error.message })
  }

}




module.exports = { signupUser, loginUser, sendMailCode, confirmMailCode, saveNecessaryUserData }