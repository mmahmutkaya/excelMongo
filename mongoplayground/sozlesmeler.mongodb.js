// MongoDB Playground - Sozlesmeler Collection Examples
// Database: rapor724_v2

// ============================================
// 1. CREATE - Insert a new contract
// ============================================
db.sozlesmeler.insertOne({
  _projeId: ObjectId("YOUR_PROJE_ID_HERE"),
  _firmaId: ObjectId("YOUR_FIRMA_ID_HERE"),
  sozlesmeNo: "SZ-2025-001",
  sozlesmeName: "Ana Taşeron Sözleşmesi",
  sozlesmeTipi: "Taşeron",
  taraf: "ABC İnşaat A.Ş.",
  tarafEmail: "contact@abc.com.tr",
  tarafTelefon: "+90 212 123 4567",
  tarafAdresi: "İstanbul, Türkiye",
  baslangicTarihi: new Date("2025-01-01"),
  bitisTarihi: new Date("2025-12-31"),
  sozlesmeAmount: 500000,
  paraBirimi: "TRL",
  odemeProgrami: "3 taksit - başlangıç, ara, bitiş",
  durum: "Aktif",
  dosyaUrl: "https://example.com/sozlesmeler/SZ-2025-001.pdf",
  notlar: "Ana sözleşme",
  icNotlar: "Dahili not: Para ödeme güncellenecek",
  imzacilar: [
    {
      kiAdi: "Mahmut Yaya",
      unvan: "Proje Müdürü",
      imzaTarihi: new Date("2025-01-15"),
      email: "mahmut@example.com",
      notlar: "İmzalandı"
    }
  ],
  sozlesmeVersiyonlar: [],
  createdBy: "user@example.com",
  createdAt: new Date(),
  guncellemeTarihi: null,
  guncellenenKisi: null
})

// ============================================
// 2. READ - Get all contracts for a project
// ============================================
db.sozlesmeler.find({
  _projeId: ObjectId("YOUR_PROJE_ID_HERE")
}).sort({ createdAt: -1 })

// ============================================
// 3. READ - Get contract by contract number
// ============================================
db.sozlesmeler.findOne({
  sozlesmeNo: "SZ-2025-001"
})

// ============================================
// 4. READ - Get active contracts
// ============================================
db.sozlesmeler.find({
  durum: "Aktif"
}).sort({ bitisTarihi: 1 })

// ============================================
// 5. READ - Get contracts by date range
// ============================================
db.sozlesmeler.find({
  baslangicTarihi: { $gte: new Date("2025-01-01") },
  bitisTarihi: { $lte: new Date("2025-12-31") }
})

// ============================================
// 6. READ - Get contracts by contractor
// ============================================
db.sozlesmeler.find({
  taraf: "ABC İnşaat A.Ş."
})

// ============================================
// 7. UPDATE - Update contract information
// ============================================
db.sozlesmeler.updateOne(
  { sozlesmeNo: "SZ-2025-001" },
  {
    $set: {
      durum: "Tamamlandı",
      guncellemeTarihi: new Date(),
      guncellenenKisi: "user@example.com"
    }
  }
)

// ============================================
// 8. UPDATE - Add signatory to contract
// ============================================
db.sozlesmeler.updateOne(
  { sozlesmeNo: "SZ-2025-001" },
  {
    $push: {
      imzacilar: {
        kiAdi: "Ahmet Demir",
        unvan: "Genel Müdür",
        imzaTarihi: new Date(),
        email: "ahmet@example.com",
        notlar: "Son onay imzası"
      }
    }
  }
)

// ============================================
// 9. UPDATE - Add attachment to contract
// ============================================
db.sozlesmeler.updateOne(
  { sozlesmeNo: "SZ-2025-001" },
  {
    $push: {
      ekler: {
        ekName: "Teknik Şartname",
        ekUrl: "https://example.com/sozlesmeler/SZ-2025-001-teknik.pdf",
        ekTipi: "PDF",
        yuklenmeTarihi: new Date()
      }
    }
  }
)

// ============================================
// 10. DELETE - Remove a signatory
// ============================================
db.sozlesmeler.updateOne(
  { sozlesmeNo: "SZ-2025-001" },
  {
    $pull: {
      imzacilar: { _id: ObjectId("SIGNATORY_ID_HERE") }
    }
  }
)

// ============================================
// 11. AGGREGATION - Get contract statistics by status
// ============================================
db.sozlesmeler.aggregate([
  {
    $group: {
      _id: "$durum",
      count: { $sum: 1 },
      totalAmount: { $sum: "$sozlesmeAmount" }
    }
  },
  {
    $sort: { _id: 1 }
  }
])

// ============================================
// 12. AGGREGATION - Get contracts nearing expiration
// ============================================
db.sozlesmeler.aggregate([
  {
    $match: {
      durum: "Aktif",
      bitisTarihi: {
        $gte: new Date(),
        $lte: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    }
  },
  {
    $sort: { bitisTarihi: 1 }
  },
  {
    $project: {
      sozlesmeNo: 1,
      sozlesmeName: 1,
      taraf: 1,
      bitisTarihi: 1,
      daysUntilExpiry: {
        $divide: [
          { $subtract: ["$bitisTarihi", new Date()] },
          1000 * 60 * 60 * 24
        ]
      }
    }
  }
])

// ============================================
// 13. AGGREGATION - Join with projects
// ============================================
db.sozlesmeler.aggregate([
  {
    $match: { durum: "Aktif" }
  },
  {
    $lookup: {
      from: "projeler",
      localField: "_projeId",
      foreignField: "_id",
      as: "projeDetaylari"
    }
  },
  {
    $unwind: "$projeDetaylari"
  },
  {
    $project: {
      sozlesmeNo: 1,
      sozlesmeName: 1,
      taraf: 1,
      projeAdi: "$projeDetaylari.name",
      sozlesmeAmount: 1,
      paraBirimi: 1
    }
  }
])

// ============================================
// 14. DELETE - Remove entire contract
// ============================================
db.sozlesmeler.deleteOne({
  sozlesmeNo: "SZ-2025-001"
})

// ============================================
// 15. CREATE INDEXES - For performance
// ============================================
db.sozlesmeler.createIndex({ _projeId: 1 })
db.sozlesmeler.createIndex({ _firmaId: 1 })
db.sozlesmeler.createIndex({ sozlesmeNo: 1 }, { unique: true })
db.sozlesmeler.createIndex({ durum: 1 })
db.sozlesmeler.createIndex({ baslangicTarihi: 1 })
db.sozlesmeler.createIndex({ bitisTarihi: 1 })
db.sozlesmeler.createIndex({ createdAt: 1 })
db.sozlesmeler.createIndex({ _projeId: 1, durum: 1 })

// ============================================
// Show collection statistics
// ============================================
db.sozlesmeler.stats()
