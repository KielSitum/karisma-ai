import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import json
import re
import logging
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import DistilBertTokenizerFast, TFDistilBertModel

# =====================================================================
# LOGGING SETUP
# =====================================================================
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger("karisma")

# =====================================================================
# OPTIMASI MEMORI (RAM) UNTUK ENVIRONMENT CPU HUGGING FACE
# =====================================================================
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

app = FastAPI(
    title="Karisma AI API",
    description="Unified Production Server for Skill Extraction and Career Classification"
)

# =====================================================================
# 1. REGISTRASI CUSTOM OBJECTS
# =====================================================================
@tf.keras.utils.register_keras_serializable()
class SkillProjectionLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        kwargs.pop('name', None)
        kwargs.pop('trainable', None)
        kwargs.pop('dtype', None)
        super().__init__(**kwargs)

    def call(self, inputs):
        return inputs

# =====================================================================
# 2. PROSES PEMUATAN MODEL
# =====================================================================
log.info("Memuat Model 1 (Skill Extractor) & Tokenizer...")
tokenizer = DistilBertTokenizerFast.from_pretrained('distilbert-base-uncased')
model1 = tf.keras.models.load_model(
    'model1/karisma_skill_extractor_v2.keras',
    custom_objects={'TFDistilBertModel': TFDistilBertModel},
    compile=False
)

log.info("Memuat Model 2 (Career Classifier)...")
model2 = tf.saved_model.load(
    'model2/karisma_career_classifier_savedmodel',
)

with open('model1/skill_vocab.json', 'r') as f:
    vocab1 = json.load(f)
id2label = {int(k): v for k, v in vocab1['id2label'].items()}
max_length1 = vocab1['max_length']

with open('model2/model2_config.json', 'r') as f:
    vocab2 = json.load(f)
skill2idx = vocab2['skill2idx']
class_names = vocab2['class_names']
vocab_size2 = vocab2['top_n_skills']

log.info("Semua model berhasil dimuat.")
log.info(f"max_length model1 : {max_length1}")
log.info(f"Jumlah label      : {len(id2label)} → {id2label}")
log.info(f"Jumlah skill vocab: {len(skill2idx)}")

# =====================================================================
# 3. STRUKTUR DATA INPUT
# =====================================================================
class CVInput(BaseModel):
    cv_text: str

# =====================================================================
# FUNGSI PREPROCESSING
# Diselaraskan 1:1 dengan SkillExtractor._split_sentences() di notebook
# =====================================================================
def preprocess_and_split_sentences(text):
    log.debug("=== PREPROCESSING START ===")
    log.debug(f"Panjang raw text: {len(text)} karakter")

    # --- Step 0: Hapus URL dan email ---
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\S*', '', text)
    text = re.sub(r'(github\.com|linkedin\.com)(/\S+)?', '', text)
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '', text)
    log.debug(f"Setelah URL/email strip: {len(text)} karakter")

    # --- Step 1: Hyphenation merge ---
    lines = text.split('\n')
    log.debug(f"Jumlah baris setelah split('\\n'): {len(lines)}")
    merged_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if (re.search(r'[a-zA-Z]-$', line.rstrip()) and
                i + 1 < len(lines) and
                lines[i + 1].strip() and
                not lines[i + 1].strip().startswith(('-', '•', '*'))):
            merged = line.rstrip()[:-1] + lines[i + 1].strip()
            log.debug(f"  [HYPHEN MERGE] '{line.rstrip()}' + '{lines[i+1].strip()}' → '{merged}'")
            merged_lines.append(merged)
            i += 2
        else:
            merged_lines.append(line)
            i += 1

    # --- Step 2: Soft-wrap merge ---
    rejoined = []
    i = 0
    while i < len(merged_lines):
        current = merged_lines[i].strip()
        if not current:
            rejoined.append('')
            i += 1
            continue
        original = current
        while i + 1 < len(merged_lines):
            next_line = merged_lines[i + 1].strip()
            ends_no_punct = current and current[-1] not in '.!?:'
            next_lowercase = next_line and next_line[0].islower()
            not_header = not re.match(
                r'^(january|february|march|april|may|june|july|august|'
                r'september|october|november|december|present)',
                current, re.IGNORECASE
            )
            if ends_no_punct and next_lowercase and not_header and next_line:
                current = current + ' ' + next_line
                i += 1
            else:
                break
        if current != original:
            log.debug(f"  [SOFT-WRAP] '{original[:60]}...' digabung, hasil: '{current[:80]}...'")
        rejoined.append(current)
        i += 1

    log.debug(f"Jumlah baris setelah soft-wrap: {len([r for r in rejoined if r.strip()])}")

    # --- Step 3: Split ke sentences, filter noise, tangani short skill ---
    sentences = []
    skipped = []
    for line in rejoined:
        line = line.strip()
        if not line:
            continue

        # Filter noise per-line
        if re.match(r'^https?://', line):
            skipped.append(f"[URL] {line[:60]}")
            continue
        if re.match(r'^www\.', line):
            skipped.append(f"[WWW] {line[:60]}")
            continue
        if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', line):
            skipped.append(f"[EMAIL] {line[:60]}")
            continue
        if re.match(r'^[\+\(]?\d[\d\s\-\(\)\.]{6,}$', line):
            skipped.append(f"[PHONE] {line[:60]}")
            continue
        if re.match(r'^Page \d+ of \d+$', line, re.IGNORECASE):
            skipped.append(f"[PAGE] {line[:60]}")
            continue
        if re.match(r'^\(.*\)$', line):
            skipped.append(f"[PAREN] {line[:60]}")
            continue

        # Strip bullet markers
        line = re.sub(r'^[•\-\*]\s+', '', line).strip()
        if not line:
            continue

        word_count = len(line.split())
        if word_count > 25:
            subs = re.split(r'(?<=[.!?])\s+', line)
            for s in subs:
                s = s.strip()
                if s:
                    sentences.append(s)
                    log.debug(f"  [CHUNK >25] '{s[:80]}'")
        elif word_count <= 3:
            prefixed = f"Skill: {line}"
            sentences.append(prefixed)
            log.debug(f"  [SHORT ≤3] '{prefixed}'")
        else:
            sentences.append(line)
            log.debug(f"  [NORMAL {word_count}w] '{line[:80]}'")

    if skipped:
        log.debug(f"Baris yang dibuang ({len(skipped)}):")
        for s in skipped:
            log.debug(f"  SKIP → {s}")

    log.debug(f"Total sentences ke model: {len(sentences)}")
    log.debug("=== PREPROCESSING END ===")
    return sentences


# =====================================================================
# 4. ENDPOINTS API
# =====================================================================
@app.get("/")
def home():
    return {"status": "online", "message": "Karisma AI API v7 is running perfectly"}

@app.post("/analyze-cv")
async def analyze_cv(payload: CVInput):
    try:
        text = payload.cv_text
        if not text.strip():
            raise HTTPException(status_code=400, detail="Teks CV tidak boleh kosong")

        log.info("=== /analyze-cv REQUEST START ===")
        log.info(f"Panjang cv_text: {len(text)} karakter")

        # -----------------------------------------------------------------
        # 1. PIPELINE UTAMA (MODEL NER)
        # -----------------------------------------------------------------
        sentences = preprocess_and_split_sentences(text)

        log.info(f"Jumlah sentences yang akan diproses model: {len(sentences)}")
        for idx, s in enumerate(sentences):
            log.info(f"  SENTENCE[{idx:02d}]: '{s}'")

        extracted_skills = []

        for sent_idx, sentence in enumerate(sentences):
            words = sentence.split()
            if not words:
                continue

            encoding = tokenizer(
                words,
                is_split_into_words=True,
                return_tensors='tf',
                truncation=True,
                padding='max_length',
                max_length=max_length1
            )

            logits1 = model1([encoding['input_ids'], encoding['attention_mask']], training=False)
            predictions1 = tf.argmax(logits1, axis=-1).numpy()[0]
            word_ids = encoding.word_ids()

            # Kumpulkan prediksi per kata untuk logging
            word_preds = []
            seen_wids = set()
            for i, w_idx in enumerate(word_ids):
                if w_idx is None or w_idx in seen_wids:
                    continue
                seen_wids.add(w_idx)
                lbl = id2label.get(predictions1[i], 'O')
                word_preds.append((words[w_idx], lbl))

            # Cek apakah ada prediksi non-O
            non_o = [(w, l) for w, l in word_preds if l != 'O']
            if non_o:
                log.info(f"  [S{sent_idx:02d}] Prediksi non-O: {non_o}")
            else:
                log.debug(f"  [S{sent_idx:02d}] Semua O — tidak ada skill terdeteksi")

            # Ekstrak skill dari BIO sequence
            current_tokens = []
            prev_word_idx = None
            for i, w_idx in enumerate(word_ids):
                if w_idx is None or w_idx == prev_word_idx:
                    continue
                label = id2label.get(predictions1[i], 'O')
                word = words[w_idx].lower().strip('.,;:()"\'•- ')

                if label == 'B-SKILL':
                    if current_tokens:
                        extracted_skills.append(' '.join(current_tokens))
                    current_tokens = [word] if word else []
                elif label == 'I-SKILL' and current_tokens:
                    if word:
                        current_tokens.append(word)
                else:
                    if current_tokens:
                        extracted_skills.append(' '.join(current_tokens))
                    current_tokens = []
                prev_word_idx = w_idx

            if current_tokens:
                extracted_skills.append(' '.join(current_tokens))

        log.info(f"Skills dari NER model ({len(extracted_skills)}): {extracted_skills}")

        # -----------------------------------------------------------------
        # 2. PIPELINE PENYELAMAT (Dictionary Rescue Fallback)
        # -----------------------------------------------------------------
        text_lower = " " + text.lower() + " "
        fallback_hits = []
        for sk in skill2idx.keys():
            if len(sk) > 2 or sk in ['c', 'r', 'go']:
                pattern = r'\b' + re.escape(sk) + r'\b'
                if re.search(pattern, text_lower):
                    extracted_skills.append(sk)
                    fallback_hits.append(sk)

        log.info(f"Skills dari fallback ({len(fallback_hits)}): {fallback_hits}")

        # -----------------------------------------------------------------
        # 3. DEDUPLIKASI
        # -----------------------------------------------------------------
        seen = set()
        unique_skills = []
        for s in extracted_skills:
            s_clean = s.strip()
            if len(s_clean) > 1 and s_clean not in seen:
                seen.add(s_clean)
                unique_skills.append(s_clean)

        log.info(f"Unique skills final ({len(unique_skills)}): {unique_skills}")

        # -----------------------------------------------------------------
        # PIPELINE MODEL 2: Klasifikasi Karir
        # -----------------------------------------------------------------
        if not unique_skills:
            log.warning("Tidak ada skill yang terekstrak sama sekali.")
            return {
                "status": "success",
                "skills_extracted": [],
                "career_recommendations": [{"rank": 1, "career": "General / Unknown", "score_pct": "0.0%"}]
            }

        vec = np.zeros((1, vocab_size2), dtype=np.float32)
        matched = False
        matched_skills = []
        for sk in unique_skills:
            if sk in skill2idx:
                vec[0, skill2idx[sk]] = 1.0
                matched = True
                matched_skills.append(sk)

        log.info(f"Skills yang cocok di skill2idx ({len(matched_skills)}): {matched_skills}")

        if not matched:
            log.warning("Tidak ada skill yang cocok di skill2idx Model 2.")
            return {
                "status": "success",
                "skills_extracted": matched_skills,
                "career_recommendations": [{"rank": 1, "career": "General Industry", "score_pct": "50.0%"}]
            }

        tensor_vec = tf.constant(vec, dtype=tf.float32)

        try:
            out = model2.serve(tensor_vec)
        except AttributeError:
            infer = model2.signatures["serving_default"]
            out = infer(tensor_vec)

        if isinstance(out, dict):
            out = list(out.values())[0]

        logits2 = out.numpy()[0]
        T = 4.0
        probs2 = tf.nn.sigmoid(logits2 / T).numpy()

        top_k = 3
        top_k_idx = np.argsort(probs2)[::-1][:top_k]

        careers_output = []
        for i, idx in enumerate(top_k_idx):
            score = probs2[idx]
            careers_output.append({
                "rank": i + 1,
                "career": class_names[idx],
                "score_pct": f'{score * 100:.1f}%'
            })

        log.info(f"Career recommendations: {careers_output}")
        log.info("=== /analyze-cv REQUEST END ===")

        return {
            "status": "success",
            "skills_extracted": matched_skills,
            "career_recommendations": careers_output
        }

    except Exception as e:
        log.exception(f"Internal Server Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")