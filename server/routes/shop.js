const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { getAllShopItems, getDailyFeaturedItems, SHOP_CONFIG, WEAPON_SKINS } = require('../config/shop');
const { SKINS, EMOTES, TRAILS } = require('../config/battleTicket');

const router = express.Router();

// ========== GET ALL SHOP ITEMS ==========
router.get('/items', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    let items = getAllShopItems();
    
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    // Get user's owned items to mark them
    const user = await User.findById(req.userId);
    
    items = items.map(item => ({
      ...item,
      owned: isItemOwned(user, item)
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({ error: 'Error fetching shop items' });
  }
});

// ========== GET FEATURED ITEMS ==========
router.get('/featured', authenticate, async (req, res) => {
  try {
    const featured = getDailyFeaturedItems();
    const user = await User.findById(req.userId);
    
    const featuredWithOwned = featured.map(item => ({
      ...item,
      owned: isItemOwned(user, item)
    }));
    
    res.json({
      items: featuredWithOwned,
      nextRotation: getNextRotationTime()
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({ error: 'Error fetching featured items' });
  }
});

// ========== GET BUNDLES ==========
router.get('/bundles', authenticate, async (req, res) => {
  try {
    const bundles = Object.entries(SHOP_CONFIG.bundles).map(([id, bundle]) => ({
      id,
      ...bundle
    }));
    
    const user = await User.findById(req.userId);
    
    const bundlesWithOwned = bundles.map(bundle => {
      const allOwned = bundle.items.every(item => {
        if (item.type === 'skin') return user.inventory.ownedSkins.includes(item.id);
        if (item.type === 'emote') return user.inventory.ownedEmotes.includes(item.id);
        if (item.type === 'trail') return user.inventory.ownedTrails.includes(item.id);
        return false;
      });
      
      return {
        ...bundle,
        allOwned
      };
    });
    
    res.json(bundlesWithOwned);
  } catch (error) {
    console.error('Get bundles error:', error);
    res.status(500).json({ error: 'Error fetching bundles' });
  }
});

// ========== PURCHASE ITEM ==========
router.post('/purchase', authenticate, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    
    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'Item ID and type are required' });
    }
    
    const user = await User.findById(req.userId);
    
    let price = 0;
    let itemName = '';
    
    // Handle different item types
    if (itemType === 'skin') {
      const skin = SKINS[itemId];
      if (!skin) return res.status(404).json({ error: 'Skin not found' });
      if (skin.battleTicket) return res.status(400).json({ error: 'This skin is Battle Ticket exclusive' });
      if (user.inventory.ownedSkins.includes(itemId)) {
        return res.status(400).json({ error: 'Already owned' });
      }
      
      price = skin.price;
      itemName = skin.name;
      
      if (user.stats.coins < price) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      
      user.stats.coins -= price;
      user.inventory.ownedSkins.push(itemId);
      
    } else if (itemType === 'emote') {
      const emote = EMOTES[itemId];
      if (!emote) return res.status(404).json({ error: 'Emote not found' });
      if (user.inventory.ownedEmotes.includes(itemId)) {
        return res.status(400).json({ error: 'Already owned' });
      }
      
      price = emote.price;
      itemName = emote.name;
      
      if (user.stats.coins < price) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      
      user.stats.coins -= price;
      user.inventory.ownedEmotes.push(itemId);
      
    } else if (itemType === 'trail') {
      const trail = TRAILS[itemId];
      if (!trail) return res.status(404).json({ error: 'Trail not found' });
      if (user.inventory.ownedTrails.includes(itemId)) {
        return res.status(400).json({ error: 'Already owned' });
      }
      
      price = trail.price;
      itemName = trail.name;
      
      if (user.stats.coins < price) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      
      user.stats.coins -= price;
      user.inventory.ownedTrails.push(itemId);
      
    } else if (itemType === 'weapon_skin') {
      const weaponSkin = WEAPON_SKINS[itemId];
      if (!weaponSkin) return res.status(404).json({ error: 'Weapon skin not found' });
      
      if (!user.inventory.ownedWeaponSkins) {
        user.inventory.ownedWeaponSkins = [];
      }
      
      if (user.inventory.ownedWeaponSkins.includes(itemId)) {
        return res.status(400).json({ error: 'Already owned' });
      }
      
      price = weaponSkin.price;
      itemName = weaponSkin.name;
      
      if (user.stats.coins < price) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      
      user.stats.coins -= price;
      user.inventory.ownedWeaponSkins.push(itemId);
      
    } else if (itemType === 'bundle') {
      const bundle = SHOP_CONFIG.bundles[itemId];
      if (!bundle) return res.status(404).json({ error: 'Bundle not found' });
      
      price = bundle.bundlePrice;
      itemName = bundle.name;
      
      if (user.stats.coins < price) {
        return res.status(400).json({ error: 'Not enough coins' });
      }
      
      // Add all bundle items
      for (const item of bundle.items) {
        if (item.type === 'skin' && !user.inventory.ownedSkins.includes(item.id)) {
          user.inventory.ownedSkins.push(item.id);
        } else if (item.type === 'emote' && !user.inventory.ownedEmotes.includes(item.id)) {
          user.inventory.ownedEmotes.push(item.id);
        } else if (item.type === 'trail' && !user.inventory.ownedTrails.includes(item.id)) {
          user.inventory.ownedTrails.push(item.id);
        }
      }
      
      user.stats.coins -= price;
      
    } else {
      return res.status(400).json({ error: 'Invalid item type' });
    }
    
    await user.save();
    
    res.json({
      message: `Purchased ${itemName}!`,
      coins: user.stats.coins,
      inventory: user.inventory
    });
    
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Error processing purchase' });
  }
});

// ========== PREVIEW ITEM ==========
router.get('/preview/:itemType/:itemId', authenticate, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    
    let itemData = null;
    
    if (itemType === 'skin') {
      itemData = SKINS[itemId];
    } else if (itemType === 'emote') {
      itemData = EMOTES[itemId];
    } else if (itemType === 'trail') {
      itemData = TRAILS[itemId];
    } else if (itemType === 'weapon_skin') {
      itemData = WEAPON_SKINS[itemId];
    } else if (itemType === 'bundle') {
      itemData = SHOP_CONFIG.bundles[itemId];
    }
    
    if (!itemData) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(itemData);
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Error fetching item preview' });
  }
});

// ========== HELPER FUNCTIONS ==========
function isItemOwned(user, item) {
  if (item.type === 'skin') {
    return user.inventory.ownedSkins.includes(item.id);
  } else if (item.type === 'emote') {
    return user.inventory.ownedEmotes.includes(item.id);
  } else if (item.type === 'trail') {
    return user.inventory.ownedTrails.includes(item.id);
  } else if (item.type === 'weapon_skin') {
    return user.inventory.ownedWeaponSkins?.includes(item.id) || false;
  } else if (item.type === 'bundle') {
    return item.items.every(bundleItem => {
      if (bundleItem.type === 'skin') return user.inventory.ownedSkins.includes(bundleItem.id);
      if (bundleItem.type === 'emote') return user.inventory.ownedEmotes.includes(bundleItem.id);
      if (bundleItem.type === 'trail') return user.inventory.ownedTrails.includes(bundleItem.id);
      return false;
    });
  }
  return false;
}

function getNextRotationTime() {
  const now = Date.now();
  const msInDay = 86400000;
  const nextRotation = Math.ceil(now / msInDay) * msInDay;
  return new Date(nextRotation);
}

module.exports = router;
