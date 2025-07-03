const nodemailer = require('nodemailer');

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kashishghuliani2004@gmail.com',      // Replace with your Gmail
      pass: 'oxofeipkaagjltfx'           // Use App Password generated in Google Account
    }
  });

  const mailOptions = {
    from: 'yourEmail@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the link to reset your password: http://localhost:3000/reset-password/${generateToken()}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }
};

// Dummy token generator (replace with real token logic later)
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15);
};

module.exports = { forgotPassword };
