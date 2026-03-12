# 🎨 BrainStorm Royale - Client UI Guide

## Overview

The new client UI includes all the requested features with a modern, polished interface!

---

## 🖥️ Main Screen Layout

### Top Bar (Always Visible)
```
[⚙️ Settings] [👥 Friends]          [💰 Coins] [🎫 Battle Ticket] [Logout]
```

**Left Side:**
- Settings button - Opens settings modal
- Friends button - Opens friends sidebar (shows notification badge if you have friend requests)

**Right Side:**
- Coins display - Shows your current coin balance
- Battle Ticket button - Opens Battle Ticket progression
- Logout button - Sign out and return to login

---

## 👥 Friends System

### Opening Friends Sidebar
Click "👥 Friends" in the top bar, or it slides in from the right side.

### Three Tabs:

#### 1. **Friends Tab**
- Shows all your friends
- Green dot 🟢 = Online
- Gray dot ⚪ = Offline
- "In Game" indicator if they're playing
- **Actions:**
  - Click "Invite" to invite to your party

#### 2. **Requests Tab**
- Shows pending friend requests
- Red notification badge shows count
- **Actions:**
  - Click ✓ to accept
  - Click ✗ to decline

#### 3. **Search Tab**
- Search for users by username
- Type at least 2 characters
- Shows results as you type
- **Actions:**
  - Click "Add Friend" to send request
  - Shows "✓ Friends" if already friends
  - Shows "Blocked" for blocked users

### How It Works:
```javascript
// Friends are loaded automatically when you log in
// Search updates as you type
// Real-time updates when friends come online/offline
```

---

## 🎉 Party System

### Creating a Party
Currently happens automatically when you invite friends, or you can call:
```javascript
createParty(); // Opens party panel
```

### Party Panel (Bottom Left)
Shows when you're in a party:
- Lists all party members
- 👑 Crown icon = Party leader
- Shows ready status (✓ Ready or ⏳ Waiting)
- Golden border for leader
- Green border when ready

### Party Actions:
1. **Invite Friends**
   - Open Friends sidebar
   - Click "Invite" next to a friend's name
   - They get a popup notification

2. **Ready Up**
   - Click "Ready Up" button in party panel
   - Changes to green border when ready
   - All must be ready before starting

3. **Leave Party**
   - Click "Leave" button in party header
   - Party panel closes
   - You're removed from the party

### How Invites Work:
```javascript
// When you receive an invite:
// 1. Popup appears: "[Friend] invited you to their party. Join?"
// 2. Click OK to accept
// 3. Party panel opens automatically
// 4. You're added to the party member list
```

---

## 🎫 Battle Ticket (Battle Pass)

### Opening Battle Ticket
Click "🎫 Battle Ticket" in the top bar.

### Battle Ticket Modal Layout:

**Header:**
- Season name: "Season 1: Brain Storm Rising"
- Current tier: "Tier 5 / 50"
- XP Progress bar (shows XP toward next tier)
- XP text: "450 / 1000 XP"

**Premium Banner** (if not purchased):
- Gold banner: "🌟 Unlock Premium Battle Ticket 🌟"
- Shows cost: 950 coins
- Click to purchase

**Reward Tiers:**
- Scrollable list of all 50 tiers
- Each tier shows:
  - Tier number
  - Free rewards (white background)
  - Premium rewards (gold background)
  - Status: Locked 🔒, Available (Claim button), or Claimed ✓

### Tier States:

1. **Locked** (gray, opacity 50%)
   - Haven't reached this tier yet
   - Shows 🔒 Locked

2. **Available** (normal, bright)
   - You've reached this tier
   - Green "Claim Rewards" button
   - Click to claim

3. **Claimed** (gray background)
   - Already claimed
   - Shows ✓ Claimed

### Reward Types:
- 💰 Coins - Currency
- ⚡ XP - Experience boost
- 👤 Skin - Character skin
- 😊 Emote - Emote animation
- ✨ Trail - Movement trail

### How XP Works:
```javascript
// XP earned from each game:
baseXP = 50;
killXP = kills * 20;
winXP = isWin ? 100 : 0;
triviaXP = correctAnswers * 10;
totalXP = baseXP + killXP + winXP + triviaXP;

// XP needed per tier: 1,000
// Example: Tier 5 = 5,000 total XP
```

---

## 💬 Chat System

### In-Game Chat Window
Appears in bottom-left during games:
- Shows last 50 messages
- Auto-scrolls to newest
- Displays username in blue
- Black semi-transparent background

### Using Chat:

1. **Open Chat**
   - Press Enter key
   - Chat input appears at bottom

2. **Send Message**
   - Type your message (max 200 characters)
   - Press Enter to send
   - Message appears for all players

3. **Close Chat**
   - Press ESC key
   - Or click outside chat window

### Chat Features:
- **Profanity Filter** (optional)
  - Filters bad words if enabled in settings
  - Replaces with asterisks: "****"

- **Chat History**
  - Stores last 50 messages per game
  - Cleared when leaving game

### Settings Integration:
```javascript
// Can enable/disable in Settings:
- Enable Text Chat: ON/OFF
- Profanity Filter: ON/OFF
```

---

## 🎤 Voice Chat

### Enabling Voice Chat

1. Open Settings
2. Read the warning about online communication
3. Toggle "Enable Voice Chat"
4. Accept browser microphone permissions

### Voice Controls (In-Game)

When enabled, voice controls appear top-left:
- Red dot 🔴 = Microphone muted
- Green dot 🟢 = Currently speaking
- "Hold V to Talk" button

### Push-to-Talk:
- Hold V key to talk
- Release V to mute
- Indicator pulses green when speaking

### Voice Chat Warning:
```
⚠️ Voice Chat Warning

Voice chat connects you directly with other players. 
By enabling voice chat, you agree to:
- Communicate respectfully
- Not share personal information
- Report abusive behavior
- Follow community guidelines

Parents should monitor their child's online interactions.
```

### Technical Note:
Voice chat uses WebRTC for peer-to-peer connections. Requires:
- HTTPS in production
- Modern browser (Chrome, Firefox, Edge)
- Microphone permissions

---

## ⚙️ Settings Modal

### Opening Settings
Click "⚙️ Settings" in the top bar.

### Settings Sections:

#### 1. **Chat Settings**

**Enable Text Chat**
- Toggle ON/OFF
- Disables all text chat when OFF
- Default: ON

**Profanity Filter**
- Toggle ON/OFF
- Filters bad words in chat
- Default: ON

#### 2. **Voice Chat Settings**

**Enable Voice Chat**
- Toggle ON/OFF
- Shows warning before enabling
- Requires microphone permissions
- Default: OFF

#### 3. **Privacy Settings**

**Show Online Status**
- Toggle ON/OFF
- Controls if friends see you online
- Default: ON

**Allow Friend Requests**
- Toggle ON/OFF
- Blocks incoming friend requests when OFF
- Default: ON

### Saving Settings:
- Click "Save Settings" button at bottom
- Settings saved to database
- Applied immediately
- Guest users cannot save settings

---

## 🎨 UI Components Reference

### Buttons

**Primary Button** (gradient purple)
```css
- Quick Play
- Ready Up
- Claim Rewards
```

**Secondary Button** (white with purple border)
```css
- Join Private Game
- Create Private Game
```

**Friend Buttons**
- Invite (purple) - Invite to party
- Accept (green) - Accept friend request
- Decline (red) - Decline request

### Colors

**Primary Colors:**
- Purple: `#667eea`
- Dark Purple: `#764ba2`
- Gold: `#f1c40f`

**Status Colors:**
- Online: `#44ff44` (green)
- Offline: `#999999` (gray)
- Speaking: `#44ff44` (green, pulsing)
- Muted: `#ff4444` (red)

**UI Colors:**
- Background: Purple gradient
- Modals: White with shadow
- Panels: Rgba(255, 255, 255, 0.95)

---

## 🔧 JavaScript Functions Reference

### Friends
```javascript
loadFriends()                    // Refresh friends list
loadFriendRequests()             // Refresh pending requests
searchUsers()                    // Search for users
sendFriendRequest(username)      // Send friend request
acceptFriendRequest(requestId)   // Accept request
declineFriendRequest(requestId)  // Decline request
```

### Party
```javascript
createParty()                    // Create new party
inviteToParty(userId)            // Invite friend
leaveParty()                     // Leave current party
partyReadyToggle()               // Toggle ready status
```

### Battle Ticket
```javascript
loadBattleTicket()               // Refresh status
loadBattleTicketRewards()        // Load all tiers
claimReward(tier)                // Claim tier reward
buyPremium()                     // Purchase premium
```

### Chat
```javascript
addChatMessage(msg)              // Add message to chat
// Messages sent via socket:
socket.emit('send-chat-message', { message: text })
```

### Settings
```javascript
openSettings()                   // Open settings modal
closeSettings()                  // Close settings modal
loadUserSettings()               // Load from database
saveSettings()                   // Save to database
toggleSetting(setting)           // Toggle a setting
```

---

## 📱 Modal System

### Structure
```html
<div class="modal-overlay">
  <div class="modal-content">
    <button class="modal-close">×</button>
    <!-- Modal content here -->
  </div>
</div>
```

### Opening/Closing
```javascript
// Open modal
document.getElementById('modal-id').classList.add('active');

// Close modal
document.getElementById('modal-id').classList.remove('active');
```

### Current Modals:
1. Battle Ticket Modal
2. Settings Modal
3. (Can add more as needed)

---

## 🎮 Integration with Game

### During Game:
- Chat window active
- Voice controls visible (if enabled)
- Party panel visible (if in party)
- Friends sidebar available
- Battle Ticket accessible

### Post-Game:
- Stats automatically saved
- Battle Ticket XP added
- Coins earned shown
- Level-up notifications

---

## 🚀 Testing Checklist

### Friends System:
- [ ] Search for users
- [ ] Send friend request
- [ ] Accept/decline requests
- [ ] View friends list
- [ ] See online status
- [ ] Invite to party

### Party System:
- [ ] Create party
- [ ] Receive invite
- [ ] Join party
- [ ] Ready up
- [ ] Leave party
- [ ] See party members

### Battle Ticket:
- [ ] View progression
- [ ] Claim rewards
- [ ] Buy premium
- [ ] See locked/unlocked tiers

### Chat:
- [ ] Send messages
- [ ] Receive messages
- [ ] Profanity filter works
- [ ] Chat history scrolls

### Voice:
- [ ] Enable voice chat
- [ ] Microphone permissions
- [ ] Push-to-talk works
- [ ] Speaking indicator

### Settings:
- [ ] Toggle settings
- [ ] Save settings
- [ ] Settings persist

---

## 💡 Tips for Development

1. **Testing with Multiple Users:**
   - Open multiple browser windows
   - Create different accounts
   - Test friend requests between them

2. **Testing Party System:**
   - Need at least 2 users
   - One creates party, other accepts invite
   - Both can see each other in party panel

3. **Testing Battle Ticket:**
   - Add XP manually in database to test tiers
   - Test claiming at different tier levels
   - Verify premium vs free rewards

4. **Testing Voice Chat:**
   - Requires HTTPS in production
   - Test locally with `localhost`
   - Check browser console for WebRTC errors

---

## 🐛 Common Issues

### Friends Sidebar Won't Open
- Check if `toggleFriends()` is being called
- Verify `friends-sidebar` has correct classes
- Check console for JavaScript errors

### Party Panel Not Showing
- Verify `party-panel` has `active` class
- Check socket connection is established
- Ensure party events are being received

### Battle Ticket Not Loading
- Verify authentication token is set
- Check API responses in Network tab
- Ensure user is not a guest

### Chat Messages Not Appearing
- Check `currentSettings.chatEnabled` is true
- Verify socket connection
- Check `addChatMessage()` is being called

### Voice Chat Not Working
- HTTPS required in production
- Check microphone permissions
- Verify WebRTC support in browser
- Check console for errors

---

**The client UI is complete and ready to use! 🎉**
