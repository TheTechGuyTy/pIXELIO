// Battle Ticket Configuration
// Season 1: "Brain Storm Rising"

const BATTLE_TICKET_CONFIG = {
  currentSeason: 1,
  seasonName: "Brain Storm Rising",
  seasonStart: new Date('2026-01-01'),
  seasonEnd: new Date('2026-03-31'),
  
  // XP required per tier (cumulative)
  xpPerTier: 1000,
  maxTier: 50,
  
  // Premium ticket price in coins
  premiumPrice: 950,
  
  // Rewards by tier
  rewards: {
    // Tier: { free: [...], premium: [...] }
    0: {
      free: [{ type: 'coins', amount: 100 }],
      premium: [{ type: 'skin', id: 'season1_starter' }]
    },
    1: {
      free: [{ type: 'xp_boost', amount: 10 }],
      premium: [{ type: 'emote', id: 'brain_power' }]
    },
    2: {
      free: [{ type: 'coins', amount: 150 }],
      premium: [{ type: 'trail', id: 'lightning_blue' }]
    },
    3: {
      free: [],
      premium: [{ type: 'skin', id: 'scholar' }]
    },
    5: {
      free: [{ type: 'coins', amount: 200 }],
      premium: [{ type: 'emote', id: 'thinking' }]
    },
    7: {
      free: [{ type: 'xp_boost', amount: 15 }],
      premium: [{ type: 'skin', id: 'professor' }]
    },
    10: {
      free: [{ type: 'skin', id: 'student' }],
      premium: [{ type: 'trail', id: 'electric_purple' }]
    },
    12: {
      free: [{ type: 'coins', amount: 250 }],
      premium: [{ type: 'emote', id: 'genius' }]
    },
    15: {
      free: [{ type: 'xp_boost', amount: 20 }],
      premium: [{ type: 'skin', id: 'einstein' }]
    },
    18: {
      free: [{ type: 'coins', amount: 300 }],
      premium: [{ type: 'trail', id: 'rainbow_storm' }]
    },
    20: {
      free: [{ type: 'emote', id: 'celebration' }],
      premium: [{ type: 'skin', id: 'wizard' }]
    },
    25: {
      free: [{ type: 'coins', amount: 400 }],
      premium: [{ type: 'skin', id: 'cyborg' }]
    },
    30: {
      free: [{ type: 'skin', id: 'graduate' }],
      premium: [{ type: 'trail', id: 'golden_aura' }]
    },
    35: {
      free: [{ type: 'coins', amount: 500 }],
      premium: [{ type: 'emote', id: 'victory_dance' }]
    },
    40: {
      free: [{ type: 'xp_boost', amount: 50 }],
      premium: [{ type: 'skin', id: 'valedictorian' }]
    },
    45: {
      free: [{ type: 'coins', amount: 750 }],
      premium: [{ type: 'trail', id: 'platinum_flames' }]
    },
    50: {
      free: [{ type: 'skin', id: 'master_brain' }],
      premium: [{ type: 'skin', id: 'legendary_sage' }, { type: 'trail', id: 'ultimate_storm' }]
    }
  }
};

// Available skins with visual data
const SKINS = {
  // Default/Free skins
  default: {
    name: 'BrainBot Classic',
    rarity: 'common',
    price: 0,
    colors: { primary: '#667eea', secondary: '#764ba2', accent: '#fff' }
  },
  rookie: {
    name: 'Rookie Bot',
    rarity: 'common',
    price: 200,
    colors: { primary: '#3498db', secondary: '#2980b9', accent: '#ecf0f1' }
  },
  
  // SPECIAL THEMED ROBOTS (User favorites!)
  peely: {
    name: 'Banana Bot',
    rarity: 'epic',
    price: 800,
    battleTicket: false,
    colors: { primary: '#fff200', secondary: '#ffd700', accent: '#8B4513' }
  },
  pug: {
    name: 'Pug Bot',
    rarity: 'epic',
    price: 800,
    battleTicket: false,
    colors: { primary: '#D2B48C', secondary: '#8B7355', accent: '#000' }
  },
  
  // AWESOME THEMED ROBOTS
  cyber_ninja: {
    name: 'Cyber Ninja',
    rarity: 'legendary',
    price: 1200,
    battleTicket: false,
    colors: { primary: '#1a1a2e', secondary: '#16213e', accent: '#0f3460' }
  },
  galaxy: {
    name: 'Galaxy Bot',
    rarity: 'legendary',
    price: 1200,
    battleTicket: false,
    colors: { primary: '#4B0082', secondary: '#8B008B', accent: '#FFD700' }
  },
  lava: {
    name: 'Lava Bot',
    rarity: 'rare',
    price: 600,
    battleTicket: false,
    colors: { primary: '#ff4500', secondary: '#ff6347', accent: '#ffff00' }
  },
  ice: {
    name: 'Ice Bot',
    rarity: 'rare',
    price: 600,
    battleTicket: false,
    colors: { primary: '#87ceeb', secondary: '#4682b4', accent: '#ffffff' }
  },
  golden: {
    name: 'Golden Bot',
    rarity: 'legendary',
    price: 1500,
    battleTicket: false,
    colors: { primary: '#ffd700', secondary: '#ffed4e', accent: '#8b7500' }
  },
  neon: {
    name: 'Neon Bot',
    rarity: 'epic',
    price: 900,
    battleTicket: false,
    colors: { primary: '#00ff00', secondary: '#00cc00', accent: '#000' }
  },
  rainbow: {
    name: 'Rainbow Bot',
    rarity: 'legendary',
    price: 1800,
    battleTicket: false,
    colors: { primary: '#ff0080', secondary: '#00ffff', accent: '#ffff00' }
  },
  shadow: {
    name: 'Shadow Bot',
    rarity: 'epic',
    price: 1000,
    battleTicket: false,
    colors: { primary: '#1a1a1a', secondary: '#333333', accent: '#ff0000' }
  },
  
  // Battle Ticket Exclusive Robots
  student: {
    name: 'Student Bot',
    rarity: 'common',
    price: 0,
    battleTicket: true,
    colors: { primary: '#3498db', secondary: '#2980b9', accent: '#fff' }
  },
  graduate: {
    name: 'Graduate Bot',
    rarity: 'rare',
    price: 0,
    battleTicket: true,
    colors: { primary: '#2ecc71', secondary: '#27ae60', accent: '#fff' }
  },
  master_brain: {
    name: 'Master Brain Bot',
    rarity: 'legendary',
    price: 0,
    battleTicket: true,
    colors: { primary: '#9b59b6', secondary: '#8e44ad', accent: '#ffd700' }
  }
};

// Emotes
const EMOTES = {
  wave: { name: 'Wave', price: 0, animation: 'wave' },
  thumbsup: { name: 'Thumbs Up', price: 0, animation: 'thumbsup' },
  brain_power: { name: 'Brain Power', price: 300, animation: 'brain' },
  thinking: { name: 'Thinking', price: 400, animation: 'thinking' },
  genius: { name: 'Genius', price: 500, animation: 'lightbulb' },
  celebration: { name: 'Celebration', price: 600, animation: 'celebrate' },
  victory_dance: { name: 'Victory Dance', price: 800, animation: 'dance' }
};

// Trails
const TRAILS = {
  default: { name: 'No Trail', price: 0, color: null },
  lightning_blue: { name: 'Blue Lightning', price: 400, color: '#3498db' },
  electric_purple: { name: 'Purple Electric', price: 600, color: '#9b59b6' },
  rainbow_storm: { name: 'Rainbow Storm', price: 800, color: 'rainbow' },
  golden_aura: { name: 'Golden Aura', price: 1000, color: '#f1c40f' },
  platinum_flames: { name: 'Platinum Flames', price: 1500, color: '#bdc3c7' },
  ultimate_storm: { name: 'Ultimate Storm', price: 2000, color: 'gradient' }
};

module.exports = {
  BATTLE_TICKET_CONFIG,
  SKINS,
  EMOTES,
  TRAILS
};
