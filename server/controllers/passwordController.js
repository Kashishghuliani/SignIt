const nodemailer = require('nodemailer');

const FRONTEND_URL = 'https://sign-it-5656.vercel.app';  // ✅ Your deployed frontend
let tokenStore = {};  // Temporary token storage (use DB in real project)

// Dummy token generator
const generateToken = () => Math.random().toString(36).substring(2, 15);

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const token = generateToken();
  tokenStore[token] = email;  // Store token with email

  const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kashishghuliani2004@gmail.com',
      pass: 'oxofeipkaagjltfx'  
    }
  });

  const mailOptions = {
    from: 'kashishghuliani2004@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
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

  const email = tokenStore[token];
  if (!email) return res.status(400).json({ message: "Invalid or expired token" });

  console.log(`Password for ${email} changed to: ${newPassword}`);  // In real app, hash & update DB
  delete tokenStore[token];  // Remove token after use

  res.json({ message: "Password reset successful!" });
};

module.exports = { forgotPassword, resetPassword };
