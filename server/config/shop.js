// Shop Configuration
const { SKINS, EMOTES, TRAILS } = require('./battleTicket');

const SHOP_CONFIG = {
  categories: ['skins', 'emotes', 'trails', 'bundles'],
  
  // Daily featured items (rotate daily)
  featuredRotation: {
    updateInterval: 86400000, // 24 hours
    itemCount: 4
  },
  
  // Bundle deals
  bundles: {
    starter_pack: {
      name: 'Starter Pack',
      description: 'Everything you need to get started!',
      items: [
        { type: 'skin', id: 'student' },
        { type: 'emote', id: 'brain_power' },
        { type: 'trail', id: 'lightning_blue' }
      ],
      regularPrice: 1300,
      bundlePrice: 950,
      discount: 27
    },
    brain_master: {
      name: 'Brain Master Bundle',
      description: 'For the ultimate scholar',
      items: [
        { type: 'skin', id: 'graduate' },
        { type: 'skin', id: 'master_brain' },
        { type: 'emote', id: 'genius' },
        { type: 'trail', id: 'golden_aura' }
      ],
      regularPrice: 4400,
      bundlePrice: 3200,
      discount: 27
    },
    emote_pack: {
      name: 'Emote Collection',
      description: 'Express yourself!',
      items: [
        { type: 'emote', id: 'brain_power' },
        { type: 'emote', id: 'thinking' },
        { type: 'emote', id: 'genius' },
        { type: 'emote', id: 'celebration' }
      ],
      regularPrice: 1800,
      bundlePrice: 1350,
      discount: 25
    }
  }
};

// Weapon skins (cosmetic only, no stat changes)
const WEAPON_SKINS = {
  // Pistol skins
  pistol_gold: { name: 'Golden Pistol', weapon: 'pistol', price: 300, rarity: 'rare' },
  pistol_cyber: { name: 'Cyber Pistol', weapon: 'pistol', price: 500, rarity: 'epic' },
  
  // Rifle skins
  rifle_camo: { name: 'Camo Rifle', weapon: 'rifle', price: 400, rarity: 'uncommon' },
  rifle_neon: { name: 'Neon Rifle', weapon: 'rifle', price: 600, rarity: 'epic' },
  
  // Shotgun skins
  shotgun_steel: { name: 'Steel Shotgun', weapon: 'shotgun', price: 450, rarity: 'rare' },
  
  // Sniper skins
  sniper_arctic: { name: 'Arctic Sniper', weapon: 'sniper', price: 800, rarity: 'legendary' },
  
  // SMG skins
  smg_rapid: { name: 'Rapid Fire SMG', weapon: 'smg', price: 350, rarity: 'uncommon' },
  
  // Rocket Launcher skins
  rocket_destroyer: { name: 'Destroyer', weapon: 'rocket_launcher', price: 1200, rarity: 'legendary' }
};

// Get all purchasable items
function getAllShopItems() {
  const items = [];
  
  // Skins (exclude battle ticket exclusives)
  Object.entries(SKINS).forEach(([id, skin]) => {
    if (!skin.battleTicket && skin.price > 0) {
      items.push({
        id,
        type: 'skin',
        name: skin.name,
        price: skin.price,
        rarity: skin.rarity,
        category: 'skins'
      });
    }
  });
  
  // Emotes (exclude default ones)
  Object.entries(EMOTES).forEach(([id, emote]) => {
    if (emote.price > 0) {
      items.push({
        id,
        type: 'emote',
        name: emote.name,
        price: emote.price,
        category: 'emotes',
        rarity: 'uncommon'
      });
    }
  });
  
  // Trails (exclude default)
  Object.entries(TRAILS).forEach(([id, trail]) => {
    if (trail.price > 0) {
      items.push({
        id,
        type: 'trail',
        name: trail.name,
        price: trail.price,
        category: 'trails',
        rarity: getRarityByPrice(trail.price)
      });
    }
  });
  
  // Weapon skins
  Object.entries(WEAPON_SKINS).forEach(([id, weaponSkin]) => {
    items.push({
      id,
      type: 'weapon_skin',
      name: weaponSkin.name,
      weapon: weaponSkin.weapon,
      price: weaponSkin.price,
      rarity: weaponSkin.rarity,
      category: 'weapon_skins'
    });
  });
  
  // Bundles
  Object.entries(SHOP_CONFIG.bundles).forEach(([id, bundle]) => {
    items.push({
      id,
      type: 'bundle',
      name: bundle.name,
      description: bundle.description,
      items: bundle.items,
      regularPrice: bundle.regularPrice,
      price: bundle.bundlePrice,
      discount: bundle.discount,
      category: 'bundles',
      rarity: 'epic'
    });
  });
  
  return items;
}

function getRarityByPrice(price) {
  if (price < 400) return 'common';
  if (price < 700) return 'uncommon';
  if (price < 1000) return 'rare';
  if (price < 1500) return 'epic';
  return 'legendary';
}

// Generate daily featured items
function getDailyFeaturedItems() {
  const allItems = getAllShopItems().filter(item => item.type !== 'bundle');
  
  // Seed random based on current day for consistent daily rotation
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
  
  // Simple seeded shuffle
  const seededItems = allItems.sort((a, b) => {
    const hashA = (daysSinceEpoch + a.id.charCodeAt(0)) % 100;
    const hashB = (daysSinceEpoch + b.id.charCodeAt(0)) % 100;
    return hashA - hashB;
  });
  
  return seededItems.slice(0, SHOP_CONFIG.featuredRotation.itemCount);
}

module.exports = {
  SHOP_CONFIG,
  WEAPON_SKINS,
  getAllShopItems,
  getDailyFeaturedItems,
  getRarityByPrice
};
