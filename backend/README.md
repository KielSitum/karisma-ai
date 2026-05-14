# Karisma AI — Backend

## Tech Stack
- **Express.js** — REST API
- **node-pg-migrate** — database migrations
- **pg** — koneksi langsung ke PostgreSQL Supabase
- **@supabase/supabase-js** — Supabase Storage & query
- **pdf-parse** — ekstraksi teks dari PDF
- **bcryptjs** — hash password
- **jsonwebtoken** — JWT auth

---

## Cara Menjalankan (Full Setup)

### Prasyarat
- Node.js >= 18
- Akun Supabase (gratis di https://supabase.com)

---

### 1. Setup Supabase

#### A. Buat project baru di Supabase
1. Buka https://supabase.com → New Project
2. Catat **Project URL** dan **service_role key** (Settings → API)
3. Catat **Database Password** yang dibuat saat setup

#### B. Ambil Database Connection String
1. Supabase Dashboard → Settings → Database
2. Scroll ke **Connection string**
3. Pilih tab **URI** → mode **Session (port 5432)**
4. Copy string-nya, contoh:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijkl.supabase.co:5432/postgres
   ```

#### C. Buat Storage Bucket
1. Supabase Dashboard → Storage → New Bucket
2. Name: `cv-uploads`
3. Centang **Public bucket** → Save

---

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy dan isi environment variables
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=random-string-minimal-32-karakter-bebas
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
CV_BUCKET=cv-uploads
```

#### Jalankan Migrations
```bash
# Buat semua tabel di Supabase
npm run migrate

# Cek status migration
npm run migrate:status

# Rollback 1 migration (jika perlu)
npm run migrate:down
```

#### Jalankan Backend Server
```bash
# Development (auto-restart saat file berubah)
npm run dev

# Production
npm start
```

Backend berjalan di: **http://localhost:5000**

---

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di: **http://localhost:5173**

> Tidak perlu set `VITE_API_URL` — Vite sudah dikonfigurasi proxy
> `/api` → `http://localhost:5000` secara otomatis di `vite.config.js`

---

### 4. Urutan Menjalankan

Buka **3 terminal**:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — (opsional) cek migration
cd backend && npm run migrate:status
```

Buka browser: **http://localhost:5173**

---

## Perintah Migration

| Perintah | Fungsi |
|---|---|
| `npm run migrate` | Jalankan semua migration yang belum dijalankan |
| `npm run migrate:down` | Rollback 1 migration terakhir |
| `npm run migrate:status` | Lihat status semua migration |
| `npm run migrate:create -- nama-migration` | Buat file migration baru |

### Contoh membuat migration baru:
```bash
npm run migrate:create -- add-column-to-users
# Akan membuat: migrations/[timestamp]_add-column-to-users.js
```

---

## API Endpoints

### Auth `/api/auth`
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/register` | ❌ | Daftar akun baru |
| POST | `/login` | ❌ | Login, dapat JWT |
| GET | `/me` | ✅ | Data user saat ini |
| PATCH | `/profile` | ✅ | Update nama / avatar |
| PATCH | `/password` | ✅ | Ganti password |
| DELETE | `/account` | ✅ | Hapus akun + semua data |

### CV `/api/cv`
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/upload` | ✅ | Upload PDF, ekstrak teks |
| GET | `/` | ✅ | List semua CV user |
| GET | `/:id` | ✅ | Detail CV + analysis + matches |
| GET | `/:id/raw-text` | ✅ | Raw text hasil ekstraksi (untuk ML model) |
| PATCH | `/:id/analysis` | ✅ | Push hasil model ke DB |
| DELETE | `/:id` | ✅ | Hapus CV + storage |

### Jobs `/api/jobs`
| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/` | ✅ | List job listings |
| GET | `/:id` | ✅ | Detail job + skills |
| GET | `/meta/categories` | ✅ | Semua kategori job |

---

## Integrasi ML Model

Setelah CV diupload, backend menyimpan raw text di `CV_Analysis.Skills` JSON dengan format:
```json
{
  "raw_text": "John Doe\nSoftware Engineer...",
  "num_pages": 2,
  "skills": [],
  "status": "pending"
}
```

Model ML mengambil teks via:
```
GET /api/cv/:id/raw-text
Authorization: Bearer <token>
```

Setelah selesai, push hasil ke:
```
PATCH /api/cv/:id/analysis
Authorization: Bearer <token>

{
  "skills": ["Python", "TensorFlow", "SQL"],
  "matches": [
    {
      "job_listing_id": "uuid-dari-job-listings",
      "predicted_career": "Data Scientist",
      "match_percentage": 87.5,
      "matched_skills": ["Python", "SQL"],
      "skill_gaps": ["Tableau", "R"]
    }
  ]
}
```
