const mongoose = require('mongoose')

const Schema = mongoose.Schema

const isPaketSchema = new Schema(
  {
    _projeId:mongoose.Schema.Types.ObjectId,
    versiyon: Number,
    isPaketler:Array
  },
  {
    collection: 'ispaketler',
    versionKey: false
  }
)

module.exports = mongoose.model('IsPaket', isPaketSchema)