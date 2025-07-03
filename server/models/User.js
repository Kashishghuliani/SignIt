const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  // 🎨 Signature Style Preferences
  signatureText: {
    type: String,
    default: ''
  },

  fontSize: {
    type: Number,
    default: 14
  },

  fontColor: {
    type: String,
    default: '#000000'
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
