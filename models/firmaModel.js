const mongoose = require('mongoose')

const Schema = mongoose.Schema

const firmaSchema = new Schema(
  {
    name: String,
    wbs:Array,
    lbs:Array,
    paraBirimleri: Array,
    pozMetrajTipleri: Array,
    pozBirimleri: Array,
    yetkiliKisiler: Array,
    createdAt: Date,
    createdBy: String
  },
  {
    collection: 'firmalar',
    versionKey: false
  }
)

module.exports = mongoose.model('Firma', firmaSchema)