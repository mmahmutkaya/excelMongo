const mongoose = require('mongoose')

const Schema = mongoose.Schema

const firmaSchema = new Schema(
  {
    name: String,
    paraBirimleri: Array,
    pozMetrajTipleri: Array,
    pozBirimleri: Array,
    yetkiliKisiler: Array,
    createdAt: Date,
    createdBy: String,

  },
  {
    timestamps: true,
    collection: 'firmalar',
    versionKey: false
  }
)

module.exports = mongoose.model('Firma', firmaSchema)