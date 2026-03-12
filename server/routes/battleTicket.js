const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { BATTLE_TICKET_CONFIG, SKINS } = require('../config/battleTicket');

const router = express.Router();

// ========== GET BATTLE TICKET STATUS ==========
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Calculate current tier based on XP
    const currentTier = Math.min(
      Math.floor(user.battleTicket.xp / BATTLE_TICKET_CONFIG.xpPerTier),
      BATTLE_TICKET_CONFIG.maxTier
    );
    
    // XP needed for next tier
    const nextTierXP = (currentTier + 1) * BATTLE_TICKET_CONFIG.xpPerTier;
    const xpProgress = user.battleTicket.xp - (currentTier * BATTLE_TICKET_CONFIG.xpPerTier);
    
    // Get available rewards
    const availableRewards = [];
    for (let tier = 0; tier <= currentTier; tier++) {
      if (!user.battleTicket.claimedRewards.includes(tier)) {
        const rewards = BATTLE_TICKET_CONFIG.rewards[tier];
        if (rewards) {
          availableRewards.push({
            tier,
            free: rewards.free || [],
            premium: user.battleTicket.hasPremium ? (rewards.premium || []) : []
          });
        }
      }
    }
    
    res.json({
      season: BATTLE_TICKET_CONFIG.currentSeason,
      seasonName: BATTLE_TICKET_CONFIG.seasonName,
      hasPremium: user.battleTicket.hasPremium,
      currentTier,
      maxTier: BATTLE_TICKET_CONFIG.maxTier,
      totalXP: user.battleTicket.xp,
      xpProgress,
      xpNeeded: BATTLE_TICKET_CONFIG.xpPerTier,
      nextTierXP,
      claimedRewards: user.battleTicket.claimedRewards,
      availableRewards,
      seasonEnd: BATTLE_TICKET_CONFIG.seasonEnd
    });
  } catch (error) {
    console.error('Battle ticket status error:', error);
    res.status(500).json({ error: 'Error fetching battle ticket status' });
  }
});

// ========== GET ALL REWARDS ==========
router.get('/rewards', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const currentTier = Math.min(
      Math.floor(user.battleTicket.xp / BATTLE_TICKET_CONFIG.xpPerTier),
      BATTLE_TICKET_CONFIG.maxTier
    );
    
    const allRewards = [];
    for (let tier = 0; tier <= BATTLE_TICKET_CONFIG.maxTier; tier++) {
      const rewards = BATTLE_TICKET_CONFIG.rewards[tier];
      if (rewards) {
        allRewards.push({
          tier,
          locked: tier > currentTier,
          claimed: user.battleTicket.claimedRewards.includes(tier),
          free: rewards.free || [],
          premium: rewards.premium || []
        });
      }
    }
    
    res.json(allRewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Error fetching rewards' });
  }
});

// ========== CLAIM REWARD ==========
router.post('/claim/:tier', authenticate, async (req, res) => {
  try {
    const tier = parseInt(req.params.tier);
    const user = await User.findById(req.userId);
    
    const currentTier = Math.min(
      Math.floor(user.battleTicket.xp / BATTLE_TICKET_CONFIG.xpPerTier),
      BATTLE_TICKET_CONFIG.maxTier
    );
    
    // Check if tier is unlocked
    if (tier > currentTier) {
      return res.status(400).json({ error: 'Tier not unlocked yet' });
    }
    
    // Check if already claimed
    if (user.battleTicket.claimedRewards.includes(tier)) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }
    
    const rewards = BATTLE_TICKET_CONFIG.rewards[tier];
    if (!rewards) {
      return res.status(404).json({ error: 'No rewards for this tier' });
    }
    
    const claimedItems = [];
    
    // Claim free rewards
    if (rewards.free) {
      for (const reward of rewards.free) {
        if (reward.type === 'coins') {
          user.addCoins(reward.amount);
          claimedItems.push({ type: 'coins', amount: reward.amount });
        } else if (reward.type === 'xp_boost') {
          user.addXP(reward.amount);
          claimedItems.push({ type: 'xp_boost', amount: reward.amount });
        } else if (reward.type === 'skin') {
          if (!user.inventory.ownedSkins.includes(reward.id)) {
            user.inventory.ownedSkins.push(reward.id);
            claimedItems.push({ type: 'skin', id: reward.id, name: SKINS[reward.id]?.name });
          }
        } else if (reward.type === 'emote') {
          if (!user.inventory.ownedEmotes.includes(reward.id)) {
            user.inventory.ownedEmotes.push(reward.id);
            claimedItems.push({ type: 'emote', id: reward.id });
          }
        } else if (reward.type === 'trail') {
          if (!user.inventory.ownedTrails.includes(reward.id)) {
            user.inventory.ownedTrails.push(reward.id);
            claimedItems.push({ type: 'trail', id: reward.id });
          }
        }
      }
    }
    
    // Claim premium rewards if user has premium
    if (user.battleTicket.hasPremium && rewards.premium) {
      for (const reward of rewards.premium) {
        if (reward.type === 'coins') {
          user.addCoins(reward.amount);
          claimedItems.push({ type: 'coins', amount: reward.amount, premium: true });
        } else if (reward.type === 'skin') {
          if (!user.inventory.ownedSkins.includes(reward.id)) {
            user.inventory.ownedSkins.push(reward.id);
            claimedItems.push({ type: 'skin', id: reward.id, name: SKINS[reward.id]?.name, premium: true });
          }
        } else if (reward.type === 'emote') {
          if (!user.inventory.ownedEmotes.includes(reward.id)) {
            user.inventory.ownedEmotes.push(reward.id);
            claimedItems.push({ type: 'emote', id: reward.id, premium: true });
          }
        } else if (reward.type === 'trail') {
          if (!user.inventory.ownedTrails.includes(reward.id)) {
            user.inventory.ownedTrails.push(reward.id);
            claimedItems.push({ type: 'trail', id: reward.id, premium: true });
          }
        }
      }
    }
    
    user.battleTicket.claimedRewards.push(tier);
    await user.save();
    
    res.json({
      message: 'Rewards claimed!',
      items: claimedItems,
      coins: user.stats.coins,
      xp: user.stats.xp,
      level: user.stats.level
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    res.status(500).json({ error: 'Error claiming reward' });
  }
});

// ========== BUY PREMIUM BATTLE TICKET ==========
router.post('/buy-premium', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.battleTicket.hasPremium) {
      return res.status(400).json({ error: 'Already have premium battle ticket' });
    }
    
    if (user.stats.coins < BATTLE_TICKET_CONFIG.premiumPrice) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    
    user.stats.coins -= BATTLE_TICKET_CONFIG.premiumPrice;
    user.battleTicket.hasPremium = true;
    await user.save();
    
    res.json({
      message: 'Premium Battle Ticket purchased!',
      coins: user.stats.coins
    });
  } catch (error) {
    console.error('Buy premium error:', error);
    res.status(500).json({ error: 'Error purchasing premium' });
  }
});

// ========== ADD BATTLE TICKET XP (Internal use) ==========
// This is called after games to add XP to battle ticket
router.post('/add-xp', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid XP amount' });
    }
    
    const user = await User.findById(req.userId);
    
    const oldTier = Math.floor(user.battleTicket.xp / BATTLE_TICKET_CONFIG.xpPerTier);
    user.battleTicket.xp += amount;
    const newTier = Math.min(
      Math.floor(user.battleTicket.xp / BATTLE_TICKET_CONFIG.xpPerTier),
      BATTLE_TICKET_CONFIG.maxTier
    );
    
    await user.save();
    
    res.json({
      xpGained: amount,
      totalXP: user.battleTicket.xp,
      oldTier,
      newTier,
      tierUp: newTier > oldTier
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ error: 'Error adding XP' });
  }
});

module.exports = router;
