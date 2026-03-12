const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ========== SEND GIFT ==========
router.post('/send', authenticate, async (req, res) => {
  try {
    const { recipientUsername, itemType, itemId, message } = req.body;
    
    if (!recipientUsername || !itemType || !itemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sender = await User.findById(req.userId);
    const recipient = await User.findOne({ username: recipientUsername });
    
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (recipient._id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot gift yourself' });
    }
    
    // Check if sender owns the item
    let owned = false;
    if (itemType === 'skin') {
      owned = sender.inventory.ownedSkins.includes(itemId);
    } else if (itemType === 'emote') {
      owned = sender.inventory.ownedEmotes.includes(itemId);
    } else if (itemType === 'trail') {
      owned = sender.inventory.ownedTrails.includes(itemId);
    } else if (itemType === 'coins') {
      const amount = parseInt(itemId);
      if (sender.stats.coins < amount) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      owned = true;
    } else {
      return res.status(400).json({ error: 'Invalid item type' });
    }
    
    if (!owned && itemType !== 'coins') {
      return res.status(400).json({ error: 'You do not own this item' });
    }
    
    // Create gift
    if (!recipient.gifts) {
      recipient.gifts = [];
    }
    
    const gift = {
      id: require('crypto').randomBytes(8).toString('hex'),
      from: sender.username,
      fromId: sender._id,
      itemType,
      itemId,
      message: message || '',
      sentAt: new Date(),
      claimed: false
    };
    
    recipient.gifts.push(gift);
    
    // If gifting coins, deduct from sender
    if (itemType === 'coins') {
      const amount = parseInt(itemId);
      sender.stats.coins -= amount;
      await sender.save();
    }
    
    await recipient.save();
    
    res.json({
      message: `Gift sent to ${recipientUsername}!`,
      gift
    });
    
  } catch (error) {
    console.error('Send gift error:', error);
    res.status(500).json({ error: 'Error sending gift' });
  }
});

// ========== GET GIFTS ==========
router.get('/inbox', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.gifts) {
      user.gifts = [];
      await user.save();
    }
    
    res.json(user.gifts);
    
  } catch (error) {
    console.error('Get gifts error:', error);
    res.status(500).json({ error: 'Error fetching gifts' });
  }
});

// ========== CLAIM GIFT ==========
router.post('/claim/:giftId', authenticate, async (req, res) => {
  try {
    const { giftId } = req.params;
    
    const user = await User.findById(req.userId);
    
    if (!user.gifts) {
      user.gifts = [];
    }
    
    const gift = user.gifts.find(g => g.id === giftId);
    
    if (!gift) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    if (gift.claimed) {
      return res.status(400).json({ error: 'Gift already claimed' });
    }
    
    // Add item to inventory
    if (gift.itemType === 'skin') {
      if (!user.inventory.ownedSkins.includes(gift.itemId)) {
        user.inventory.ownedSkins.push(gift.itemId);
      }
    } else if (gift.itemType === 'emote') {
      if (!user.inventory.ownedEmotes.includes(gift.itemId)) {
        user.inventory.ownedEmotes.push(gift.itemId);
      }
    } else if (gift.itemType === 'trail') {
      if (!user.inventory.ownedTrails.includes(gift.itemId)) {
        user.inventory.ownedTrails.push(gift.itemId);
      }
    } else if (gift.itemType === 'coins') {
      const amount = parseInt(gift.itemId);
      user.stats.coins += amount;
    }
    
    gift.claimed = true;
    gift.claimedAt = new Date();
    
    await user.save();
    
    res.json({
      message: 'Gift claimed!',
      item: {
        type: gift.itemType,
        id: gift.itemId
      },
      coins: user.stats.coins
    });
    
  } catch (error) {
    console.error('Claim gift error:', error);
    res.status(500).json({ error: 'Error claiming gift' });
  }
});

// ========== DELETE GIFT ==========
router.delete('/delete/:giftId', authenticate, async (req, res) => {
  try {
    const { giftId } = req.params;
    
    const user = await User.findById(req.userId);
    
    if (!user.gifts) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    const giftIndex = user.gifts.findIndex(g => g.id === giftId);
    
    if (giftIndex === -1) {
      return res.status(404).json({ error: 'Gift not found' });
    }
    
    user.gifts.splice(giftIndex, 1);
    await user.save();
    
    res.json({ message: 'Gift deleted' });
    
  } catch (error) {
    console.error('Delete gift error:', error);
    res.status(500).json({ error: 'Error deleting gift' });
  }
});

module.exports = router;
