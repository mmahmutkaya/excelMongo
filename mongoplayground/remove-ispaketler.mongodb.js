use('rapor724_v2')

db["projeler"].updateMany(
  {},
  {
    $unset: {
      isPaketler: "",
      isPaketVersiyonlar: "",
      butce: "",
      butceVersiyonlar: "",
      metrajVersiyonlar: "",
      birimFiyatVersiyonlar: ""
    }
  }
)
db["dugumler"].deleteMany({})
