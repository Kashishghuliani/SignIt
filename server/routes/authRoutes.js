const express = require('express');
const { register, login, googleAuth } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');  // Import both handlers

const router = express.Router();

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Password Recovery Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
