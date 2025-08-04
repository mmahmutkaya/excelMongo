const mongoose = require('mongoose')

const Schema = mongoose.Schema

const projeSchema = new Schema({
  
}, { timestamps: true, collection: 'projeler' })

module.exports = mongoose.model('Proje', projeSchema)