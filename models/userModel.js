const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
})

// static signup method
userSchema.statics.signup = async function (email, password) {


  const errorObject = {}
  // errorObject.emailError = null
  // errorObject.passwordError = null


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

  return { user }
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
  const user = await this.findOne({ email })
  if (!user && !errorObject.emailError) {
    errorObject.emailError = 'Bu email adresi sistemde kayıtlı değil.'
  }

  // hata kontrol - 2
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }


  //  // errorObject kontrol - 3 - password doğru mu?
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    errorObject.passwordError = 'Hatalı şifre'
  }
  // hata kontrol - 3
  if (Object.keys(errorObject).length) {
    return ({ errorObject })
  }


  // hata yok demekki 
  return { user }
}

module.exports = mongoose.model('User', userSchema)