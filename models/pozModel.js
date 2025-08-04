const mongoose = require('mongoose')

const Schema = mongoose.Schema

const pozSchema = new Schema({
  pozName: {
    type: String,
    required: true
  },
  pozNo: {
    type: String,
    required: true
  }
}, { timestamps: true, collection: 'pozlar' })

module.exports = mongoose.model('Poz', pozSchema)