use('rapor724_v2')

db["projeler"].updateMany(
  {},
  { $unset: { isPaketler: "", isPaketVersiyonlar:"" } }
)

db["dugumler"].updateMany(
  {},
  { $unset: { isPaketler: "", isPaketVersiyonlar:"" } }
)
