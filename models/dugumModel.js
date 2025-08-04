const mongoose = require('mongoose')

const Schema = mongoose.Schema

const dugumSchema = new Schema({

}, { collection: 'dugumler' })

module.exports = mongoose.model('Dugum', dugumSchema)