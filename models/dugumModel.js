const mongoose = require('mongoose')

const Schema = mongoose.Schema

const satirSchema = mongoose.Schema(
  {
    "satirNo": String,
    "aciklama": String,
    "carpan1": Number,
    "carpan2": Number,
    "carpan3": Number,
    "carpan4": Number,
    "carpan5": Number,
    "metraj": Number,
    "isPreparing": Boolean,
    "isReady": Boolean,
    "isSelected":Boolean,
    "hasSelectedCopy":Boolean,
    "versiyon":Number,
  }
)

const hazirlananMetrajSchema = mongoose.Schema(
  {
    "userEmail": String,
    "metrajPreparing": Number,
    "metrajReady": Number,
    "metrajOnaylanan": Number,
    "isReady":Boolean,
    "isSelected":Boolean,
    "satirlar": [satirSchema]
  }
)

const revizeMetrajSchema = mongoose.Schema(
  {
    "satirNo":String,
    "isPreparing":Boolean,
    "isReady":Boolean,
    "isPreparing":Boolean,
    "satirlar":Array
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
    metrajVersiyonlari: Array
  },
  {
    collection: 'dugumler',
    versionKey: false
  }
)

module.exports = mongoose.model('Dugum', dugumSchema)