const mongoose = require('mongoose')

const Schema = mongoose.Schema


// SATIRLAR

const satirSchema = mongoose.Schema(
  {
    "satirNo": String,
    "originalSatirNo": String,
    "aciklama": String,
    "carpan1": String,
    "carpan2": String,
    "carpan3": String,
    "carpan4": String,
    "carpan5": String,
    "metraj": String,
    "isPreparing": Boolean,
    "isReady": Boolean,
    "isReadyUnSeen": Boolean,
    "isSelected": Boolean,
    "hasSelectedCopy": Boolean,
    "isSelectedCopy": Boolean,
    "isFirstCopy": Boolean,
    "isLastCopy": Boolean,
    "isPasif": Boolean,
    "pasifEdilenVersiyon": Number,
    "versiyon": Number,
    "dizi": String,
  }
)

const revizeSatirSchema = mongoose.Schema(
  {
    "satirNo": String,
    "originalSatirNo": String,
    "aciklama": String,
    "carpan1": String,
    "carpan2": String,
    "carpan3": String,
    "carpan4": String,
    "carpan5": String,
    "metraj": String,
    "isPreparing": Boolean,
    "isReady": Boolean,
    "isReadyUnSeen": Boolean,
    "isSelected": Boolean,
    "hasSelectedCopy": Boolean,
    "isSelectedCopy": Boolean,
    "isFirstCopy": Boolean,
    "isLastCopy": Boolean,
    "isPasif": Boolean,
    "pasifEdilenVersiyon": Number,
    "versiyon": Number,
    "dizi": String,
    "userEmail": String
  }
)




const hazirlananMetrajSchema = mongoose.Schema(
  {
    "userEmail": String,
    "metrajPreparing": Number,
    "metrajReady": Number,
    "metrajOnaylanan": Number,
    "isReady": Boolean,
    "isSelected": Boolean,
    "satirlar": [satirSchema]
  }
)


const revizeMetrajSchema = mongoose.Schema(
  {
    "satirNo": String,
    "isPreparing": Boolean,
    "isReady": Boolean,
    "isSelected": Boolean,
    "satirlar": [revizeSatirSchema]
  }
)

// const isPaketSchema = mongoose.Schema(
//   {
//     _id: mongoose.Schema.Types.ObjectId,
//     selected: Boolean
//   }
// )


// const isPaketSchema = mongoose.Schema(
//   {
//     _id: mongoose.Schema.Types.ObjectId,
//   }
// )

const isPaketVersiyonSchema = mongoose.Schema(
  {
    versiyon: Number,
    isPaketler: Array,
    _id: { id: false }
  }
)


const dugumSchema = new Schema(
  {
    _projeId: mongoose.Schema.Types.ObjectId,
    _mahalId: mongoose.Schema.Types.ObjectId,
    _pozId: mongoose.Schema.Types.ObjectId,
    openMetraj: Boolean,
    isDeleted: Boolean,
    hazirlananMetrajlar: [hazirlananMetrajSchema],
    revizeMetrajlar: [revizeMetrajSchema],
    isPaketler: Array,
    metrajVersiyonlar: Array,
    isPaketVersiyonlar: [isPaketVersiyonSchema]
  },
  {
    collection: 'dugumler',
    versionKey: false
  }
)

module.exports = mongoose.model('Dugum', dugumSchema)