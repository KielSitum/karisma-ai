import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../config/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { extractTextFromPDF } from "../utils/pdfExtractor.js";

const router = Router();
const BUCKET = process.env.CV_BUCKET || "cv-uploads";

// ── POST /cv/upload ───────────────────────────────────────────────────────────
// Uploads PDF to Supabase Storage, extracts raw text, saves CV_uploads + CV_Analysis row
router.post(
  "/upload",
  authMiddleware,
  uploadMiddleware.single("cv"),
  async (req, res) => {
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

    // 5. Create CV_Analysis record with extracted text in Skills JSON
    //    Skills is stored as JSON — we store raw_text here so the ML model can use it.
    //    The model will later update this with proper skill data.
    const initialAnalysis = {
      raw_text: extractedText,
      num_pages: numPages,
      skills: [], // to be filled by ML model
      status: "pending", // pending | analyzed
    };

    const { data: analysis, error: analysisError } = await supabase
      .from("CV_Analysis")
      .insert({
        CV_upload_id: cvUpload.id,
        Skills: initialAnalysis,
      })
      .select()
      .single();

    if (analysisError) {
      console.error("CV_Analysis insert error:", analysisError);
      return res.status(500).json({ error: "Failed to save analysis record" });
    }

    res.status(201).json({
      message: "CV uploaded and text extracted successfully",
      cv: {
        id: cvUpload.id,
        filename: cvUpload.filename,
        file_url: cvUpload.file_url,
        uploaded_at: cvUpload.uploaded_at,
        analysis_id: analysis.id,
        raw_text: extractedText,
        num_pages: numPages,
      },
    });
  },
);

// ── GET /cv ───────────────────────────────────────────────────────────────────
// List all CVs for authenticated user with their analysis & matches
router.get("/", authMiddleware, async (req, res) => {
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
            Title,
            Job_Category,
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
        skill_gaps: m.Skill_gaps || [],
        created_at: m.created_at,
        job: m.Job_listings
          ? {
              id: m.Job_listings.id,
              title: m.Job_listings.Title,
              category: m.Job_listings.Job_Category,
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
});

// ── GET /cv/:id ───────────────────────────────────────────────────────────────
// Get a single CV with full analysis & matches
router.get("/:id", authMiddleware, async (req, res) => {
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
            Title,
            Job_Category,
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
      skill_gaps: m.Skill_gaps || [],
      created_at: m.created_at,
      job: m.Job_listings
        ? {
            id: m.Job_listings.id,
            title: m.Job_listings.Title,
            category: m.Job_listings.Job_Category,
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
});

// ── GET /cv/:id/raw-text ──────────────────────────────────────────────────────
// Return only the extracted raw text — for ML model consumption
router.get("/:id/raw-text", authMiddleware, async (req, res) => {
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
});

// ── PATCH /cv/:id/analysis ────────────────────────────────────────────────────
// Update CV_Analysis with results from ML model (skills, matches, etc.)
// This endpoint is for the ML model to push results back
router.patch("/:id/analysis", authMiddleware, async (req, res) => {
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

    const matchRows = matches.map((m) => ({
      CV_analysis_id: analysisId,
      Job_listing_id: m.job_listing_id || null,
      Predicted_career: m.predicted_career,
      Match_percentage: m.match_percentage,
      Matched_Skills: m.matched_skills || [],
      Skill_gaps: m.skill_gaps || [],
    }));

    const { error: matchError } = await supabase
      .from("Career_Matches")
      .insert(matchRows);

    if (matchError) {
      console.error("Career_Matches insert error:", matchError);
      return res.status(500).json({ error: "Failed to save career matches" });
    }
  }

  res.json({ message: "Analysis updated successfully" });
});

// ── DELETE /cv/:id ────────────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
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
});

export default router;
