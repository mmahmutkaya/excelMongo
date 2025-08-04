const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pozSchema = new Schema({
  _firmaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _projeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  _wbsId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  pozNo: {
    type: String,
    required: true
  },
  pozName: {
    type: String,
    required: true
  },
  pozBirimId: {
    type: String,
    required: true
  },
  pozMetrajTipId: {
    type: String,
    required: true
  }
}, { timestamps: true, collection: 'pozlar' })

module.exports = mongoose.model('Poz', pozSchema)