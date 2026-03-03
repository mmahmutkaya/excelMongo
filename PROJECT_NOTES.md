# excelMongo — Proje Notları

## Genel Bakış

**Proje adı:** Rapor 7/24
**Tip:** Node.js / Express REST API
**Database:** MongoDB Atlas — `rapor724_v2`
**Port:** 4000
**Deploy:** Vercel
**Frontend:** https://rapor724.vercel.app (React)
**Dil:** Türkçe (contracts modülü İngilizce'ye migrate edildi)

---

## Bağlantı

```
MONGO_URI = mongodb+srv://excelUser:excel1923@serverless1.bzqa6.mongodb.net/rapor724_v2
```

---

## Koleksiyonlar ve Modeller

### 1. `users` — `models/userModel.js`
| Alan | Tip | Açıklama |
|------|-----|----------|
| email | String | unique |
| password | String | bcrypt hash |
| isim | String | |
| soyisim | String | |
| userCode | String | isim[0..1] + soyisim |
| mailConfirmationKod | String | 6 haneli |
| mailTeyit | Boolean | email doğrulama |
| customSettings | Object | UI tercihleri (sayfa bazlı) |

**Static metodlar:** `signup()`, `login()`

---

### 2. `firmalar` — `models/firmaModel.js`
| Alan | Tip |
|------|-----|
| name | String |
| wbs | Array |
| lbs | Array |
| paraBirimleri | Array |
| pozMetrajTipleri | Array |
| pozBirimleri | Array |
| yetkiliKisiler | Array |
| createdAt | Date |
| createdBy | String |

---

### 3. `projeler` — `models/projeModel.js`
| Alan | Tip | Açıklama |
|------|-----|----------|
| _firmaId | ObjectId | firmalar ref |
| name | String | |
| wbs | Array | Work Breakdown Structure |
| lbs | Array | Labor Breakdown Structure |
| paraBirimleri | Array | |
| pozMetrajTipleri | Array | |
| pozBirimleri | Array | |
| yetkiliKisiler | Array | |
| aktifYetkiliKisiler | Array | |
| yetkiliFirmalar | Array | |
| metrajVersiyonlar | Array | `{versiyonNumber, aciklama, createdAt, createdby}` |
| birimFiyatVersiyonlar | Array | `{versiyonNumber, aciklama, createdAt, createdby}` |
| isPaketVersiyonlar | Array | `{versiyonNumber, isPaketler, aciklama, createdAt, createdby}` |
| isPaketler | Array | **kaldırıldı** (bkz. migration) |
| birimFiyatVersiyon_isProgress | Boolean | |
| createdBy | String | |
| createdAt | Date | |

---

### 4. `pozlar` — `models/pozModel.js`
| Alan | Tip |
|------|-----|
| _firmaId | ObjectId |
| _projeId | ObjectId |
| _wbsId | ObjectId |
| pozNo | String |
| pozName | String |
| pozBirimId | String |
| pozMetrajTipId | String |
| birimFiyatlar | Array |
| birimFiyatVersiyonlar | Array |
| metrajVersiyonlar | Array |

---

### 5. `mahaller` — `models/mahalModel.js`
| Alan | Tip |
|------|-----|
| _firmaId | ObjectId (required) |
| _projeId | ObjectId (required) |
| _lbsId | ObjectId (required) |
| mahalNo | String |
| mahalName | String |

---

### 6. `dugumler` — `models/dugumModel.js`
Ölçüm düğümleri — poz + mahal kesişiminde oluşur.

| Alan | Tip | Açıklama |
|------|-----|----------|
| _projeId | ObjectId | |
| _mahalId | ObjectId | |
| _pozId | ObjectId | |
| openMetraj | Boolean | |
| isDeleted | Boolean | soft delete |
| hazirlananMetrajlar | Array | hazırlık aşamasındaki metrajlar |
| revizeMetrajlar | Array | revize edilmiş metrajlar |
| isPaketler | Array | |
| metrajVersiyonlar | Array | |
| isPaketVersiyonlar | Array | |

**satirSchema:** `{number, multipliers, measurementStatus, versioning, ...}`

---

### 7. `contracts` — `models/contractModel.js`
*(İngilizce — yeni eklendi)*

| Alan | Tip |
|------|-----|
| _projectId | ObjectId |
| _companyId | ObjectId |
| contractNumber | String |
| contractName | String |
| contractType | String |
| contractor / email / phone / address | String |
| startDate / endDate / renewalDate | Date |
| contractAmount | Number |
| currency | String |
| paymentSchedule | String |
| status | `Active\|Completed\|Pending\|Terminated\|In Progress` |
| initialApproval / finalApproval | `{date, approver}` |
| signatories | Array `{name, position, signDate, email, notes}` |
| contractVersions | Array |
| documentUrl / attachments | String / Array |
| notes / internalNotes | String |
| createdBy / updatedBy | String |

---

## Route Özeti

| Prefix | Dosya |
|--------|-------|
| `/api/user` | `routes/user.js` |
| `/api/firmalar` | `routes/firmalar.js` |
| `/api/projeler` | `routes/projeler.js` |
| `/api/pozlar` | `routes/pozlar.js` |
| `/api/mahaller` | `routes/mahaller.js` |
| `/api/dugumler` | `routes/dugumler.js` |
| `/api/versiyon` | `routes/versiyon.js` |
| `/api/contracts` | `routes/contracts.js` |

---

## Auth Middleware

| Middleware | Kontrol |
|------------|---------|
| `requireAuth` | JWT token geçerli mi |
| `requireMailTeyit` | mailTeyit === true |
| `requireAuthAndNecessary` | JWT + mailTeyit + isim + soyisim + userCode |

JWT header'ları: `email`, `token`
JWT süresi: 7 gün

---

## Migration Geçmişi

| Tarih | İşlem | Koleksiyon |
|-------|-------|------------|
| — | `contracts` modülü Türkçe → İngilizce | `contracts` |
| 2026-03 | `isPaketler` + `isPaketVersiyonlar` alanları kaldırıldı | `dugumler` |
| 2026-03 | `isPaketler` + `isPaketVersiyonlar` alanları kaldırıldı | `projeler` |

**Playground dosyaları:** `mongoplayground/` klasöründe

---

## Önemli Notlar

- `pozlar`, `mahaller`, `dugumler` üçgeni projenin çekirdeği — WBS ve LBS hiyerarşisi üzerinde çalışır
- Versiyon yönetimi hem `projeler` hem `dugumler` içinde; `versiyonNumber` artan integer
- `customSettings` her kullanıcı için sayfa bazlı UI konfigürasyonu tutar
- CORS: sadece `localhost:3000` ve `rapor724.vercel.app`
