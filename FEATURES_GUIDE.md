# 🎮 BrainStorm Royale v2.0 - New Features Guide

## ✨ What's New

This update adds **5 major features** to complete the full version of BrainStorm Royale!

---

## 🎫 Battle Ticket (Battle Pass System)

### What is Battle Ticket?

The Battle Ticket is a seasonal progression system where you earn exclusive rewards by playing games and gaining XP.

### Features:

**Free Track**
- Available to all players
- Earn skins, coins, and XP boosts
- 50 tiers of rewards

**Premium Track**
- Costs 950 coins (one-time purchase per season)
- Unlock exclusive premium skins and rewards
- Get rewards from both free AND premium tracks

### How to Progress:

1. **Play Games** - Every match gives you XP
2. **Complete Challenges** - Bonus XP for achievements
3. **Earn Tiers** - 1,000 XP per tier (50 tiers total)
4. **Claim Rewards** - Unlock cosmetics, coins, and more!

### Season 1: "Brain Storm Rising"

**Duration:** January 1 - March 31, 2026

**Featured Rewards:**
- **Tier 0:** Storm Cadet skin (Premium)
- **Tier 10:** Student skin (Free)
- **Tier 20:** Knowledge Wizard skin (Premium)
- **Tier 30:** Graduate skin (Free)
- **Tier 50:** Legendary Sage skin (Premium) + Ultimate Storm trail

### API Endpoints:

```javascript
// Get Battle Ticket status
GET /api/battle-ticket/status

// View all rewards
GET /api/battle-ticket/rewards

// Claim reward for specific tier
POST /api/battle-ticket/claim/:tier

// Buy Premium Battle Ticket
POST /api/battle-ticket/buy-premium
```

---

## 👥 Friends System

### Add Friends

1. **Search for Players**
   - Search by username
   - View their level and online status

2. **Send Friend Request**
   - Click "Add Friend" on their profile
   - They receive a notification

3. **Accept/Decline Requests**
   - View pending requests in Friends tab
   - Accept to add them to your friends list

### Friends List Features:

- **See Online Status** - Green dot = online
- **View Game Status** - "In Game" if they're playing
- **Quick Invite** - Invite friends to your party
- **View Stats** - See their level and achievements
- **Remove Friends** - Right-click to remove

### Privacy Options:

- **Friend Requests** - Enable/disable receiving requests
- **Online Status** - Show/hide your online status
- **Block Users** - Prevent specific players from contacting you

### API Endpoints:

```javascript
// Send friend request
POST /api/friends/request
Body: { username: "player123" }

// Get friend requests
GET /api/friends/requests

// Accept request
POST /api/friends/accept
Body: { requestId: "..." }

// Get friends list
GET /api/friends/list

// Remove friend
DELETE /api/friends/remove/:friendId

// Search users
GET /api/friends/search?query=username
```

---

## 🎉 Party System

### Create a Party

1. Click "Create Party" in the main menu
2. You become the party leader
3. Invite friends to join

### Party Features:

**Party Leader Can:**
- Invite players
- Kick members
- Start the game when everyone is ready
- Choose game settings

**Party Members Can:**
- Ready up
- Chat with party
- Leave party

### Inviting Friends:

1. Open Friends list
2. Click "Invite to Party" on a friend
3. They receive an invite notification
4. They can accept or decline

### Playing Together:

1. All party members ready up
2. Leader clicks "Start Game"
3. Everyone enters the same lobby together
4. Play as a team or compete!

### Socket Events:

```javascript
// Create party
socket.emit('create-party')

// Invite friend
socket.emit('invite-to-party', { userId: friendId })

// Accept invite
socket.emit('accept-party-invite', { partyId })

// Leave party
socket.emit('leave-party')

// Toggle ready status
socket.emit('party-ready-toggle')
```

---

## 💬 Chat System

### Text Chat

**In-Game Chat:**
- Press Enter to open chat
- Type your message (max 200 characters)
- Press Enter to send
- ESC to close

**Features:**
- See last 50 messages
- Username colors
- Timestamps
- Profanity filter (optional)

### Chat Settings:

**Enable/Disable Chat**
- Turn chat completely on or off
- Settings → Chat → Enable Chat

**Profanity Filter**
- Automatically filters inappropriate words
- Settings → Chat → Profanity Filter

### Chat Commands:

```
/help - Show available commands
/mute [username] - Mute a specific player
/unmute [username] - Unmute a player
```

### Socket Events:

```javascript
// Send message
socket.emit('send-chat-message', {
  message: "Hello!"
})

// Receive message
socket.on('chat-message', (data) => {
  // data = { id, username, message, timestamp }
})
```

---

## 🎤 Voice Chat (WebRTC)

### Enabling Voice Chat

1. Go to **Settings → Voice Chat**
2. Toggle "Enable Voice Chat"
3. Allow microphone permissions in browser
4. See warning about online voice chat

### Voice Chat Features:

**Push-to-Talk**
- Hold V key to talk
- Release to mute

**Volume Control**
- Adjust individual player volumes
- Master volume slider

**Indicators**
- Speaking indicator shows who's talking
- Microphone icon shows your status

### Privacy & Safety:

⚠️ **Voice Chat Warning:**

"Voice chat connects you directly with other players. By enabling voice chat, you agree to:
- Communicate respectfully
- Not share personal information
- Report abusive behavior
- Follow community guidelines

Parents: Monitor your child's online interactions."

### Technical Details:

**WebRTC Peer-to-Peer**
- Direct connection between players
- Low latency audio
- Encrypted communication

**Supported Browsers:**
- Chrome/Edge (Recommended)
- Firefox
- Safari (limited support)

### Socket Events (WebRTC Signaling):

```javascript
// Send voice offer
socket.emit('voice-offer', {
  to: targetSocketId,
  offer: rtcOffer
})

// Send voice answer
socket.emit('voice-answer', {
  to: targetSocketId,
  answer: rtcAnswer
})

// Send ICE candidate
socket.emit('voice-ice-candidate', {
  to: targetSocketId,
  candidate: iceCandidate
})
```

---

## 🎨 Character Skins

### Real Character Designs

Characters are no longer simple circles! Each skin features:

- **Unique Color Schemes** - Primary, secondary, and accent colors
- **Character Bodies** - Detailed body design with gradients
- **Head & Face** - Animated facial features
- **Brain Symbol** - Themed chest emblem
- **Smooth Animations** - Bobbing and movement effects

### Skin Rarities:

- **Common** (Gray) - Starter skins
- **Uncommon** (Green) - Purchasable with coins
- **Rare** (Blue) - Battle Ticket rewards
- **Epic** (Purple) - High-tier Battle Ticket
- **Legendary** (Orange) - Ultimate rewards

### Featured Skins:

**Free Skins:**
- Default - Basic starter skin
- Rookie Scholar - Blue theme
- Student - Green academic (500 coins)
- Graduate - Purple with gold accent (1000 coins)
- Master Brain - Red legendary (2000 coins)

**Battle Ticket Exclusive:**
- Storm Cadet (Tier 0)
- Wise Scholar (Tier 3)
- Professor (Tier 7)
- Einstein (Tier 15)
- Knowledge Wizard (Tier 20)
- Cyborg Scholar (Tier 25)
- Valedictorian (Tier 40)
- Legendary Sage (Tier 50)

### Character Rendering:

The game now uses `CharacterRenderer` to draw detailed characters:

```javascript
// Draw static character
CharacterRenderer.drawCharacter(ctx, x, y, skinId, scale);

// Draw animated character
CharacterRenderer.drawAnimated(ctx, x, y, skinId, frame, scale);
```

---

## 🔧 Settings & Privacy

### New Settings Added:

**Chat Settings:**
- Enable/Disable Text Chat
- Profanity Filter
- Chat Notifications

**Voice Settings:**
- Enable/Disable Voice Chat
- Microphone Input Device
- Output Volume
- Push-to-Talk Key Binding

**Privacy Settings:**
- Show Online Status
- Allow Friend Requests
- Block List Management
- Data Sharing Preferences

### Updating Settings:

```javascript
PATCH /api/auth/profile
Body: {
  settings: {
    chatEnabled: true,
    voiceChatEnabled: false,
    profanityFilter: true,
    friendRequestsEnabled: true,
    showOnlineStatus: true
  }
}
```

---

## 📱 Updated UI Components

### Main Menu:
- Friends sidebar (right)
- Party panel (bottom right)
- Battle Ticket button (top right)
- Notifications (top)

### In-Game HUD:
- Chat window (bottom left)
- Voice indicators (top left)
- Party member status (left side)

### Post-Game Screen:
- Battle Ticket progress bar
- XP breakdown
- Tier-up notifications

---

## 🎯 Quick Tips

1. **Battle Ticket Pro Tip:** Buy premium early in the season to maximize rewards!

2. **Friends Tip:** Add friends who play often for easier party formation

3. **Party Tip:** Use voice chat for better team coordination

4. **Chat Tip:** Mute toxic players to enjoy the game more

5. **Skin Tip:** Mix and match trails with skins for unique looks!

---

## 🐛 Known Issues & Limitations

- Voice chat requires HTTPS in production
- Mobile voice chat has limited browser support
- Party size limited to 4 players
- Battle Ticket progress resets each season
- Chat history cleared when leaving game

---

## 🔮 Coming Soon

- Spectator mode for friends
- Party voice chat rooms
- Battle Ticket tier skips
- Seasonal exclusive events
- Friend activity feed
- Custom chat emotes

---

**Enjoy the new features! 🧠⚡**
