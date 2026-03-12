const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ========== SIGNUP ==========
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        stats: user.stats,
        inventory: user.inventory
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating account' });
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    user.isOnline = true;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        stats: user.stats,
        inventory: user.inventory,
        kdRatio: user.kdRatio,
        winRate: user.winRate,
        accuracy: user.accuracy
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// ========== GET PROFILE ==========
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      stats: user.stats,
      inventory: user.inventory,
      achievements: user.achievements,
      matchHistory: user.matchHistory.slice(0, 10), // Last 10 games
      kdRatio: user.kdRatio,
      winRate: user.winRate,
      accuracy: user.accuracy,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// ========== UPDATE PROFILE ==========
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { equippedSkin, equippedTrail } = req.body;
    const user = await User.findById(req.userId);
    
    // Update equipped cosmetics
    if (equippedSkin && user.inventory.ownedSkins.includes(equippedSkin)) {
      user.inventory.equippedSkin = equippedSkin;
    }
    
    if (equippedTrail && user.inventory.ownedTrails.includes(equippedTrail)) {
      user.inventory.equippedTrail = equippedTrail;
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated',
      inventory: user.inventory
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// ========== GET LEADERBOARD ==========
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'wins', limit = 100 } = req.query;
    
    let sortField;
    switch (type) {
      case 'wins':
        sortField = { 'stats.wins': -1 };
        break;
      case 'kills':
        sortField = { 'stats.kills': -1 };
        break;
      case 'level':
        sortField = { 'stats.level': -1, 'stats.xp': -1 };
        break;
      default:
        sortField = { 'stats.wins': -1 };
    }
    
    const users = await User.find()
      .select('username stats createdAt')
      .sort(sortField)
      .limit(parseInt(limit));
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      stats: user.stats,
      kdRatio: user.kdRatio,
      winRate: user.winRate,
      memberSince: user.createdAt
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

// ========== BUY ITEM FROM SHOP ==========
router.post('/shop/buy', authenticate, async (req, res) => {
  try {
    const { itemType, itemId, price } = req.body;
    const user = await User.findById(req.userId);
    
    // Check if user has enough coins
    if (user.stats.coins < price) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    
    // Check if already owned
    let alreadyOwned = false;
    if (itemType === 'skin') {
      alreadyOwned = user.inventory.ownedSkins.includes(itemId);
    } else if (itemType === 'trail') {
      alreadyOwned = user.inventory.ownedTrails.includes(itemId);
    } else if (itemType === 'emote') {
      alreadyOwned = user.inventory.ownedEmotes.includes(itemId);
    }
    
    if (alreadyOwned) {
      return res.status(400).json({ error: 'Already owned' });
    }
    
    // Deduct coins and add item
    user.stats.coins -= price;
    
    if (itemType === 'skin') {
      user.inventory.ownedSkins.push(itemId);
    } else if (itemType === 'trail') {
      user.inventory.ownedTrails.push(itemId);
    } else if (itemType === 'emote') {
      user.inventory.ownedEmotes.push(itemId);
    }
    
    await user.save();
    
    res.json({
      message: 'Purchase successful!',
      coins: user.stats.coins,
      inventory: user.inventory
    });
  } catch (error) {
    console.error('Shop purchase error:', error);
    res.status(500).json({ error: 'Error processing purchase' });
  }
});

// ========== LOGOUT ==========
router.post('/logout', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.isOnline = false;
    await user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error logging out' });
  }
});

module.exports = router;
