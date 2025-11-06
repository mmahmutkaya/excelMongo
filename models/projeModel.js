const mongoose = require('mongoose')

const Schema = mongoose.Schema

const isPaketBaslikSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    aciklama: String,
    isPaketleri: Array,
    createdBy: String,
    createdAt: Date
  }
)

const isPaketVersiyonSchema = mongoose.Schema(
  {
    versiyon: Number,
    basliklar: [isPaketBaslikSchema]
  }
)

const projeSchema = new Schema(
  {
    _firmaId: mongoose.ObjectId,
    name: String,
    wbs: Array,
    lbs: Array,
    paraBirimleri: Array,
    isPaketVersiyonlar: [isPaketVersiyonSchema],
    pozMetrajTipleri: Array,
    pozBirimleri: Array,
    yetkiliKisiler: Array,
    yetkiliFirmalar: Array,
    metrajVersiyonlar: Array,
    createdBy: String,
    createdAt: Date
  },
  {
    collection: 'projeler',
    versionKey: false
  }
)

module.exports = mongoose.model('Proje', projeSchema)