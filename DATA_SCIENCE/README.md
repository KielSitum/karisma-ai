# 📖 Data Dictionary 

> **Source:** Glints Indonesia Job Platform  
> **Pipeline Notebook:** `glints_analysis_fixed_usd.ipynb`  
> **Raw Input:** `full_dataset_glints_v2.csv` (~60.000+ lowongan kerja)  
> **Output File:** `glints_v2_cleaned.csv`

---

## 📋 Ringkasan Dataset

| Atribut | Detail |
|---|---|
| **Total kolom** | 30 kolom |
| **Unit salary default** | USD/bulan (kurs IDR/USD = 17.000) |
| **Hierarki kategori** | Industry (L1) → Job_Category_parent (L2) → Job_Category (L3) |
| **Ketersediaan salary** | ~84% posting memiliki data salary valid |

---

## ⚙️ Pipeline Preprocessing Singkat

```
RAW DATA (full_dataset_glints_v2.csv)
  │
  ├─ Drop duplikat berdasarkan Job_Link
  ├─ Impute Industry null → 'UNKNOWN'
  ├─ SALARY:
  │    Convert mode → IDR bulanan (MONTH×1 | YEAR÷12 | HOUR×160 | DAY×22 | WEEK×4.3)
  │    Floor outlier bawah: max < 850K IDR → 1.000.000; min < 850K → max(850K, 85%×max)
  │    Konversi IDR → USD (÷ 17.000)
  │    Label salary_tier berdasarkan bins USD/bulan
  ├─ SKILLS: canonical name mapping (normalisasi variasi nama)
  └─ FEATURE ENGINEERING:
       experience_level, Education_Label, Job_Type_Label,
       Work_Arr_Label, salary_avg, salary_range_width, skill_count, education_rank
```

---

## 🗂️ Deskripsi Kolom

### 🔑 Identitas & Teks

| Kolom | Tipe | Nullable | Deskripsi |
|---|---|---|---|
| `Job_Link` | string | ❌ | URL unik per posting lowongan di Glints |
| `Title` | string | ❌ | Judul posisi pekerjaan seperti di posting asli |
| `Skills` | string | ❌ | Daftar skill dalam format comma-separated (data **mentah** sebelum normalisasi) |

---

### 🏢 Hierarki Kategori Pekerjaan

```
Industry (L1)  →  Job_Category_parent (L2)  →  Job_Category (L3)
   Technology         Engineering                 Software Engineer
   Finance            Marketing                   Digital Marketing
   Education          Sales                       B2B Sales
```

| Kolom | Tipe | Nullable | Deskripsi |
|---|---|---|---|
| `Industry` | string | ❌ | Bidang industri perusahaan (**Level 1**). Null asli diisi `'UNKNOWN'` |
| `Job_Category_parent` | string | ❌ | Fungsi/kategori pekerjaan utama (**Level 2**) |
| `Job_Category` | string | ❌ | Kategori pekerjaan detail (**Level 3**) |

---

### 📄 Atribut Posting

| Kolom | Tipe | Nullable | Nilai yang Diperbolehkan | Deskripsi |
|---|---|---|---|---|
| `Job_Type` | string | ❌ | `FULL_TIME`, `CONTRACT`, `INTERNSHIP`, `PART_TIME`, `PROJECT_BASED` | Jenis kontrak kerja |
| `Work Arrangement` | string | ❌ | `ONSITE`, `HYBRID`, `REMOTE` | Skema lokasi kerja |
| `Education` | string | ❌ | `PRIMARY_SCHOOL`, `SECONDARY_SCHOOL`, `HIGH_SCHOOL`, `DIPLOMA`, `BACHELOR_DEGREE`, `PROFESSIONAL_EDUCATION`, `MASTER_DEGREE`, `DOCTORATE` | Pendidikan minimum yang disyaratkan |
| `Experience` | integer | ❌ | `{0, 1, 3, 5, 10}` | Pengalaman kerja minimum (tahun) |
| `Salary_Mode` | string | ✅ | `MONTH`, `YEAR`, `HOUR`, `DAY`, `WEEK`, `PROJECT`, `null` | Mode pembayaran gaji asli. Null = posting tidak mencantumkan salary |

---

### 💰 Kolom Salary — IDR (Juta Rupiah/bulan)

> Kolom ini menyimpan nilai salary dalam satuan **Juta Rupiah per bulan**, berguna untuk analisis dan visualisasi konteks Indonesia.

| Kolom | Tipe | Nullable | Deskripsi |
|---|---|---|---|
| `salary_min_monthly` | float | ✅ | Gaji minimum bulanan dalam IDR |
| `salary_max_monthly` | float | ✅ | Gaji maksimum bulanan dalam IDR |
| `salary_min_jt` | float | ✅ | Gaji minimum dalam **Juta IDR** (`salary_min_monthly / 1.000.000`) |
| `salary_max_jt` | float | ✅ | Gaji maksimum dalam **Juta IDR** |
| `salary_avg_jt` | float | ✅ | Rata-rata gaji dalam **Juta IDR** (`(min + max) / 2`) |
| `salary_range_width_jt` | float | ✅ | Selisih max–min dalam **Juta IDR** — indikator ruang negosiasi |

---

### 💵 Kolom Salary — USD (per bulan)

> Kolom utama yang digunakan untuk analisis lintas industri. Kurs: **1 USD = 17.000 IDR**.

| Kolom | Tipe | Nullable | Deskripsi |
|---|---|---|---|
| `salary_min_usd` | float | ✅ | Gaji minimum bulanan dalam **USD** (`salary_min_monthly / 17000`) |
| `salary_max_usd` | float | ✅ | Gaji maksimum bulanan dalam **USD** |
| `salary_avg` | float | ✅ | Rata-rata gaji dalam **USD** — nilai representatif utama |
| `salary_avg_usd` | float | ✅ | Alias eksplisit dari `salary_avg` |
| `salary_range_width_usd` | float | ✅ | Selisih max–min dalam **USD** — indikator ruang negosiasi gaji |

**Catatan:** Semua kolom salary bernilai `null` jika `has_salary = False`.

---

### 🏷️ Label & Flag Salary

| Kolom | Tipe | Nullable | Deskripsi |
|---|---|---|---|
| `has_salary` | boolean | ❌ | `True` jika posting memiliki data salary valid |
| `salary_tier` | string | ✅ | Label bucket gaji berdasarkan `salary_avg_usd` |

**Tier Salary (bins USD/bulan):**

| Tier | Rentang USD/bulan | Setara IDR/bulan |
|---|---|---|
| `< $120` | 0 – 120 | < Rp 2,04 Juta |
| `$120-300` | 120 – 300 | Rp 2,04 – 5,1 Juta |
| `$300-600` | 300 – 600 | Rp 5,1 – 10,2 Juta |
| `$600-1200` | 600 – 1.200 | Rp 10,2 – 20,4 Juta |
| `> $1200` | > 1.200 | > Rp 20,4 Juta |

---

### 🎓 Kolom Derived — Label & Encoding

| Kolom | Tipe | Nullable | Source Column | Deskripsi |
|---|---|---|---|---|
| `experience_level` | string | ❌ | `Experience` | Label level karir (lihat mapping di bawah) |
| `Education_Label` | string | ❌ | `Education` | Nama pendidikan dalam Bahasa Indonesia |
| `Job_Type_Label` | string | ❌ | `Job_Type` | Nama tipe kerja dalam Bahasa Indonesia |
| `Work_Arr_Label` | string | ❌ | `Work Arrangement` | Nama skema kerja dalam Bahasa Indonesia |
| `education_rank` | integer | ❌ | `Education` | Nilai ordinal 1–7 untuk korelasi numerik |
| `skill_count` | integer | ❌ | `Skills` | Jumlah skill per posting (dari split koma data mentah) |

**Mapping `experience_level`:**

| Nilai `Experience` | `experience_level` |
|---|---|
| `0` | Entry Level (0 thn) |
| `1, 2, 3` | Junior (1-3 thn) |
| `4, 5, 6` | Mid Level (4-6 thn) |
| `> 6` (nilai: 10) | Senior (>6 thn) |

**Mapping `education_rank`:**

| Education | Education_Label | education_rank |
|---|---|---|
| PRIMARY_SCHOOL | SD | 1 |
| SECONDARY_SCHOOL | SMP | 2 |
| HIGH_SCHOOL | SMA/SMK | 3 |
| DIPLOMA | Diploma | 4 |
| BACHELOR_DEGREE | S1 | 5 |
| PROFESSIONAL_EDUCATION | Profesional | 5 |
| MASTER_DEGREE | S2 | 6 |
| DOCTORATE | S3 | 7 |

---

## ⚠️ Catatan Penting

1. **Salary null** — Sekitar 16% posting tidak mencantumkan data gaji (`has_salary = False`). Kolom salary di baris tersebut bernilai `null`.
2. **Kurs tetap** — Konversi IDR→USD menggunakan kurs tetap Rp 17.000/USD. Nilai USD bersifat indikatif, bukan nilai tukar real-time.
3. **salary_avg vs salary_avg_usd** — Kedua kolom ini identik nilainya; `salary_avg_usd` merupakan alias eksplisit yang memperjelas unit.
4. **Skills (kolom `Skills`)** — Adalah data **mentah** yang belum dinormalisasi. Untuk analisis skill yang sudah dinormalisasi (canonical mapping), gunakan output pipeline NLP terpisah (`glints_nlp_ready.csv`).
5. **`Work Arrangement`** — Nama kolom ini memiliki spasi (bukan underscore), pastikan gunakan tanda kutip saat akses via pandas: `df['Work Arrangement']`.
6. **PROJECT salary** — Posting dengan `Salary_Mode = PROJECT` diperlakukan sebagai lump-sum dan dikecualikan dari analisis salary bulanan (salary dianggap tidak dapat dikonversi secara reliable).

---

## 📁 File Terkait

| File | Deskripsi |
|---|---|
| `data_dictionary.csv` | Data dictionary format tabel (CSV) |
| `data_dictionary.json` | Data dictionary format terstruktur (JSON) dengan metadata lengkap |
| `README.md` | Dokumen ini |
| `glints_v2_cleaned.csv` | Dataset output utama |
| `glints_nlp_ready.csv` | Dataset NLP-ready dengan skills ternormalisasi dan fitur text (output pipeline terpisah) |
