# 📊 DATA SCIENCE — Karisma AI

> **Karisma AI: AI Career Navigator & Skill Intelligence untuk Mahasiswa**
> Coding Camp 2026 powered by DBS Foundation | Tim CC26-PSU202

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.x-150458?style=flat-square&logo=pandas&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-Live-FF4B4B?style=flat-square&logo=streamlit&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Production-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37626?style=flat-square&logo=jupyter&logoColor=white)
![License](https://img.shields.io/badge/License-Academic-lightgrey?style=flat-square)

---

## 📌 Deskripsi Proyek

Folder ini berisi seluruh pipeline **Data Science** dari proyek Karisma AI, mulai dari pengumpulan data lowongan kerja melalui web scraping platform Glints Indonesia, pembersihan dan analisis data, hingga penyediaan data terstruktur untuk kebutuhan model AI dan database production.

Pipeline ini menghasilkan **60.000+ data lowongan kerja** yang digunakan sebagai fondasi sistem rekomendasi karir berbasis data untuk mahasiswa Indonesia.

---

## 👥 Tim Data Science

| ID | Nama | Role |
|---|---|---|
| CDCC319D6Y1274 | Alfi Syahrin | Data Scientist |
| CDCC319D6Y0416 | Mayadi Alamsyah Putra Silalahi | Data Scientist |

---

## 🗂️ Struktur Folder

```
DATA SCIENCE/
│
├── 📁 Dataset/
│   ├── full_dataset_glints.csv          # Raw output scraping (±60.000 baris)
│   ├── glints_nlp_ready.csv             # Output analisis → input model NLP
│   ├── glints_v2_cleaned.csv            # Output analisis → dashboard Streamlit
│   └── glints_category_output.csv       # Output analisis → database seeding
│
├── 📁 Scrapping_data/
│   └── glints_scrapper.py               # Script web scraping API GraphQL Glints
│
├── 📁 Analysis_data/
│   └── glints_analysis_final.ipynb      # Notebook EDA, cleaning & feature engineering
│
├── 📁 Seeding_database/
│   ├── seeding_skills_database.py       # Script seeding ke Supabase (PostgreSQL)
│   └── glints_category_output.csv       # File input untuk proses seeding
│
├── 📁 Karisma-dashboard/
│   └── [PLACEHOLDER: nama file .py]     # Source code Streamlit EDA Dashboard
│
├── 📁 Data_dictionary/
│   ├── glints_data_dictionary.csv       # Data dictionary format CSV
│   ├── glints_data_dictionary.json      # Data dictionary format JSON
│   └── README.md                        # Data dictionary format Markdown
│
├── 📁 A-B_Testing/
│   └── model1.ipynb                     # Script A/B Testing 
│
├── 📄 Laporan_Teknis_DataScience_KarismaAI_CC26PSU202.pdf
└── 📄 README.md                         
```



---

## 📁 Detail Setiap Folder

### 📂 Dataset/
Berisi seluruh file data yang dihasilkan oleh pipeline, baik data mentah hasil scraping maupun data yang sudah diproses oleh notebook analisis.

| File | Baris | Kolom | Keterangan |
|---|---|---|---|
| `full_dataset_glints.csv` | ±60.000 | 13 | Raw output scraper, belum dibersihkan |
| `glints_nlp_ready.csv` | ±60.000 | 20 | Skills ternormalisasi, salary ter-encode, siap untuk model NLP |
| `glints_v2_cleaned.csv` | ±60.000 | 30 | Kolom paling lengkap, label human-readable, untuk dashboard |
| `glints_category_output.csv` | 65 | 7 | 1 baris per job category, aggregasi salary & skills |

---

### 📂 Scrapping_data/
Berisi script Python untuk mengumpulkan data lowongan kerja dari API GraphQL Glints Indonesia.

**`glints_scrapper.py`**
- Target endpoint: `https://glints.com/api/v2-alc/graphql?op=searchJobsV3`
- Strategi: kombinasi **1.008 filter** (6 job type × 3 work arrangement × 7 experience × 8 education)
- Fitur: resume capability, retry mechanism, rate limiting adaptif, incremental write ke CSV
- Output: `full_dataset_glints.csv`

**Cara menjalankan:**
```bash
# Pastikan cookie & user-agent sudah diisi di bagian HEADERS
python glints_scrapper.py
```

> ⚠️ **Perhatian:** Sebelum menjalankan script, isi terlebih dahulu field `Authorization`, `User-Agent`, dan `Cookie` pada variabel `HEADERS` di baris 10–19 dengan nilai dari browser Anda.

---

### 📂 Analysis_data/
Berisi notebook Jupyter yang melakukan seluruh proses cleaning, feature engineering, dan Exploratory Data Analysis (EDA).

**`glints_analysis_final.ipynb`**

Tahapan dalam notebook:
1. **Data Understanding** — eksplorasi shape, hierarki kategori, missing values, duplikat
2. **Data Cleaning** — drop duplikat, fill missing, normalisasi salary (IDR → USD), normalisasi skill via `SKILL_CANONICAL`
3. **Feature Engineering** — `experience_level`, `education_rank`, `salary_tier`, `skill_count`, `has_salary`, dll
4. **EDA (7 Research Questions)**:
   - Industri apa yang paling aktif merekrut?
   - Skill apa yang paling banyak diminati?
   - Skill apa yang berkorelasi dengan gaji tertinggi?
   - Bagaimana korelasi pengalaman dan kompensasi?
   - Bagaimana distribusi salary tier?
   - Kategori pekerjaan apa yang bergaji tertinggi?
   - Bagaimana distribusi pendidikan dan work arrangement?
5. **Export** — menghasilkan 3 file output ke folder `Dataset/`

**Cara menjalankan:**
```bash
jupyter lab glints_analysis_final.ipynb
# atau buka langsung di Kaggle Notebook / Google Colab
```

---

### 📂 Seeding_database/
Berisi script Python untuk mengisi database Supabase (PostgreSQL) production dengan data yang telah diproses.

**`seeding_skills_database.py`**
- Input: `glints_category_output.csv`
- Output: mengisi 3 tabel di Supabase — `Job_listings`, `Skills`, `Job_Skills`
- Fitur: transaksional (auto-rollback jika gagal), idempotent (`ON CONFLICT DO NOTHING`), batch insert per 1.000 baris

**Skema database:**
```sql
Job_listings (id UUID, Job VARCHAR, Min_Salary INT, Max_Salary INT, created_at TIMESTAMP)
Skills       (id UUID, Skill_name VARCHAR)
Job_Skills   (id UUID, Job_listing_id UUID → Job_listings, Skills_id UUID → Skills)
```

**Cara menjalankan:**
```bash
pip install pandas psycopg2-binary
# Isi DB_CONFIG di baris 18–25 dengan kredensial Supabase Anda
python seeding_skills_database.py
```

> ⚠️ **Perhatian:** Isi variabel `DB_CONFIG` (host, user, password, project_ref) sebelum menjalankan script. Jangan commit kredensial ke repository.

---

### 📂 Karisma-dashboard/
Berisi source code Streamlit EDA Dashboard yang menyajikan insight hasil analisis data pasar kerja Indonesia secara interaktif kepada publik.

**Dashboard live:** https://karisma-dashboard.streamlit.app/

Fitur dashboard:
- Overview pasar kerja (KPI utama, ringkasan dataset, dan 7 insight)
- Job Market (Distribusi industri, job cluster, tipe & arrangement pekerjaan)
- Salary Analysis (Distribusi salary, perbandingan per industri, experience, pendidikan)
- Skill Analysis (Top skills, skill premium, dan skill paling versatile)
- Job Explorer (Filter & cari lowongan spesifik secara interaktif)

**Cara menjalankan secara lokal:**
```bash
python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

streamlit run app.py
```

---

### 📂 Data_dictionary/
Berisi dokumentasi lengkap seluruh kolom dari keempat file dataset dalam tiga format berbeda.

| File | Format | Kegunaan |
|---|---|---|
| `glints_data_dictionary.csv` | CSV | Tabular, mudah dibuka di Excel / Google Sheets |
| `glints_data_dictionary.json` | JSON | Integrasi programatik / API / tooling |
| `README.md` | Markdown | Dokumentasi lengkap dengan diagram pipeline & skema SQL |

Total **42 kolom** terdokumentasi, mencakup 11 kategori: Identitas, Hierarki Kategori, Salary Raw, Salary Processed (IDR & USD), Salary Encoded, Skills, Job Context, dan Grouped (Database Seeding).

---

### 📂 A-B_Testing/
Berisi script pengujian A/B Testing untuk memvalidasi insight dan asumsi yang ditemukan selama proses EDA.

**Cara menjalankan:**
```bash
# Run All Code IPYNB
```

---

## ⚙️ Setup dan Instalasi

### Prerequisites
- Python 3.10+
- pip

### Install dependencies
```bash
pip install pandas numpy requests matplotlib seaborn plotly scikit-learn streamlit psycopg2-binary jupyter
```

### Urutan eksekusi pipeline (dari awal)
```bash
# 1. Scraping data
cd Scrapping_data/
python glints_scrapper.py

# 2. Analisis & cleaning (jalankan semua cell di notebook)
cd ../Analysis_data/
jupyter lab glints_analysis_final.ipynb

# 3. Seeding database
cd ../Seeding_database/
python seeding_skills_database.py

# 4. Jalankan dashboard
cd ../Karisma-dashboard/
streamlit run app.py
```

---

## 🔗 Tautan Penting

| Resource | URL |
|---|---|
| 🌐 Streamlit Dashboard (Live) | https://karisma-dashboard.streamlit.app/ |
| 💾 Repository GitHub | https://github.com/KielSitum/karisma-ai |
| 📋 Project Plan | CC26-PSU202 — Coding Camp 2026 DBS Foundation |

---

## 📄 Laporan Teknis

Dokumentasi lengkap seluruh proses pipeline Data Science tersedia pada file:

**`Laporan_Teknis_DataScience_KarismaAI_CC26PSU202.pdf`**

Laporan mencakup : Pendahuluan, Metodologi, Web Scraping, Data Cleaning, EDA, File Output, Dashboard, Database Seeding, Temuan & Implikasi, dan Kesimpulan.

---

*Coding Camp 2026 powered by DBS Foundation — Tim CC26-PSU202*
