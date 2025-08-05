const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const clinicRoutes = require('./routes/clinic');
const authRoutes = require('./routes/auth');

const path = require('path');
const fs = require('fs');

// Load environment variables manually if dotenv fails
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

dotenv.config({ path: envPath });
const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'NOT LOADED');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');
console.log('PORT:', process.env.PORT || 5000);

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:3000',
  'https://sahaycommunity.netlify.app',
  'https://sahaycommunity.netlify.app/',
  'https://sahay-app.netlify.app',
  'https://sahay-app.netlify.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://sahaycommunity.netlify.app"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
}));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Use environment variable or fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://aditya123:aditya123@cluster0.pirxh3j.mongodb.net/sahay?retryWrites=true&w=majority';

console.log('Attempting to connect with URI:', MONGO_URI);
const JWT_SECRET = process.env.JWT_SECRET || 'sahay_jwt_secret_key_2024';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test endpoint to verify backend-frontend connectivity
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is connected!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

app.use('/api/clinics', clinicRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
