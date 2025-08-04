const mongoose = require('mongoose')

const Schema = mongoose.Schema

const projeSchema = new Schema({
  pozName: {
    type: String,
    required: true
  },
  pozNo: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Proje', projeSchema)