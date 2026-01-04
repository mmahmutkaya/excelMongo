const mongoose = require('mongoose')

const Schema = mongoose.Schema

// const isPaketSchema = mongoose.Schema(
//   {
//     _id: mongoose.Schema.Types.ObjectId,
//     name: String,
//     isActive:Boolean,
//     aciklama: String,
//     createdBy: String,
//     createdAt: Date
//   }
// )

// const isPaketVersiyonSchema = mongoose.Schema(
//   {
//     versiyon: Number,
//     isPaketler: [isPaketSchema]
//   }
// )

const projeSchema = new Schema(
  {
    _firmaId: mongoose.ObjectId,
    name: String,
    wbs: Array,
    lbs: Array,
    paraBirimleri: Array,
    isPaketler:Array,
    isPaketVersiyonlar: Array,
    pozMetrajTipleri: Array,
    pozBirimleri: Array,
    yetkiliKisiler: Array,
    aktifYetkiliKisiler:Array,
    yetkiliFirmalar: Array,
    metrajVersiyonlar: Array,
    birimFiyatVersiyonlar: Array,
    createdBy: String,
    createdAt: Date
  },
  {
    collection: 'projeler',
    versionKey: false
  }
)

module.exports = mongoose.model('Proje', projeSchema)