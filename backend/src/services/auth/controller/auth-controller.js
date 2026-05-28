import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { supabase } from '../../../config/supabase.js';

const resend = new Resend(process.env.RESEND_API_KEY);

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── Helper: send verification email ──────────────────────────────────────────
export async function sendVerificationEmail(user) {
  const verifyToken = jwt.sign(
    { userId: user.id, purpose: 'email-verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

  const { error } = await resend.emails.send({
    from: `Karisma AI <noreply@karisma-ai.site>`,
    to: user.email,
    subject: 'Verify Your Karisma AI Account',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#F4F5FB;border-radius:16px">
        <img src="${process.env.FRONTEND_URL}/logo-karisma.png" alt="Karisma AI" style="height:32px;margin-bottom:24px" />
        <h2 style="color:#0F1226;font-size:20px;font-weight:700;margin:0 0 8px">Verify Your Email Address</h2>
        <p style="color:#5A5F7D;font-size:14px;margin:0 0 24px;line-height:1.6">
          Hi ${user.full_name}, welcome to Karisma AI! Click the button below to verify your email address and activate your account. This link is valid for <strong>24 hours</strong>.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;background:#5B4FE8;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
          Verify My Email
        </a>
        <p style="color:#9EA3BC;font-size:12px;margin:24px 0 0;line-height:1.6">
          If you didn't create an account with Karisma AI, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) throw new Error('Failed to send verification email');
}

// ── POST /auth/register ───────────────────────────────────────────────────────
export async function register(req, res) {
  const { full_name, email, password } = req.body;

  const { data: existing } = await supabase
    .from('Users').select('id').eq('email', email).maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from('Users')
    .insert({ full_name, email, password: hashedPassword, is_verified: false })
    .select('id, full_name, email, avatar_url, created_at')
    .single();

  if (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }

  try {
    await sendVerificationEmail(user);
  } catch (emailErr) {
    console.error('Failed to send verification email:', emailErr);
  }

  res.status(201).json({
    success: true,
    requiresVerification: true,
    email: user.email,
    message: 'Account created. Please check your email to verify your account.',
  });
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
export async function login(req, res) {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('Users')
    .select('id, full_name, email, password, avatar_url, is_verified, created_at, updated_at')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.is_verified) {
    return res.status(403).json({
      error: 'Please verify your email before logging in.',
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
    });
  }

  const token = signToken(user.id);
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
}

// ── GET /auth/me ──────────────────────────────────────────────────────────────
export function getMe(req, res) {
  res.json({ user: req.user });
}

// ── PATCH /auth/profile ───────────────────────────────────────────────────────
export async function updateProfile(req, res) {
  const { full_name, avatar_url } = req.body;
  const updates = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.updated_at = new Date().toISOString();

  const { data: user, error } = await supabase
    .from('Users')
    .update(updates)
    .eq('id', req.user.id)
    .select('id, full_name, email, avatar_url, created_at, updated_at')
    .single();

  if (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }

  res.json({ user });
}

// ── PATCH /auth/password ──────────────────────────────────────────────────────
export async function changePassword(req, res) {
  const { current_password, new_password } = req.body;

  const { data: user, error: fetchError } = await supabase
    .from('Users').select('password').eq('id', req.user.id).single();

  if (fetchError || !user) {
    return res.status(500).json({ error: 'Failed to verify current password' });
  }

  const valid = await bcrypt.compare(current_password, user.password);
  if (!valid) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const hashed = await bcrypt.hash(new_password, 12);

  const { error: updateError } = await supabase
    .from('Users')
    .update({ password: hashed, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update password' });
  }

  res.json({ message: 'Password updated successfully' });
}

// ── DELETE /auth/account ──────────────────────────────────────────────────────
export async function deleteAccount(req, res) {
  const userId = req.user.id;

  const { data: cvUploads } = await supabase
    .from('CV_uploads').select('id').eq('users_id', userId);

  if (cvUploads?.length) {
    const cvIds = cvUploads.map(cv => cv.id);
    const { data: analyses } = await supabase
      .from('CV_Analysis').select('id').in('CV_upload_id', cvIds);

    if (analyses?.length) {
      const analysisIds = analyses.map(a => a.id);
      await supabase.from('Career_Matches').delete().in('CV_analysis_id', analysisIds);
      await supabase.from('CV_Analysis').delete().in('id', analysisIds);
    }

    await supabase.from('CV_uploads').delete().in('id', cvIds);
  }

  const { error } = await supabase.from('Users').delete().eq('id', userId);

  if (error) {
    return res.status(500).json({ error: 'Failed to delete account' });
  }

  res.json({ message: 'Account deleted successfully' });
}
