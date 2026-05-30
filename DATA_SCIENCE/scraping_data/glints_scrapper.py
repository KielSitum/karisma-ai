import os
import csv
import time
import random
import requests
import itertools
import re

API_URL = "https://glints.com/api/v2-alc/graphql?op=searchJobsV3"

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    "Origin": "https://glints.com",
    "Referer": "https://glints.com/",
    # HAPUS TANDA PAGAR (#) DI BAWAH INI DAN MASUKKAN DATA DARI BROWSER ANDA
    # "Authorization": "Bearer ISI_DENGAN_TOKEN_ANDA",
    "User-Agent": '#',
    "Cookie": '#'
}

GRAPHQL_QUERY = """
query searchJobsV3($data: JobSearchConditionInput!) {
  searchJobsV3(data: $data) {
    jobsInPage {
      id
      title
      workArrangementOption
      minYearsOfExperience
      educationLevel
      type
      company {
        industry {
          name
        }
      }
      hierarchicalJobCategory {
        name
        level
        parents {
          name
          level
        }
      }
      salaries {
        salaryMode
        minAmount
        maxAmount
      }
      skills {
        skill {
          name
        }
      }
    }
    hasMore
  }
}
"""


def full_scraper():
    print("=== MEMULAI FULL SCRAPING (RESUME CAPABLE & FAST MODE) ===")
    
    job_types = ["FULL_TIME", "CONTRACT", "INTERNSHIP", "PART_TIME", "FREELANCE", "PROJECT_BASED"]
    work_arrangements = ["ONSITE", "HYBRID", "REMOTE"]
    experiences = ["NO_EXPERIENCE", "FRESH_GRAD", "LESS_THAN_A_YEAR", "ONE_TO_THREE_YEARS", "THREE_TO_FIVE_YEARS", "FIVE_TO_TEN_YEARS", "MORE_THAN_TEN_YEARS"]
    education_levels = ["PRIMARY_SCHOOL", "SECONDARY_SCHOOL", "HIGH_SCHOOL", "DIPLOMA", "BACHELOR_DEGREE", "PROFESSIONAL_EDUCATION", "MASTER_DEGREE", "DOCTORATE"]

    csv_file = 'full_dataset_glints.csv'
    progress_file = 'progress_glints.txt'
    
    completed_filters = set()
    if os.path.exists(progress_file):
        with open(progress_file, 'r') as f:
            completed_filters = set(f.read().splitlines())
            print(f"[*] Melanjutkan scraping... Ditemukan {len(completed_filters)} filter yang sudah selesai sebelumnya.")

    file_exists = os.path.isfile(csv_file)
    with open(csv_file, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file, quoting=csv.QUOTE_ALL)
        
        if not file_exists:
            writer.writerow(["Job_Link", "Title", "Industry", "Job_Category_parent", "Job_Category", "Salary_Mode", "Min_Salary", "Max_Salary", "Skills", "Job_Type", "Work Arrangement", "Education", "Experience"])

        for jt, wa, exp, edu_lvl in itertools.product(job_types, work_arrangements, experiences, education_levels):
            
            current_filter_id = f"{jt}_{wa}_{exp}_{edu_lvl}"
            
            print(f"\n=======================================================")
            print(f"[*] FILTER AKTIF: {jt} | {wa} | {exp} | {edu_lvl}")
            print(f"=======================================================")
            
            page = 1
            has_more = True
            is_filter_success = False
            
            while has_more:
                print(f"    -> Mengambil halaman {page}...")
                
                payload = {
                        "operationName": "searchJobsV3",
                        "query": GRAPHQL_QUERY,
                        "variables": {
                            "data": {
                                "CountryCode": "ID",
                                "sortBy": "LATEST",                  
                                "lastUpdatedAtRange": "ANY_TIME",    
                                "type": [jt],
                                "workArrangementOptions": [wa],
                                "yearsOfExperienceFilter": {
                                    "ranges": [exp]
                                },
                                "educationLevels": [edu_lvl],
                                "includeExternalJobs": True,
                                "pageSize": 30,
                                "page": page
                            }
                        }
                    }
                
                max_retries = 3
                success = False
                data_json = {}
                
                for attempt in range(1, max_retries + 1):
                    try:
                        response = requests.post(API_URL, json=payload, headers=HEADERS, timeout=15)
                        
                        if response.status_code == 200:
                            data_json = response.json()
                            success = True
                            break  
                        
                        elif response.status_code == 400:
                            if "request offset exceeds the maximum limit" in response.text:
                                print("       [-] Batas maksimal halaman dari server tercapai. Lanjut ke keranjang berikutnya...")
                                success = True 
                              
                                data_json = {"data": {"searchJobsV3": {"jobsInPage": [], "hasMore": False}}}
                                break 
                            else:
                                print(f"       [!] FATAL ERROR 400 (Filter Ditolak).")
                                print(f"       [!] Detail: {response.text}")
                                print("       [!] SKRIP DIMATIKAN PAKSA UNTUK MENCEGAH BANNED IP.")
                                return 
                            
                        elif response.status_code in [401, 403]:
                            print(f"       [!] Akses Ditolak (Error {response.status_code}). Cookie kedaluwarsa.")
                            print("       [!] HENTIKAN SKRIP, PERBARUI COOKIE, DAN JALANKAN ULANG.")
                            return 
                            
                        elif response.status_code == 429:
                            print(f"       [!] Warning 429: Terlalu Cepat (Too Many Requests)! Jeda 30 detik...")
                            time.sleep(30)
                            
                        else:
                            print(f"       [!] Error {response.status_code}. Mencoba ulang ({attempt}/{max_retries})...")
                            time.sleep(random.uniform(2.0, 4.0))
                            
                    except requests.exceptions.RequestException as e:
                        print(f"       [!] Koneksi gagal: {e}. Mencoba ulang ({attempt}/{max_retries})...")
                        time.sleep(random.uniform(3.0, 5.0))
                
                if not success:
                    print(f"       [!] Gagal mengambil halaman {page}. Melompat ke kombinasi berikutnya...")
                    break 
                
                search_results = data_json.get('data', {}).get('searchJobsV3', {})
                jobs = search_results.get('jobsInPage', [])
                has_more = search_results.get('hasMore', False)
                
                if not jobs:
                    print("       [-] Data pada kombinasi filter ini telah habis.")
                    is_filter_success = True 
                    break
                    
                for job in jobs:
                    job_id = job.get('id', '')
                    job_link = f"https://glints.com/id/opportunities/jobs/{job_id}"
                    
                    title = job.get('title', 'N/A')
                    
                    company_data = job.get('company') or {}
                    industry_data = company_data.get('industry') or {}
                    industry_name = industry_data.get('name', 'N/A')
                    
                    category_data = job.get('hierarchicalJobCategory') or {}
                    category_now = category_data.get('name', 'N/A')
                    
                    parents = category_data.get('parents') or []
                    category_parent = parents[0].get('name', 'N/A') if parents else 'N/A'
                    
                    salaries = job.get('salaries') or []
                    if salaries:
                        salary_mode = salaries[0].get('salaryMode', 'N/A')
                        min_salary = salaries[0].get('minAmount', 0)
                        max_salary = salaries[0].get('maxAmount', 0)
                    else:
                        salary_mode = 'N/A'
                        min_salary = 0
                        max_salary = 0
                        
                    skills_list = job.get('skills') or []
                    skills_str = ", ".join([s.get('skill', {}).get('name', '') for s in skills_list if isinstance(s, dict) and s.get('skill')])
                    
                    work_arr = job.get('workArrangementOption', 'N/A')
                    job_type = job.get('type', 'N/A')
                    edu = job.get('educationLevel', 'N/A')
                    reqs_exp = job.get('minYearsOfExperience', 0)
                    
                    writer.writerow([
                        job_link, 
                        title, 
                        industry_name,        
                        category_parent,      
                        category_now,         
                        salary_mode,          
                        min_salary, 
                        max_salary, 
                        skills_str, 
                        job_type, 
                        work_arr, 
                        edu, 
                        reqs_exp
                    ])


                file.flush() 
                page += 1

                if not has_more:
                    is_filter_success = True
                
                sleep_time = random.uniform(1.5, 3.5)
                print(f"       [zZz] Sukses. Jeda {sleep_time:.2f} detik...")
                time.sleep(sleep_time)

            if is_filter_success:
                with open(progress_file, 'a') as pf:
                    pf.write(current_filter_id + '\n')

    print("\n=== FULL SCRAPING SELESAI ===")

if __name__ == "__main__":
    full_scraper()
