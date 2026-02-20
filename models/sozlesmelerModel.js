const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Sub-schema for contract versions
const sozlesmeVersiyonSchema = mongoose.Schema(
  {
    versiyonNumber: Number,
    aciklama: String,
    createdAt: Date,
    createdby: String
  }
)

// Sub-schema for contract signatories
const imzaciSchema = mongoose.Schema(
  {
    kiAdi: String,
    unvan: String, // Title/Position
    imzaTarihi: Date,
    email: String,
    notlar: String
  }
)

// Main sozlesmeler schema
const sozlesmeleSchema = new Schema(
  {
    _projeId: mongoose.ObjectId,
    _firmaId: mongoose.ObjectId,
    sozlesmeNo: String, // Contract number (unique identifier)
    sozlesmeName: String, // Contract title
    sozlesmeTipi: String, // Type: 'Taşeron', 'Tedarikçi', 'İnsan kaynağı', 'Tesaj', etc.
    taraf: String, // Contractor/Supplier name
    tarafEmail: String,
    tarafTelefon: String,
    tarafAdresi: String,

    // Contract dates
    baslangicTarihi: Date,
    bitisTarihi: Date,
    yenilenmeTarihi: Date, // Renewal date if applicable

    // Financial details
    sozlesmeAmount: Number, // Contract amount/value
    paraBirimi: String, // Currency (TRL, USD, EUR, etc.)
    odemeProgrami: String, // Payment schedule description

    // Status tracking
    durum: String, // Status: 'Aktif', 'Tamamlandı', 'Bekleme', 'Feshedildi', 'Sürüyor'
    ilk_onay: {
      onaylayan: String,
      onayTarihi: Date,
      onayDurumu: Boolean
    },
    final_onay: {
      onaylayan: String,
      onayTarihi: Date,
      onayDurumu: Boolean
    },

    // Signatories
    imzacilar: [imzaciSchema],

    // Versions
    sozlesmeVersiyonlar: [sozlesmeVersiyonSchema],

    // Additional data
    dosyaUrl: String, // URL to contract file/attachment
    ekler: [
      {
        ekName: String,
        ekUrl: String,
        ekTipi: String, // Type: 'PDF', 'Resim', 'Word', etc.
        yuklenmeTarihi: Date
      }
    ],

    // Notes and comments
    notlar: String,
    icNotlar: String, // Internal notes only visible to team

    // Audit trail
    createdBy: String,
    createdAt: Date,
    guncellenmeyi: Date,
    guncellenenKisi: String
  },
  {
    collection: 'sozlesmeler',
    versionKey: false
  }
)

// Add indexes for commonly searched fields
sozlesmeleSchema.index({ _projeId: 1 })
sozlesmeleSchema.index({ _firmaId: 1 })
sozlesmeleSchema.index({ sozlesmeNo: 1 })
sozlesmeleSchema.index({ durum: 1 })
sozlesmeleSchema.index({ baslangicTarihi: 1 })
sozlesmeleSchema.index({ bitisTarihi: 1 })
sozlesmeleSchema.index({ createdAt: 1 })

module.exports = mongoose.model('Sozlesmele', sozlesmeleSchema)
