# 📘 Data Dictionary — Glints Job Market Analysis (Indonesia)

> **Dataset:** 60.000+ lowongan kerja dari platform Glints Indonesia  
> **Pipeline:** Scraping → Analisis & Cleaning → Seeding Database  
> **Total kolom didokumentasikan:** 42

---

## 🗂️ Overview Pipeline & File

```
[Glints API]
     ↓ glints_scrapper.py
full_dataset_glints.csv         ← raw scrape, ~60K baris
     ↓ glints_analysis_final.ipynb
     ├── glints_nlp_ready.csv          ← model NLP / career recommendation
     ├── glints_v2_cleaned.csv         ← dashboard Streamlit 
     └── glints_category_output.csv
              ↓ seeding_skills_database.py
         [Supabase] Job_listings + Skills + Job_Skills
```

| File | Granularitas | Tujuan |
|---|---|---|
| `full_dataset_glints.csv` | 1 baris = 1 lowongan | Raw output scraper |
| `glints_nlp_ready.csv` | 1 baris = 1 lowongan | Input model NLP / ML |
| `glints_v2_cleaned.csv` | 1 baris = 1 lowongan | Visualisasi & Dashboard |
| `glints_category_output.csv` | 1 baris = 1 kategori job | Seeding database Supabase |

---

## 📋 Kolom per File

### `full_dataset_glints.csv` (13 kolom)

| Kolom | Kategori | Tipe Data |
|---|---|---|
| `Job_Link` | Identitas | string |
| `Title` | Identitas | string |
| `Industry` | Hierarki Kategori (L1) | string |
| `Job_Category_parent` | Hierarki Kategori (L2) | string |
| `Job_Category` | Hierarki Kategori (L3) | string |
| `Salary_Mode` | Salary Raw | string (categorical) |
| `Min_Salary` | Salary Raw | float |
| `Max_Salary` | Salary Raw | float |
| `Skills` | Skills | string (comma-separated) |
| `Job_Type` | Job Context | string (categorical) |
| `Work Arrangement` | Job Context | string (categorical) |
| `Education` | Job Context | string (categorical) |
| `Experience` | Job Context | integer |

### `glints_category_output.csv` (7 kolom)

| Kolom | Kategori | Tipe Data |
|---|---|---|
| `skills_list` | Skills | list of string (Python list repr) |
| `job_category_parent` | Grouped (Database Seeding) | string |
| `job_category` | Grouped (Database Seeding) | string |
| `job_link` | Grouped (Database Seeding) | string |
| `skills` | Grouped (Database Seeding) | string (comma-separated) |
| `min_avg_salary` | Grouped (Database Seeding) | float (USD) |
| `max_avg_salary` | Grouped (Database Seeding) | float (USD) |

### `glints_nlp_ready.csv` (22 kolom)

| Kolom | Kategori | Tipe Data |
|---|---|---|
| `Job_Link` | Identitas | string |
| `Title` | Identitas | string |
| `Industry` | Hierarki Kategori (L1) | string |
| `Job_Category_parent` | Hierarki Kategori (L2) | string |
| `Job_Category` | Hierarki Kategori (L3) | string |
| `salary_min_monthly` | Salary Processed (IDR) | float |
| `salary_max_monthly` | Salary Processed (IDR) | float |
| `salary_min_usd` | Salary Processed (USD) | float |
| `salary_max_usd` | Salary Processed (USD) | float |
| `salary_avg` | Salary Processed (USD) | float |
| `salary_avg_usd` | Salary Processed (USD) | float |
| `salary_avg_capped` | Salary Processed (USD) | float |
| `salary_normalized` | Salary Encoded | float [0.0 – 1.0] |
| `salary_tier` | Salary Encoded | string (ordinal categorical) |
| `salary_tier_encoded` | Salary Encoded | integer |
| `has_salary` | Salary Encoded | boolean |
| `Skills` | Skills | string (comma-separated) |
| `skills_list` | Skills | list of string (Python list repr) |
| `Job_Type` | Job Context | string (categorical) |
| `Work Arrangement` | Job Context | string (categorical) |
| `Education` | Job Context | string (categorical) |
| `Experience` | Job Context | integer |

### `glints_v2_cleaned.csv` (30 kolom)

| Kolom | Kategori | Tipe Data |
|---|---|---|
| `Job_Link` | Identitas | string |
| `Title` | Identitas | string |
| `Industry` | Hierarki Kategori (L1) | string |
| `Job_Category_parent` | Hierarki Kategori (L2) | string |
| `Job_Category` | Hierarki Kategori (L3) | string |
| `Salary_Mode` | Salary Raw | string (categorical) |
| `salary_min_monthly` | Salary Processed (IDR) | float |
| `salary_max_monthly` | Salary Processed (IDR) | float |
| `salary_min_jt` | Salary Processed (IDR) | float |
| `salary_max_jt` | Salary Processed (IDR) | float |
| `salary_avg_jt` | Salary Processed (IDR) | float |
| `salary_range_width_jt` | Salary Processed (IDR) | float |
| `salary_min_usd` | Salary Processed (USD) | float |
| `salary_max_usd` | Salary Processed (USD) | float |
| `salary_avg` | Salary Processed (USD) | float |
| `salary_avg_usd` | Salary Processed (USD) | float |
| `salary_range_width_usd` | Salary Processed (USD) | float |
| `salary_tier` | Salary Encoded | string (ordinal categorical) |
| `has_salary` | Salary Encoded | boolean |
| `Skills` | Skills | string (comma-separated) |
| `skill_count` | Skills | integer |
| `Job_Type` | Job Context | string (categorical) |
| `Job_Type_Label` | Job Context | string |
| `Work Arrangement` | Job Context | string (categorical) |
| `Work_Arr_Label` | Job Context | string |
| `Education` | Job Context | string (categorical) |
| `Education_Label` | Job Context | string |
| `education_rank` | Job Context | integer (ordinal) |
| `Experience` | Job Context | integer |
| `experience_level` | Job Context | string (categorical) |

---

## 🔍 Detail Kolom per Kategori

### Identitas

#### `Job_Link`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `https://glints.com/id/opportunities/jobs/abc123` |

**Deskripsi:** URL unik per lowongan kerja di Glints (format: https://glints.com/id/opportunities/jobs/<id>)

> 💡 **Catatan:** Digunakan sebagai primary key de-duplikasi

---

#### `Title`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Data Analyst` |

**Deskripsi:** Nama posisi/jabatan pekerjaan seperti yang tertera di posting

> 💡 **Catatan:** Belum dinormalisasi, bisa sangat variatif

---

### Hierarki Kategori (L1)

#### `Industry`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Technology` |

**Deskripsi:** Bidang industri perusahaan yang membuka lowongan (Level 1 hierarki)

> 💡 **Catatan:** Missing value (~1.6%) diisi 'UNKNOWN' saat cleaning

---

### Hierarki Kategori (L2)

#### `Job_Category_parent`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Software Engineering` |

**Deskripsi:** Fungsi pekerjaan utama / domain karir (Level 2 hierarki). Digunakan sebagai primary key di tabel Job_listings database

> 💡 **Catatan:** Kolom kunci untuk grouping di glints_category_output.csv dan seeding database

---

### Hierarki Kategori (L3)

#### `Job_Category`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Backend Developer` |

**Deskripsi:** Spesialisasi pekerjaan secara detail (Level 3 hierarki, anak dari Job_Category_parent)

> 💡 **Catatan:** Level paling granular dalam hierarki Industry → Job_Category_parent → Job_Category

---

### Salary Raw

#### `Salary_Mode`

| Field | Value |
|---|---|
| **Tipe Data** | `string (categorical)` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `MONTH` |

**Deskripsi:** Satuan/periode pembayaran gaji yang diinput perusahaan

> 💡 **Catatan:** Nilai: MONTH, YEAR, HOUR, WEEK, DAY, PROJECT. Null berarti no-salary. Digunakan untuk konversi ke monthly.

---

#### `Min_Salary`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv` |
| **Contoh Nilai** | `5000000` |

**Deskripsi:** Batas bawah gaji dalam satuan Salary_Mode (IDR, belum dikonversi ke bulanan)

> 💡 **Catatan:** Nilai 0 diperlakukan sebagai null saat cleaning. Kolom ini adalah nilai mentah sebelum konversi.

---

#### `Max_Salary`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv` |
| **Contoh Nilai** | `8000000` |

**Deskripsi:** Batas atas gaji dalam satuan Salary_Mode (IDR, belum dikonversi ke bulanan)

> 💡 **Catatan:** Jika null, diisi dengan nilai Min_Salary. Nilai 0 diperlakukan sebagai null.

---

### Salary Processed (IDR)

#### `salary_min_monthly`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `5000000.0` |

**Deskripsi:** Batas bawah gaji setelah dikonversi ke IDR per bulan

> 💡 **Catatan:** Hasil konversi dari Min_Salary × multiplier Salary_Mode. Null untuk posting tanpa salary.

---

#### `salary_max_monthly`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `8000000.0` |

**Deskripsi:** Batas atas gaji setelah dikonversi ke IDR per bulan

> 💡 **Catatan:** Hasil konversi dari Max_Salary × multiplier Salary_Mode.

---

#### `salary_min_jt`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `5.0` |

**Deskripsi:** Batas bawah gaji bulanan dalam satuan Juta IDR (÷ 1.000.000)

> 💡 **Catatan:** Shorthand untuk visualisasi dashboard agar angka lebih ringkas

---

#### `salary_max_jt`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `8.0` |

**Deskripsi:** Batas atas gaji bulanan dalam satuan Juta IDR (÷ 1.000.000)

---

#### `salary_avg_jt`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `6.5` |

**Deskripsi:** Rata-rata gaji (avg dari min & max) dalam Juta IDR per bulan

---

#### `salary_range_width_jt`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `3.0` |

**Deskripsi:** Lebar rentang salary (max - min) dalam Juta IDR. Proxy ruang negosiasi.

> 💡 **Catatan:** Semakin besar = posting lebih fleksibel dalam negosiasi

---

### Salary Processed (USD)

#### `salary_min_usd`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `312.5` |

**Deskripsi:** Batas bawah gaji bulanan dalam USD (hasil konversi dari IDR)

> 💡 **Catatan:** Konversi menggunakan kurs tetap yang ditetapkan di notebook. Null untuk no-salary.

---

#### `salary_max_usd`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `500.0` |

**Deskripsi:** Batas atas gaji bulanan dalam USD

---

#### `salary_avg`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `406.25` |

**Deskripsi:** Rata-rata gaji (avg dari salary_min_usd & salary_max_usd) dalam USD per bulan

> 💡 **Catatan:** Kolom utama untuk analisis salary komparatif

---

#### `salary_avg_usd`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `406.25` |

**Deskripsi:** Alias dari salary_avg, di-round 2 desimal. Digunakan untuk konsistensi naming.

> 💡 **Catatan:** Identik dengan salary_avg. Tersedia di glints_category_output sebagai min_avg_salary & max_avg_salary.

---

#### `salary_avg_capped`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv` |
| **Contoh Nilai** | `406.25` |

**Deskripsi:** salary_avg yang sudah di-clip di persentil ke-99 untuk menghilangkan outlier ekstrem

> 💡 **Catatan:** Digunakan sebagai input MinMaxScaler untuk menghasilkan salary_normalized

---

#### `salary_range_width_usd`

| Field | Value |
|---|---|
| **Tipe Data** | `float` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `187.5` |

**Deskripsi:** Lebar rentang salary (max_usd - min_usd) dalam USD. Proxy fleksibilitas negosiasi.

---

### Salary Encoded

#### `salary_normalized`

| Field | Value |
|---|---|
| **Tipe Data** | `float [0.0 – 1.0]` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv` |
| **Contoh Nilai** | `0.3241` |

**Deskripsi:** salary_avg_capped yang dinormalisasi dengan MinMaxScaler ke rentang [0, 1]

> 💡 **Catatan:** Null untuk posting tanpa salary. Digunakan langsung sebagai fitur numerik model ML.

---

#### `salary_tier`

| Field | Value |
|---|---|
| **Tipe Data** | `string (ordinal categorical)` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Mid` |

**Deskripsi:** Label tier salary berdasarkan salary_avg_usd per bulan

> 💡 **Catatan:** Nilai: Entry, Low-Mid, Mid, Mid-Senior, Senior, Executive. Null untuk no-salary.

---

#### `salary_tier_encoded`

| Field | Value |
|---|---|
| **Tipe Data** | `integer` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_nlp_ready.csv` |
| **Contoh Nilai** | `3` |

**Deskripsi:** Encoding ordinal dari salary_tier (Entry=1 s/d Executive=6)

> 💡 **Catatan:** Null untuk no-salary. Gunakan kolom ini untuk model yang butuh fitur numerik ordinal.

---

#### `has_salary`

| Field | Value |
|---|---|
| **Tipe Data** | `boolean` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `True` |

**Deskripsi:** Flag apakah posting ini mencantumkan informasi salary yang valid

> 💡 **Catatan:** False jika Salary_Mode null & Min_Salary = Max_Salary = 0 (~15.5% dari dataset)

---

### Skills

#### `Skills`

| Field | Value |
|---|---|
| **Tipe Data** | `string (comma-separated)` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Python, SQL, Data Analysis, Microsoft Excel` |

**Deskripsi:** Daftar skill mentah (raw) yang diminta perusahaan, dipisahkan koma

> 💡 **Catatan:** Belum dinormalisasi. Berisi duplikat variasi nama (mis. 'Ms Excel' vs 'Microsoft Excel').

---

#### `skills_list`

| Field | Value |
|---|---|
| **Tipe Data** | `list of string (Python list repr)` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_nlp_ready.csv`, `glints_category_output.csv` |
| **Contoh Nilai** | `['Python', 'SQL', 'Data Analysis', 'Microsoft Excel']` |

**Deskripsi:** Daftar skill setelah normalisasi canonical name mapping (lowercase → standar)

> 💡 **Catatan:** Hasil dari SKILL_CANONICAL dict di notebook. Duplikat variasi digabung ke satu nama standar. Di glints_category_output.csv berisi semua unique skill per job_category_parent.

---

#### `skill_count`

| Field | Value |
|---|---|
| **Tipe Data** | `integer` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `5` |

**Deskripsi:** Jumlah skill yang diminta dalam satu posting (dihitung dari kolom Skills raw)

> 💡 **Catatan:** Proxy kompleksitas atau seniority posisi. Rata-rata ~5 skill per posting.

---

### Job Context

#### `Job_Type`

| Field | Value |
|---|---|
| **Tipe Data** | `string (categorical)` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `FULL_TIME` |

**Deskripsi:** Tipe kontrak/ikatan kerja (nilai raw dari API)

> 💡 **Catatan:** Nilai: FULL_TIME, CONTRACT, INTERNSHIP, PART_TIME, FREELANCE, PROJECT_BASED

---

#### `Job_Type_Label`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Full Time` |

**Deskripsi:** Label human-readable dari Job_Type untuk keperluan tampilan dashboard

> 💡 **Catatan:** Mapping dari JT_LABEL dict di notebook. Fallback ke nilai Job_Type jika tidak ada mapping.

---

#### `Work Arrangement`

| Field | Value |
|---|---|
| **Tipe Data** | `string (categorical)` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `REMOTE` |

**Deskripsi:** Pengaturan lokasi kerja (nilai raw dari API)

> 💡 **Catatan:** Nilai: ONSITE, HYBRID, REMOTE. Perhatikan nama kolom menggunakan spasi (bukan underscore).

---

#### `Work_Arr_Label`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Remote` |

**Deskripsi:** Label human-readable dari Work Arrangement

> 💡 **Catatan:** Mapping dari WA_LABEL dict di notebook.

---

#### `Education`

| Field | Value |
|---|---|
| **Tipe Data** | `string (categorical)` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `BACHELOR_DEGREE` |

**Deskripsi:** Persyaratan pendidikan minimum untuk posisi ini (nilai raw dari API)

> 💡 **Catatan:** Nilai: PRIMARY_SCHOOL, SECONDARY_SCHOOL, HIGH_SCHOOL, DIPLOMA, BACHELOR_DEGREE, PROFESSIONAL_EDUCATION, MASTER_DEGREE, DOCTORATE

---

#### `Education_Label`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `S1 / Sarjana` |

**Deskripsi:** Label human-readable dari Education untuk tampilan dashboard

> 💡 **Catatan:** Mapping dari EDU_LABEL dict di notebook.

---

#### `education_rank`

| Field | Value |
|---|---|
| **Tipe Data** | `integer (ordinal)` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `5` |

**Deskripsi:** Encoding ordinal dari Education untuk analisis korelasi numerik

> 💡 **Catatan:** Skala: PRIMARY_SCHOOL=1 s/d DOCTORATE=8. Dari EDU_RANK dict di notebook.

---

#### `Experience`

| Field | Value |
|---|---|
| **Tipe Data** | `integer` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `full_dataset_glints.csv`, `glints_nlp_ready.csv`, `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `3` |

**Deskripsi:** Minimum tahun pengalaman kerja yang dibutuhkan

> 💡 **Catatan:** Nilai: 0, 1, 3, 5, 10. Berasal dari filter yearsOfExperienceFilter di API.

---

#### `experience_level`

| Field | Value |
|---|---|
| **Tipe Data** | `string (categorical)` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_v2_cleaned.csv` |
| **Contoh Nilai** | `Mid Level (3 thn)` |

**Deskripsi:** Label deskriptif level karir berdasarkan nilai Experience

> 💡 **Catatan:** Mapping dari map_exp_level() di notebook. Contoh nilai: 'Entry Level (0 thn)', 'Mid Level (3 thn)', 'Senior (5 thn)'.

---

### Grouped (Database Seeding)

#### `job_category_parent`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ✅ Wajib ada |
| **Tersedia di** | `glints_category_output.csv` |
| **Contoh Nilai** | `Software Engineering` |

**Deskripsi:** Nama fungsi pekerjaan utama (lowercase). Versi snake_case dari Job_Category_parent. Primary key di tabel Job_listings Supabase.

> 💡 **Catatan:** 1 baris per unique job_category_parent. Total baris = jumlah kategori unik di dataset.

---

#### `job_category`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_category_output.csv` |
| **Contoh Nilai** | `Backend Developer` |

**Deskripsi:** Salah satu contoh job_category (L3) dari kategori ini (diambil 'first' saat groupby)

> 💡 **Catatan:** Bukan representasi lengkap — hanya sample satu nilai. Tidak digunakan untuk seeding.

---

#### `job_link`

| Field | Value |
|---|---|
| **Tipe Data** | `string` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_category_output.csv` |
| **Contoh Nilai** | `https://glints.com/id/opportunities/jobs/abc123` |

**Deskripsi:** Salah satu contoh job_link dari kategori ini (diambil 'first' saat groupby)

> 💡 **Catatan:** Hanya sample referensi, tidak digunakan saat seeding database.

---

#### `skills`

| Field | Value |
|---|---|
| **Tipe Data** | `string (comma-separated)` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_category_output.csv` |
| **Contoh Nilai** | `Python, SQL, Machine Learning` |

**Deskripsi:** Sample raw skills (max 5 unique posting) untuk kategori ini

> 💡 **Catatan:** Bukan daftar lengkap. Gunakan skills_list untuk daftar lengkap unique skills per kategori.

---

#### `min_avg_salary`

| Field | Value |
|---|---|
| **Tipe Data** | `float (USD)` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_category_output.csv` |
| **Contoh Nilai** | `312.5` |

**Deskripsi:** Rata-rata salary_min_usd dari semua posting dalam kategori ini (hanya posting has_salary=True)

> 💡 **Catatan:** Null jika tidak ada posting dengan salary valid di kategori ini. Di-insert ke kolom Min_Salary tabel Job_listings Supabase.

---

#### `max_avg_salary`

| Field | Value |
|---|---|
| **Tipe Data** | `float (USD)` |
| **Nullable** | ⚠️ Nullable |
| **Tersedia di** | `glints_category_output.csv` |
| **Contoh Nilai** | `500.0` |

**Deskripsi:** Rata-rata salary_max_usd dari semua posting dalam kategori ini (hanya posting has_salary=True)

> 💡 **Catatan:** Null jika tidak ada posting dengan salary valid di kategori ini. Di-insert ke kolom Max_Salary tabel Job_listings Supabase.

---

## 🗄️ Skema Database Supabase

Tabel di Supabase yang di-populate oleh `seeding_skills_database.py` dari `glints_category_output.csv`:

```sql

Job_listings (
    id          UUID PRIMARY KEY,
    Job         VARCHAR,   
    Min_Salary  INT,       
    Max_Salary  INT,      
    created_at  TIMESTAMP
)

Skills (
    id          UUID PRIMARY KEY,
    Skill_name  VARCHAR
)

Job_Skills (
    id              UUID PRIMARY KEY,
    Job_listing_id  UUID REFERENCES Job_listings(id),
    Skills_id       UUID REFERENCES Skills(id)
)
```

