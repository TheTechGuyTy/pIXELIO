# ⚡ Quick Start Guide

Get BrainStorm Royale running in **5 minutes**!

## Step 1: Install Node.js

Download and install from [nodejs.org](https://nodejs.org/) (choose LTS version)

## Step 2: Set Up MongoDB (Choose One)

### Option A: MongoDB Atlas (Cloud - Easiest) ⭐

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a FREE cluster (M0)
4. Create a database user
5. Whitelist all IPs (0.0.0.0/0)
6. Get connection string

Full guide: See `MONGODB_SETUP.md`

### Option B: Local MongoDB

**Mac:** `brew install mongodb-community && brew services start mongodb-community`
**Windows:** Download installer from mongodb.com
**Linux:** `sudo apt-get install mongodb && sudo systemctl start mongodb`

## Step 3: Install & Configure

```bash
# 1. Navigate to project folder
cd brainstorm-royale-game

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your MongoDB connection string
# Use your favorite text editor to edit .env
```

### Your .env should look like:

```env
# If using MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brainstorm-royale

# If using Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/brainstorm-royale

# Change these to random strings (IMPORTANT for production!)
JWT_SECRET=change-this-to-something-random-1234567890
SESSION_SECRET=change-this-to-something-random-0987654321

PORT=3000
```

## Step 4: Start Server

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

## Step 5: Play!

1. Open browser to **http://localhost:3000**
2. Sign up or continue as guest
3. Create or join a game
4. Have fun! 🎮

## Testing Multiplayer Locally

1. Open multiple browser tabs to http://localhost:3000
2. Create a game in one tab
3. Join with the game code in other tabs
4. Play together!

## Common Issues

### "MongoDB Connection Error"
- Check your MONGODB_URI in .env file
- For Atlas: verify IP whitelist and credentials
- For Local: make sure MongoDB is running

### "Port 3000 already in use"
- Change PORT in .env to 3001 or another number
- Or close the other application using port 3000

### "Cannot find module"
- Run `npm install` again
- Make sure you're in the project directory

## Next Steps

- Read `README.md` for full documentation
- Check `DEPLOYMENT.md` to deploy online
- Review `MONGODB_SETUP.md` for database details

## Need Help?

- Check the main README.md
- Review troubleshooting section
- Open an issue on GitHub

---

**That's it! You're ready to play! 🧠⚡**
