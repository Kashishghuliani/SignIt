const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const signatureRoutes = require('./routes/signatureRoutes');
const auditRoutes = require('./routes/auditRoutes');

dotenv.config();

const app = express();

// Allowed Origins from .env
const allowedOrigins = [
  process.env.FRONTEND_URL,      // Vercel Frontend
  'http://localhost:3000'        // Local testing
];

// Enable CORS with dynamic origin check
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

// Helmet with safer COOP/COEP configuration
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Allow JSON parsing
app.use(express.json());

// Serve uploaded PDFs statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', documentRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/audit', auditRoutes);

// Root Health Check
app.get('/', (req, res) => res.send('✅ API is working'));

const PORT = process.env.PORT || 5000;

// Database Connection and Server Start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ MongoDB Connection Error:', err));
