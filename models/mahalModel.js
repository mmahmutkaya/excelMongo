const mongoose = require('mongoose')

const Schema = mongoose.Schema

const mahalSchema = new Schema(
  {
    _firmaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    _projeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    _lbsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    mahalNo: {
      type: String,
      required: true
    },
    mahalName: {
      type: String,
      required: true
    }
  },
  {
    collection: 'mahaller',
    versionKey: false
  }
)

module.exports = mongoose.model('Mahal', mahalSchema)