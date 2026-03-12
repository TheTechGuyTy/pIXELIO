// Match Statistics and Post-Game Screen

// Calculate comprehensive match statistics
function calculateMatchStats(player, game, finalPlacement) {
  const stats = {
    // Placement
    placement: finalPlacement,
    totalPlayers: game.players.size,
    
    // Combat
    kills: player.kills,
    deaths: player.isAlive ? 0 : 1,
    damageDealt: player.damageDealt,
    damageTaken: player.damageTaken,
    accuracy: player.shotsFired > 0 ? Math.round((player.shotsHit / player.shotsFired) * 100) : 0,
    headshotPercentage: player.shotsHit > 0 ? Math.round((player.headshots / player.shotsHit) * 100) : 0,
    longestElimination: player.longestKill || 0,
    
    // Trivia
    questionsAnswered: player.questionsTotal,
    correctAnswers: player.questionsCorrect,
    triviaAccuracy: player.questionsTotal > 0 ? Math.round((player.questionsCorrect / player.questionsTotal) * 100) : 0,
    triviaStreak: player.maxTriviaStreak || 0,
    
    // Building
    structuresBuilt: player.structuresBuilt || 0,
    materialsGathered: player.materialsGathered || 0,
    materialsUsed: player.materialsUsed || 0,
    buildingsDestroyed: player.buildingsDestroyed || 0,
    
    // Survival
    survivalTime: Math.floor((Date.now() - game.startTime) / 1000), // seconds
    distanceTraveled: player.distanceTraveled || 0,
    vehicleDistance: player.vehicleDistance || 0,
    
    // Power-ups & Items
    powerupsCollected: player.powerupsCollected || 0,
    weaponsPickedUp: player.weaponsPickedUp || 0,
    
    // Rewards
    xpEarned: 0,
    coinsEarned: 0,
    leveledUp: false,
    newLevel: player.level,
    
    // Misc
    won: finalPlacement === 1,
    withFriends: player.partySize > 1,
    partySize: player.partySize || 1
  };
  
  // Calculate XP & Coins
  const baseXP = 50;
  const baseCoins = 25;
  
  stats.xpEarned = baseXP + 
                   (stats.kills * 20) + 
                   (stats.won ? 100 : 0) + 
                   (stats.correctAnswers * 10) +
                   Math.floor(stats.survivalTime / 60) * 5; // 5 XP per minute
  
  stats.coinsEarned = baseCoins + 
                      (stats.kills * 10) + 
                      (stats.won ? 100 : 0) + 
                      (stats.correctAnswers * 5);
  
  // Apply seasonal event bonuses
  const { applyEventBonuses } = require('./seasonalEvents');
  const rewards = applyEventBonuses({ 
    xp: stats.xpEarned, 
    coins: stats.coinsEarned,
    triviaXP: stats.correctAnswers * 10
  });
  
  stats.xpEarned = rewards.xp;
  stats.coinsEarned = rewards.coins;
  
  return stats;
}

// Get performance rating
function getPerformanceRating(stats) {
  let score = 0;
  
  // Placement (0-40 points)
  const placementPercent = (stats.totalPlayers - stats.placement) / stats.totalPlayers;
  score += placementPercent * 40;
  
  // Kills (0-25 points)
  score += Math.min(stats.kills * 2.5, 25);
  
  // Damage (0-15 points)
  score += Math.min((stats.damageDealt / 100), 15);
  
  // Trivia (0-15 points)
  score += (stats.triviaAccuracy / 100) * 15;
  
  // Survival (0-5 points)
  score += Math.min(stats.survivalTime / 120, 5);
  
  // Normalize to 0-100
  const rating = Math.round(score);
  
  if (rating >= 90) return { rating, grade: 'S', color: '#FFD700' };
  if (rating >= 80) return { rating, grade: 'A', color: '#00FF00' };
  if (rating >= 70) return { rating, grade: 'B', color: '#00BFFF' };
  if (rating >= 60) return { rating, grade: 'C', color: '#FFA500' };
  return { rating, grade: 'D', color: '#FF4500' };
}

// Get stat categories for display
function getStatCategories(stats) {
  return [
    {
      name: 'Combat',
      icon: '⚔️',
      stats: [
        { label: 'Eliminations', value: stats.kills, icon: '💀' },
        { label: 'Damage Dealt', value: stats.damageDealt, icon: '💥' },
        { label: 'Accuracy', value: `${stats.accuracy}%`, icon: '🎯' },
        { label: 'Longest Kill', value: `${stats.longestElimination}m`, icon: '📏' }
      ]
    },
    {
      name: 'Trivia',
      icon: '🧠',
      stats: [
        { label: 'Questions Answered', value: stats.questionsAnswered, icon: '❓' },
        { label: 'Correct Answers', value: stats.correctAnswers, icon: '✅' },
        { label: 'Accuracy', value: `${stats.triviaAccuracy}%`, icon: '📊' },
        { label: 'Best Streak', value: stats.triviaStreak, icon: '🔥' }
      ]
    },
    {
      name: 'Building',
      icon: '🏗️',
      stats: [
        { label: 'Structures Built', value: stats.structuresBuilt, icon: '🏠' },
        { label: 'Materials Gathered', value: stats.materialsGathered, icon: '📦' },
        { label: 'Buildings Destroyed', value: stats.buildingsDestroyed, icon: '💥' }
      ]
    },
    {
      name: 'Survival',
      icon: '⏱️',
      stats: [
        { label: 'Survival Time', value: formatTime(stats.survivalTime), icon: '⏰' },
        { label: 'Distance Traveled', value: `${Math.round(stats.distanceTraveled)}m`, icon: '🏃' },
        { label: 'Vehicle Distance', value: `${Math.round(stats.vehicleDistance)}m`, icon: '🚗' }
      ]
    }
  ];
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get medals/achievements for match
function getMatchMedals(stats) {
  const medals = [];
  
  if (stats.won) {
    medals.push({ name: 'Victory Royale', icon: '👑', color: '#FFD700' });
  }
  
  if (stats.kills >= 10) {
    medals.push({ name: 'Killing Spree', icon: '🔥', color: '#FF4500' });
  }
  
  if (stats.kills === 0 && stats.won) {
    medals.push({ name: 'Pacifist Victory', icon: '🕊️', color: '#00BFFF' });
  }
  
  if (stats.triviaAccuracy === 100 && stats.questionsAnswered >= 5) {
    medals.push({ name: 'Perfect Scholar', icon: '🧠', color: '#9B59B6' });
  }
  
  if (stats.structuresBuilt >= 50) {
    medals.push({ name: 'Master Builder', icon: '🏗️', color: '#8B4513' });
  }
  
  if (stats.survivalTime >= 600) { // 10 minutes
    medals.push({ name: 'Long Survivor', icon: '⏰', color: '#2ECC71' });
  }
  
  if (stats.headshotPercentage >= 50 && stats.kills >= 3) {
    medals.push({ name: 'Sharpshooter', icon: '🎯', color: '#E74C3C' });
  }
  
  if (stats.damageDealt >= 1000) {
    medals.push({ name: 'Heavy Hitter', icon: '💥', color: '#F39C12' });
  }
  
  return medals;
}

// Compare stats with personal best
function compareWithPersonalBest(stats, user) {
  const comparisons = [];
  
  if (stats.kills > (user.stats.personalBests?.kills || 0)) {
    comparisons.push({ stat: 'Kills', value: stats.kills, previous: user.stats.personalBests?.kills || 0, isNew: true });
    user.stats.personalBests = user.stats.personalBests || {};
    user.stats.personalBests.kills = stats.kills;
  }
  
  if (stats.damageDealt > (user.stats.personalBests?.damage || 0)) {
    comparisons.push({ stat: 'Damage', value: stats.damageDealt, previous: user.stats.personalBests?.damage || 0, isNew: true });
    user.stats.personalBests = user.stats.personalBests || {};
    user.stats.personalBests.damage = stats.damageDealt;
  }
  
  if (stats.survivalTime > (user.stats.personalBests?.survivalTime || 0)) {
    comparisons.push({ stat: 'Survival Time', value: stats.survivalTime, previous: user.stats.personalBests?.survivalTime || 0, isNew: true });
    user.stats.personalBests = user.stats.personalBests || {};
    user.stats.personalBests.survivalTime = stats.survivalTime;
  }
  
  return comparisons;
}

module.exports = {
  calculateMatchStats,
  getPerformanceRating,
  getStatCategories,
  getMatchMedals,
  compareWithPersonalBest,
  formatTime
};
