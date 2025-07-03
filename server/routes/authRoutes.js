const express = require('express');
const { register, login, googleAuth } = require('../controllers/authController');
const { forgotPassword } = require('../controllers/passwordController');  // Import forgot password handler

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);  // Add Forgot Password route

module.exports = router;
