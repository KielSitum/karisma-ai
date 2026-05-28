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
  sendVerificationEmail,
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
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

const router = Router();

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

// ── GET /auth/verify-email ────────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
    }

    if (decoded.purpose !== 'email-verification') {
      return res.status(400).json({ error: 'Invalid token.' });
    }

    const { error } = await supabase
      .from('Users')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', decoded.userId);

    if (error) return res.status(500).json({ error: 'Failed to verify email.' });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// ── POST /auth/resend-verification ───────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data: user } = await supabase
      .from('Users')
      .select('id, full_name, email, is_verified')
      .eq('email', email)
      .maybeSingle();

    if (!user) return res.json({ success: true });
    if (user.is_verified) return res.status(400).json({ error: 'Email is already verified.' });

    await sendVerificationEmail(user);
    res.json({ success: true, message: 'Verification email resent.' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend email.' });
  }
});

// ── POST /auth/google ─────────────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    const { data: existingUser } = await supabase
      .from('Users')
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .eq('email', email)
      .maybeSingle();

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        message: 'Email not registered. Please register first.',
        email, name, picture,
      });
    }

    let user = existingUser;

    if (picture && !user.avatar_url) {
      const { data: updatedUser } = await supabase
        .from('Users')
        .update({ avatar_url: picture, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select('id, full_name, email, avatar_url, created_at, updated_at')
        .single();
      if (updatedUser) user = updatedUser;
    }

    const appToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ success: true, token: appToken, user });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ success: false, message: "Invalid Firebase token" });
  }
});

// ── POST /auth/avatar ─────────────────────────────────────────────────────────
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const userId = req.user.id;
    const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const fileName = `${process.env.CV_AVATAR_BUCKET}/${userId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(process.env.CV_AVATAR_BUCKET)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload avatar' });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(process.env.CV_AVATAR_BUCKET)
      .getPublicUrl(fileName);

    const cleanUrl = publicUrl.split('?')[0];

    const { data: user, error: updateError } = await supabase
      .from('Users')
      .update({ avatar_url: cleanUrl, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .single();

    if (updateError) return res.status(500).json({ error: 'Failed to update avatar URL' });

    res.json({ avatar_url: cleanUrl, user });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload avatar' });
  }
});

// ── POST /auth/register-google ────────────────────────────────────────────────
router.post("/register-google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token is required" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = decodedToken;

    const { data: existingUser } = await supabase
      .from('Users').select('id').eq('email', email).maybeSingle();

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const { data: newUser, error } = await supabase
      .from('Users')
      .insert({
        full_name: name,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        avatar_url: picture || null,
        is_verified: true, // Google email sudah terverifikasi
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .single();

    if (error) throw error;

    const appToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({ success: true, token: appToken, user: newUser });
  } catch (err) {
    console.error('Register Google error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to register account.', detail: err.message });
  }
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data: user } = await supabase
      .from('Users').select('id, full_name, email').eq('email', email).maybeSingle();

    if (!user) {
      return res.json({ success: true, message: 'If email is registered, a reset link will be sent.' });
    }

    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const { error: emailError } = await resend.emails.send({
      from: `Karisma AI <noreply@karisma-ai.site>`,
      to: user.email,
      subject: 'Reset Your Karisma AI Password',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#F4F5FB;border-radius:16px">
          <img src="${process.env.FRONTEND_URL}/logo-karisma.png" alt="Karisma AI" style="height:32px;margin-bottom:24px" />
          <h2 style="color:#0F1226;font-size:20px;font-weight:700;margin:0 0 8px">Reset Your Password</h2>
          <p style="color:#5A5F7D;font-size:14px;margin:0 0 24px;line-height:1.6">
            Hi ${user.full_name}, we received a request to reset the password for your account.
            Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#5B4FE8;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
            Reset My Password
          </a>
          <p style="color:#9EA3BC;font-size:12px;margin:24px 0 0;line-height:1.6">
            If you did not request a password reset, you can safely ignore this email. Your account remains secure.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }

    res.json({ success: true, message: 'If email is registered, a reset link will be sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

// ── POST /auth/reset-password ─────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Reset password link is not valid or has expired.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Token is not valid.' });
    }

    const hashed = await bcrypt.hash(password, 12);

    const { error: updateError } = await supabase
      .from('Users')
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq('id', decoded.userId);

    if (updateError) return res.status(500).json({ error: 'Failed to update password.' });

    res.json({ success: true, message: 'Password successfully updated. Please login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'An error occurred while resetting the password.' });
  }
});

export default router;
