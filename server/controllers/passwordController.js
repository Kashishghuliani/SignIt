const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sign-it-5656.vercel.app';
const RESET_SECRET = process.env.RESET_SECRET || 'supersecrettoken';

// Forgot Password - Send Reset Link
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = jwt.sign({ email }, RESET_SECRET, { expiresIn: '15m' });
  const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset.</p>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 15 minutes.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent!" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: "Error sending email" });
  }
};

// Reset Password - Update Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password required" });
  }

  try {
    const decoded = jwt.verify(token, RESET_SECRET);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = { forgotPassword, resetPassword };
