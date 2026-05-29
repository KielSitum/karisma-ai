from pdfminer.high_level import extract_text
import os
import pandas as pd


def extract_with_pdfminer(pdf_path):
    try:
        # pdfminer akan mencoba sekuat tenaga mengambil teks sesuai layout
        text = extract_text(pdf_path)
        return text.strip() if text else "EMPTY_RESULT"
    except Exception as e:
        return f"ERROR: {str(e)}"


def main():
    folder_path = r"D:\DBS DICODING\KarismaAI\karisma-ai\DATA_SCIENCE\DATASET CV"
    output_file = "raw_extraction_pdfminer.csv"

    data = []
    pdf_files = [f for f in os.listdir(folder_path) if f.endswith(".pdf")]

    for i, filename in enumerate(pdf_files):
        print(f"[{i+1}/{len(pdf_files)}] Ekstraksi: {filename}")
        full_text = extract_with_pdfminer(os.path.join(folder_path, filename))

        data.append({"file_name": filename, "raw_text": full_text})

    df = pd.DataFrame(data)
    df.to_csv(output_file, index=False, encoding="utf-8")
    print(f"\nSelesai! Cek file {output_file}")


if __name__ == "__main__":
    main()
