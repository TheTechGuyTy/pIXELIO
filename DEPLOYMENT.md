# 🚀 Deployment Checklist

Before deploying BrainStorm Royale to production, make sure you complete these steps.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

- [ ] Set strong `JWT_SECRET` (random 32+ character string)
- [ ] Set strong `SESSION_SECRET` (random 32+ character string)
- [ ] Configure `MONGODB_URI` with production database
- [ ] Set `PORT` if needed (defaults to 3000)

**Generate secure secrets:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. MongoDB Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (whitelist production IPs)
- [ ] Connection string tested and working
- [ ] Backup strategy in place

### 3. Security

- [ ] All default secrets changed
- [ ] `.env` file NOT committed to repository
- [ ] `.gitignore` includes `.env`
- [ ] MongoDB network access restricted (not 0.0.0.0/0)
- [ ] CORS settings reviewed
- [ ] Rate limiting considered (for future)

### 4. Code Quality

- [ ] All console.logs reviewed
- [ ] Error handling in place
- [ ] No hardcoded credentials
- [ ] Dependencies up to date (`npm update`)
- [ ] No unused dependencies

### 5. Testing

- [ ] Signup/login flow tested
- [ ] Game creation works
- [ ] Joining games works
- [ ] Multiplayer sync tested
- [ ] Stats saving tested
- [ ] Leaderboard tested
- [ ] Guest mode tested

## 🌐 Deployment Platforms

### Railway.app (Easiest)

#### Pros:
- Very easy setup
- Automatic deployments from GitHub
- Free tier available
- Built-in monitoring

#### Steps:
1. [ ] Push code to GitHub
2. [ ] Sign up at [railway.app](https://railway.app)
3. [ ] Create new project → Deploy from GitHub
4. [ ] Select your repository
5. [ ] Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `PORT` (optional)
6. [ ] Deploy!

#### After Deployment:
- [ ] Test the live URL
- [ ] Create a custom domain (optional)

---

### Render.com

#### Pros:
- Free tier with no credit card
- Auto-deploy from GitHub
- SSL certificates included

#### Steps:
1. [ ] Push code to GitHub
2. [ ] Sign up at [render.com](https://render.com)
3. [ ] New → Web Service
4. [ ] Connect GitHub repository
5. [ ] Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
6. [ ] Add environment variables
7. [ ] Create Web Service

#### After Deployment:
- [ ] Test the live URL
- [ ] Set up custom domain (optional)

---

### Heroku

#### Pros:
- Well-established platform
- Good documentation
- Add-ons available

#### Steps:
1. [ ] Install Heroku CLI
2. [ ] Login: `heroku login`
3. [ ] Create app: `heroku create brainstorm-royale`
4. [ ] Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your-connection-string"
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set SESSION_SECRET="your-secret"
   ```
5. [ ] Add to git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
6. [ ] Deploy: `git push heroku main`

#### After Deployment:
- [ ] Check logs: `heroku logs --tail`
- [ ] Test application
- [ ] Set up custom domain (optional)

---

### DigitalOcean App Platform

#### Pros:
- Good performance
- Scalable
- $5/month tier

#### Steps:
1. [ ] Push code to GitHub
2. [ ] Sign up at [digitalocean.com](https://www.digitalocean.com)
3. [ ] Create → Apps → Deploy from GitHub
4. [ ] Select repository
5. [ ] Configure environment variables
6. [ ] Launch app

---

### AWS / Google Cloud / Azure

#### Pros:
- Maximum control
- Highly scalable
- Professional infrastructure

#### Cons:
- More complex setup
- Requires more DevOps knowledge

#### Recommended if:
- You expect high traffic
- You need specific infrastructure
- You have cloud experience

---

## 📊 Post-Deployment

### 1. Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor server performance
- [ ] Track user metrics
- [ ] Set up uptime monitoring

### 2. Database Management

- [ ] Verify MongoDB backups are enabled
- [ ] Monitor database size
- [ ] Check connection limits
- [ ] Review slow queries

### 3. Security Updates

- [ ] Regularly update dependencies: `npm update`
- [ ] Monitor for security vulnerabilities: `npm audit`
- [ ] Review MongoDB Atlas security advisories
- [ ] Update Node.js version when needed

### 4. Performance

- [ ] Monitor response times
- [ ] Check Socket.io connection stability
- [ ] Review server logs for errors
- [ ] Optimize as needed

### 5. User Feedback

- [ ] Set up feedback mechanism
- [ ] Monitor user complaints
- [ ] Track common issues
- [ ] Plan feature updates

## 🐛 Common Deployment Issues

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas whitelist includes your server IP
- Test connection string locally first

### Issue: "Application Error" or 500 errors
**Solution:**
- Check logs: `heroku logs` or platform equivalent
- Verify all environment variables are set
- Check for missing dependencies

### Issue: "WebSocket connection failed"
**Solution:**
- Ensure your hosting platform supports WebSockets
- Check firewall settings
- Verify Socket.io configuration

### Issue: "Module not found"
**Solution:**
- Run `npm install` on server
- Check package.json has all dependencies
- Verify Node.js version compatibility

## 📈 Scaling Considerations

When your game grows:

### 10-100 Users
- Free tier hosting is fine
- Monitor performance

### 100-1,000 Users
- Consider paid hosting tier
- Upgrade MongoDB to M10
- Implement caching

### 1,000+ Users
- Multiple server instances
- Load balancing
- Redis for session storage
- CDN for static assets
- Database sharding

## 🎯 Launch Checklist

Day of launch:

- [ ] All systems tested
- [ ] Monitoring in place
- [ ] Backup strategy confirmed
- [ ] Team ready for support
- [ ] Social media posts ready
- [ ] Landing page live
- [ ] Analytics tracking setup

## 📞 Support Resources

- MongoDB Atlas: [support.mongodb.com](https://support.mongodb.com)
- Railway: [railway.app/help](https://railway.app/help)
- Render: [render.com/docs](https://render.com/docs)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)

---

**Good luck with your deployment! 🚀**

**Need help?** Open an issue on GitHub or reach out to the community!
