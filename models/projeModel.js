const mongoose = require('mongoose')

const Schema = mongoose.Schema

const projeSchema = new Schema(
  {
    _firmaId:mongoose.ObjectId,
    name: String,
    wbs: Array,
    lbs: Array,
    paraBirimleri: Array,
    isPaketBasliklari: Array,
    isPaketleri: Array,
    // pozMetrajTipleri,
    // pozBirimleri,
    // // yetkiliKisiler: [{ email: userEmail, yetki: "owner" }],
    // yetkiliFirmalar: [{ _firmaId, yetki: "owner" }],
    // // createdBy: userEmail,
    // createdAt: currentTime,
    // isDeleted: false
  },
  {
    timestamps: true,
    collection: 'projeler',
    versionKey: false
  }
)

module.exports = mongoose.model('Proje', projeSchema)