const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get Profile
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({
    signatureText: user.signatureText,
    fontSize: user.fontSize,
    fontColor: user.fontColor
  });
});

// Update Signature Style
router.patch('/update-style', auth, async (req, res) => {
  const { signatureText, fontSize, fontColor } = req.body;
  
  await User.findByIdAndUpdate(req.userId, {
    signatureText, fontSize, fontColor
  });

  res.json({ message: 'Signature style updated' });
});

module.exports = router;
