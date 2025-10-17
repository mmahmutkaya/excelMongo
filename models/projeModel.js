const mongoose = require('mongoose')

const Schema = mongoose.Schema

const projeSchema = new Schema(
  {
    _firmaId:mongoose.ObjectId,
    name: String,
    wbs: Array,
    lbs: Array,
    paraBirimleri: Array,
    isPaketBasliklari: Array,
    isPaketleri: Array,
    pozMetrajTipleri:Array,
    pozBirimleri:Array,
    yetkiliKisiler: Array,
    yetkiliFirmalar: Array,
    createdBy: String,
    createdAt: Date
  },
  {
    collection: 'projeler',
    versionKey: false
  }
)

module.exports = mongoose.model('Proje', projeSchema)