import { Router } from 'express';
import { validationResult } from 'express-validator';
import { authMiddleware } from '../../../middlewares/auth.js';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controller/auth-controller.js';
import {
  registerValidation,
  loginValidation,
  profileValidation,
  passwordValidation,
} from '../validator/schema.js';

import admin from "../../../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import { supabase } from '../../../config/supabase.js';
import multer from 'multer';
import crypto from 'crypto';

// Multer untuk avatar (image only, max 2MB)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

const router = Router();

// ── Validation middleware helper ──────────────────────────────────────────────
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post('/register', registerValidation, validate, register);

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post('/login', loginValidation, validate, login);

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, getMe);

// ── PATCH /auth/profile ───────────────────────────────────────────────────────
router.patch('/profile', authMiddleware, profileValidation, validate, updateProfile);

// ── PATCH /auth/password ──────────────────────────────────────────────────────
router.patch('/password', authMiddleware, passwordValidation, validate, changePassword);

// ── DELETE /auth/account ──────────────────────────────────────────────────────
router.delete('/account', authMiddleware, deleteAccount);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // Cek apakah user sudah ada di database (berdasarkan email)
    const { data: existingUser } = await supabase
      .from('Users')
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .eq('email', email)
      .maybeSingle();

    // Jika belum terdaftar → tolak, suruh register dulu
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        message: 'Akun Google ini belum terdaftar. Silakan daftar terlebih dahulu.',
        email,
        name,
        picture,
      });
    }

    let user = existingUser;

    // Update avatar jika berubah
    if (picture && !user.avatar_url) {
      const { data: updatedUser } = await supabase
        .from('Users')
        .update({ avatar_url: picture, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('id, full_name, email, avatar_url, created_at, updated_at')
        .single();
      if (updatedUser) user = updatedUser;
    }

    // Sign JWT dengan userId (konsisten dengan login biasa)
    const appToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      token: appToken,
      user,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({
      success: false,
      message: "Invalid Firebase token",
    });
  }
});


// ── POST /auth/avatar ─────────────────────────────────────────────────────────
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const fileName = `${process.env.CV_AVATAR_BUCKET}/${userId}.${ext}`;

    // Upload ke Supabase Storage bucket "avatars"
    const { error: uploadError } = await supabase.storage
      .from(process.env.CV_AVATAR_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true, // overwrite jika sudah ada
      });

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload avatar' });
    }

    // Ambil public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.CV_AVATAR_BUCKET)
      .getPublicUrl(fileName);

    const cleanUrl = publicUrl.split('?')[0];

    // Simpan URL ke tabel Users
    const { data: user, error: updateError } = await supabase
      .from('Users')
      .update({ avatar_url: cleanUrl, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update avatar URL' });
    }

    res.json({ avatar_url: cleanUrl, user });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload avatar' });
  }
});

router.post("/register-google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = decodedToken;
    console.log('1. Decoded:', { email, name });

    const { data: existingUser } = await supabase
      .from('Users').select('id').eq('email', email).maybeSingle();
    console.log('2. Existing user:', existingUser);

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const { data: newUser, error } = await supabase
      .from('Users')
      .insert({
        full_name: name,
        email,
        password: crypto.randomBytes(32).toString('hex'), // ← random, tidak bisa dipakai login
        avatar_url: picture || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .single();
    console.log('3. Insert result:', { newUser, error });

    if (error) throw error;

    const appToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({ success: true, token: appToken, user: newUser });
  } catch (err) {
    console.error('4. Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan akun.', detail: err.message });
  }
});

export default router;
