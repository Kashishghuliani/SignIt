const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Signature = require('../models/Signature');
const Document = require('../models/Document');
const auth = require('../middleware/authMiddleware');
const { finalizeDocument, deleteSignature, updateSignatureStatus } = require('../controllers/signatureController');
const User = require('../models/User');


// 🔒 Authenticated Routes

// Get Signatures for a Document
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid Document ID' });

    const signatures = await Signature.find({ documentId: req.params.id });
    res.json(signatures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Place Signature (Private Authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, x, y, page, renderWidth, renderHeight, text, fontSize, fontColor } = req.body;

    if (!documentId || x === undefined || y === undefined || !page || !renderWidth || !renderHeight)
      return res.status(400).json({ message: 'Missing required fields' });
    const user = await User.findById(req.userId);
    const newSignature = new Signature({
    documentId,
    x: parseFloat(x),
    y: parseFloat(y),
    page: page || 1,
    renderWidth: parseFloat(renderWidth),
    renderHeight: parseFloat(renderHeight),
    status: 'Pending',
    text: text?.trim(),   // ✅ Make sure you're capturing this
    fontSize: fontSize || 14,
    fontColor: fontColor || '#000000'
   });


    await newSignature.save();
    res.json(newSignature);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Finalize Document (Add all signatures)
router.post('/finalize', auth, finalizeDocument);

// Delete Signature
router.delete('/:id', auth, deleteSignature);

// Update Signature Status
router.patch('/:id/status', auth, updateSignatureStatus);

module.exports = router;
