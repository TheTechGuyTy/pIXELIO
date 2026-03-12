// Spectate and Replay System

const REPLAY_CONFIG = {
  maxDuration: 600000, // 10 minutes max
  recordInterval: 100, // Record every 100ms
  maxFileSize: 10485760, // 10MB max
  compressionEnabled: true,
  autoSave: true
};

// Replay data structure
class GameReplay {
  constructor(gameId, mapType) {
    this.id = require('crypto').randomBytes(16).toString('hex');
    this.gameId = gameId;
    this.mapType = mapType;
    this.startTime = Date.now();
    this.endTime = null;
    this.duration = 0;
    this.frames = [];
    this.players = [];
    this.winner = null;
    this.metadata = {
      totalKills: 0,
      totalDamage: 0,
      longestKill: 0,
      buildingsPlaced: 0
    };
  }
  
  // Record a frame
  recordFrame(gameState) {
    const frame = {
      timestamp: Date.now() - this.startTime,
      players: gameState.players.map(p => ({
        id: p.id,
        username: p.username,
        x: p.x,
        y: p.y,
        health: p.health,
        shield: p.shield,
        weapon: p.weapon,
        isAlive: p.isAlive,
        kills: p.kills
      })),
      bullets: gameState.bullets.map(b => ({
        x: b.x,
        y: b.y,
        weapon: b.weapon
      })),
      buildings: gameState.buildings.map(b => ({
        x: b.x,
        y: b.y,
        type: b.type,
        health: b.health
      })),
      stormRadius: gameState.stormRadius,
      killFeed: gameState.killFeed.slice(0, 5)
    };
    
    this.frames.push(frame);
  }
  
  // End recording
  endRecording(winner, finalStats) {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    this.winner = winner;
    this.metadata = {
      ...this.metadata,
      ...finalStats
    };
  }
  
  // Get replay data
  getData() {
    return {
      id: this.id,
      gameId: this.gameId,
      mapType: this.mapType,
      startTime: this.startTime,
      duration: this.duration,
      frames: this.frames,
      players: this.players,
      winner: this.winner,
      metadata: this.metadata
    };
  }
  
  // Compress replay data
  compress() {
    // Simple delta compression - only store changes between frames
    const compressed = {
      ...this.getData(),
      frames: this.frames.map((frame, index) => {
        if (index === 0) return frame; // First frame is complete
        
        const prev = this.frames[index - 1];
        const delta = {
          timestamp: frame.timestamp,
          players: frame.players.map((p, i) => {
            const prevP = prev.players[i];
            const changes = {};
            
            if (p.x !== prevP.x) changes.x = p.x;
            if (p.y !== prevP.y) changes.y = p.y;
            if (p.health !== prevP.health) changes.health = p.health;
            if (p.shield !== prevP.shield) changes.shield = p.shield;
            if (p.weapon !== prevP.weapon) changes.weapon = p.weapon;
            if (p.isAlive !== prevP.isAlive) changes.isAlive = p.isAlive;
            if (p.kills !== prevP.kills) changes.kills = p.kills;
            
            return Object.keys(changes).length > 0 ? { id: p.id, ...changes } : null;
          }).filter(p => p !== null),
          stormRadius: frame.stormRadius !== prev.stormRadius ? frame.stormRadius : undefined,
          killFeed: frame.killFeed.length > 0 ? frame.killFeed : undefined
        };
        
        return delta;
      })
    };
    
    return compressed;
  }
}

// Spectator manager
class SpectatorManager {
  constructor() {
    this.spectators = new Map(); // gameId -> [socketIds]
    this.spectating = new Map(); // socketId -> gameId
  }
  
  // Add spectator to game
  addSpectator(socketId, gameId) {
    if (!this.spectators.has(gameId)) {
      this.spectators.set(gameId, []);
    }
    
    this.spectators.get(gameId).push(socketId);
    this.spectating.set(socketId, gameId);
  }
  
  // Remove spectator
  removeSpectator(socketId) {
    const gameId = this.spectating.get(socketId);
    
    if (gameId && this.spectators.has(gameId)) {
      const spectators = this.spectators.get(gameId);
      const index = spectators.indexOf(socketId);
      
      if (index > -1) {
        spectators.splice(index, 1);
      }
      
      if (spectators.length === 0) {
        this.spectators.delete(gameId);
      }
    }
    
    this.spectating.delete(socketId);
  }
  
  // Get spectators for game
  getSpectators(gameId) {
    return this.spectators.get(gameId) || [];
  }
  
  // Get what a spectator is watching
  getSpectating(socketId) {
    return this.spectating.get(socketId);
  }
  
  // Get spectator count for game
  getSpectatorCount(gameId) {
    return this.spectators.get(gameId)?.length || 0;
  }
}

// Replay player (for playing back replays)
class ReplayPlayer {
  constructor(replayData) {
    this.data = replayData;
    this.currentFrame = 0;
    this.isPlaying = false;
    this.speed = 1.0; // Playback speed
    this.startTime = null;
  }
  
  // Start playback
  play() {
    this.isPlaying = true;
    this.startTime = Date.now();
  }
  
  // Pause playback
  pause() {
    this.isPlaying = false;
  }
  
  // Stop and reset
  stop() {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.startTime = null;
  }
  
  // Seek to specific time
  seek(timestamp) {
    this.currentFrame = this.data.frames.findIndex(f => f.timestamp >= timestamp);
    if (this.currentFrame === -1) this.currentFrame = this.data.frames.length - 1;
  }
  
  // Get current frame
  getCurrentFrame() {
    return this.data.frames[this.currentFrame];
  }
  
  // Update (call in game loop)
  update(deltaTime) {
    if (!this.isPlaying) return;
    
    const elapsed = (Date.now() - this.startTime) * this.speed;
    
    // Find frame that matches elapsed time
    while (this.currentFrame < this.data.frames.length - 1) {
      const nextFrame = this.data.frames[this.currentFrame + 1];
      if (nextFrame.timestamp > elapsed) break;
      this.currentFrame++;
    }
    
    // End of replay
    if (this.currentFrame >= this.data.frames.length - 1) {
      this.stop();
    }
  }
  
  // Set playback speed
  setSpeed(speed) {
    this.speed = Math.max(0.25, Math.min(4.0, speed)); // Clamp between 0.25x and 4x
  }
  
  // Get progress (0-1)
  getProgress() {
    return this.currentFrame / (this.data.frames.length - 1);
  }
}

// Save replay to database (simplified)
async function saveReplay(replay, userId) {
  const User = require('../models/User');
  
  try {
    const user = await User.findById(userId);
    
    if (!user) return null;
    
    if (!user.replays) {
      user.replays = [];
    }
    
    const compressedReplay = replay.compress();
    
    // Add to user's replays
    user.replays.unshift({
      id: replay.id,
      gameId: replay.gameId,
      timestamp: replay.startTime,
      duration: replay.duration,
      winner: replay.winner,
      metadata: replay.metadata,
      data: compressedReplay
    });
    
    // Keep only last 10 replays
    if (user.replays.length > 10) {
      user.replays = user.replays.slice(0, 10);
    }
    
    await user.save();
    
    return replay.id;
  } catch (error) {
    console.error('Save replay error:', error);
    return null;
  }
}

// Load replay from database
async function loadReplay(replayId, userId) {
  const User = require('../models/User');
  
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.replays) return null;
    
    const replay = user.replays.find(r => r.id === replayId);
    
    if (!replay) return null;
    
    return replay.data;
  } catch (error) {
    console.error('Load replay error:', error);
    return null;
  }
}

// Delete replay
async function deleteReplay(replayId, userId) {
  const User = require('../models/User');
  
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.replays) return false;
    
    const index = user.replays.findIndex(r => r.id === replayId);
    
    if (index === -1) return false;
    
    user.replays.splice(index, 1);
    await user.save();
    
    return true;
  } catch (error) {
    console.error('Delete replay error:', error);
    return false;
  }
}

module.exports = {
  REPLAY_CONFIG,
  GameReplay,
  SpectatorManager,
  ReplayPlayer,
  saveReplay,
  loadReplay,
  deleteReplay
};
