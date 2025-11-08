

// customSettings
const customSettings = {
  pages: {
    firmapozlari: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ]
    },
    pozlar: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ],
      paraBirimleri: []
    },
    mahaller: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ]
    },
    metrajOnayla: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ],
      showHasMahal: true
    },
    metrajOnayla: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ],
      showMetrajYapabilenler: []
    },
    ispaketleri: {
      basliklar: [
        { id: "aciklama", baslikName: "Açıklama", visible: true, show: true },
        { id: "versiyon", baslikName: "Versiyon", visible: true, show: true }
      ]
    }
  }
}




use('rapor724_v2');
db["users"].updateMany(
  {},
  { $set: { customSettings } }
)

