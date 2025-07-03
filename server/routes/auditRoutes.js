const express = require('express');
const router = express.Router();
const Audit = require('../models/Audit');
const auth = require('../middleware/authMiddleware');

router.get('/:documentId', auth, async (req, res) => {
  try {
    const logs = await Audit.find({ documentId: req.params.documentId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
