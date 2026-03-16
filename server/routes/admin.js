const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Admin user IDs (add your user ID here after creating account)
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || (!user.isAdmin && !ADMIN_IDS.includes(req.userId))) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error verifying admin status' });
  }
};

// ========== MAKE USER ADMIN ==========
router.post('/make-admin/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isAdmin = true;
    await user.save();
    
    res.json({ message: `${user.username} is now an admin` });
    
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Error making user admin' });
  }
});

// ========== BAN USER ==========
router.post('/ban', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, reason, duration } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isAdmin) {
      return res.status(400).json({ error: 'Cannot ban admin users' });
    }
    
    user.isBanned = true;
    user.banReason = reason || 'Violation of terms';
    user.bannedAt = new Date();
    
    if (duration) {
      user.banExpiresAt = new Date(Date.now() + duration * 1000);
    }
    
    await user.save();
    
    res.json({
      message: `${user.username} has been banned`,
      reason: user.banReason,
      expiresAt: user.banExpiresAt
    });
    
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Error banning user' });
  }
});

// ========== UNBAN USER ==========
router.post('/unban', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isBanned = false;
    user.banReason = null;
    user.bannedAt = null;
    user.banExpiresAt = null;
    
    await user.save();
    
    res.json({ message: `${user.username} has been unbanned` });
    
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Error unbanning user' });
  }
});

// ========== KICK PLAYER FROM GAME (via socket) ==========
// This will be handled in socket.io with admin verification

// ========== GET ALL USERS (ADMIN) ==========
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query)
      .select('username email stats.level isOnline isBanned isAdmin createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// ========== GET USER DETAILS ==========
router.get('/user/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Error fetching user details' });
  }
});

// ========== GIVE COINS (ADMIN) ==========
router.post('/give-coins', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, username, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Find by userId or username
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.stats.coins += parseInt(amount);
    await user.save();
    
    res.json({
      message: `Gave ${amount} coins to ${user.username}`,
      newBalance: user.stats.coins
    });
    
  } catch (error) {
    console.error('Give coins error:', error);
    res.status(500).json({ error: 'Error giving coins' });
  }
});

// ========== GIVE XP (ADMIN) ==========
router.post('/give-xp', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.addXP(amount);
    await user.save();
    
    res.json({
      message: `Gave ${amount} XP to ${user.username}`,
      newXP: user.stats.xp,
      newLevel: user.stats.level
    });
    
  } catch (error) {
    console.error('Give XP error:', error);
    res.status(500).json({ error: 'Error giving XP' });
  }
});

// ========== RESET USER STATS ==========
router.post('/reset-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.stats.xp = 0;
    user.stats.level = 1;
    user.stats.wins = 0;
    user.stats.kills = 0;
    user.stats.deaths = 0;
    user.stats.gamesPlayed = 0;
    user.stats.damageDealt = 0;
    user.stats.damageTaken = 0;
    user.stats.accuracy = 0;
    user.matchHistory = [];
    
    await user.save();
    
    res.json({ message: `Reset stats for ${user.username}` });
    
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ error: 'Error resetting stats' });
  }
});

// ========== SERVER STATS ==========
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    const topPlayers = await User.find()
      .sort({ 'stats.wins': -1 })
      .limit(10)
      .select('username stats.wins stats.level');
    
    res.json({
      totalUsers,
      onlineUsers,
      bannedUsers,
      topPlayers
    });
    
  } catch (error) {
    console.error('Get server stats error:', error);
    res.status(500).json({ error: 'Error fetching server stats' });
  }
});

// ========== BROADCAST MESSAGE (via socket) ==========
// This will be handled in socket.io

// ========== CREATE ADMIN EVENT ==========
router.post('/event/create', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, startTime, endTime, rewards } = req.body;
    
    // This would be stored in a separate AdminEvents collection
    // For now, returning success
    
    res.json({
      message: 'Admin event created',
      event: {
        name,
        description,
        startTime,
        endTime,
        rewards
      }
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});


// ========== GET ACTIVE GAMES ==========
router.get('/games', authenticate, requireAdmin, async (req, res) => {
  try {
    // games map is in index.js — expose via global or return from socket
    // For now return a placeholder that socket will fill
    res.json({ games: [] });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching games' });
  }
});

// ========== GIVE/REMOVE SKIN ==========
router.post('/give-skin', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, skinId, remove } = req.body;
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (remove) {
      user.inventory.ownedSkins = user.inventory.ownedSkins.filter(s => s !== skinId);
      if (user.inventory.equippedSkin === skinId) user.inventory.equippedSkin = 'default';
    } else {
      if (!user.inventory.ownedSkins.includes(skinId)) {
        user.inventory.ownedSkins.push(skinId);
      }
    }
    await user.save();
    res.json({ message: `Skin ${skinId} ${remove ? 'removed from' : 'given to'} ${user.username}`, inventory: user.inventory });
  } catch (error) {
    res.status(500).json({ error: 'Error updating skin' });
  }
});

// ========== REMOVE COINS ==========
router.post('/remove-coins', authenticate, requireAdmin, async (req, res) => {
  try {
    const { username, userId, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.stats.coins = Math.max(0, user.stats.coins - parseInt(amount));
    await user.save();
    res.json({ message: `Removed ${amount} coins from ${user.username}`, newBalance: user.stats.coins });
  } catch (error) {
    res.status(500).json({ error: 'Error removing coins' });
  }
});

// ========== MUTE / UNMUTE ==========
router.post('/mute', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId, muted } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.settings.chatEnabled = !muted;
    user.markModified('settings');
    await user.save();
    res.json({ message: `${user.username} ${muted ? 'muted' : 'unmuted'}` });
  } catch (error) {
    res.status(500).json({ error: 'Error muting user' });
  }
});

// ========== NEWS MANAGEMENT ==========
// Simple in-memory news store (persists while server runs)
const newsItems = [];

router.get('/news', async (req, res) => {
  res.json({ news: newsItems.slice(0, 10) });
});

router.post('/news', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, body, type } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body required' });
    const item = { id: Date.now(), title, body, type: type || 'update', createdAt: new Date().toISOString() };
    newsItems.unshift(item);
    if (newsItems.length > 20) newsItems.pop();
    res.json({ message: 'News posted', item });
  } catch (error) {
    res.status(500).json({ error: 'Error posting news' });
  }
});

router.delete('/news/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const idx = newsItems.findIndex(n => n.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    newsItems.splice(idx, 1);
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting news' });
  }
});

module.exports = router;
module.exports.newsItems = newsItems;
module.exports.requireAdmin = requireAdmin;
