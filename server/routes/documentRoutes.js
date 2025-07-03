const express = require('express');
const router = express.Router();

const upload = require('../utils/multerConfig');
const auth = require('../middleware/authMiddleware');
const {
  uploadDocument,
  getUserDocuments,
  deleteDocument,
  sendSignatureLink,
  getPublicDocument,
  publicSign
} = require('../controllers/documentController');

// 📥 Upload PDF (protected)
router.post('/upload', auth, upload.single('pdf'), uploadDocument);

// 📃 Get user's uploaded documents (protected)
router.get('/', auth, getUserDocuments);

// 🗑️ Delete document by ID (protected)
router.delete('/:id', auth, deleteDocument);

// 📧 Send signature link via email (protected)
router.post('/send-link', auth, sendSignatureLink);

// 🌐 Get public document details by token (public)
router.get('/public/:token', getPublicDocument);

// 🖊️ Publicly sign document using token (public)
// 🖊️ Public Sign using token
router.post('/public-sign', publicSign);



module.exports = router;
