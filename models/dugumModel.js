const mongoose = require('mongoose')

const Schema = mongoose.Schema

const dugumSchema = new Schema(
  {
    _projeId: mongoose.Schema.Types.ObjectId,
    _mahalId: mongoose.Schema.Types.ObjectId,
    _pozId: mongoose.Schema.Types.ObjectId,
    openMetraj: Boolean,
    isDeleted: Boolean,
    hazirlananMetrajlar: Array,
    revizeMetrajlar: Array,
    metrajVersiyonlari: Array
  },
  {
    collection: 'dugumler',
    versionKey: false
  }
)

module.exports = mongoose.model('Dugum', dugumSchema)