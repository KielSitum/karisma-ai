# Karisma AI — A/B Testing: Model NER Skill Extractor

This folder contains all the scripts, *datasets*, and evaluation results used to conduct A/B Testing experiments on the Karisma AI **Skill Extractor** model. 

The primary goal of this directory is to comprehensively compare the extraction performance of two model variants (Variant A / V1 and Variant B / V2) to determine which model is more optimal at filtering and extracting skills from user CVs.

---

## 📁 Directory Structure

Below is a representation of the structure and contents of the `ab-testing` folder:

```text
ab-testing/
│
├── DATASET CV/                                 # Folder containing the raw CV dataset for testing
├── output_ab_testing/                          # Folder storing extraction results and test visualizations
│
├── ab_testing_karisma_ai_two_tailed.ipynb      # Main notebook for statistical testing (Two-tailed A/B test)
├── model1_karisma_skill_extractor_v1.ipynb     # Notebook for Extraction Model Variant A (Version 1)
├── model1_karisma_skill_extractor_v2.ipynb     # Notebook for Extraction Model Variant B (Version 2)
│
├── raw_extraction.csv                          # Raw extraction data before further processing
├── README.md                                   # Main documentation for the A/B testing folder (This file)
└── skill_vocab.json                            # Reference dictionary (vocabulary) of skills used by the models
```

This notebook documents an A/B testing experiment designed to compare two versions of a skill extraction model used in Karisma AI's career navigation platform.

---

## How to Run the A/B Testing

*(Follow the guide below in order to replicate the A/B testing process on your local machine)*

### 1. Environment and Data Preparation
* Ensure you have installed all required dependencies

### 2. Execute Model Variant A (Version 1)
* Open and run all cells in the `model1_karisma_skill_extractor_v1.ipynb` notebook.
* **Output:** The model will generate a **`.keras`** file (e.g., `model_v1.keras`). 
* **Next Step:** The file is not automatically saved in the root directory. You must **manually move the `.keras` file** to the root directory, ensuring it is at the same level as the `ab_testing_karisma_ai_two_tailed.ipynb` file.

### 3. Execute Model Variant B (Version 2)
* Open and run all cells in the `model1_karisma_skill_extractor_v2.ipynb` notebook.
* **Output:** The model will generate a **`.keras`** file for V2 (with improved preprocessing). 
* **Next Step:** Just like before, **manually move this `.keras` file** to the root directory, ensuring it is at the same level as the `ab_testing_karisma_ai_two_tailed.ipynb` file.

---

### ⚡ Fast-Track Option (Alternative)
If you want to save time and skip retraining the models from scratch, you can download the ready-to-use **`.keras`** files directly. 

-  Download the model files via the following Google Drive link: 
   **[[karisma_skill_extractor_v1.keras](https://drive.google.com/file/d/1jpFw9KohUalNoxHHAT2TEgfTBn_-P4w6/view?usp=sharing)]** and **[[karisma_skill_extractor_v2.keras](https://drive.google.com/file/d/1f3svDuzCIiWpGDbgRi_FKvyJbj0RS4KR/view?usp=sharing)]**
-  Once downloaded, place the `.keras` files directly into the root directory (at the same level as `ab_testing_karisma_ai_two_tailed.ipynb`).

### 4. Perform Significance Testing (Two-Tailed)
* Open the `ab_testing_karisma_ai_two_tailed.ipynb` notebook.
* Ensure the paths for the V1 and V2 results in the notebook match the outputs from steps 2 and 3.
* Run all cells to get the conversion metric calculations (e.g., number of relevant skills), p-value, and distribution visualizations.
* The final output from this statistical analysis will be exported to the `output_ab_testing/` folder.

### 5. Result Interpretation
* To view the summary of findings and an in-depth analysis regarding the skill reduction effectiveness (Variant B's conservatism vs. Variant A's quantity), you can read the test results directly within the evaluation notebook or through the team's presentation document.

## Project Overview

The goal is to evaluate the impact of a new model (`karisma_skill_extractor_v2.keras`) and an improved preprocessing logic (`_split_sentences` new version) against the existing baseline (`karisma_skill_extractor_v1.keras`) and its old preprocessing logic. The primary focus is on the quantity of extracted skills and the processing latency.

### Variants:
- **Varian A (Control)**:
  - **Model**: `karisma_skill_extractor_v1.keras`
  - **Preprocessing**: `_split_sentences` (old version - simple regex split)
- **Varian B (Treatment)**:
  - **Model**: `karisma_skill_extractor_v2.keras`
  - **Preprocessing**: `_split_sentences` (new version - handles word-wrap, soft-wrap, and noise filtering)

### Hypothesis:
- **H₀ (Null Hypothesis)**: There is no significant difference in the average number of skills extracted between Varian A and B.
- **H₁ (Alternative Hypothesis)**: There is a significant difference in the average number of skills extracted between Varian A and B (two-tailed test).

## Experiment Flow

```
raw_extraction.csv (50 CVs)
        │
   ┌────┴────┐
   ▼         ▼
Varian A   Varian B
(Old Model + (New Model +
 Old Logic)  New Logic)
   │         │
   └────┬────┘
        ▼
  Statistical Analysis
  (Paired T-Test Two-Tailed, CI 95%, Cohen's d, Latency)
        ▼
  Visualization & Conclusion
```

## Technical Details

### Environment Setup
The notebook utilizes `transformers`, `tensorflow-hub`, `seqeval`, `numpy`, `pandas`, `scipy`, `matplotlib`, and `seaborn`. GPU acceleration is configured if available.

### Custom Objects
Custom Keras objects (`MaskedSparseCategoricalCrossentropy` and `MaskedAccuracy`) are defined to correctly load the pre-trained `.keras` models. `TFDistilBertModel` is registered for the backbone.

### `SkillExtractor` Class
A unified `SkillExtractor` class is implemented, allowing for the selection of either Varian A (old logic) or Varian B (new logic) during initialization. This class handles:
1.  Receiving raw CV text.
2.  Preprocessing and splitting text into sentences.
3.  Performing DistilBERT NER on each sentence.
4.  Aggregating B-SKILL/I-SKILL spans.
5.  Returning a list of unique skills.

### Configuration
-   `MODEL_A_PATH`: Path to `karisma_skill_extractor_v1.keras`
-   `MODEL_B_PATH`: Path to `karisma_skill_extractor_v2.keras`
-   `VOCAB_PATH`: Path to `skill_vocab.json`
-   `CSV_PATH`: Path to `raw_extraction.csv` (contains 50 CVs)

### Dataset
The experiment uses a dataset of 50 raw CV texts loaded from `raw_extraction.csv`. The `raw_text` column is validated and handled for missing values.

## A/B Testing Execution

The experiment iterates through each of the 50 CVs, applying both Varian A and Varian B skill extractors. The following metrics are recorded for each variant per CV:
-   `skill_count`: Number of unique skills extracted.
-   `extracted_skills`: List of extracted skills.
-   `latency_ms`: Execution time in milliseconds.
-   `skill_diff`: Difference in skill count (B - A).

## Statistical Analysis

A **Paired T-Test (two-tailed)** is performed to compare the mean skill counts of Varian A and B. This test is appropriate because both variants process the *same* set of CVs (paired samples). Alpha (α) is set to 0.05.

### Key Findings:
-   **P-value**: `0.000000` (significantly less than 0.05)
-   **Decision**: Reject H₀.
-   **Interpretation**: There is sufficient statistical evidence to conclude a significant difference in the number of skills extracted between Varian A and Varian B. The changes in Varian B's preprocessing logic significantly altered the entity extraction density.
-   **Mean Skill Count**: Varian A: `164.52`, Varian B: `106.24`
-   **Improvement %**: `-35.42%` (Varian B extracts fewer skills on average).
-   **Cohen's d**: `-2.0957` (Large effect size, indicating a substantial difference).
-   **Average Latency**: Varian A: `9261.3 ms`, Varian B: `8410.1 ms`
-   **Latency Overhead**: `-9.2%` (Varian B is faster).

## Visualizations

The notebook generates three types of visualizations:
1.  **Bar Chart (Average Skill & Latency)**: Compares the mean skill counts and average latencies of Varian A and B, including standard deviations as error bars and percentage improvements/overheads.
2.  **Box Plot & Violin Plot (Skill Distribution)**: Visualizes the distribution of skill counts for both variants, showing quartiles, outliers, and density. This helps assess the stability and spread of extracted skills.
3.  **Skill Diff per CV & Trend Plot**: Shows the skill count for each variant across all CVs and highlights the difference between them, indicating overall trends.

## Top 5 CVs with Largest Extraction Differences

A table is provided detailing the 5 CVs with the most significant absolute difference in extracted skill counts between Varian A and B, including partial lists of extracted skills and latencies for each.

## Conclusion

The A/B testing results indicate that Varian B, with its new model and improved preprocessing logic, significantly reduces the number of extracted skills compared to Varian A, with a large effect size (`Cohen's d = -2.0957`). While Varian B also shows an improvement in latency by approximately 9.2%, the primary impact is on the *density* of skill extraction, leading to fewer skills being identified. This suggests that the improved preprocessing in Varian B might be more conservative or effective at filtering out irrelevant text, resulting in a more focused (but smaller) set of skills. Further analysis would be needed to determine if this reduction in quantity translates to higher quality or precision of extracted skills, and if this aligns with the business objectives of Karisma AI.

## Usage

To run this experiment:
1.  **Mount Google Drive**: Ensure your Google Drive is mounted to `/content/drive`.
2.  **Place Assets**: Place `karisma_skill_extractor_v1.keras`, `karisma_skill_extractor_v2.keras`, `skill_vocab.json`, and `raw_extraction.csv` in the specified `BASE_PATH` (e.g., `/content/drive/MyDrive/KARISMA/`).
3.  **Run All Cells**: Execute the notebook cells sequentially. The output will include statistical analysis, visualizations, and saved results in `output_ab_testing` folder within your `BASE_PATH`.