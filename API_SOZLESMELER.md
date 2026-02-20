# Sozlesmeler Collection - API Documentation

## Overview
The `sozlesmeler` (Contracts) collection manages contracts and agreements for projects. Each contract is linked to a project (`_projeId`) and can optionally be linked to a company (`_firmaId`).

## Base URL
```
http://localhost:4000/api/sozlesmeler
```

## Authentication
All endpoints require:
- Headers: `email`, `token`
- Middleware: `requireAuthAndNecessary` (user must be verified)

---

## Endpoints

### 1. Create Contract
**POST** `/api/sozlesmeler`

**Request Body:**
```json
{
  "_projeId": "ObjectId",
  "_firmaId": "ObjectId (optional)",
  "sozlesmeNo": "SZ-2025-001",
  "sozlesmeName": "Ana Taşeron Sözleşmesi",
  "sozlesmeTipi": "Taşeron",
  "taraf": "ABC İnşaat A.Ş.",
  "tarafEmail": "contact@abc.com.tr",
  "tarafTelefon": "+90 212 123 4567",
  "tarafAdresi": "İstanbul, Türkiye",
  "baslangicTarihi": "2025-01-01",
  "bitisTarihi": "2025-12-31",
  "sozlesmeAmount": 500000,
  "paraBirimi": "TRL",
  "odemeProgrami": "3 taksit - başlangıç, ara, bitiş",
  "durum": "Aktif",
  "dosyaUrl": "https://example.com/sozlesmeler/SZ-2025-001.pdf",
  "notlar": "Ana sözleşme",
  "icNotlar": "Dahili not"
}
```

**Response:**
```json
{
  "_id": "ObjectId",
  "_projeId": "ObjectId",
  "sozlesmeNo": "SZ-2025-001",
  "durum": "Aktif",
  "createdBy": "user@example.com",
  "createdAt": "2025-02-20T10:00:00Z",
  ...
}
```

**Status Codes:**
- `200` - Success
- `200` with `errorObject` - Validation errors

---

### 2. Get Contracts by Project
**GET** `/api/sozlesmeler/byproje/:projeId`

**Response:**
```json
[
  {
    "_id": "ObjectId",
    "_projeId": "ObjectId",
    "sozlesmeNo": "SZ-2025-001",
    "sozlesmeName": "Ana Taşeron Sözleşmesi",
    "durum": "Aktif",
    ...
  },
  ...
]
```

---

### 3. Get Single Contract
**GET** `/api/sozlesmeler/:id`

**Response:**
```json
{
  "_id": "ObjectId",
  "_projeId": "ObjectId",
  "sozlesmeNo": "SZ-2025-001",
  "imzacilar": [
    {
      "_id": "ObjectId",
      "kiAdi": "Mahmut Yaya",
      "unvan": "Proje Müdürü",
      "imzaTarihi": "2025-01-15T00:00:00Z",
      "email": "mahmut@example.com"
    }
  ],
  "ekler": [
    {
      "_id": "ObjectId",
      "ekName": "Teknik Şartname",
      "ekUrl": "https://example.com/sozlesmeler/SZ-2025-001-teknik.pdf",
      "ekTipi": "PDF"
    }
  ],
  ...
}
```

---

### 4. Update Contract
**PATCH** `/api/sozlesmeler/:id`

**Request Body:**
```json
{
  "sozlesmeName": "Güncellenmiş adı",
  "sozlesmeAmount": 600000,
  "odemeProgrami": "4 taksit"
}
```

**Response:** Updated contract object

---

### 5. Delete Contract
**DELETE** `/api/sozlesmeler/:id`

**Response:**
```json
{
  "message": "Sözleşme silindi"
}
```

---

### 6. Update Contract Status
**PATCH** `/api/sozlesmeler/:id/status`

**Request Body:**
```json
{
  "durum": "Tamamlandı"
}
```

**Valid Status Values:**
- `Aktif` - Active
- `Tamamlandı` - Completed
- `Bekleme` - Pending
- `Feshedildi` - Terminated
- `Sürüyor` - In Progress

**Response:** Updated contract object

---

### 7. Add Signatory
**POST** `/api/sozlesmeler/:id/imzaci`

**Request Body:**
```json
{
  "kiAdi": "Ahmet Demir",
  "unvan": "Genel Müdür",
  "email": "ahmet@example.com",
  "notlar": "Son onay imzası"
}
```

**Response:** Updated contract with new signatory

---

### 8. Remove Signatory
**DELETE** `/api/sozlesmeler/:id/imzaci/:imzaciId`

**Response:** Updated contract with signatory removed

---

## Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `_projeId` | ObjectId | Project reference (required) |
| `_firmaId` | ObjectId | Company reference (optional) |
| `sozlesmeNo` | String | Contract number (unique per project) |
| `sozlesmeName` | String | Contract title |
| `sozlesmeTipi` | String | Type: Taşeron, Tedarikçi, İnsan kaynağı, etc. |
| `taraf` | String | Contractor/Supplier name |
| `tarafEmail` | String | Contact email |
| `tarafTelefon` | String | Contact phone |
| `tarafAdresi` | String | Address |
| `baslangicTarihi` | Date | Start date |
| `bitisTarihi` | Date | End date |
| `yenilenmeTarihi` | Date | Renewal date |
| `sozlesmeAmount` | Number | Contract amount/value |
| `paraBirimi` | String | Currency (TRL, USD, EUR) |
| `odemeProgrami` | String | Payment schedule description |
| `durum` | String | Status |
| `ilk_onay` | Object | Initial approval info |
| `final_onay` | Object | Final approval info |
| `imzacilar` | Array | Signatories list |
| `sozlesmeVersiyonlar` | Array | Version history |
| `dosyaUrl` | String | Main document URL |
| `ekler` | Array | Attachments |
| `notlar` | String | Public notes |
| `icNotlar` | String | Internal notes |
| `createdBy` | String | User who created |
| `createdAt` | Date | Creation timestamp |
| `guncellemeTarihi` | Date | Last update timestamp |
| `guncellenenKisi` | String | User who updated |

---

## Indexes
Automatically created for performance:
- `_projeId` - Query by project
- `_firmaId` - Query by company
- `sozlesmeNo` - Unique contract number
- `durum` - Query by status
- `baslangicTarihi` - Query by start date
- `bitisTarihi` - Query by end date (useful for expiry tracking)
- `createdAt` - Sort by creation
- `_projeId + durum` - Composite index for filtering by project and status

---

## Error Handling

**Validation Errors (HTTP 200 with errorObject):**
```json
{
  "errorObject": {
    "sozlesmeNoError": "Bu sözleşme numarası bu proje için zaten kullanılmış",
    "tarafError": "Taraf adı girilmemiş"
  }
}
```

**Critical Errors (HTTP 400):**
```json
{
  "error": "BACKEND - (createSozlesmele) - Database connection failed"
}
```

---

## Example Usage

### Create Contract
```bash
curl -X POST http://localhost:4000/api/sozlesmeler \
  -H "Content-Type: application/json" \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..." \
  -d '{
    "_projeId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "sozlesmeNo": "SZ-2025-001",
    "sozlesmeName": "Ana Taşeron Sözleşmesi",
    "sozlesmeTipi": "Taşeron",
    "taraf": "ABC İnşaat A.Ş.",
    "sozlesmeAmount": 500000,
    "paraBirimi": "TRL",
    "durum": "Aktif"
  }'
```

### Get Contracts by Project
```bash
curl -X GET http://localhost:4000/api/sozlesmeler/byproje/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..."
```

### Update Contract Status
```bash
curl -X PATCH http://localhost:4000/api/sozlesmeler/65a1b2c3d4e5f/status \
  -H "Content-Type: application/json" \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..." \
  -d '{"durum": "Tamamlandı"}'
```

### Add Signatory
```bash
curl -X POST http://localhost:4000/api/sozlesmeler/65a1b2c3d4e5f/imzaci \
  -H "Content-Type: application/json" \
  -H "email: user@example.com" \
  -H "token: eyJhbGc..." \
  -d '{
    "kiAdi": "Ahmet Demir",
    "unvan": "Genel Müdür",
    "email": "ahmet@example.com"
  }'
```

---

## Testing the API

### Using MongoDB Playground
Run queries in `/mongoplayground/sozlesmeler.mongodb.js` to:
- Create test contracts
- Query by various filters
- Test aggregations
- Verify indexes

### Using Postman/cURL
1. Get valid JWT token from `/api/user/login`
2. Add headers: `email`, `token`
3. Test endpoints with provided examples

---

## Next Steps

1. **Create Frontend Components** - Build UI forms for contract management
2. **Add Validation** - Implement more field validations as needed
3. **Create Reports** - Add endpoints for contract analytics
4. **Setup Notifications** - Alert users when contracts are expiring
5. **Add Versioning** - Track contract versions and changes
