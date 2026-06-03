"""
Tabel:
    Job_listings  (id uuid, Job varchar, Min_Salary int, Max_Salary int, created_at timestamp)
    Skills        (id uuid, Skill_name varchar)
    Job_Skills    (id uuid, Job_listing_id uuid, Skills_id uuid)
"""

import ast
import uuid
from collections import Counter
from datetime import datetime, timezone

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values


DB_CONFIG = {
    "host":     "#",  # ganti sesuai region 
    "port":     6543,
    "dbname":   "postgres",
    "user":     "postgres.<project_ref>",  
    "password": "#",
    "sslmode":  "require",
}

CSV_PATH = "glints_category_output.csv"



def parse_skills(raw: str) -> list[str]:
    if not raw or pd.isna(raw):
        return []
    try:
        result = ast.literal_eval(raw)
        if isinstance(result, list):
            return [str(s).strip() for s in result if str(s).strip()]
    except Exception:
        pass
    return [s.strip() for s in str(raw).split(",") if s.strip()]


def main():

    print(f"Membaca {CSV_PATH} ...")
    df = pd.read_csv(CSV_PATH)
    print(f"   {len(df):,} baris | {df['job_category_parent'].nunique()} unique job_category_parent")

  
    print("\n🔧 Menyiapkan Job_listings ...")
    job_df = (
        df[["job_category_parent", "min_avg_salary", "max_avg_salary"]]
        .dropna(subset=["job_category_parent"])
        .drop_duplicates(subset=["job_category_parent"])
        .reset_index(drop=True)
    )

    now = datetime.now(timezone.utc)
    job_name_to_id: dict[str, str] = {}
    job_records = []

    for _, row in job_df.iterrows():
        job_id   = str(uuid.uuid4())
        job_name = row["job_category_parent"].strip()
        min_sal  = int(row["min_avg_salary"]) if pd.notna(row["min_avg_salary"]) else None
        max_sal  = int(row["max_avg_salary"]) if pd.notna(row["max_avg_salary"]) else None

        job_name_to_id[job_name] = job_id
        job_records.append((job_id, job_name, min_sal, max_sal, now))

    print(f"   → {len(job_records)} job records")


    print("\n🔧 Menyiapkan Skills (tanpa batasan) ...")

    skill_canonical: dict[str, str] = {} 

    for _, row in df.iterrows():
        for skill in parse_skills(row["skills_list"]):
            key = skill.lower()
            if key not in skill_canonical:
                skill_canonical[key] = skill

    skill_key_to_id: dict[str, str] = {key: str(uuid.uuid4()) for key in skill_canonical}
    skill_records = [
        (skill_key_to_id[key], skill_canonical[key])
        for key in skill_canonical
    ]

    print(f"   → {len(skill_records):,} unique skills")

   
    print("\n🔧 Menyiapkan Job_Skills ...")

    job_skill_pairs: set[tuple[str, str]] = set()
    job_skill_records = []

    for _, row in df.iterrows():
        job_name = str(row["job_category_parent"]).strip() if pd.notna(row["job_category_parent"]) else None
        if not job_name or job_name not in job_name_to_id:
            continue

        job_id = job_name_to_id[job_name]

        for skill in parse_skills(row["skills_list"]):
            key      = skill.lower()
            skill_id = skill_key_to_id.get(key)
            if not skill_id:
                continue

            pair = (job_id, skill_id)
            if pair not in job_skill_pairs:
                job_skill_pairs.add(pair)
                job_skill_records.append((str(uuid.uuid4()), job_id, skill_id))

    print(f"   → {len(job_skill_records):,} unique relasi Job_Skills")

    
    print("\n🔌 Menghubungkan ke Supabase ...")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        print("\nInsert Job_listings ...")
        execute_values(
            cur,
            """
            INSERT INTO "Job_listings" (id, "Job", "Min_Salary", "Max_Salary", created_at)
            VALUES %s
            ON CONFLICT (id) DO NOTHING
            """,
            job_records,
            page_size=500,
        )
        print(f"   {len(job_records)} baris")

        print("\nInsert Skills ...")
        batch_size = 1000
        for i in range(0, len(skill_records), batch_size):
            batch = skill_records[i : i + batch_size]
            execute_values(
                cur,
                """
                INSERT INTO "Skills" (id, "Skill_name")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
                """,
                batch,
                page_size=500,
            )
            print(f"   ... {min(i + batch_size, len(skill_records)):,}/{len(skill_records):,}", end="\r")
        print(f"   {len(skill_records):,} baris                    ")

        print("\nInsert Job_Skills ...")
        for i in range(0, len(job_skill_records), batch_size):
            batch = job_skill_records[i : i + batch_size]
            execute_values(
                cur,
                """
                INSERT INTO "Job_Skills" (id, "Job_listing_id", "Skills_id")
                VALUES %s
                ON CONFLICT (id) DO NOTHING
                """,
                batch,
                page_size=500,
            )
            print(f"   ... {min(i + batch_size, len(job_skill_records)):,}/{len(job_skill_records):,}", end="\r")
        print(f"   {len(job_skill_records):,} baris                    ")

        conn.commit()
        print("\nSemua data berhasil dicommit!")

    except Exception as e:
        conn.rollback()
        print(f"\n Error, rollback: {e}")
        raise

    finally:
        cur.close()
        conn.close()
        print("🔌 Koneksi ditutup.")

    print(f"""
╔══════════════════════════════════════════════════════╗
║                 RINGKASAN INSERT                     ║
╠══════════════════════════════════════════════════════╣
║  Job_listings : {len(job_records):<6} baris (unique job_category_parent) ║
║  Skills       : {len(skill_records):<6,} baris (semua unique skills)      ║
║  Job_Skills   : {len(job_skill_records):<6,} baris (semua relasi)             ║
╚══════════════════════════════════════════════════════╝
""")


if __name__ == "__main__":
    main()
