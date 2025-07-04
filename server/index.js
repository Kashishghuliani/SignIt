const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('✅ uploads folder created');
} else {
  console.log('✅ uploads folder exists');
}

// Routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const signatureRoutes = require('./routes/signatureRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Allowed Origins (Local + Deployed Frontend)
const allowedOrigins = [
  process.env.FRONTEND_URL, // Example: https://sign-it-5656.vercel.app
  'https://sign-it-5656.vercel.app'
];

// CORS Setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Security Headers
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Manual COOP/COEP to avoid browser postMessage issues
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json());

// Serve Uploaded PDFs
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', documentRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/audit', auditRoutes);

app.get('/', (req, res) => res.send('✅ API is working'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ MongoDB Connection Error:', err));
