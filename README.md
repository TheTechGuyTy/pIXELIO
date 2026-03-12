# 🧠 BrainStorm Royale - Full Version with Database

A multiplayer battle royale trivia game with **user accounts, persistent stats, and leaderboards**!

## 🆕 What's New in Version 2.0

- ✅ **User Accounts** - Sign up, login, and save your progress
- ✅ **Persistent Stats** - Tracks wins, kills, K/D ratio, accuracy, and more
- ✅ **Experience & Levels** - Gain XP and level up as you play
- ✅ **In-Game Currency** - Earn coins to unlock cosmetics
- ✅ **Match History** - View your last 20 games
- ✅ **Leaderboards** - Compete for the top spot
- ✅ **Achievements System** - Track your accomplishments
- ✅ **Shop & Cosmetics** - Buy skins, trails, and emotes
- ✅ **Guest Mode** - Play without an account

## 📦 What You Need

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Database for storing user accounts
  - **Option 1 (Recommended):** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud database
  - **Option 2:** Local MongoDB installation

## 🚀 Quick Start

### 1. Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier is fine)
4. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Create username and password (save these!)
5. Whitelist your IP:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
6. Get your connection string:
   - Click "Database" → "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### Option B: Local MongoDB

1. Install MongoDB locally:
   - **Windows/Mac:** [Download MongoDB Community Edition](https://www.mongodb.com/try/download/community)
   - **Linux:** `sudo apt-get install mongodb`
2. Start MongoDB: `mongod`
3. Your connection string: `mongodb://localhost:27017/brainstorm-royale`

### 2. Install Dependencies

```bash
cd brainstorm-royale-game
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Your MongoDB connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/brainstorm-royale

# Generate random secrets (DO THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
SESSION_SECRET=your-session-secret-change-this-67890

# Server port
PORT=3000
```

**⚠️ IMPORTANT:** Change the JWT_SECRET and SESSION_SECRET to random strings before deploying!

### 4. Start the Server

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║  🧠 BrainStorm Royale Server Running  ║
╠════════════════════════════════════════╣
║  Port: 3000                            ║
║  Database: Connected                   ║
║  Status: ✅ Ready                       ║
╚════════════════════════════════════════╝
```

### 5. Open the Game

Go to: **http://localhost:3000**

## 🎮 How to Play

### Account System

1. **Sign Up** - Create an account to save your progress
2. **Login** - Access your stats and continue where you left off
3. **Guest Mode** - Play without an account (stats won't be saved)

### Game Features

- **Create Game** - Host a private game with a 6-character code
- **Join Game** - Enter a code to join a friend's game
- **Lobby System** - Players ready up, host starts the game
- **Real-time Multiplayer** - See other players move and fight in real-time
- **Trivia Stations** - Answer questions to get health and ammo
- **Multiple Weapons** - Pistol, Shotgun, Rifle, Sniper
- **Storm Mechanic** - Shrinking safe zone forces players together
- **Post-Game Stats** - View your performance and earn rewards

### Progression System

- **XP & Levels** - Gain experience from playing games
- **Coins** - Earn currency to spend in the shop
- **Stats Tracking** - Wins, kills, K/D ratio, accuracy, and more
- **Match History** - Review your recent games
- **Leaderboards** - See top players by wins, kills, or level

## 🗄️ Database Schema

The game uses MongoDB with the following collections:

### Users Collection

```javascript
{
  username: String,          // Unique username
  email: String,             // Unique email
  password: String,          // Hashed password
  
  stats: {
    level: Number,
    xp: Number,
    coins: Number,
    gamesPlayed: Number,
    wins: Number,
    kills: Number,
    deaths: Number,
    questionsAnswered: Number,
    questionsCorrect: Number,
    // ... more stats
  },
  
  inventory: {
    ownedSkins: [String],
    equippedSkin: String,
    ownedEmotes: [String],
    // ... more cosmetics
  },
  
  achievements: [{ id: String, unlockedAt: Date }],
  matchHistory: [{ gameId, placement, kills, ... }],
  
  createdAt: Date,
  lastLogin: Date,
  isOnline: Boolean
}
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login to existing account
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PATCH /api/auth/profile` - Update profile (requires auth)

### Leaderboards

- `GET /api/auth/leaderboard?type=wins&limit=100` - Get leaderboard
  - Types: `wins`, `kills`, `level`

### Shop

- `POST /api/auth/shop/buy` - Purchase an item (requires auth)

### Health Check

- `GET /api/health` - Check server status

## 🌐 Deployment

### Deploy to Railway (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Add MongoDB Atlas connection string as environment variable:
   - Key: `MONGODB_URI`
   - Value: Your connection string
5. Add other environment variables (`JWT_SECRET`, `SESSION_SECRET`)
6. Deploy!

### Deploy to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. New Web Service → Connect your repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Create the service

### Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create brainstorm-royale`
4. Add MongoDB:
   - Go to MongoDB Atlas and get connection string
   - Set config var: `heroku config:set MONGODB_URI="your-connection-string"`
5. Set secrets:
   ```bash
   heroku config:set JWT_SECRET="your-random-secret-here"
   heroku config:set SESSION_SECRET="your-other-random-secret"
   ```
6. Deploy: `git push heroku main`

## 🛠️ Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5 Canvas** - Game rendering
- **Socket.io Client** - Real-time updates
- **Vanilla JavaScript** - No frameworks needed!

## 📊 Game Rewards

### XP Calculation
- Base XP: 50 per game
- Kill XP: 20 per kill
- Win XP: 100 bonus
- Trivia XP: 10 per correct answer

### Coin Calculation
- Base Coins: 25 per game
- Kill Coins: 10 per kill
- Win Coins: 100 bonus
- Trivia Coins: 5 per correct answer

### Level Formula
```javascript
Level = floor(sqrt(XP / 100)) + 1
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Input validation
- Session management
- CORS configuration

## 🐛 Troubleshooting

### "MongoDB Connection Error"
- Check your MONGODB_URI in .env file
- Verify MongoDB Atlas IP whitelist settings
- Ensure database user has correct permissions

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### "Port already in use"
- Change PORT in .env file
- Kill the process using the port: `lsof -ti:3000 | xargs kill` (Mac/Linux)

### "Invalid authentication token"
- Clear your browser's localStorage
- Login again

## 📝 Development Tips

### Adding New Weapons

Edit `server/index.js`:
```javascript
const WEAPONS = {
  newWeapon: { 
    name: 'New Weapon', 
    damage: 50, 
    fireRate: 500, 
    ammoUse: 1, 
    range: 400, 
    speed: 20 
  }
};
```

### Adding New Trivia Questions

Edit `server/index.js`:
```javascript
const TRIVIA_QUESTIONS = [
  { 
    q: "Your question here?", 
    a: ["Option 1", "Option 2", "Option 3", "Option 4"], 
    correct: 1  // Index of correct answer (0-3)
  }
];
```

### Adding New Skins

1. Add to shop data (create a shop system)
2. Update User model's inventory schema
3. Implement rendering logic in client

## 🔮 Future Features

- [ ] Friend system & party invites
- [ ] Voice chat
- [ ] More game modes (Team Deathmatch, Capture the Flag)
- [ ] Seasonal events & battle passes
- [ ] Mobile app (iOS/Android)
- [ ] Spectator mode
- [ ] Replays
- [ ] Tournament system
- [ ] Clan/Guild system
- [ ] Trading system for cosmetics

## 📄 License

MIT License - Feel free to use this for your own projects!

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Made with 🧠 and ⚡ - BrainStorm Royale v2.0**
