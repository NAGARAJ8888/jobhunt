import { Request, Response } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const PASSWORD_SALT_ROUNDS = 10;

const hashOtp = (otp: string) =>
  crypto.createHash('sha256').update(otp).digest('hex');

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getMailTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('SMTP Configuration Error:');
    console.error('SMTP_HOST:', smtpHost ? '✓ set' : '✗ MISSING');
    console.error('SMTP_USER:', smtpUser ? '✓ set' : '✗ MISSING');
    console.error('SMTP_PASS:', smtpPass ? '✓ set' : '✗ MISSING');
    console.error('SMTP_PORT:', smtpPort);
    console.error('SMTP_SECURE:', smtpSecure);
    throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optional SMTP_PORT, SMTP_SECURE, MAIL_FROM) in environment variables.');
  }

  console.log('Initializing SMTP transporter with host:', smtpHost, 'port:', smtpPort);

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const sendPasswordResetOtpEmail = async (email: string, otp: string) => {
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
  console.log('Sending OTP email to:', email, 'from:', mailFrom);
  
  try {
    const transporter = getMailTransporter();
    const result = await transporter.sendMail({
      from: mailFrom,
      to: email,
      subject: 'JobPortal Password Reset OTP',
      text: `Your JobPortal password reset OTP is ${otp}. It expires in 10 minutes.`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2 style="margin-bottom:8px;">JobPortal Password Reset</h2>
        <p>Use this OTP to reset your password:</p>
        <p style="font-size:24px; font-weight:700; letter-spacing:2px; margin:12px 0;">${otp}</p>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
    });
    console.log('OTP email sent successfully. MessageId:', result.messageId);
  } catch (error: any) {
    console.error('Failed to send OTP email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, role } = req.body;
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ user: { id: user._id, name, email, role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    let isPasswordValid = false;
    if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Backward compatibility for previously stored plaintext passwords.
      isPasswordValid = user.password === password;
      if (isPasswordValid) {
        user.password = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
        await user.save();
      }
    }

    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const requestPasswordResetOtp = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for this email, an OTP has been sent.',
      });
    }

    const otp = generateOtp();
    user.forgotPasswordOtpHash = hashOtp(otp);
    user.forgotPasswordOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    user.forgotPasswordOtpAttempts = 0;
    user.forgotPasswordResetToken = null;
    user.forgotPasswordResetTokenExpiresAt = null;
    await user.save();

    await sendPasswordResetOtpEmail(email, otp);

    return res.status(200).json({
      message: 'OTP has been sent to your email.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const verifyPasswordResetOtp = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.forgotPasswordOtpHash || !user.forgotPasswordOtpExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (user.forgotPasswordOtpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many invalid attempts. Request a new OTP.' });
    }

    if (new Date(user.forgotPasswordOtpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP expired. Request a new OTP.' });
    }

    const isValidOtp = hashOtp(otp) === user.forgotPasswordOtpHash;
    if (!isValidOtp) {
      user.forgotPasswordOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.forgotPasswordResetToken = resetToken;
    user.forgotPasswordResetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
    user.forgotPasswordOtpHash = null;
    user.forgotPasswordOtpExpiresAt = null;
    user.forgotPasswordOtpAttempts = 0;
    await user.save();

    return res.status(200).json({
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const resetToken = String(req.body?.resetToken || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Email, reset token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.forgotPasswordResetToken || !user.forgotPasswordResetTokenExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired reset session' });
    }

    const isTokenExpired = new Date(user.forgotPasswordResetTokenExpiresAt).getTime() < Date.now();
    if (isTokenExpired || user.forgotPasswordResetToken !== resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset session' });
    }

    user.password = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    user.forgotPasswordResetToken = null;
    user.forgotPasswordResetTokenExpiresAt = null;
    user.forgotPasswordOtpHash = null;
    user.forgotPasswordOtpExpiresAt = null;
    user.forgotPasswordOtpAttempts = 0;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
