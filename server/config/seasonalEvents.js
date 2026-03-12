// Seasonal Events System

const SEASONS = {
  spring: {
    name: 'Spring Bloom',
    months: [3, 4, 5],
    theme: {
      colors: ['#90EE90', '#98FB98', '#FFB6C1'],
      decoration: 'flowers',
      weather: 'sunny'
    }
  },
  summer: {
    name: 'Summer Splash',
    months: [6, 7, 8],
    theme: {
      colors: ['#FFD700', '#FFA500', '#87CEEB'],
      decoration: 'beach',
      weather: 'hot'
    }
  },
  fall: {
    name: 'Autumn Harvest',
    months: [9, 10, 11],
    theme: {
      colors: ['#FF8C00', '#D2691E', '#8B4513'],
      decoration: 'leaves',
      weather: 'windy'
    }
  },
  winter: {
    name: 'Winter Wonderland',
    months: [12, 1, 2],
    theme: {
      colors: ['#FFFFFF', '#B0E0E6', '#4169E1'],
      decoration: 'snow',
      weather: 'snowy'
    }
  }
};

const SEASONAL_EVENTS = {
  // Halloween (October)
  halloween: {
    name: 'Spooky Storm',
    description: 'The arena is haunted! Collect special pumpkin power-ups!',
    startDate: '10-15',
    endDate: '11-01',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return (month === 10 && day >= 15) || (month === 11 && day === 1);
    },
    rewards: {
      skins: ['pumpkin_bot', 'ghost_bot'],
      emotes: ['spooky_dance', 'boo'],
      trails: ['candy_corn', 'spider_web']
    },
    specialItems: ['pumpkin_powerup', 'ghost_shield'],
    mapDecorations: ['pumpkins', 'gravestones', 'cobwebs'],
    theme: {
      skyColor: '#4B0082',
      fogColor: '#663399'
    }
  },
  
  // Thanksgiving (November)
  thanksgiving: {
    name: 'Harvest Festival',
    description: 'Gather and be thankful! Bonus XP event!',
    startDate: '11-20',
    endDate: '11-27',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return month === 11 && day >= 20 && day <= 27;
    },
    bonuses: {
      xp: 1.5,
      coins: 1.5
    },
    rewards: {
      skins: ['turkey_bot', 'pilgrim_bot'],
      emotes: ['thankful']
    },
    mapDecorations: ['cornucopia', 'hay_bales']
  },
  
  // Christmas (December)
  christmas: {
    name: 'Winter Celebration',
    description: 'Tis the season! Special gift boxes everywhere!',
    startDate: '12-15',
    endDate: '12-26',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return month === 12 && day >= 15 && day <= 26;
    },
    rewards: {
      skins: ['santa_bot', 'elf_bot', 'snowman_bot'],
      emotes: ['jingle', 'snow_angel'],
      trails: ['snowflakes', 'candy_cane']
    },
    specialItems: ['gift_boxes', 'snow_powerup'],
    mapDecorations: ['christmas_trees', 'lights', 'presents'],
    theme: {
      skyColor: '#4682B4',
      weather: 'snow'
    }
  },
  
  // New Year (January)
  new_year: {
    name: 'New Year Blast',
    description: 'Celebrate with fireworks! All power-ups spawn more!',
    startDate: '12-31',
    endDate: '01-02',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return (month === 12 && day === 31) || (month === 1 && day <= 2);
    },
    bonuses: {
      powerupSpawn: 2
    },
    rewards: {
      skins: ['2026_bot'],
      emotes: ['fireworks', 'party_horn'],
      trails: ['confetti']
    },
    specialEffects: ['fireworks'],
    mapDecorations: ['balloons', 'streamers']
  },
  
  // Valentine's Day (February)
  valentines: {
    name: 'Love Storm',
    description: 'Spread the love! Gift items to friends for bonus coins!',
    startDate: '02-10',
    endDate: '02-15',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return month === 2 && day >= 10 && day <= 15;
    },
    bonuses: {
      gifting: 1.5
    },
    rewards: {
      skins: ['cupid_bot', 'heart_bot'],
      emotes: ['heart_eyes', 'blow_kiss'],
      trails: ['hearts']
    },
    mapDecorations: ['roses', 'hearts']
  },
  
  // Easter (April - varies)
  easter: {
    name: 'Egg Hunt',
    description: 'Find hidden eggs for special rewards!',
    startDate: '04-10',
    endDate: '04-17',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return month === 4 && day >= 10 && day <= 17;
    },
    rewards: {
      skins: ['bunny_bot', 'chick_bot'],
      emotes: ['hop', 'egg_toss'],
      trails: ['egg_trail']
    },
    specialItems: ['easter_eggs'],
    mapDecorations: ['easter_baskets', 'eggs']
  },
  
  // Back to School (September)
  back_to_school: {
    name: 'Brain Academy',
    description: 'Trivia questions give DOUBLE XP!',
    startDate: '09-01',
    endDate: '09-15',
    active: function() {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return month === 9 && day >= 1 && day <= 15;
    },
    bonuses: {
      triviaXP: 2
    },
    rewards: {
      skins: ['student_pro_bot', 'teacher_bot'],
      emotes: ['book_read', 'graduate_toss'],
      trails: ['pencils']
    },
    mapDecorations: ['desks', 'blackboards']
  }
};

// Get current active events
function getActiveEvents() {
  const activeEvents = [];
  
  for (const [id, event] of Object.entries(SEASONAL_EVENTS)) {
    if (event.active()) {
      activeEvents.push({ id, ...event });
    }
  }
  
  return activeEvents;
}

// Get current season
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  
  for (const [id, season] of Object.entries(SEASONS)) {
    if (season.months.includes(month)) {
      return { id, ...season };
    }
  }
  
  return null;
}

// Apply event bonuses to rewards
function applyEventBonuses(baseRewards) {
  const activeEvents = getActiveEvents();
  let multipliedRewards = { ...baseRewards };
  
  activeEvents.forEach(event => {
    if (event.bonuses) {
      if (event.bonuses.xp) {
        multipliedRewards.xp = Math.floor(multipliedRewards.xp * event.bonuses.xp);
      }
      if (event.bonuses.coins) {
        multipliedRewards.coins = Math.floor(multipliedRewards.coins * event.bonuses.coins);
      }
      if (event.bonuses.triviaXP && multipliedRewards.triviaXP) {
        multipliedRewards.triviaXP = Math.floor(multipliedRewards.triviaXP * event.bonuses.triviaXP);
      }
    }
  });
  
  return multipliedRewards;
}

module.exports = {
  SEASONS,
  SEASONAL_EVENTS,
  getActiveEvents,
  getCurrentSeason,
  applyEventBonuses
};
