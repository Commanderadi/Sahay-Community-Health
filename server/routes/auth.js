const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Load JWT secret manually if not available
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const jwtLine = envContent.split('\n').find(line => line.startsWith('JWT_SECRET='));
    if (jwtLine) {
      JWT_SECRET = jwtLine.split('=')[1].trim();
    }
  }
}

// Fallback JWT secret if still not available
if (!JWT_SECRET) {
  JWT_SECRET = 'sahay_jwt_secret_key_2024';
  console.log('⚠️ Using fallback JWT secret');
}

const router = express.Router();

// 🔍 Test route to verify auth routes are working
router.get('/test', (req, res) => {
  res.send('Auth routes are working!');
});

// ✅ Register new user
router.post('/register', async (req, res) => {
  console.log('🔔 /register endpoint hit'); // Debug log

  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, role });
    await user.save();

    console.log('✅ User registered:', email);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ✅ Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET || 'sahay_jwt_secret_key_2024',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
