import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../config/supabase.js";
import { extractTextFromPDF } from "../../../utils/pdfExtractor.js";

const BUCKET = process.env.CV_BUCKET || "cv-uploads";

// ── Hugging Face Space URL ────────────────────────────────────────────────────
const HF_API_URL =
  process.env.HF_API_URL || "https://brisbanejrs-karisma-ai.hf.space";

/**
 * Kirim raw text ke Hugging Face Space untuk ekstraksi skill + prediksi karir.
 * Return: { skills_extracted: string[], career_recommendations: {rank,career,score_pct}[] }
 */
async function callKarismaAI(rawText) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000); // 60 detik timeout

  try {
    const res = await fetch(`${HF_API_URL}/analyze-cv`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv_text: rawText }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HF API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Helper: find job listing by career name with fallback search.
 */
async function findJobByCareer(careerName) {
  // 1. Exact match (case insensitive)
  const { data: exactMatch } = await supabase
    .from("Job_listings")
    .select(`id, Job_Skills ( Skills ( Skill_name ) )`)
    .ilike("Job", careerName)
    .limit(1);

  if (exactMatch && exactMatch.length > 0) {
    return exactMatch[0];
  }

  // 2. Partial match using the first word
  const firstWord = careerName.split(/[ &]+/)[0];
  if (firstWord.length > 2) {
    const { data: partialMatch } = await supabase
      .from("Job_listings")
      .select(`id, Job_Skills ( Skills ( Skill_name ) )`)
      .ilike("Job", `%${firstWord}%`)
      .limit(1);
    if (partialMatch && partialMatch.length > 0) {
      return partialMatch[0];
    }
  }

  // 3. Fallback to text search
  const tsQuery = careerName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .join(" | ");
  if (tsQuery) {
    const { data: tsMatch } = await supabase
      .from("Job_listings")
      .select(`id, Job_Skills ( Skills ( Skill_name ) )`)
      .textSearch("Job", tsQuery)
      .limit(1);
    if (tsMatch && tsMatch.length > 0) {
      return tsMatch[0];
    }
  }

  return null;
}

/**
 * Helper: compute matched skills and skill gaps.
 * Skill gaps are limited to a maximum of 5 items.
 */
function computeSkillMatch(aiSkills, jobData) {
  const MAX_SKILL_GAPS = 5;

  const dbSkills = (jobData?.Job_Skills || [])
    .map((js) => js.Skills?.Skill_name)
    .filter(Boolean);

  const normalizedDbSkills = dbSkills.map((s) => s.toLowerCase());
  const matchedSkills = aiSkills.filter((s) =>
    normalizedDbSkills.includes(s.toLowerCase()),
  );

  const normalizedMatched = matchedSkills.map((s) => s.toLowerCase());
  const skillGaps = dbSkills
    .filter((s) => !normalizedMatched.includes(s.toLowerCase()))
    .slice(0, MAX_SKILL_GAPS);

  return { matchedSkills, skillGaps };
}

// ── POST /cv/upload ───────────────────────────────────────────────────────────
export async function uploadCV(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file provided" });
  }

  const buffer = req.file.buffer;
  const filename = req.file.originalname;
  const userId = req.user.id;

  // 1. Extract raw text from PDF
  let extractedText = "";
  let numPages = 0;
  try {
    const result = await extractTextFromPDF(buffer);
    extractedText = result.text;
    numPages = result.numPages;
  } catch (err) {
    console.error("PDF extraction error:", err.message);
    // Don't fail the upload — just store empty text; model can handle it
    extractedText = "";
  }

  console.log("=== HASIL RAW TEXT CV ===");
  console.log(extractedText);
  console.log("=========================");

  // 2. Upload to Supabase Storage
  const fileKey = `${userId}/${uuidv4()}-${filename.replace(/\s+/g, "_")}`;

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(fileKey, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (storageError) {
    console.error("Storage upload error:", storageError);
    return res
      .status(500)
      .json({ error: "Failed to upload file to storage" });
  }

  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileKey);
  const fileUrl = urlData?.publicUrl || "";

  // 4. Create CV_uploads record
  const { data: cvUpload, error: cvError } = await supabase
    .from("CV_uploads")
    .insert({
      users_id: userId,
      filename,
      file_url: fileUrl,
    })
    .select()
    .single();

  if (cvError) {
    console.error("CV_uploads insert error:", cvError);
    return res.status(500).json({ error: "Failed to save CV record" });
  }

  // 5. Panggil Karisma AI (HF Space) untuk ekstrak skill + prediksi karir
  let aiSkills = [];
  let aiCareers = [];
  let aiStatus = "pending";

  if (extractedText.trim()) {
    try {
      console.log("⏳ Memanggil Karisma AI (HF Space)...");
      const aiResult = await callKarismaAI(extractedText);
      aiSkills = aiResult.skills_extracted || [];
      aiCareers = aiResult.career_recommendations || [];

      aiStatus = "analyzed";
      console.log(
        `✅ AI selesai: ${aiSkills.length} skill, ${aiCareers.length} karir`,
      );
    } catch (aiErr) {
      console.error("❌ Karisma AI error:", aiErr.message);
      aiStatus = "pending";
    }
  }

  // 6. Simpan CV_Analysis dengan hasil AI
  const skillsPayload = {
    raw_text: extractedText,
    num_pages: numPages,
    skills: aiSkills,
    status: aiStatus,
  };

  const { data: analysis, error: analysisError } = await supabase
    .from("CV_Analysis")
    .insert({
      CV_upload_id: cvUpload.id,
      Skills: skillsPayload,
      ...(aiStatus === "analyzed"
        ? { analyzes_at: new Date().toISOString() }
        : {}),
    })
    .select()
    .single();

  if (analysisError) {
    console.error("CV_Analysis insert error:", analysisError);
    return res.status(500).json({ error: "Failed to save analysis record" });
  }

  // 7. Simpan Career_Matches jika AI berhasil memprediksi
  if (aiCareers.length > 0 && analysis?.id) {
    const matchRows = [];

    for (const c of aiCareers) {
      const jobData = await findJobByCareer(c.career);
      const jobListingId = jobData?.id || null;
      const { matchedSkills, skillGaps } = computeSkillMatch(
        aiSkills,
        jobData,
      );

      matchRows.push({
        CV_analysis_id: analysis.id,
        Job_listing_id: jobListingId,
        Predicted_career: c.career,
        Match_percentage: parseFloat(c.score_pct) || 0,
        Matched_Skills: matchedSkills,
        Skill_gaps: skillGaps,
      });
    }

    const { error: matchError } = await supabase
      .from("Career_Matches")
      .insert(matchRows);

    if (matchError) {
      console.error("Career_Matches insert error:", matchError);
      // Non-fatal — CV & Analysis sudah tersimpan
    }
  }

  res.status(201).json({
    message:
      aiStatus === "analyzed"
        ? "CV uploaded, analyzed, and career matches saved successfully"
        : "CV uploaded and text extracted. AI analysis pending.",
    cv: {
      id: cvUpload.id,
      filename: cvUpload.filename,
      file_url: cvUpload.file_url,
      uploaded_at: cvUpload.uploaded_at,
      analysis_id: analysis.id,
      raw_text: extractedText,
      num_pages: numPages,
      skills: aiSkills,
      career_recommendations: aiCareers,
      status: aiStatus,
    },
  });
}

// ── GET /cv ───────────────────────────────────────────────────────────────────
export async function listCVs(req, res) {
  const userId = req.user.id;

  const { data: cvUploads, error } = await supabase
    .from("CV_uploads")
    .select(
      `
      id,
      filename,
      file_url,
      uploaded_at,
      CV_Analysis (
        id,
        Skills,
        analyzes_at,
        Career_Matches (
          id,
          Job_listing_id,
          Predicted_career,
          Match_percentage,
          Matched_Skills,
          Skill_gaps,
          created_at,
          Job_listings (
            id,
            Job,
            Min_Salary,
            Max_Salary
          )
        )
      )
    `,
    )
    .eq("users_id", userId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("CV list error:", error);
    return res.status(500).json({ error: "Failed to fetch CVs" });
  }

  // Normalize response shape to match what the frontend expects
  const normalized = (cvUploads || []).map((cv) => {
    const analysis = cv.CV_Analysis?.[0] || null;
    const skills = analysis?.Skills || {};
    const matches = (analysis?.Career_Matches || [])
      .map((m) => ({
        id: m.id,
        job_listing_id: m.Job_listing_id,
        predicted_career: m.Predicted_career,
        match_percentage: m.Match_percentage,
        matched_skills: m.Matched_Skills || [],
        skill_gaps: (m.Skill_gaps || []).slice(0, 5),
        created_at: m.created_at,
        job: m.Job_listings
          ? {
              id: m.Job_listings.id,
              category: m.Job_listings.Job,
              min_salary: m.Job_listings.Min_Salary,
              max_salary: m.Job_listings.Max_Salary,
            }
          : null,
      }))
      .sort((a, b) => b.match_percentage - a.match_percentage);

    return {
      id: cv.id,
      filename: cv.filename,
      file_url: cv.file_url,
      uploaded_at: cv.uploaded_at,
      analysis: analysis
        ? {
            id: analysis.id,
            skills: Array.isArray(skills.skills) ? skills.skills : [],
            raw_text: skills.raw_text || "",
            status: skills.status || "pending",
            num_pages: skills.num_pages || 0,
            analyzed_at: analysis.analyzes_at,
          }
        : null,
      matches,
    };
  });

  res.json({ cvs: normalized });
}

// ── GET /cv/:id ───────────────────────────────────────────────────────────────
export async function getCVById(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const { data: cv, error } = await supabase
    .from("CV_uploads")
    .select(
      `
      id,
      filename,
      file_url,
      uploaded_at,
      users_id,
      CV_Analysis (
        id,
        Skills,
        analyzes_at,
        Career_Matches (
          id,
          Job_listing_id,
          Predicted_career,
          Match_percentage,
          Matched_Skills,
          Skill_gaps,
          created_at,
          Job_listings (
            id,
            Job,
            Min_Salary,
            Max_Salary
          )
        )
      )
    `,
    )
    .eq("id", id)
    .eq("users_id", userId)
    .single();

  if (error || !cv) {
    return res.status(404).json({ error: "CV not found" });
  }

  const analysis = cv.CV_Analysis?.[0] || null;
  const skills = analysis?.Skills || {};
  const matches = (analysis?.Career_Matches || [])
    .map((m) => ({
      id: m.id,
      job_listing_id: m.Job_listing_id,
      predicted_career: m.Predicted_career,
      match_percentage: m.Match_percentage,
      matched_skills: m.Matched_Skills || [],
      skill_gaps: (m.Skill_gaps || []).slice(0, 5),
      created_at: m.created_at,
      job: m.Job_listings
        ? {
            id: m.Job_listings.id,
            category: m.Job_listings.Job,
            min_salary: m.Job_listings.Min_Salary,
            max_salary: m.Job_listings.Max_Salary,
          }
        : null,
    }))
    .sort((a, b) => b.match_percentage - a.match_percentage);

  res.json({
    cv: {
      id: cv.id,
      filename: cv.filename,
      file_url: cv.file_url,
      uploaded_at: cv.uploaded_at,
      analysis: analysis
        ? {
            id: analysis.id,
            skills: Array.isArray(skills.skills) ? skills.skills : [],
            raw_text: skills.raw_text || "",
            status: skills.status || "pending",
            num_pages: skills.num_pages || 0,
            analyzed_at: analysis.analyzes_at,
          }
        : null,
      matches,
    },
  });
}

// ── GET /cv/:id/raw-text ──────────────────────────────────────────────────────
export async function getCVRawText(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("CV_uploads")
    .select(
      `
      id,
      filename,
      users_id,
      CV_Analysis ( Skills )
    `,
    )
    .eq("id", id)
    .eq("users_id", userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "CV not found" });
  }

  const skills = data.CV_Analysis?.[0]?.Skills || {};
  const rawText = skills.raw_text || "";

  res.json({
    cv_id: data.id,
    filename: data.filename,
    raw_text: rawText,
  });
}

// ── PATCH /cv/:id/analysis ────────────────────────────────────────────────────
export async function updateAnalysis(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const { skills, matches } = req.body;

  // Verify ownership
  const { data: cv, error: cvErr } = await supabase
    .from("CV_uploads")
    .select("id, CV_Analysis(id, Skills)")
    .eq("id", id)
    .eq("users_id", userId)
    .single();

  if (cvErr || !cv) {
    return res.status(404).json({ error: "CV not found" });
  }

  const analysisId = cv.CV_Analysis?.[0]?.id;
  if (!analysisId) {
    return res.status(404).json({ error: "Analysis record not found" });
  }

  // Merge skills into existing Skills JSON (preserve raw_text)
  const existing = cv.CV_Analysis[0]?.Skills || {};
  const updatedSkills = {
    ...existing,
    skills: skills || existing.skills || [],
    status: "analyzed",
  };

  const { error: updateError } = await supabase
    .from("CV_Analysis")
    .update({
      Skills: updatedSkills,
      analyzes_at: new Date().toISOString(),
    })
    .eq("id", analysisId);

  if (updateError) {
    return res.status(500).json({ error: "Failed to update analysis" });
  }

  // Insert Career_Matches if provided
  if (matches?.length) {
    // Delete old matches first
    await supabase
      .from("Career_Matches")
      .delete()
      .eq("CV_analysis_id", analysisId);

    const matchRows = [];
    const finalSkills = updatedSkills.skills || [];

    for (const m of matches) {
      let jobListingId = m.job_listing_id || null;
      let jobData = null;

      if (jobListingId) {
        const { data: exactMatch } = await supabase
          .from("Job_listings")
          .select(`id, Job_Skills ( Skills ( Skill_name ) )`)
          .eq("id", jobListingId)
          .limit(1);
        if (exactMatch && exactMatch.length > 0) jobData = exactMatch[0];
      } else if (m.predicted_career) {
        jobData = await findJobByCareer(m.predicted_career);
      }

      if (jobData) {
        jobListingId = jobData.id;
      }

      const { matchedSkills, skillGaps } = computeSkillMatch(
        finalSkills,
        jobData,
      );

      matchRows.push({
        CV_analysis_id: analysisId,
        Job_listing_id: jobListingId,
        Predicted_career: m.predicted_career,
        Match_percentage: m.match_percentage,
        Matched_Skills: matchedSkills,
        Skill_gaps: skillGaps,
      });
    }

    const { error: matchError } = await supabase
      .from("Career_Matches")
      .insert(matchRows);

    if (matchError) {
      console.error("Career_Matches insert error:", matchError);
      return res
        .status(500)
        .json({ error: "Failed to save career matches" });
    }
  }

  res.json({ message: "Analysis updated successfully" });
}

// ── DELETE /cv/:id ────────────────────────────────────────────────────────────
export async function deleteCV(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  // Verify ownership
  const { data: cv, error: fetchError } = await supabase
    .from("CV_uploads")
    .select("id, file_url, CV_Analysis(id)")
    .eq("id", id)
    .eq("users_id", userId)
    .single();

  if (fetchError || !cv) {
    return res.status(404).json({ error: "CV not found" });
  }

  const analysisId = cv.CV_Analysis?.[0]?.id;

  // Delete Career_Matches → CV_Analysis → CV_uploads in order
  if (analysisId) {
    await supabase
      .from("Career_Matches")
      .delete()
      .eq("CV_analysis_id", analysisId);
    await supabase.from("CV_Analysis").delete().eq("id", analysisId);
  }

  const { error: deleteError } = await supabase
    .from("CV_uploads")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return res.status(500).json({ error: "Failed to delete CV" });
  }

  // Optionally remove from storage (extract key from URL)
  if (cv.file_url) {
    try {
      const url = new URL(cv.file_url);
      const parts = url.pathname.split(
        `/${process.env.CV_BUCKET || "cv-uploads"}/`,
      );
      const fileKey = parts[1];
      if (fileKey) {
        await supabase.storage
          .from(process.env.CV_BUCKET || "cv-uploads")
          .remove([fileKey]);
      }
    } catch (_) {
      // Non-critical — file may not exist in storage
    }
  }

  res.json({ message: "CV deleted successfully" });
}
