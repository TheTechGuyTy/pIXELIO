const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ========== GET NOTIFICATIONS ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    
    const user = await User.findById(req.userId);
    
    if (!user.notifications) {
      user.notifications = [];
      await user.save();
    }
    
    let notifications = user.notifications;
    
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }
    
    // Sort by newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      notifications,
      unreadCount: user.notifications.filter(n => !n.read).length
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// ========== MARK NOTIFICATION AS READ ==========
router.post('/read/:notificationId', authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const user = await User.findById(req.userId);
    
    if (!user.notifications) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = user.notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    await user.save();
    
    res.json({
      message: 'Notification marked as read',
      unreadCount: user.notifications.filter(n => !n.read).length
    });
    
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Error marking notification as read' });
  }
});

// ========== MARK ALL AS READ ==========
router.post('/read-all', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.notifications) {
      user.notifications = [];
    }
    
    user.notifications.forEach(n => n.read = true);
    await user.save();
    
    res.json({ message: 'All notifications marked as read' });
    
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Error marking all as read' });
  }
});

// ========== DELETE NOTIFICATION ==========
router.delete('/:notificationId', authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const user = await User.findById(req.userId);
    
    if (!user.notifications) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const index = user.notifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    user.notifications.splice(index, 1);
    await user.save();
    
    res.json({ 
      message: 'Notification deleted',
      unreadCount: user.notifications.filter(n => !n.read).length
    });
    
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Error deleting notification' });
  }
});

// ========== CLEAR ALL NOTIFICATIONS ==========
router.delete('/clear-all', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    user.notifications = [];
    await user.save();
    
    res.json({ message: 'All notifications cleared' });
    
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Error clearing notifications' });
  }
});

// ========== CREATE NOTIFICATION (INTERNAL) ==========
async function createNotification(userId, type, title, message, icon, data = {}) {
  try {
    const user = await User.findById(userId);
    
    if (!user) return;
    
    if (!user.notifications) {
      user.notifications = [];
    }
    
    const notification = {
      id: require('crypto').randomBytes(8).toString('hex'),
      type,
      title,
      message,
      icon,
      data,
      read: false,
      createdAt: new Date()
    };
    
    user.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(0, 50);
    }
    
    await user.save();
    
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
}

// ========== NOTIFICATION TYPES ==========
const NOTIFICATION_TYPES = {
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  PARTY_INVITE: 'party_invite',
  GIFT_RECEIVED: 'gift_received',
  CHALLENGE_COMPLETE: 'challenge_complete',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up',
  BATTLE_TICKET_REWARD: 'battle_ticket_reward',
  SEASONAL_EVENT: 'seasonal_event',
  ADMIN_MESSAGE: 'admin_message',
  DAILY_REWARD: 'daily_reward'
};

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
