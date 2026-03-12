// Daily Challenges System

const DAILY_CHALLENGES = {
  // Combat challenges
  combat_eliminations: {
    name: 'Elimination Expert',
    description: 'Get {count} eliminations',
    type: 'combat',
    tiers: [
      { count: 3, xp: 100, coins: 50 },
      { count: 5, xp: 150, coins: 75 },
      { count: 10, xp: 250, coins: 125 }
    ],
    icon: '⚔️'
  },
  
  combat_damage: {
    name: 'Damage Dealer',
    description: 'Deal {amount} damage',
    type: 'combat',
    tiers: [
      { amount: 500, xp: 100, coins: 50 },
      { amount: 1000, xp: 150, coins: 75 },
      { amount: 2000, xp: 250, coins: 125 }
    ],
    icon: '💥'
  },
  
  combat_headshots: {
    name: 'Headhunter',
    description: 'Get {count} headshots',
    type: 'combat',
    tiers: [
      { count: 2, xp: 125, coins: 60 },
      { count: 5, xp: 200, coins: 100 },
      { count: 10, xp: 300, coins: 150 }
    ],
    icon: '🎯'
  },
  
  // Trivia challenges
  trivia_correct: {
    name: 'Brain Power',
    description: 'Answer {count} trivia questions correctly',
    type: 'trivia',
    tiers: [
      { count: 5, xp: 100, coins: 50 },
      { count: 10, xp: 150, coins: 75 },
      { count: 20, xp: 250, coins: 125 }
    ],
    icon: '🧠'
  },
  
  trivia_streak: {
    name: 'Perfect Streak',
    description: 'Get {count} correct answers in a row',
    type: 'trivia',
    tiers: [
      { count: 3, xp: 125, coins: 60 },
      { count: 5, xp: 200, coins: 100 },
      { count: 10, xp: 300, coins: 150 }
    ],
    icon: '✨'
  },
  
  // Building challenges
  building_structures: {
    name: 'Master Builder',
    description: 'Build {count} structures',
    type: 'building',
    tiers: [
      { count: 50, xp: 100, coins: 50 },
      { count: 100, xp: 150, coins: 75 },
      { count: 200, xp: 250, coins: 125 }
    ],
    icon: '🏗️'
  },
  
  building_materials: {
    name: 'Material Collector',
    description: 'Gather {amount} materials',
    type: 'building',
    tiers: [
      { amount: 500, xp: 100, coins: 50 },
      { amount: 1000, xp: 150, coins: 75 },
      { amount: 2000, xp: 250, coins: 125 }
    ],
    icon: '📦'
  },
  
  // Victory challenges
  victory_placement: {
    name: 'Top Finisher',
    description: 'Place in Top {count}',
    type: 'victory',
    tiers: [
      { count: 10, xp: 150, coins: 75 },
      { count: 5, xp: 200, coins: 100 },
      { count: 3, xp: 300, coins: 150 }
    ],
    icon: '🏆'
  },
  
  victory_wins: {
    name: 'Victory Royale',
    description: 'Win {count} matches',
    type: 'victory',
    tiers: [
      { count: 1, xp: 200, coins: 100 },
      { count: 2, xp: 300, coins: 150 },
      { count: 3, xp: 500, coins: 250 }
    ],
    icon: '👑'
  },
  
  // General challenges
  games_played: {
    name: 'Dedicated Player',
    description: 'Play {count} matches',
    type: 'general',
    tiers: [
      { count: 3, xp: 100, coins: 50 },
      { count: 5, xp: 150, coins: 75 },
      { count: 10, xp: 250, coins: 125 }
    ],
    icon: '🎮'
  },
  
  survival_time: {
    name: 'Survivor',
    description: 'Survive for {time} minutes',
    type: 'general',
    tiers: [
      { time: 10, xp: 100, coins: 50 },
      { time: 20, xp: 150, coins: 75 },
      { time: 30, xp: 250, coins: 125 }
    ],
    icon: '⏱️'
  },
  
  // Vehicle challenges
  vehicle_distance: {
    name: 'Road Warrior',
    description: 'Travel {distance}m in vehicles',
    type: 'vehicle',
    tiers: [
      { distance: 1000, xp: 100, coins: 50 },
      { distance: 2500, xp: 150, coins: 75 },
      { distance: 5000, xp: 250, coins: 125 }
    ],
    icon: '🚗'
  },
  
  // Social challenges
  play_with_friends: {
    name: 'Team Player',
    description: 'Play {count} matches with friends',
    type: 'social',
    tiers: [
      { count: 2, xp: 125, coins: 60 },
      { count: 5, xp: 200, coins: 100 },
      { count: 10, xp: 300, coins: 150 }
    ],
    icon: '👥'
  }
};

// Weekly challenges (harder, better rewards)
const WEEKLY_CHALLENGES = {
  weekly_eliminations: {
    name: 'Elimination Master',
    description: 'Get {count} total eliminations this week',
    type: 'combat',
    count: 50,
    xp: 1000,
    coins: 500,
    icon: '⚔️'
  },
  
  weekly_wins: {
    name: 'Win Streak',
    description: 'Win {count} matches this week',
    type: 'victory',
    count: 5,
    xp: 1500,
    coins: 750,
    icon: '🏆'
  },
  
  weekly_trivia: {
    name: 'Trivia Master',
    description: 'Answer {count} trivia questions correctly this week',
    type: 'trivia',
    count: 100,
    xp: 1000,
    coins: 500,
    icon: '🧠'
  },
  
  weekly_structures: {
    name: 'Architect Legend',
    description: 'Build {count} structures this week',
    type: 'building',
    count: 500,
    xp: 1000,
    coins: 500,
    icon: '🏗️'
  },
  
  weekly_damage: {
    name: 'Destruction',
    description: 'Deal {amount} total damage this week',
    type: 'combat',
    amount: 10000,
    xp: 1200,
    coins: 600,
    icon: '💥'
  }
};

// Generate daily challenges for a user
function generateDailyChallenges() {
  const challengeKeys = Object.keys(DAILY_CHALLENGES);
  const selectedKeys = [];
  
  // Select 3 random unique challenges
  while (selectedKeys.length < 3) {
    const randomKey = challengeKeys[Math.floor(Math.random() * challengeKeys.length)];
    if (!selectedKeys.includes(randomKey)) {
      selectedKeys.push(randomKey);
    }
  }
  
  const challenges = selectedKeys.map(key => {
    const challenge = DAILY_CHALLENGES[key];
    const tier = Math.floor(Math.random() * challenge.tiers.length); // Random tier
    
    return {
      id: key,
      name: challenge.name,
      description: challenge.description.replace(/\{(count|amount|time|distance)\}/, challenge.tiers[tier][Object.keys(challenge.tiers[tier])[0]]),
      type: challenge.type,
      icon: challenge.icon,
      target: challenge.tiers[tier],
      progress: 0,
      completed: false,
      tier: tier
    };
  });
  
  return challenges;
}

// Generate weekly challenges
function generateWeeklyChallenges() {
  const challengeKeys = Object.keys(WEEKLY_CHALLENGES);
  const selectedKeys = [];
  
  // Select 2 random unique weekly challenges
  while (selectedKeys.length < 2) {
    const randomKey = challengeKeys[Math.floor(Math.random() * challengeKeys.length)];
    if (!selectedKeys.includes(randomKey)) {
      selectedKeys.push(randomKey);
    }
  }
  
  const challenges = selectedKeys.map(key => {
    const challenge = WEEKLY_CHALLENGES[key];
    const targetKey = Object.keys(challenge).find(k => ['count', 'amount', 'time', 'distance'].includes(k));
    
    return {
      id: key,
      name: challenge.name,
      description: challenge.description.replace(/\{(count|amount|time|distance)\}/, challenge[targetKey]),
      type: challenge.type,
      icon: challenge.icon,
      target: challenge[targetKey],
      xp: challenge.xp,
      coins: challenge.coins,
      progress: 0,
      completed: false
    };
  });
  
  return challenges;
}

// Check if daily challenges need to be refreshed
function shouldRefreshDaily(lastRefresh) {
  if (!lastRefresh) return true;
  
  const now = new Date();
  const last = new Date(lastRefresh);
  
  // Refresh if it's a new day (UTC)
  return now.getUTCDate() !== last.getUTCDate() || 
         now.getUTCMonth() !== last.getUTCMonth() ||
         now.getUTCFullYear() !== last.getUTCFullYear();
}

// Check if weekly challenges need to be refreshed
function shouldRefreshWeekly(lastRefresh) {
  if (!lastRefresh) return true;
  
  const now = new Date();
  const last = new Date(lastRefresh);
  
  // Refresh every Monday (day 1 of week)
  const nowWeek = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
  const lastWeek = Math.floor((last - new Date(last.getFullYear(), 0, 1)) / 604800000);
  
  return nowWeek !== lastWeek;
}

// Update challenge progress
function updateChallengeProgress(challenge, increment) {
  if (challenge.completed) return challenge;
  
  challenge.progress += increment;
  
  const targetKey = Object.keys(challenge.target).find(k => ['count', 'amount', 'time', 'distance'].includes(k));
  const target = challenge.target[targetKey];
  
  if (challenge.progress >= target) {
    challenge.completed = true;
    challenge.completedAt = new Date();
  }
  
  return challenge;
}

module.exports = {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  generateDailyChallenges,
  generateWeeklyChallenges,
  shouldRefreshDaily,
  shouldRefreshWeekly,
  updateChallengeProgress
};
