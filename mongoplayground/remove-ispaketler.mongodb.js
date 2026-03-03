use('rapor724_v2');
db["dugumler"].updateMany(
  {},
  { $unset: { isPaketler: "", isPaketVersiyonlar:"" } }
)
