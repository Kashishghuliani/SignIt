const mongoose = require('mongoose');

const SignatureSchema = new mongoose.Schema({

  documentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document', 
    required: true 
  },

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },

  x: { type: Number, required: true },
  y: { type: Number, required: true },
  page: { type: Number, required: true },
  renderWidth: { type: Number, required: true },
  renderHeight: { type: Number, required: true },

  status: { 
    type: String, 
    enum: ['Pending', 'Signed', 'Rejected'], 
    default: 'Pending' 
  },

  reason: { 
    type: String, 
    default: '' 
  },

  text: { 
    type: String, 
    default: '' 
  },

  fontSize: { 
    type: Number, 
    default: 14 
  },

  fontColor: { 
    type: String, 
    default: "#000000" 
  }

}, { timestamps: true });

module.exports = mongoose.model('Signature', SignatureSchema);
