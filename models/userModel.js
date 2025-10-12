const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    mailConfirmationKod: {
      type: String
    },
    mailTeyit: {
      type: Boolean
    },
    isim: {
      type: String
    },
    soyisim: {
      type: String
    }
  },
  {
    versionKey: false
  }
)



// static signup method
userSchema.statics.signup = async function (email, password) {


  const errorObject = {}

  // emailError
  if (!email && !errorObject.emailError) {
    errorObject.emailError = "Boş bırakılamaz."
  }
  if (!validator.isEmail(email) && !errorObject.emailError) {
    errorObject.emailError = 'Email adresini doğru giriniz.'
  }
  const exists = await this.findOne({ email })
  if (exists && !errorObject.emailError) {
    errorObject.emailError = "Bu email adresi sistemde kayıtlı."
  }



  // passwordError
  if (!password && !errorObject.passwordError) {
    errorObject.passwordError = "Boş bırakılamaz."
  }
  if (!validator.isStrongPassword(password)) {
    errorObject.passwordError = '8 hane, büyük harf, küçük harf ve karakter'
  }


  // hata kontrol
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }


  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ email, password: hash })

  // kullanıcı kaydedildi ise
  let user2 = JSON.parse(JSON.stringify(user))

  delete user2.password

  const token = jwt.sign({ email: user2.email }, process.env.SECRET, { expiresIn: '3d' })
  user2.token = token

  // hata yok demekki 
  return { user: user2 }

}




// static login method
userSchema.statics.login = async function (email, password) {


  const errorObject = {}

  //  errorObject kontrol-1 - gelen veriler uygun mu?

  // emailError - 1
  if (!email && !errorObject.emailError) {
    errorObject.emailError = "Boş bırakılamaz."
  }
  if (!validator.isEmail(email) && !errorObject.emailError) {
    errorObject.emailError = 'Email adresini doğru giriniz.'
  }

  // passwordError - 1
  if (!password && !errorObject.passwordError) {
    errorObject.passwordError = "Boş bırakılamaz."
  }

  // hata kontrol - 1
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }



  // errorObject kontrol - 2 - user var mı ?
  // emailError
  let user = await this.findOne({ email })
  if (!user && !errorObject.emailError) {
    errorObject.emailError = 'Bu email adresi sistemde kayıtlı değil.'
  }

  // hata kontrol - 2
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }


  // errorObject kontrol - 3 - password doğru mu?
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    errorObject.passwordError = 'Hatalı şifre'
  }
  // hata kontrol - 3
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }

  // password eşleşti
  let user2 = JSON.parse(JSON.stringify(user))

  delete user2.password
  delete user2.mailConfirmationKod

  const token = jwt.sign({ email: user2.email }, process.env.SECRET, { expiresIn: '5000' })
  user2.token = token

  // hata yok demekki 
  return { user: user2 }
}

module.exports = mongoose.model('User', userSchema)