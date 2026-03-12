# 🚀 Deploy BrainStorm Royale to BrainStormRoyale.com

## Complete Deployment Guide

This guide will help you deploy your game to **BrainStormRoyale.com** with a professional setup!

---

## 📋 What You'll Need

1. **Domain Name:** BrainStormRoyale.com ($10-15/year)
2. **Hosting Service:** Railway, Heroku, or DigitalOcean ($5-10/month)
3. **Database:** MongoDB Atlas (FREE tier)
4. **Time:** About 1-2 hours

**Total Monthly Cost:** $5-10 (with free MongoDB)

---

## 🎯 Step-by-Step Deployment

### Phase 1: Get Your Domain (BrainStormRoyale.com)

#### Option A: Namecheap (Recommended)
1. Go to [Namecheap.com](https://www.namecheap.com)
2. Search for "BrainStormRoyale.com"
3. Add to cart and checkout (~$10/year)
4. **IMPORTANT:** Don't set up hosting yet - we'll use Railway/Heroku

#### Option B: Google Domains
1. Go to [domains.google.com](https://domains.google.com)
2. Search and purchase BrainStormRoyale.com
3. Similar process, ~$12/year

#### Option C: GoDaddy
1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Search and buy domain
3. ~$15/year

**After Purchase:** Keep your domain registrar tab open - we'll need it later!

---

### Phase 2: Set Up Database (MongoDB Atlas - FREE)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free"
   - Sign up with email

2. **Create a Cluster**
   - Choose FREE "M0" tier
   - Select region closest to your users (e.g., US East)
   - Cluster name: "brainstorm-royale"
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Set Up Database Access**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Username: `admin`
   - Password: Click "Autogenerate Secure Password" - **SAVE THIS!**
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access From Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@brainstorm-royale.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - **SAVE THIS CONNECTION STRING!**

---

### Phase 3: Deploy to Railway (EASIEST - RECOMMENDED)

Railway is the easiest way to deploy and connect your domain!

#### Step 1: Prepare Your Code

1. **Update package.json**
   
   Make sure your `package.json` has:
   ```json
   {
     "scripts": {
       "start": "node server/index.js",
       "dev": "nodemon server/index.js"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

2. **Create `.env` file with your MongoDB connection:**
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string-here
   JWT_SECRET=your-random-secret-here-change-this-to-something-secure
   PORT=3000
   ```

#### Step 2: Deploy to Railway

1. **Sign Up for Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "Login" 
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - If first time: Click "Configure GitHub App"
   - Give Railway access to your repository
   - Select your `brainstorm-royale-game` repository

3. **Add Environment Variables**
   - Once deployed, click on your service
   - Go to "Variables" tab
   - Click "New Variable" for each:
   ```
   MONGODB_URI = your-mongodb-atlas-connection-string
   JWT_SECRET = generate-random-secret-here
   PORT = 3000
   NODE_ENV = production
   ```

4. **Deploy!**
   - Railway will auto-deploy
   - Wait 2-3 minutes
   - You'll get a URL like: `brainstorm-royale.up.railway.app`
   - **Test it!** Open the URL

#### Step 3: Connect Your Custom Domain

1. **In Railway Dashboard:**
   - Click "Settings" tab
   - Scroll to "Domains"
   - Click "Add Domain"
   - Enter: `brainstormroyale.com`
   - Railway will show you DNS records to add

2. **In Your Domain Registrar (Namecheap/Google/GoDaddy):**
   
   **If using Namecheap:**
   - Log into Namecheap
   - Go to Domain List → Manage
   - Click "Advanced DNS"
   - Add these records:
   
   | Type  | Host | Value                     | TTL  |
   |-------|------|---------------------------|------|
   | CNAME | @    | [Railway provides this]   | Auto |
   | CNAME | www  | [Railway provides this]   | Auto |
   
   **If using Google Domains:**
   - Go to DNS settings
   - Add Custom Records
   - Add CNAME records as Railway specifies
   
   **If using GoDaddy:**
   - Go to DNS Management
   - Add CNAME records

3. **Wait for DNS Propagation**
   - Takes 5-60 minutes
   - Check status at: [whatsmydns.net](https://www.whatsmydns.net)
   - Enter: brainstormroyale.com

4. **SSL Certificate (HTTPS)**
   - Railway automatically provides SSL
   - Your site will be: `https://brainstormroyale.com` 🔒

---

### Alternative: Deploy to Heroku

Heroku is another great option!

#### Step 1: Install Heroku CLI

**Mac:**
```bash
brew tap heroku/brew && brew install heroku
```

**Windows:**
Download from [heroku.com/downloads](https://devcenter.heroku.com/articles/heroku-cli)

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Deploy

```bash
# Login to Heroku
heroku login

# Navigate to your game directory
cd brainstorm-royale-game

# Create Heroku app
heroku create brainstorm-royale

# Add environment variables
heroku config:set MONGODB_URI="your-mongodb-connection-string"
heroku config:set JWT_SECRET="your-random-secret"
heroku config:set NODE_ENV="production"

# Create Procfile
echo "web: node server/index.js" > Procfile

# Initialize git (if not already)
git init
git add .
git commit -m "Deploy BrainStorm Royale"

# Deploy!
git push heroku main
```

#### Step 3: Connect Domain to Heroku

```bash
# Add your custom domain
heroku domains:add brainstormroyale.com
heroku domains:add www.brainstormroyale.com

# Heroku will give you DNS targets
heroku domains
```

Then add DNS records in your domain registrar (same as Railway steps).

---

### Alternative: Deploy to DigitalOcean (More Advanced)

For more control and scalability:

1. **Create DigitalOcean Account**
   - Go to [DigitalOcean.com](https://www.digitalocean.com)
   - Sign up and add payment method
   - Get $200 credit with student account!

2. **Create a Droplet**
   - Click "Create" → "Droplets"
   - Choose Ubuntu 22.04
   - Plan: $6/month (1GB RAM)
   - Choose datacenter region
   - Add SSH key or use password
   - Hostname: brainstorm-royale
   - Create Droplet

3. **SSH into Server**
   ```bash
   ssh root@your-droplet-ip
   ```

4. **Install Node.js and Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y git nginx
   npm install -g pm2
   ```

5. **Clone and Setup Your Game**
   ```bash
   cd /var/www
   git clone your-repo-url brainstorm-royale
   cd brainstorm-royale
   npm install
   
   # Create .env file
   nano .env
   # Add your environment variables
   ```

6. **Setup PM2 (Process Manager)**
   ```bash
   pm2 start server/index.js --name brainstorm-royale
   pm2 startup
   pm2 save
   ```

7. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/brainstorm-royale
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name brainstormroyale.com www.brainstormroyale.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/brainstorm-royale /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d brainstormroyale.com -d www.brainstormroyale.com
   ```

9. **Point Domain to Droplet**
   - In domain registrar, add:
   
   | Type | Host | Value              |
   |------|------|--------------------|
   | A    | @    | your-droplet-ip    |
   | A    | www  | your-droplet-ip    |

---

## 🔒 Security Checklist

Before going live, make sure:

- [ ] Change JWT_SECRET to a strong random value
- [ ] MongoDB has strong password
- [ ] MongoDB network access configured
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables are NOT in code
- [ ] `.env` is in `.gitignore`
- [ ] Admin password changed from default
- [ ] Rate limiting enabled

---

## ✅ Testing Your Deployment

1. **Visit Your Site:**
   ```
   https://brainstormroyale.com
   ```

2. **Test Features:**
   - [ ] Sign up for account
   - [ ] Login works
   - [ ] Create game
   - [ ] Join game with friend
   - [ ] Chat works
   - [ ] Gameplay smooth
   - [ ] Trivia questions appear
   - [ ] Building works
   - [ ] Vehicles work
   - [ ] Shop loads
   - [ ] Battle Ticket works

3. **Performance Test:**
   - Open in multiple browsers
   - Test with 5+ players
   - Check for lag
   - Monitor server logs

---

## 📊 Monitoring Your Game

### Railway Dashboard
- View live logs
- Monitor resource usage
- See deployment history
- Scale up if needed

### MongoDB Atlas Dashboard
- View database connections
- Monitor queries
- See data usage
- Backup settings

### Analytics (Optional)
Add Google Analytics to track:
- Player count
- Most popular features
- Peak hours
- User retention

---

## 🚀 Going Live Checklist

Week Before Launch:
- [ ] Test with 10-20 friends
- [ ] Fix any bugs found
- [ ] Optimize performance
- [ ] Set up monitoring
- [ ] Create social media accounts
- [ ] Make trailer video

Launch Day:
- [ ] Announce on social media
- [ ] Post in gaming communities
- [ ] Share with friends
- [ ] Monitor server load
- [ ] Be ready to scale if needed

After Launch:
- [ ] Collect feedback
- [ ] Fix critical bugs immediately
- [ ] Plan content updates
- [ ] Engage with community

---

## 💰 Cost Breakdown

### Option 1: Railway (Easiest)
- Domain: $10/year
- Railway Hosting: $5/month
- MongoDB Atlas: FREE
- **Total: ~$5-6/month**

### Option 2: Heroku
- Domain: $10/year  
- Heroku Hobby Dyno: $7/month
- MongoDB Atlas: FREE
- **Total: ~$7-8/month**

### Option 3: DigitalOcean
- Domain: $10/year
- Droplet: $6/month
- MongoDB Atlas: FREE
- **Total: ~$6-7/month**

**All options are affordable!** 🎉

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check MongoDB connection string
- Verify network access in Atlas (0.0.0.0/0)
- Check if password has special characters (URL encode them)

### "502 Bad Gateway"
- Server might not be running
- Check environment variables
- View server logs in Railway/Heroku

### "Domain not working"
- DNS takes 5-60 minutes to propagate
- Check DNS records are correct
- Try www.brainstormroyale.com
- Clear browser cache

### "Socket.io connection failed"
- Check if WebSocket ports are open
- Verify proxy settings in nginx
- Check CORS settings

---

## 📞 Need Help?

If you run into issues:
1. Check the error logs in your hosting dashboard
2. Google the specific error message
3. Check Railway/Heroku documentation
4. Ask in deployment communities

---

## 🎊 Congratulations!

Once deployed, you'll have:
- ✅ Professional domain: BrainStormRoyale.com
- ✅ Secure HTTPS connection
- ✅ Scalable hosting
- ✅ Free database
- ✅ Worldwide access
- ✅ Your own multiplayer game online!

**Share it with the world! 🌎🎮**

---

## 📱 Next Steps After Launch

1. **Mobile Optimization**
   - Test on phones/tablets
   - Adjust UI for touch controls
   - Add PWA support

2. **Marketing**
   - Create Discord server
   - Post on Reddit (r/gamedev, r/Unity3D, etc.)
   - Share on Twitter/TikTok
   - Make gameplay videos

3. **Content Updates**
   - Add new skins monthly
   - Seasonal events
   - New maps
   - Community features

4. **Monetization (Optional)**
   - Premium Battle Ticket
   - Exclusive skins
   - Supporter badges
   - Ad support

**Your game is ready for the world! Let's get it live! 🚀**
