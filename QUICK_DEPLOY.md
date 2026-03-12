# ⚡ Quick Deploy to BrainStormRoyale.com

## 15-Minute Deployment Guide

### ✅ Prerequisites
- [ ] Purchase domain: BrainStormRoyale.com
- [ ] Create MongoDB Atlas account (free)
- [ ] Create Railway account (with GitHub)

---

## 🚀 5 Simple Steps

### Step 1: MongoDB (5 min)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up → Create FREE cluster
3. Add Database User (save password!)
4. Allow network access: 0.0.0.0/0
5. Get connection string → Save it!

### Step 2: Push to GitHub (2 min)
```bash
cd brainstorm-royale-game
git init
git add .
git commit -m "Deploy BrainStorm Royale v4.0"
git branch -M main
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR-USERNAME/brainstorm-royale.git
git push -u origin main
```

### Step 3: Deploy to Railway (3 min)
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=make-this-random-and-secure
   PORT=3000
   NODE_ENV=production
   ```
6. Wait for deployment ✅

### Step 4: Connect Domain (5 min)
1. In Railway: Settings → Domains → Add Domain
2. Enter: `brainstormroyale.com`
3. Railway gives you DNS records
4. In your domain registrar (Namecheap/Google):
   - Add CNAME record `@` → [Railway value]
   - Add CNAME record `www` → [Railway value]
5. Wait 5-30 minutes for DNS

### Step 5: Test! (1 min)
1. Visit `https://brainstormroyale.com`
2. Sign up for account
3. Create a game
4. Share with friends!

---

## 🎯 Environment Variables You Need

Copy these and fill in YOUR values:

```env
# MongoDB (from Atlas)
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@brainstorm-royale.xxxxx.mongodb.net/brainstorm?retryWrites=true&w=majority

# Security (generate random string)
JWT_SECRET=change_this_to_something_random_and_secure_like_keyboard_mashing

# Server
PORT=3000
NODE_ENV=production

# Optional Admin Setup
ADMIN_IDS=your-user-id-after-creating-account
```

---

## 🆘 Common Issues

### "Can't connect to MongoDB"
- Check your MongoDB password (no special characters like @, :, /)
- If it has special characters, URL encode them
- Make sure network access is 0.0.0.0/0

### "Domain not loading"
- Wait 30 minutes for DNS propagation
- Check [whatsmydns.net](https://whatsmydns.net)
- Try clearing browser cache
- Try `www.brainstormroyale.com`

### "Build failed on Railway"
- Check that package.json has correct start script
- Make sure all dependencies are in package.json
- Check Railway logs for specific error

---

## 💰 Monthly Cost

- **Domain:** $10/year = $0.83/month
- **Railway:** $5/month (first $5 free!)
- **MongoDB:** FREE (forever)

**Total: ~$5/month** (or FREE for first month!)

---

## 📱 After Deployment

1. **Test everything:**
   - Sign up
   - Create game
   - Play with friends
   - Test all features

2. **Make it official:**
   - Create social media accounts
   - Make Discord server
   - Create trailer video
   - Share with friends!

3. **Monitor:**
   - Check Railway dashboard daily
   - Monitor player count
   - Read feedback
   - Fix bugs quickly

---

## 🎊 You're Live!

Your game is now at **https://brainstormroyale.com**!

Share it everywhere:
- School friends
- Discord servers
- Reddit (r/gamedev, r/WebGames)
- Twitter/TikTok
- YouTube

**Congratulations! You built and deployed a full multiplayer game! 🚀🎮**
