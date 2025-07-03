require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const secret = process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret); // Only your own token
    req.userId = decoded.userId;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.userName = user.name;
    req.userEmail = user.email;

    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
