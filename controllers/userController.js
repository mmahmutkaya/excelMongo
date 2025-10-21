const User = require('../models/userModel')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')


// signup a user
const signupUser = async (req, res) => {

  const hataBase = "BACKEND - (signupUser) - "

  try {

    const { email, password } = req.body

    const result = await User.signup(email, password)

    if (result.errorObject) {
      return res.status(200).json({ errorObject: result.errorObject })
    }

    if (result.user) {
      return res.status(200).json({ user: result.user })
    }

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }
}



// login a user
const loginUser = async (req, res) => {

  const hataBase = "BACKEND - (loginUser) - "

  try {

    const { email, password } = req.body


    const result = await User.login(email, password)

    if (result.errorObject) {
      return res.status(200).json({ errorObject: result.errorObject })
    }

    if (result.user) {
      return res.status(200).json({ user: result.user })
    }

  } catch (error) {
    return res.status(401).json({ error: hataBase + error })
  }
}




// send mail code
const sendMailCode = async (req, res) => {

  const hataBase = "BACKEND - (sendMailCode) - "

  try {

    const { email: userEmail } = req.headers

    if (!userEmail) {
      throw new Error("Sorguya 'email' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

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

    return res.status(200).json("Mail adresinize gelen kodu giriniz.")

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}





// confirm mail code
const confirmMailCode = async (req, res) => {

  const hataBase = "BACKEND - (confirmMailCode) - "

  try {

    const { email: userEmail } = req.headers
    const { mailCode } = req.body


    // aslında requireAuth dan geçti, bu kontole gerek yok
    if (!userEmail) {
      throw new Error("Sorguya 'email' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (typeof mailCode !== "string") {
      throw new Error("Sorguya 'mailCode' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

    if (mailCode.length < 1) {
      return res.status(200).json({ errorObject: { mailCodeError: "Boş bırakılamaz" } })
    }


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

      const token = jwt.sign({ email: user2.email }, process.env.SECRET, { expiresIn: '7d' })
      user2.token = token
      user2.mailTeyit = true

      return res.status(200).json({ user: user2 })

    } else {
      return res.status(200).json({ errorObject: { mailCodeError: "Kod eşleşmedi" } })
    }


  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}




// confirm mail code
const saveNecessaryUserData = async (req, res) => {

  const hataBase = "BACKEND - (saveNecessaryUserData) - "

  try {

    const { email } = req.headers
    const { isim, soyisim } = req.body

    if (!email) {
      throw new Error("Sorguya 'email' gönderilmemiş, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile irtibata geçiniz.")
    }

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
      return res.status(200).json({ errorObject })
    }



    let userCode = isim.substring(0, 2) + soyisim.substring(0, 2)

    const users = await User.find({}, { userCode: 1 })


    if (users.length) {

      let benzerVar
      let maxNumber = 0

      users.map(oneUser => {

        let oneCode = oneUser.userCode

        if (oneCode?.substring(0, 4) === userCode) {

          benzerVar = true
          let theNumber = parseInt(oneCode.substring(4, oneCode.length))
          if (theNumber > maxNumber) {
            maxNumber = theNumber
          }

        }

      })

      if (benzerVar) {
        userCode = userCode + (parseInt(maxNumber) + 1)
      }

    }

    let user = await User.findOneAndUpdate(
      { email },
      { $set: { isim, soyisim, userCode } },
      { new: true }
    )

    if (user) {

      let user2 = JSON.parse(JSON.stringify(user))

      delete user2.password
      delete user2.mailConfirmationKod

      const token = jwt.sign({ email: user2.email }, process.env.SECRET, { expiresIn: '7d' })
      user2.token = token
      user2.mailTeyit = true

      return res.status(200).json({ user: user2 })

    } else {
      throw new Error("Kullanıcı bulunamadı, sayfayı yenileyiniz, sorun devam ederse Rapor7/24 ile iletişime geçiniz.")
    }

  } catch (error) {
    return res.status(400).json({ error: hataBase + error })
  }

}




module.exports = { signupUser, loginUser, sendMailCode, confirmMailCode, saveNecessaryUserData }