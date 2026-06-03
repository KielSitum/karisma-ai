# Karisma AI 

**Karisma AI** is an intelligent career acceleration platform that analyzes your CV using AI to extract skills, match you with the best career paths, and identify skill gaps — helping bridge the gap between your education and your dream career.

---

## Features

- **CV Upload & Analysis** — Upload your CV and let AI extract your skills automatically
- **Career Matching** — Get matched with the most relevant career paths based on your skills
- **Skill Gap Detection** — Know exactly what skills you need to learn
- **Learning Roadmap** — Personalized roadmap to fill your skill gaps
- **Karisma Assistant** — Built-in AI chatbot to answer your career questions
- **Auth** — Email/password and Google OAuth login, with email verification and forgot password flow

---

## 🛠️ Arsitektur & Tech Stack

Aplikasi ini dibangun dengan arsitektur modern yang memisahkan antara klien (*frontend*), server (*backend*), dan layanan *AI*.

<p align="center">
  <img src="frontend/public/arsitektur-karisma-ai.png" width="500" alt="Arsitektur Karisma AI">
</p>

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | JWT, Firebase (Google OAuth) |
| AI Model | Hugging Face Space |
| Email | Resend |

---

## 📁 Project Structure

```
karisma-ai/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── controller/
│   │   │       ├── validator/
│   │   │       └── router/
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   └── firebaseAdmin.js
│   │   └── middlewares/
│   └── migrations/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── utils/
│   └── public/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Supabase project
- Firebase project (for Google OAuth)
- Resend account (for email)
- Hugging Face Space (for AI model)

---

### 1. Clone the repository

```bash
git clone https://github.com/KielSitum/karisma-ai.git
cd karisma-ai
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
# ─── Supabase ───────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ─── Database (node-pg-migrate) ─────────────────────────────
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
PGSSLMODE=require

# ─── JWT ────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# ─── Server ─────────────────────────────────────────────────
PORT=5000
CLIENT_URL=http://localhost:5173

# ─── Supabase Storage bucket ────────────────────────────────
CV_BUCKET=your_cv_bucket_name
CV_AVATAR_BUCKET=your_avatar_bucket_name

# ─── Karisma AI — Hugging Face Space ────────────────────────
HF_API_URL=https://your-space.hf.space

# ─── Firebase (base64 encoded service account JSON) ─────────
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_firebase_service_account

# ─── Resend ─────────────────────────────────────────────────
RESEND_API_KEY=re_your_resend_api_key
FRONTEND_URL=http://localhost:5173
```

Run database migrations:

```bash
npm run migrate up
```

Start the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Database Setup (Supabase)

### Storage Buckets

Create two buckets in your Supabase project under **Storage**:

| Bucket | Purpose | Env Variable |
|---|---|---|
| `cv-files` (or your choice) | Stores uploaded CV PDFs | `CV_BUCKET` |
| `cv-avatars` (or your choice) | Stores user profile photos | `CV_AVATAR_BUCKET` |

Make both buckets **public** so files can be accessed via public URL.

---

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Google** as a sign-in provider under **Authentication → Sign-in method**
3. Add `http://localhost:5173` to the **Authorized domains** list
4. Go to **Project Settings → Service Accounts** → click **Generate new private key**
5. Encode the downloaded JSON to base64:
   ```bash
   base64 -i serviceAccountKey.json
   ```
6. Paste the result into `FIREBASE_SERVICE_ACCOUNT_BASE64` in your backend `.env`

---

## Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key and set it as `RESEND_API_KEY`
4. Update the `from` address in the email templates to match your verified domain

---

## Model AI

- [Skill Extractor Model](https://drive.google.com/drive/folders/1ALnAGbh6ebAxEw1AmFLvBwCajFY2i7W9?usp=drive_link)
- [Career Classifier Model](https://drive.google.com/drive/folders/1j_zBJjbd0WDGED1mxnaoMmUvpEeGSPM_?usp=drive_link)

---

## Tim Pengembang (CC26-PSU202)

| Nama | ID | Universitas | Peran |
| :--- | :--- | :--- | :--- |
| Brisbane Jovan Rivaldi Sihombing | CACC319D6X0803 | Universitas Sumatera Utara | Project Manager & AI Engineer |
| Jesica Eldamaris Maha | CACC319D6X0803 | Universitas Sumatera Utara | AI Engineer |
| Mayadi Alamsyah Putra Silalahi | CDCC319D6Y0416 | Universitas Sumatera Utara | Data Scientist |
| Alfi Syahrin | CDCC319D6Y1274 | Universitas Sumatera Utara | Data Scientist |
| Yehezkiel Situmorang | CFCC319D6Y1709 | Universitas Sumatera Utara | Full-Stack Web Developer |
| Fausta Raihan Maulana | CFCC200D6Y0848 | Universitas Diponegoro | Full-Stack Web Developer |

---