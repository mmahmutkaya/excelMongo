const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pozSchema = new Schema(
  {
    _firmaId: mongoose.Schema.Types.ObjectId,
    _projeId:mongoose.Schema.Types.ObjectId,
    _wbsId:mongoose.Schema.Types.ObjectId,
    pozNo: String,
    pozName:String,
    pozBirimId: String,
    pozMetrajTipId: String
  },
  {
    collection: 'pozlar',
    versionKey: false
  }
)

module.exports = mongoose.model('Poz', pozSchema)