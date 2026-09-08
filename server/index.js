const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const clinicRoutes = require('./routes/clinic');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

dotenv.config({ path: path.join(__dirname, '.env') });

// Some environments hand Node a loopback DNS resolver (127.0.0.1) with nothing
// listening, which breaks the mongodb+srv lookup. Fall back to public resolvers
// in that case. Override with DNS_SERVERS (comma-separated) if needed.
const servers = dns.getServers();
const onlyLoopback = servers.every((s) => s === '127.0.0.1' || s === '::1');
if (onlyLoopback || process.env.DNS_SERVERS) {
  const fallback = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean)
    : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];
  dns.setServers(fallback);
  console.log('DNS resolvers set to:', fallback.join(', '));
}

// Fail fast if required secrets are missing instead of falling back to
// insecure defaults.
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Create server/.env from server/.env.example and set these values.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// CORS: allow the local dev client plus any origins listed in ALLOWED_ORIGINS
// (comma-separated) so production URLs are configured, not hardcoded.
const allowedOrigins = [
  'http://localhost:3000',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : []),
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server).
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// Health / connectivity check used by the frontend.
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is connected!',
    timestamp: new Date().toISOString(),
    status: 'success',
  });
});

app.use('/api/clinics', clinicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 for unknown API routes.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler — must be registered after the routes.
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
