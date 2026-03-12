const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ========== SEND FRIEND REQUEST ==========
router.post('/request', authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Find the target user
    const targetUser = await User.findOne({ username });
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }
    
    const currentUser = await User.findById(req.userId);
    
    // Check if already friends
    const alreadyFriends = currentUser.friends.some(
      f => f.userId.toString() === targetUser._id.toString()
    );
    
    if (alreadyFriends) {
      return res.status(400).json({ error: 'Already friends' });
    }
    
    // Check if blocked
    const isBlocked = targetUser.blockedUsers.includes(req.userId);
    if (isBlocked) {
      return res.status(400).json({ error: 'Cannot send friend request' });
    }
    
    // Check if request already sent
    const requestExists = targetUser.friendRequests.some(
      r => r.from.toString() === req.userId
    );
    
    if (requestExists) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }
    
    // Add friend request
    targetUser.friendRequests.push({ from: req.userId });
    await targetUser.save();
    
    res.json({ message: 'Friend request sent!' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Error sending friend request' });
  }
});

// ========== GET FRIEND REQUESTS ==========
router.get('/requests', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username stats.level isOnline');
    
    const requests = user.friendRequests.map(r => ({
      id: r._id,
      from: {
        id: r.from._id,
        username: r.from.username,
        level: r.from.stats.level,
        isOnline: r.from.isOnline
      },
      sentAt: r.sentAt
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Error fetching friend requests' });
  }
});

// ========== ACCEPT FRIEND REQUEST ==========
router.post('/accept', authenticate, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const user = await User.findById(req.userId);
    const requestIndex = user.friendRequests.findIndex(
      r => r._id.toString() === requestId
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    const request = user.friendRequests[requestIndex];
    const friendId = request.from;
    
    // Add to both users' friend lists
    user.friends.push({ userId: friendId });
    user.friendRequests.splice(requestIndex, 1);
    await user.save();
    
    const friend = await User.findById(friendId);
    friend.friends.push({ userId: req.userId });
    await friend.save();
    
    res.json({ message: 'Friend request accepted!' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Error accepting friend request' });
  }
});

// ========== DECLINE FRIEND REQUEST ==========
router.post('/decline', authenticate, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const user = await User.findById(req.userId);
    const requestIndex = user.friendRequests.findIndex(
      r => r._id.toString() === requestId
    );
    
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    user.friendRequests.splice(requestIndex, 1);
    await user.save();
    
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Error declining friend request' });
  }
});

// ========== GET FRIENDS LIST ==========
router.get('/list', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends.userId', 'username stats.level isOnline currentGameId');
    
    const friends = user.friends.map(f => ({
      id: f.userId._id,
      username: f.userId.username,
      level: f.userId.stats.level,
      isOnline: f.userId.isOnline,
      inGame: !!f.userId.currentGameId,
      addedAt: f.addedAt
    }));
    
    res.json(friends);
  } catch (error) {
    console.error('Get friends list error:', error);
    res.status(500).json({ error: 'Error fetching friends' });
  }
});

// ========== REMOVE FRIEND ==========
router.delete('/remove/:friendId', authenticate, async (req, res) => {
  try {
    const { friendId } = req.params;
    
    const user = await User.findById(req.userId);
    const friendIndex = user.friends.findIndex(
      f => f.userId.toString() === friendId
    );
    
    if (friendIndex === -1) {
      return res.status(404).json({ error: 'Friend not found' });
    }
    
    user.friends.splice(friendIndex, 1);
    await user.save();
    
    // Remove from friend's list too
    const friend = await User.findById(friendId);
    const userIndex = friend.friends.findIndex(
      f => f.userId.toString() === req.userId
    );
    
    if (userIndex !== -1) {
      friend.friends.splice(userIndex, 1);
      await friend.save();
    }
    
    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Error removing friend' });
  }
});

// ========== BLOCK USER ==========
router.post('/block', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({ error: 'User already blocked' });
    }
    
    // Remove from friends if they are friends
    user.friends = user.friends.filter(f => f.userId.toString() !== userId);
    
    // Remove any pending requests
    user.friendRequests = user.friendRequests.filter(
      r => r.from.toString() !== userId
    );
    
    user.blockedUsers.push(userId);
    await user.save();
    
    res.json({ message: 'User blocked' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Error blocking user' });
  }
});

// ========== UNBLOCK USER ==========
router.post('/unblock', authenticate, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(req.userId);
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
    await user.save();
    
    res.json({ message: 'User unblocked' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Error unblocking user' });
  }
});

// ========== SEARCH USERS ==========
router.get('/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }
    
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.userId }
    })
    .select('username stats.level isOnline')
    .limit(20);
    
    const currentUser = await User.findById(req.userId);
    
    const results = users.map(u => ({
      id: u._id,
      username: u.username,
      level: u.stats.level,
      isOnline: u.isOnline,
      isFriend: currentUser.friends.some(f => f.userId.toString() === u._id.toString()),
      isBlocked: currentUser.blockedUsers.includes(u._id)
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Error searching users' });
  }
});

module.exports = router;
