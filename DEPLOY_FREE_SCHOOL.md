# 🎮 Deploy FREE for School Testing (Railway)

## Play with Friends at School in 10 Minutes!

This guide gets your game online **completely FREE** so you and your friends can play at school!

---

## ✅ What You'll Get

- FREE hosting (no credit card needed!)
- URL like: `brainstorm-royale.up.railway.app`
- Everyone at school can connect
- 500 hours/month FREE (plenty for testing!)
- Works on school WiFi

---

## 🚀 Step-by-Step (10 Minutes)

### Step 1: Setup MongoDB Atlas (3 min) - FREE Forever

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free"
   - Sign up with Google/email

2. **Create Cluster**
   - Click "Build a Database"
   - Choose **FREE M0 tier** (shared)
   - Select closest region (US East)
   - Cluster name: `brainstorm-royale`
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `gameuser`
   - Password: Click "Autogenerate" → **COPY AND SAVE THIS!**
   - Role: "Atlas admin"
   - Click "Add User"

4. **Allow All IPs**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access From Anywhere"
   - IP: `0.0.0.0/0` (should auto-fill)
   - Click "Confirm"

5. **Get Connection String**
   - Go back to "Database" (left sidebar)
   - Click "Connect" button
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://gameuser:<password>@brainstorm-royale.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with the password you saved
   - **SAVE THIS CONNECTION STRING!**

---

### Step 2: Push Code to GitHub (2 min)

1. **Create GitHub Account** (if you don't have one)
   - Go to [github.com](https://github.com)
   - Sign up for free

2. **Create New Repository**
   - Click the "+" icon → "New repository"
   - Repository name: `brainstorm-royale`
   - Make it **Public**
   - Don't initialize with README
   - Click "Create repository"

3. **Push Your Code**
   ```bash
   # Open terminal in your brainstorm-royale-game folder
   cd brainstorm-royale-game
   
   # Initialize git
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "BrainStorm Royale v4.0 - Ready for school!"
   
   # Add GitHub as remote (replace YOUR-USERNAME)
   git remote add origin https://github.com/YOUR-USERNAME/brainstorm-royale.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

---

### Step 3: Deploy on Railway (5 min) - FREE!

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Click "Login"
   - Choose "Login with GitHub" (easiest!)
   - Authorize Railway

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Find your `brainstorm-royale` repository
   - Click it

3. **Add Environment Variables**
   - Railway will start building
   - Click on your service (the purple card)
   - Go to "Variables" tab
   - Click "New Variable" and add these:

   **Variable 1:**
   ```
   Name: MONGODB_URI
   Value: [paste your MongoDB connection string from Step 1]
   ```

   **Variable 2:**
   ```
   Name: JWT_SECRET
   Value: supersecretpassword123brainstormroyale
   ```

   **Variable 3:**
   ```
   Name: PORT
   Value: 3000
   ```

   **Variable 4:**
   ```
   Name: NODE_ENV
   Value: production
   ```

4. **Get Your URL**
   - Go to "Settings" tab
   - Scroll to "Domains"
   - Railway auto-generates a domain
   - Copy the URL (like: `brainstorm-royale-production.up.railway.app`)
   - **This is your game URL!** 🎉

5. **Wait for Deployment**
   - Go to "Deployments" tab
   - Wait for green "SUCCESS" checkmark
   - Takes 2-3 minutes

---

### Step 4: Test Your Game!

1. **Open the URL** Railway gave you
2. **Sign up for an account**
3. **Create a game**
4. **Share the link with friends!**

---

## 📱 How Friends Connect

### Share This With Friends:

```
🎮 Let's play BrainStorm Royale!

1. Go to: [YOUR-RAILWAY-URL]
2. Click "Sign Up"
3. Create account (takes 10 seconds)
4. Join my game!

See you in the arena! 🧠⚡
```

### At School:
- Everyone needs to be on school WiFi (or any internet)
- They go to your Railway URL
- They sign up and play!
- Works on phones, tablets, laptops, Chromebooks!

---

## 🎯 Railway Free Tier Limits

**You get FREE:**
- 500 hours/month (about 21 days of 24/7 running)
- Enough for 100+ players
- Perfect for school testing!

**If you run out:**
- Game goes to sleep
- Just add a $5 credit to keep going
- But 500 hours is PLENTY for testing with friends!

---

## ⚙️ How to Update Your Game

When you add new features:

```bash
# In your game folder
git add .
git commit -m "Added cool new feature!"
git push

# Railway auto-deploys! 🚀
```

---

## 🆘 Troubleshooting

### "Can't connect to database"
- Check MongoDB connection string in Railway variables
- Make sure password doesn't have special characters
- Verify network access is 0.0.0.0/0 in MongoDB

### "Application failed to respond"
- Check Railway logs (Deployments tab)
- Make sure PORT=3000 in variables
- Verify all dependencies in package.json

### "Friends can't connect"
- Make sure they're using the full URL (https://)
- Check if school WiFi blocks the site
- Try on phone with mobile data to test

### "Game is slow"
- Free tier has some limitations
- Normal for 5-10 players
- Upgrade to $5/month for better performance

---

## 💡 Pro Tips

### Make Admin Account
1. Sign up on your game
2. Note your User ID (in profile or browser console)
3. Add to Railway variables:
   ```
   Name: ADMIN_IDS
   Value: your-user-id-here
   ```
4. Restart deployment
5. You now have admin powers! 👮

### Share Your Game
- Screenshot QR code of URL
- Post in Discord/group chats
- Make a short gameplay video
- Create a Google Doc with instructions

### Monitor Usage
- Check Railway dashboard
- See how many hours used
- Monitor if people are playing
- View logs for issues

---

## 🎊 You're Ready!

Your game is now online and **FREE** for you and your friends to play!

**What you have:**
- ✅ Live multiplayer game
- ✅ Free hosting (500 hours/month)
- ✅ Free database (MongoDB Atlas)
- ✅ Online URL everyone can access
- ✅ Perfect for testing at school!

**Share with friends and have fun! 🎮🧠⚡**

---

## 🔄 Next Steps After School Testing

Once you've tested and want to make it official:

1. **Custom Domain** - Add `brainstormroyale.com`
2. **Upgrade Railway** - $5/month for unlimited
3. **Add Features** - Based on friend feedback
4. **Go Public** - Share with the world!

**But for now - just play and have fun at school! 🏫🎮**
