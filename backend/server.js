const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  // In development, allow all origins so the Vite dev server can connect
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vs-dsa-sheet';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1); // Exit if database connection fails
});

// User Schema
const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit user ID!`
    }
  },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

// Progress Schema
const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  completedQuestions: { type: Map, of: Boolean, default: {} },
  reviewLater: { type: Map, of: Boolean, default: {} },
  revisionDates: { type: Map, of: String, default: {} },
  solutions: { 
    type: Map, 
    of: {
      code: { type: String, default: '' },
      links: { type: [String], default: [] },
      lastUpdated: { type: Date, default: Date.now }
    }, 
    default: {} 
  },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

progressSchema.index({ userId: 1 });
const Progress = mongoose.model('Progress', progressSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  topic: { type: String, required: true },
  pattern: { type: String, required: true },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['Easy', 'Medium', 'Hard', 'Very Hard']
  },
  sources: { type: String, default: '' }
});

const Question = mongoose.model('Question', questionSchema);

// Middleware to verify user
const verifyUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: 'Invalid user ID' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in verifyUser middleware:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============ AUTH ROUTES ============

// Login/Signup route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, name } = req.body;
    
    // Validate user ID
    if (!userId || !/^\d{10}$/.test(userId)) {
      return res.status(400).json({ error: 'Invalid user ID. Must be 10 digits.' });
    }
    
    let user = await User.findOne({ userId });
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (!user) {
      // New user
      if (!name) {
        return res.status(400).json({ error: 'Name required for new user' });
      }
      user = new User({ 
        userId, 
        name,
        streak: 1,
        longestStreak: 1,
        lastActiveDate: today
      });
    } else {
      // Existing user - update streak
      const lastActiveDate = user.lastActiveDate;
      
      if (lastActiveDate === today) {
        // Already logged in today, streak remains same
      } else if (lastActiveDate === yesterday.toDateString()) {
        // Consecutive day
        user.streak += 1;
      } else {
        // Streak broken
        user.streak = 1;
      }
      
      // Update longest streak if current streak is greater
      if (user.streak > user.longestStreak) {
        user.longestStreak = user.streak;
      }
      
      user.lastActiveDate = today;
    }
    
    user.lastActive = new Date();
    await user.save();
    
    // Get or create progress
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
      await progress.save();
    }
    
    res.json({ 
      user: { 
        userId: user.userId, 
        name: user.name, 
        streak: user.streak,
        longestStreak: user.longestStreak
      }, 
      progress: {
        completedQuestions: Object.fromEntries(progress.completedQuestions || new Map()),
        reviewLater: Object.fromEntries(progress.reviewLater || new Map()),
        revisionDates: Object.fromEntries(progress.revisionDates || new Map()),
        solutions: Object.fromEntries(progress.solutions || new Map())
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ PROGRESS ROUTES ============

// Get user progress
app.get('/api/progress/:userId', verifyUser, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.params.userId });
    if (!progress) {
      return res.json({ 
        completedQuestions: {}, 
        reviewLater: {}, 
        revisionDates: {}, 
        solutions: {} 
      });
    }
    
    res.json({
      completedQuestions: Object.fromEntries(progress.completedQuestions || new Map()),
      reviewLater: Object.fromEntries(progress.reviewLater || new Map()),
      revisionDates: Object.fromEntries(progress.revisionDates || new Map()),
      solutions: Object.fromEntries(progress.solutions || new Map())
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update progress
app.post('/api/progress/update', verifyUser, async (req, res) => {
  try {
    const { completedQuestions, reviewLater, revisionDates } = req.body;
    const userId = req.user.userId;
    
    const progress = await Progress.findOneAndUpdate(
      { userId },
      { 
        completedQuestions: new Map(Object.entries(completedQuestions || {})),
        reviewLater: new Map(Object.entries(reviewLater || {})),
        revisionDates: new Map(Object.entries(revisionDates || {})),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({
      completedQuestions: Object.fromEntries(progress.completedQuestions || new Map()),
      reviewLater: Object.fromEntries(progress.reviewLater || new Map()),
      revisionDates: Object.fromEntries(progress.revisionDates || new Map())
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ SOLUTIONS ROUTES ============

// Save solution
app.post('/api/solutions/save', verifyUser, async (req, res) => {
  try {
    const { questionId, code, links } = req.body;
    const userId = req.user.userId;
    
    if (!questionId) {
      return res.status(400).json({ error: 'Question ID required' });
    }
    
    const progress = await Progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }
    
    // Get existing solutions map or create new one
    const solutions = progress.solutions || new Map();
    
    // Update solution
    solutions.set(questionId.toString(), {
      code: code || '',
      links: links || [],
      lastUpdated: new Date()
    });
    
    progress.solutions = solutions;
    progress.updatedAt = new Date();
    await progress.save();
    
    res.json({ 
      success: true, 
      solution: {
        code: code || '',
        links: links || [],
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error saving solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get solution
app.get('/api/solutions/:userId/:questionId', verifyUser, async (req, res) => {
  try {
    const { userId, questionId } = req.params;
    
    const progress = await Progress.findOne({ userId });
    if (!progress || !progress.solutions) {
      return res.json({ code: '', links: [] });
    }
    
    const solution = progress.solutions.get(questionId.toString());
    res.json(solution || { code: '', links: [] });
  } catch (error) {
    console.error('Error getting solution:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ QUESTIONS ROUTES ============

// Sync questions from frontend
app.post('/api/questions/sync', async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Invalid questions data' });
    }
    
    let syncedCount = 0;
    for (const q of questions) {
      if (q.id && q.name && q.topic && q.pattern && q.difficulty) {
        await Question.findOneAndUpdate(
          { id: q.id },
          q,
          { upsert: true }
        );
        syncedCount++;
      }
    }
    
    res.json({ success: true, count: syncedCount });
  } catch (error) {
    console.error('Error syncing questions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all questions (optional)
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ id: 1 });
    res.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============ START SERVER ============

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API URL: http://localhost:${PORT}`);
  console.log(`🔗 MongoDB: ${MONGODB_URI}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});