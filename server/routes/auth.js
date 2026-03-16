const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Keep in sync with server/index.js ADMIN_USERNAMES
const ADMIN_USERNAMES = ['jmanskills'];
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
    const { identifier, password, email } = req.body;
    
    // Support both old 'email' field and new 'identifier' field
    const loginValue = identifier || email;
    
    if (!loginValue || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }
    
    // Find user by username OR email (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: loginValue.toLowerCase() },
        { username: { $regex: new RegExp(`^${loginValue}$`, 'i') } }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    user.isOnline  = true;

    // Auto-grant admin if username is in the hardcoded list
    if (!user.isAdmin && ADMIN_USERNAMES.map(u => u.toLowerCase()).includes(user.username.toLowerCase())) {
      user.isAdmin = true;
    }

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
        isAdmin: user.isAdmin,
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
      matchHistory: user.matchHistory.slice(0, 10),
      kdRatio: user.kdRatio,
      winRate: user.winRate,
      accuracy: user.accuracy,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      battleTicket: user.battleTicket,
      settings: user.settings,
      profile: user.profile || { bio: '', profilePic: 'default', ownedProfilePics: ['default'] }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// ========== UPDATE PROFILE ==========
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { equippedSkin, equippedTrail, settings } = req.body;
    const user = await User.findById(req.userId);

    // Update equipped cosmetics
    if (equippedSkin && user.inventory.ownedSkins.includes(equippedSkin)) {
      user.inventory.equippedSkin = equippedSkin;
    }
    if (equippedTrail && user.inventory.ownedTrails.includes(equippedTrail)) {
      user.inventory.equippedTrail = equippedTrail;
    }

    // Save settings — merge so partial updates work
    if (settings && typeof settings === 'object') {
      user.settings = { ...user.settings.toObject?.() ?? user.settings, ...settings };
      user.markModified('settings');
    }

    await user.save();

    res.json({
      message: 'Profile updated',
      inventory: user.inventory,
      settings: user.settings
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

// ========== GET PUBLIC PROFILE BY USERNAME ==========
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'Player not found' });

    // Only return public info
    res.json({
      username:    user.username,
      createdAt:   user.createdAt,
      stats:       user.stats,
      kdRatio:     user.kdRatio,
      winRate:     user.winRate,
      inventory:   { equippedSkin: user.inventory.equippedSkin },
      battleTicket:{ tier: user.battleTicket.tier, season: user.battleTicket.season, hasPremium: user.battleTicket.hasPremium },
      achievements: user.achievements,
      profile:     user.profile || { bio: '', profilePic: 'default' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// ========== UPDATE BIO + PROFILE PIC ==========
router.patch('/profile/customise', authenticate, async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    const user = await User.findById(req.userId);

    if (bio !== undefined) {
      user.profile = user.profile || {};
      user.profile.bio = String(bio).substring(0, 150);
    }
    if (profilePic !== undefined) {
      const owned = user.profile?.ownedProfilePics || ['default'];
      if (owned.includes(profilePic)) {
        user.profile.profilePic = profilePic;
      }
    }
    await user.save();
    res.json({ message: 'Profile updated', profile: user.profile });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});
