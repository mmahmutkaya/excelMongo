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
    "isReady": Boolean
  }
)

const hazirlananMetrajSchema = mongoose.Schema(
  {
    "userEmail": String,
    "metrajPreparing": Number,
    "metrajReady": Number,
    "metrajOnaylanan": Number,
    "satirlar": [satirSchema]
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
    revizeMetrajlar: Array,
    metrajVersiyonlari: Array
  },
  {
    collection: 'dugumler',
    versionKey: false
  }
)

module.exports = mongoose.model('Dugum', dugumSchema)