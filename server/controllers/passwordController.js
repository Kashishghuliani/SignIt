const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const FRONTEND_URL = 'https://sign-it-5656.vercel.app'; // Your deployed frontend
const RESET_SECRET = process.env.RESET_SECRET || 'supersecrettoken'; // Keep secret in .env

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Generate secure token with email, expires in 15 minutes
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
    console.error(err);
    res.status(500).json({ message: "Error sending email" });
  }
};

const resetPassword = (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password required" });
  }

  try {
    const decoded = jwt.verify(token, RESET_SECRET);
    const email = decoded.email;

    console.log(`Password for ${email} changed to: ${newPassword}`);
    // TODO: Hash newPassword and update in DB for real implementation

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = { forgotPassword, resetPassword };
