const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { 
  generateDailyChallenges, 
  generateWeeklyChallenges,
  shouldRefreshDaily,
  shouldRefreshWeekly,
  updateChallengeProgress
} = require('../config/challenges');

const router = express.Router();

// ========== GET DAILY CHALLENGES ==========
router.get('/daily', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.challenges) {
      user.challenges = {
        daily: [],
        weekly: [],
        lastDailyRefresh: null,
        lastWeeklyRefresh: null
      };
    }
    
    // Refresh daily challenges if needed
    if (shouldRefreshDaily(user.challenges.lastDailyRefresh)) {
      user.challenges.daily = generateDailyChallenges();
      user.challenges.lastDailyRefresh = new Date();
      await user.save();
    }
    
    res.json({
      challenges: user.challenges.daily,
      nextRefresh: getNextDailyRefresh()
    });
    
  } catch (error) {
    console.error('Get daily challenges error:', error);
    res.status(500).json({ error: 'Error fetching daily challenges' });
  }
});

// ========== GET WEEKLY CHALLENGES ==========
router.get('/weekly', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.challenges) {
      user.challenges = {
        daily: [],
        weekly: [],
        lastDailyRefresh: null,
        lastWeeklyRefresh: null
      };
    }
    
    // Refresh weekly challenges if needed
    if (shouldRefreshWeekly(user.challenges.lastWeeklyRefresh)) {
      user.challenges.weekly = generateWeeklyChallenges();
      user.challenges.lastWeeklyRefresh = new Date();
      await user.save();
    }
    
    res.json({
      challenges: user.challenges.weekly,
      nextRefresh: getNextWeeklyRefresh()
    });
    
  } catch (error) {
    console.error('Get weekly challenges error:', error);
    res.status(500).json({ error: 'Error fetching weekly challenges' });
  }
});

// ========== CLAIM CHALLENGE REWARD ==========
router.post('/claim/:type/:challengeId', authenticate, async (req, res) => {
  try {
    const { type, challengeId } = req.params; // type: 'daily' or 'weekly'
    
    const user = await User.findById(req.userId);
    
    if (!user.challenges || !user.challenges[type]) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    const challenge = user.challenges[type].find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    if (!challenge.completed) {
      return res.status(400).json({ error: 'Challenge not completed yet' });
    }
    
    if (challenge.claimed) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }
    
    // Give rewards
    let xpReward, coinReward;
    
    if (type === 'daily') {
      xpReward = challenge.target.xp;
      coinReward = challenge.target.coins;
    } else {
      xpReward = challenge.xp;
      coinReward = challenge.coins;
    }
    
    user.addXP(xpReward);
    user.stats.coins += coinReward;
    challenge.claimed = true;
    challenge.claimedAt = new Date();
    
    await user.save();
    
    res.json({
      message: 'Challenge reward claimed!',
      xp: xpReward,
      coins: coinReward,
      newLevel: user.stats.level,
      totalXP: user.stats.xp,
      totalCoins: user.stats.coins
    });
    
  } catch (error) {
    console.error('Claim challenge error:', error);
    res.status(500).json({ error: 'Error claiming challenge reward' });
  }
});

// ========== UPDATE CHALLENGE PROGRESS (INTERNAL) ==========
router.post('/progress', authenticate, async (req, res) => {
  try {
    const { type, increment, matchStats } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user.challenges) {
      user.challenges = {
        daily: generateDailyChallenges(),
        weekly: generateWeeklyChallenges(),
        lastDailyRefresh: new Date(),
        lastWeeklyRefresh: new Date()
      };
    }
    
    // Update daily challenges
    if (user.challenges.daily) {
      user.challenges.daily.forEach(challenge => {
        if (challenge.completed) return;
        
        switch(challenge.type) {
          case 'combat':
            if (challenge.id.includes('eliminations')) {
              updateChallengeProgress(challenge, matchStats.kills || 0);
            } else if (challenge.id.includes('damage')) {
              updateChallengeProgress(challenge, matchStats.damageDealt || 0);
            } else if (challenge.id.includes('headshots')) {
              updateChallengeProgress(challenge, matchStats.headshots || 0);
            }
            break;
          case 'trivia':
            if (challenge.id.includes('correct')) {
              updateChallengeProgress(challenge, matchStats.correctAnswers || 0);
            } else if (challenge.id.includes('streak')) {
              updateChallengeProgress(challenge, matchStats.triviaStreak || 0);
            }
            break;
          case 'building':
            if (challenge.id.includes('structures')) {
              updateChallengeProgress(challenge, matchStats.structuresBuilt || 0);
            } else if (challenge.id.includes('materials')) {
              updateChallengeProgress(challenge, matchStats.materialsGathered || 0);
            }
            break;
          case 'victory':
            if (challenge.id.includes('placement') && matchStats.placement) {
              const targetCount = challenge.target.count;
              if (matchStats.placement <= targetCount) {
                updateChallengeProgress(challenge, 1);
              }
            } else if (challenge.id.includes('wins')) {
              updateChallengeProgress(challenge, matchStats.won ? 1 : 0);
            }
            break;
          case 'general':
            if (challenge.id.includes('games_played')) {
              updateChallengeProgress(challenge, 1);
            } else if (challenge.id.includes('survival_time')) {
              updateChallengeProgress(challenge, matchStats.survivalTime || 0);
            }
            break;
          case 'vehicle':
            if (challenge.id.includes('distance')) {
              updateChallengeProgress(challenge, matchStats.vehicleDistance || 0);
            }
            break;
          case 'social':
            if (challenge.id.includes('friends') && matchStats.withFriends) {
              updateChallengeProgress(challenge, 1);
            }
            break;
        }
      });
    }
    
    // Update weekly challenges (same logic)
    if (user.challenges.weekly) {
      user.challenges.weekly.forEach(challenge => {
        if (challenge.completed) return;
        
        // Similar logic as daily but with different targets
        switch(challenge.type) {
          case 'combat':
            if (challenge.id.includes('eliminations')) {
              updateChallengeProgress(challenge, matchStats.kills || 0);
            } else if (challenge.id.includes('damage')) {
              updateChallengeProgress(challenge, matchStats.damageDealt || 0);
            }
            break;
          case 'trivia':
            if (challenge.id.includes('trivia')) {
              updateChallengeProgress(challenge, matchStats.correctAnswers || 0);
            }
            break;
          case 'building':
            if (challenge.id.includes('structures')) {
              updateChallengeProgress(challenge, matchStats.structuresBuilt || 0);
            }
            break;
          case 'victory':
            if (challenge.id.includes('wins')) {
              updateChallengeProgress(challenge, matchStats.won ? 1 : 0);
            }
            break;
        }
      });
    }
    
    await user.save();
    
    // Return newly completed challenges
    const newlyCompleted = [
      ...user.challenges.daily.filter(c => c.completed && !c.notified),
      ...user.challenges.weekly.filter(c => c.completed && !c.notified)
    ];
    
    // Mark as notified
    newlyCompleted.forEach(c => c.notified = true);
    await user.save();
    
    res.json({
      message: 'Challenges updated',
      newlyCompleted
    });
    
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ error: 'Error updating challenge progress' });
  }
});

// ========== HELPER FUNCTIONS ==========
function getNextDailyRefresh() {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

function getNextWeeklyRefresh() {
  const nextMonday = new Date();
  const daysUntilMonday = (8 - nextMonday.getUTCDay()) % 7 || 7;
  nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday;
}

module.exports = router;
