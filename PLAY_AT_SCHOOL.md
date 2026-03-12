# 🏫 Play at School - Local Network (NO Hosting Needed!)

## Option: Run on YOUR Computer, Friends Connect!

If you don't want to set up hosting, you can run the game on your laptop and have friends connect directly!

---

## ✅ Perfect If:

- You have a laptop at school
- Everyone is on the same WiFi
- You want to test instantly (no setup!)
- You don't want to deal with hosting yet

---

## 🚀 Super Quick Setup (2 Minutes)

### Step 1: Start the Game

```bash
# Open terminal in your game folder
cd brainstorm-royale-game

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

Server will say: `Server running on http://localhost:3000`

### Step 2: Find Your IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (like `192.168.1.105`)

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Look for something like `192.168.1.105`

**On Linux:**
```bash
hostname -I
```

### Step 3: Share With Friends

Tell your friends to go to:
```
http://YOUR-IP-ADDRESS:3000
```

For example: `http://192.168.1.105:3000`

---

## 📱 Example:

**You tell friends:**
"Go to: `http://192.168.1.105:3000` on your phone/laptop!"

Everyone on school WiFi can now play! 🎮

---

## ⚠️ Important Notes

### Pros:
- ✅ Instant setup (2 minutes)
- ✅ No hosting costs
- ✅ No account signups needed
- ✅ Works great for 5-20 friends
- ✅ Full control

### Cons:
- ❌ Only works when YOUR computer is on
- ❌ Only works on same WiFi network
- ❌ Can't play from home (different networks)
- ❌ If you close laptop, game stops

### Tips:
- Keep your laptop plugged in
- Don't close your laptop
- Make sure WiFi doesn't go to sleep
- Save IP address in notes app

---

## 🔥 Hot Tips

### Keep Game Running
```bash
# On Mac/Linux (keeps running even if you close terminal)
nohup npm start &

# To stop later:
pkill -f "node server/index.js"
```

### Check Who's Connected
- Look at your terminal
- You'll see players connecting
- See game events live!

### If Friends Can't Connect
1. **Check firewall:** Allow Node.js through firewall
   - Windows: Windows Defender → Allow an app
   - Mac: System Preferences → Security → Firewall → Options
   
2. **Same WiFi?** Make sure everyone is on same network

3. **Try this URL instead:** `http://localhost:3000` (only works on your computer)

4. **School WiFi restrictions:** Some schools block device-to-device connections
   - Try: Personal hotspot from your phone
   - Or: Use a hosting option instead

---

## 🎮 Playing at School

### Setup:
1. Arrive at school early
2. Start game on laptop
3. Get your IP address
4. Write IP on whiteboard/paper
5. Tell friends to connect!

### During Game:
- Keep laptop plugged in and awake
- Monitor terminal for issues
- Be the game master! 🎯

### After School:
- Close the game (Ctrl+C in terminal)
- Or leave it running for remote testing

---

## 💡 Pro Setup: Use Your Phone Hotspot

If school WiFi blocks device connections:

1. **Turn on phone hotspot**
2. **Connect your laptop to hotspot**
3. **Have friends connect to same hotspot**
4. **Follow steps above**

Now everyone is on YOUR network! Works 100%! 📱

---

## 🆚 Compare Options

### Local Network (This Guide)
- ✅ FREE
- ✅ Instant (2 min)
- ✅ No hosting setup
- ❌ Only works at school
- ❌ Your laptop must stay on

### Railway Free Hosting
- ✅ FREE
- ✅ Works from anywhere
- ✅ Works 24/7
- ✅ Friends can play anytime
- ⏱️ Takes 10 minutes to setup

**Recommendation:**
- **Local network** for quick testing TODAY
- **Railway** when you want friends to play anytime

---

## 🎊 You're Ready!

Your game is now playable at school with friends!

**Just:**
1. Start the server
2. Get your IP
3. Share with friends
4. Play! 🎮

**Have fun! 🧠⚡**
