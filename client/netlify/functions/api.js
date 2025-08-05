const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sahay-app.netlify.app', 'https://sahay-app.netlify.app/']
    : 'http://localhost:3000'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://aditya123:aditya123@cluster0.pirxh3j.mongodb.net/sahay?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'sahay_jwt_secret_key_2024';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const User = mongoose.model('User', {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'NGO', 'Visitor'], default: 'Visitor' }
});

const Clinic = mongoose.model('Clinic', {
  name: { type: String, required: true },
  city: { type: String, required: true },
  contact: { type: String, required: true },
  addedBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auth Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is connected!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clinic routes
app.get('/api/clinics', async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ createdAt: -1 });
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clinics/search', async (req, res) => {
  try {
    const { query } = req.query;
    const clinics = await Clinic.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clinics/add', verifyToken, async (req, res) => {
  try {
    const clinic = new Clinic(req.body);
    await clinic.save();
    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/clinics/:id', verifyToken, async (req, res) => {
  try {
    await Clinic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the serverless function
module.exports.handler = serverless(app); 