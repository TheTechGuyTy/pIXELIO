// Vehicles System for BrainStorm Royale

const VEHICLES = {
  hovercart: {
    name: 'Hover Cart',
    type: 'ground',
    maxHealth: 300,
    speed: 12,
    acceleration: 0.8,
    handling: 0.9,
    seats: 1,
    rarity: 'common',
    spawnRate: 0.3
  },
  brainmobile: {
    name: 'Brain Mobile',
    type: 'ground',
    maxHealth: 500,
    speed: 10,
    acceleration: 0.6,
    handling: 0.8,
    seats: 4,
    rarity: 'uncommon',
    spawnRate: 0.2,
    features: ['horn', 'boost']
  },
  jetpack: {
    name: 'Jetpack',
    type: 'air',
    maxHealth: 200,
    speed: 15,
    acceleration: 1.0,
    handling: 1.0,
    seats: 1,
    fuel: 30, // seconds
    rarity: 'rare',
    spawnRate: 0.1
  },
  quad_bike: {
    name: 'Quad Bike',
    type: 'ground',
    maxHealth: 400,
    speed: 14,
    acceleration: 0.9,
    handling: 0.95,
    seats: 2,
    rarity: 'uncommon',
    spawnRate: 0.25,
    features: ['offroad']
  },
  hoverboard: {
    name: 'Hoverboard',
    type: 'ground',
    maxHealth: 150,
    speed: 16,
    acceleration: 1.2,
    handling: 1.0,
    seats: 1,
    rarity: 'rare',
    spawnRate: 0.15,
    features: ['tricks']
  },
  flying_saucer: {
    name: 'Flying Saucer',
    type: 'air',
    maxHealth: 600,
    speed: 13,
    acceleration: 0.7,
    handling: 0.85,
    seats: 2,
    fuel: 60,
    rarity: 'epic',
    spawnRate: 0.05,
    features: ['shields', 'laser']
  }
};

// Vehicle spawn locations generator
function generateVehicleSpawns(map, count) {
  const spawns = [];
  const vehicleTypes = Object.keys(VEHICLES);
  
  for (let i = 0; i < count; i++) {
    // Weighted random selection based on rarity
    const rand = Math.random();
    let selectedVehicle;
    
    if (rand < 0.5) {
      selectedVehicle = vehicleTypes.filter(v => VEHICLES[v].rarity === 'common')[0] || 'hovercart';
    } else if (rand < 0.75) {
      selectedVehicle = vehicleTypes.filter(v => VEHICLES[v].rarity === 'uncommon')[Math.floor(Math.random() * 2)] || 'brainmobile';
    } else if (rand < 0.9) {
      selectedVehicle = vehicleTypes.filter(v => VEHICLES[v].rarity === 'rare')[Math.floor(Math.random() * 2)] || 'jetpack';
    } else {
      selectedVehicle = vehicleTypes.filter(v => VEHICLES[v].rarity === 'epic')[0] || 'flying_saucer';
    }
    
    spawns.push({
      id: require('crypto').randomBytes(8).toString('hex'),
      type: selectedVehicle,
      x: Math.random() * (map.size - 400) + 200,
      y: Math.random() * (map.size - 400) + 200,
      health: VEHICLES[selectedVehicle].maxHealth,
      fuel: VEHICLES[selectedVehicle].fuel || null,
      occupied: false,
      driver: null,
      passengers: []
    });
  }
  
  return spawns;
}

// Vehicle physics update
function updateVehicle(vehicle, input, deltaTime) {
  const vehicleData = VEHICLES[vehicle.type];
  
  if (!vehicleData || vehicle.health <= 0) {
    return null;
  }
  
  // Fuel consumption for air vehicles
  if (vehicleData.fuel && vehicle.fuel !== null) {
    vehicle.fuel -= deltaTime / 1000;
    if (vehicle.fuel <= 0) {
      vehicle.fuel = 0;
      // Vehicle falls/stops
      return vehicle;
    }
  }
  
  // Speed calculation
  if (input.forward) {
    vehicle.speed = Math.min(vehicle.speed + vehicleData.acceleration, vehicleData.speed);
  } else if (input.backward) {
    vehicle.speed = Math.max(vehicle.speed - vehicleData.acceleration, -vehicleData.speed * 0.5);
  } else {
    // Friction
    vehicle.speed *= 0.95;
  }
  
  // Turning
  if (input.left) {
    vehicle.rotation -= vehicleData.handling * 0.05;
  }
  if (input.right) {
    vehicle.rotation += vehicleData.handling * 0.05;
  }
  
  // Position update
  vehicle.x += Math.cos(vehicle.rotation) * vehicle.speed;
  vehicle.y += Math.sin(vehicle.rotation) * vehicle.speed;
  
  // Boost feature
  if (input.boost && vehicleData.features?.includes('boost')) {
    if (!vehicle.boostCooldown || Date.now() > vehicle.boostCooldown) {
      vehicle.speed *= 1.5;
      vehicle.boostCooldown = Date.now() + 5000; // 5 second cooldown
    }
  }
  
  return vehicle;
}

module.exports = {
  VEHICLES,
  generateVehicleSpawns,
  updateVehicle
};
