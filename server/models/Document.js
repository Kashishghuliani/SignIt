const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true // Original name of uploaded PDF
  },
  filepath: {
    type: String,
    required: true // Path where file is stored on server (e.g., /uploads/file.pdf)
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Reference to the User who uploaded
  },
  uploadedAt: {
    type: Date,
    default: Date.now // Auto set timestamp when uploaded
  },
  token: {
    type: String,
    default: null // Public signing token (for email links)
  },
  tokenExpires: {
    type: Date,
    default: null // Expiry time for public signing link
  }
});

module.exports = mongoose.model('Document', documentSchema);
