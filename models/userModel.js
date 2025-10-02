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
userSchema.statics.signup = async function(email, password) {

  // validation
  if (!email || !password) {
    throw Error('Tüm alanlar doldurulmalıdır.')
  }
  if (!validator.isEmail(email)) {
    throw Error('Bu email adresi kayıtlı değil.')
  }
  if (!validator.isStrongPassword(password)) {
    throw Error('Şifre güvenliği için 8 hane,büyük harf, küçük harf ve karakter kullanınız')
  }

  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('Email already in use')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ email, password: hash })

  return user
}

// static login method
userSchema.statics.login = async function(email, password) {

  if (!email || !password) {
    throw Error('Tüm alanlar doldurulmalıdır.')
  }

  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Email adresini kontrol ediniz')
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw Error('Hatalı şifre')
  }

  return user
}

module.exports = mongoose.model('User', userSchema)