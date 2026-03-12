# MongoDB Atlas Setup Guide

This guide will walk you through setting up a **free MongoDB Atlas database** for BrainStorm Royale.

## Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with your email or Google account
4. Complete the registration

## Step 2: Create a Cluster

1. After logging in, you'll see "Create a Cluster"
2. Select the **FREE tier** (M0 Sandbox)
3. Choose a cloud provider:
   - **AWS** (recommended)
   - Google Cloud Platform
   - Azure
4. Select a region closest to you or your users
5. Name your cluster (or use the default)
6. Click "Create Cluster" (this takes 1-3 minutes)

## Step 3: Create a Database User

1. Click on "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" as the authentication method
4. Enter a username (e.g., `brainstorm-admin`)
5. Click "Autogenerate Secure Password" or create your own
   - ⚠️ **IMPORTANT:** Copy and save this password! You'll need it for the connection string
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

## Step 4: Configure Network Access

1. Click on "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development:
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` to the whitelist
4. For production:
   - Add your server's IP address specifically
   - Or use your deployment platform's IP range
5. Click "Confirm"

## Step 5: Get Your Connection String

1. Click on "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Choose:
   - Driver: **Node.js**
   - Version: **4.1 or later**
5. Copy the connection string

It will look like this:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 6: Configure Your Application

1. Open the `.env` file in your project
2. Replace the MONGODB_URI with your connection string:

```env
MONGODB_URI=mongodb+srv://brainstorm-admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/brainstorm-royale?retryWrites=true&w=majority
```

**Important replacements:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/brainstorm-royale` after `.net` to specify the database name
- Remove the `<>` brackets

### Example:

Before:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

After:
```
mongodb+srv://brainstorm-admin:MySecurePass123@cluster0.ab1cd.mongodb.net/brainstorm-royale?retryWrites=true&w=majority
```

## Step 7: Test Your Connection

1. Save the `.env` file
2. Start your server: `npm start`
3. You should see: `✅ MongoDB Connected: cluster0.xxxxx.mongodb.net`

If you see an error, check:
- Username and password are correct
- No spaces in the connection string
- Database name is included
- IP address is whitelisted

## Viewing Your Data

1. In MongoDB Atlas, click "Browse Collections"
2. You'll see your database (`brainstorm-royale`) after the first user signs up
3. Click on collections to view user data:
   - `users` - All user accounts and stats

## Free Tier Limits

MongoDB Atlas Free Tier includes:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ No credit card required
- ✅ Perfect for development and small games

**This is enough for approximately 10,000-50,000 users!**

## Upgrading (If Needed)

If your game gets popular, you can upgrade to:
- **M10** ($0.08/hour) - 10GB storage
- **M20** ($0.20/hour) - 20GB storage
- And higher tiers...

## Security Best Practices

### For Production:

1. **Change default credentials**
   - Don't use simple passwords
   - Use a password manager

2. **Restrict IP addresses**
   - Remove "Allow Access from Anywhere"
   - Add only your server's IP

3. **Use environment variables**
   - Never commit `.env` to GitHub
   - Use your hosting platform's environment variable settings

4. **Enable encryption**
   - Already enabled by default in Atlas

5. **Regular backups**
   - Atlas provides automatic backups
   - Paid tiers have more backup options

## Troubleshooting

### Error: "Authentication failed"
- Check username and password in connection string
- Ensure database user has correct permissions

### Error: "Connection timeout"
- Check your IP is whitelisted
- Verify firewall settings

### Error: "Server selection timeout"
- Check internet connection
- Verify cluster is running (not paused)
- MongoDB Atlas pauses free tier clusters after 60 days of inactivity

### Cluster is Paused
1. Go to MongoDB Atlas dashboard
2. Click "Resume" on your cluster
3. Wait 1-2 minutes for it to start

## Alternative: Local MongoDB

If you prefer to run MongoDB locally:

### Install MongoDB Community Edition

**Windows:**
1. Download from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB: `mongod`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Connection String for Local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/brainstorm-royale
```

## Need Help?

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Support](https://www.mongodb.com/cloud/atlas/support)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)

---

**That's it! Your database is ready! 🎉**
