# PROJECT NOTES - excelMongo (Rapor 7/24 Backend)

## Proje Özeti
İnşaat proje yönetimi için **Node.js + Express + MongoDB** backend API.
Metraj takibi, birim fiyat yönetimi, sözleşme yönetimi ve hiyerarşik proje yapısı sunar.

**Deployment:** Vercel (serverless) | **DB:** MongoDB Atlas (`rapor724_v2`)
**Port:** 4000 | **Frontend Origin:** `https://rapor724.vercel.app` & `localhost:3000`

---

## Mimari Genel Bakış

```
Firma → Proje → [Poz + Mahal] → Dugum (kesişim noktası)
```

- **Poz** = Ne yapılıyor (iş kalemi)
- **Mahal** = Nerede yapılıyor (konum/bölüm)
- **Dugum** = Poz + Mahal kesişimi (metraj burada tutulur)

**Klasör yapısı:** `controllers/` → `models/` → `routes/` → `middleware/`

---

## Veri Modelleri

| Model | Amaç | Önemli Alanlar |
|-------|------|----------------|
| **User** | Kimlik doğrulama | email, password, mailTeyit, isim, soyisim, userCode, customSettings |
| **Firma** | Şirket ana kaydı | name, wbs[], lbs[], paraBirimleri[], pozBirimleri[], yetkiliKisiler[] |
| **Proje** | Proje konteyneri | _firmaId, wbs[], lbs[], metrajVersiyonlar[], birimFiyatVersiyonlar[], isPaketVersiyonlar[] |
| **Poz** | İş kalemi/pozisyon | _firmaId, _projeId, _wbsId, pozNo, pozName, pozBirimId, birimFiyatlar[] |
| **Mahal** | Konum/bölüm | _projeId, _lbsId, mahalNo, mahalName |
| **Dugum** | Poz+Mahal kesişimi | _projeId, _pozId, _mahalId, hazirlananMetrajlar[], revizeMetrajlar[], isPaketler[] |
| **Contract** | Sözleşmeler | _projectId, _companyId, contractNumber, status, signatories[], contractVersions[] |

---

## API Endpoint Özeti

### `/api/user`
```
POST /signup, /login, /sendmailcode, /confirmmailcode
POST /savenecessaryuserdata, /customsettingspagessetdata
```

### `/api/firmalar`
```
GET /, /:id | POST / | PATCH /parabirimleri
```

### `/api/projeler`
```
GET /byfirma/:id, /:id
POST /, /createwbs, /updatewbs, /togglewbsforpoz, /deletewbs
POST /movewbs{up|down|left|right}, /createlbs, /createispaket
POST /request/deleteprojeaktifyetkilikisi
```

### `/api/pozlar`
```
GET /  (versiyon filtrelemeli)
POST /
PATCH /birimfiyatlar
GET /ispaketpozlar
```

### `/api/mahaller`
```
GET /, POST /
```

### `/api/dugumler` (En karmaşık modül)
```
POST /
GET /pozlar, /mahallerbypoz, /bypoz
GET /hazirlananmetraj, /onaylananmetraj, /hazirlananmetrajlar
POST /addmetrajsatiri
POST /updatehazirlananmetrajpreparing, /updatehazirlananmetrajready
POST /updateonaylananmetrajrevize, /updateonaylananmetrajsil
POST /updatehazirlananmetraj{lar|seen|selected|selectedfull|unReady}
POST /ispaketler
```

### `/api/versiyon`
```
POST /metraj, /birimfiyat, /ispaket
```

### `/api/contracts`
```
POST /
GET /byproject/:projectId, /:id
PATCH /:id, /:id/status
DELETE /:id
POST /:id/signatory
DELETE /:id/signatory/:signatoryId
```

---

## Middleware (Auth Katmanları)

1. **requireAuth** - JWT doğrulama
2. **requireMailTeyit** - Email doğrulama kontrolü
3. **requireAuthAndNecessary** - Tam profil (isim + soyisim + userCode) zorunlu

**Kullanıcı onboarding akışı:**
`signup` → `sendmailcode` → `confirmmailcode` → `savenecessaryuserdata` → tüm route'lara erişim

---

## Önemli Mimari Kararlar

### Versiyon Sistemi
Her projede 3 paralel versiyon dizisi:
- `metrajVersiyonlar` - Metraj versiyonları
- `birimFiyatVersiyonlar` - Birim fiyat versiyonları
- `isPaketVersiyonlar` - İş paketi versiyonları

### Hata Yönetimi
- **Form hataları:** status 200 + `errorObject` (client-side validation için)
- **Sistem hataları:** status 400+
- Tüm hata mesajları `"BACKEND - (functionName) - " + error` formatında

### customSettings Yapısı
```javascript
customSettings.pages.{sayfaAdi}.basliklar = [...]
// Sayfalar: firmapozlari, metraj, diğerleri...
```

### Yetki Sistemi
```javascript
yetkiliKisiler: [{ email, yetkiler: [{name: "owner"}, {name: "birimFiyatEdit"}, ...] }]
```

### Dil Geçişi
- Eski kod: **Türkçe** alan adları (wbs, lbs, poz, mahal, dugum, metraj, vb.)
- **contracts** modülü Şubat 2025'te İngilizce'ye migrate edildi
- Diğer modüller hâlâ Türkçe

---

## Kritik Dosyalar

| Dosya | Önem |
|-------|------|
| `server.js` | Entry point, route bağlantıları |
| `controllers/dugumController.js` | En karmaşık business logic |
| `controllers/pozController.js` | Aggregation pipeline'lar |
| `models/dugumModel.js` | En karmaşık schema |
| `models/projeModel.js` | Versiyon sistemi çekirdeği |
| `middleware/requireAuthAndNecessary.js` | Tüm korumalı route'lar için kapı |
| `scripts/remove-ispaket-fields.js` | DB migration script (dry-run destekli) |

---

## Bağımlılıklar
```
express, mongoose, jsonwebtoken, bcrypt, cors, dotenv, lodash, validator, nodemailer, nodemon
```

---

## .env Değişkenleri
```
PORT=4000
MONGO_URI=mongodb+srv://...rapor724_v2...
SECRET=<jwt_secret>
```

---

_Son güncelleme: 2026-03-03_
