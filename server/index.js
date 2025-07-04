const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // <-- import helmet
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const signatureRoutes = require('./routes/signatureRoutes');
const auditRoutes = require('./routes/auditRoutes');

dotenv.config();

const app = express();

// Enable CORS with credentials (adjust origin to your frontend URL)
app.use(cors({
  origin: 'https://sign-it-5656.vercel.app', // replace with your actual frontend URL
  credentials: true,
}));

// Use helmet with COOP and COEP headers enabled
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: true
}));

app.use(express.json());

// Serve Uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
