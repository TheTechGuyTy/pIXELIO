const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Auth fields
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Game Stats
  stats: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 500 }, // Starting coins
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    totalDamageTaken: { type: Number, default: 0 },
    highestKillGame: { type: Number, default: 0 },
    longestWinStreak: { type: Number, default: 0 },
    currentWinStreak: { type: Number, default: 0 }
  },
  
  // Inventory & Cosmetics
  inventory: {
    ownedSkins: { type: [String], default: ['default'] }, // ONLY default skin!
    equippedSkin: { type: String, default: 'default' },
    ownedEmotes: { type: [String], default: ['wave', 'thumbsup'] },
    ownedTrails: { type: [String], default: ['default'] },
    equippedTrail: { type: String, default: 'default' },
    ownedWeaponSkins: { type: [String], default: [] },
    equippedWeaponSkins: {
      type: Map,
      of: String,
      default: {} // { pistol: 'pistol_gold', rifle: 'rifle_neon', ... }
    }
  },
  
  // Battle Ticket (Battle Pass)
  battleTicket: {
    hasPremium: { type: Boolean, default: false },
    season: { type: Number, default: 1 },
    tier: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    claimedRewards: [{ type: Number }] // Array of tier numbers claimed
  },
  
  // Friends System
  friends: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now }
  }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Settings
  settings: {
    // Audio Settings
    masterVolume: { type: Number, default: 0.7, min: 0, max: 1 },
    musicVolume: { type: Number, default: 0.5, min: 0, max: 1 },
    sfxVolume: { type: Number, default: 0.7, min: 0, max: 1 },
    voiceVolume: { type: Number, default: 1.0, min: 0, max: 1 },
    soundEffects: { type: Boolean, default: true },
    music: { type: Boolean, default: true },
    
    // Voice Chat Settings
    voiceChatEnabled: { type: Boolean, default: false },
    voiceChatMode: { type: String, enum: ['everyone', 'friends', 'team', 'off'], default: 'friends' },
    pushToTalk: { type: Boolean, default: true },
    voiceActivation: { type: Boolean, default: false },
    micSensitivity: { type: Number, default: 0.5, min: 0, max: 1 },
    
    // Chat Settings
    chatEnabled: { type: Boolean, default: true },
    profanityFilter: { type: Boolean, default: true },
    showTimestamps: { type: Boolean, default: false },
    chatOpacity: { type: Number, default: 0.8, min: 0.3, max: 1 },
    
    // Controls Settings
    keybinds: {
      moveForward: { type: String, default: 'w' },
      moveBack: { type: String, default: 's' },
      moveLeft: { type: String, default: 'a' },
      moveRight: { type: String, default: 'd' },
      jump: { type: String, default: 'space' },
      crouch: { type: String, default: 'c' },
      sprint: { type: String, default: 'shift' },
      interact: { type: String, default: 'e' },
      reload: { type: String, default: 'r' },
      buildMode: { type: String, default: 'q' },
      buildWall: { type: String, default: 'q' },
      buildFloor: { type: String, default: 'f' },
      buildStair: { type: String, default: 'v' },
      buildRoof: { type: String, default: 'g' },
      inventory: { type: String, default: 'tab' },
      map: { type: String, default: 'm' },
      emote: { type: String, default: 'b' },
      ping: { type: String, default: 'middlemouse' }
    },
    mouseSensitivity: { type: Number, default: 0.5, min: 0.1, max: 2 },
    invertY: { type: Boolean, default: false },
    
    // Gameplay Settings
    simpleBuildMode: { type: Boolean, default: false },
    autoRun: { type: Boolean, default: false },
    autoPickup: { type: Boolean, default: true },
    autoOpenDoors: { type: Boolean, default: false },
    autoSwitchWeapon: { type: Boolean, default: true },
    confirmReset: { type: Boolean, default: true },
    toggleSprint: { type: Boolean, default: false },
    toggleCrouch: { type: Boolean, default: false },
    
    // Graphics Settings
    graphicsQuality: { type: String, enum: ['low', 'medium', 'high', 'ultra'], default: 'high' },
    showFPS: { type: Boolean, default: false },
    showPing: { type: Boolean, default: true },
    motionBlur: { type: Boolean, default: false },
    shadowQuality: { type: String, enum: ['off', 'low', 'medium', 'high'], default: 'medium' },
    effectsQuality: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
    viewDistance: { type: String, enum: ['near', 'medium', 'far', 'epic'], default: 'far' },
    
    // HUD Settings
    hudScale: { type: Number, default: 1.0, min: 0.5, max: 1.5 },
    showDamageNumbers: { type: Boolean, default: true },
    showHealthBar: { type: Boolean, default: true },
    showReticle: { type: Boolean, default: true },
    showKillFeed: { type: Boolean, default: true },
    minimapSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    
    // Privacy Settings
    showOnlineStatus: { type: Boolean, default: true },
    friendRequestsEnabled: { type: Boolean, default: true },
    allowSpectators: { type: Boolean, default: true },
    hideUsername: { type: Boolean, default: false },
    shareStats: { type: Boolean, default: true },
    
    // Accessibility Settings
    colorblindMode: { type: String, enum: ['off', 'protanopia', 'deuteranopia', 'tritanopia'], default: 'off' },
    subtitles: { type: Boolean, default: false },
    reduceMotion: { type: Boolean, default: false },
    textSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    highContrast: { type: Boolean, default: false }
  },
  
  // Admin & Moderation
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedAt: { type: Date },
  banExpiresAt: { type: Date },
  
  // Gifting
  gifts: [{
    id: String,
    from: String,
    fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    itemType: String,
    itemId: String,
    message: String,
    sentAt: Date,
    claimed: { type: Boolean, default: false },
    claimedAt: Date
  }],
  
  // Challenges
  challenges: {
    daily: [{
      id: String,
      name: String,
      description: String,
      type: String,
      icon: String,
      target: mongoose.Schema.Types.Mixed,
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      claimed: { type: Boolean, default: false },
      tier: Number,
      completedAt: Date,
      claimedAt: Date,
      notified: { type: Boolean, default: false }
    }],
    weekly: [{
      id: String,
      name: String,
      description: String,
      type: String,
      icon: String,
      target: Number,
      xp: Number,
      coins: Number,
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      claimed: { type: Boolean, default: false },
      completedAt: Date,
      claimedAt: Date,
      notified: { type: Boolean, default: false }
    }],
    lastDailyRefresh: Date,
    lastWeeklyRefresh: Date
  },
  
  // Notifications
  notifications: [{
    id: String,
    type: String, // 'friend_request', 'challenge_complete', 'gift', 'achievement', 'party_invite', etc.
    title: String,
    message: String,
    icon: String,
    data: mongoose.Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Replays (last 10 matches)
  replays: [{
    id: String,
    gameId: String,
    timestamp: Date,
    duration: Number,
    winner: String,
    metadata: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Achievements
  achievements: [{
    id: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  
  // Match History (last 20 games)
  matchHistory: [{
    gameId: String,
    placement: Number,
    kills: Number,
    damageDealt: Number,
    questionsCorrect: Number,
    questionsTotal: Number,
    xpGained: Number,
    coinsGained: Number,
    playedAt: { type: Date, default: Date.now }
  }],
  
  // Account metadata
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  currentGameId: { type: String, default: null }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate level from XP
UserSchema.methods.calculateLevel = function() {
  // Level formula: Level = floor(sqrt(XP / 100))
  return Math.floor(Math.sqrt(this.stats.xp / 100)) + 1;
};

// Method to add match to history (keep last 20)
UserSchema.methods.addMatchToHistory = function(matchData) {
  this.matchHistory.unshift(matchData);
  if (this.matchHistory.length > 20) {
    this.matchHistory = this.matchHistory.slice(0, 20);
  }
};

// Method to add XP and update level
UserSchema.methods.addXP = function(amount) {
  this.stats.xp += amount;
  this.stats.level = this.calculateLevel();
};

// Method to add coins
UserSchema.methods.addCoins = function(amount) {
  this.stats.coins += amount;
};

// Virtual for K/D ratio
UserSchema.virtual('kdRatio').get(function() {
  if (this.stats.deaths === 0) return this.stats.kills;
  return (this.stats.kills / this.stats.deaths).toFixed(2);
});

// Virtual for win rate
UserSchema.virtual('winRate').get(function() {
  if (this.stats.gamesPlayed === 0) return 0;
  return ((this.stats.wins / this.stats.gamesPlayed) * 100).toFixed(1);
});

// Virtual for accuracy
UserSchema.virtual('accuracy').get(function() {
  if (this.stats.questionsAnswered === 0) return 0;
  return ((this.stats.questionsCorrect / this.stats.questionsAnswered) * 100).toFixed(1);
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
