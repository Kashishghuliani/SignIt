const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  action: String, // e.g., "Signed", "Viewed"
  user: String,   // Name or "Public"
  email: String,  // Email or "-"
  ip: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Audit', auditSchema);
