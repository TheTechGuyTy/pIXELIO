// Pixelio Simple 3D Engine
// Just reads from server and renders - nothing fancy!

class Pixelio3D {
  constructor() {
    console.log('🎮 Starting Pixelio 3D Engine...');
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.playerMeshes = {}; // Store player meshes by ID
    this.buildingMeshes = [];
    this.myPlayerId = null;
    
    // Camera
    this.cameraAngle = { h: 0, v: 0.3 };
    this.cameraDist = 40;
    
    this.init();
  }
  
  init() {
    console.log('🎨 Starting 3D initialization...');
    
    let canvas; // Declare outside try block
    
    try {
      // Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB);
      this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 8000);
      console.log('✅ Scene created');
      
      // Camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
      this.camera.position.set(0, 100, 200);
      console.log('✅ Camera created');
      
      // CREATE OWN CANVAS
      canvas = document.createElement('canvas');
      canvas.id = 'pixelio-3d-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.zIndex = '999999';
      canvas.style.pointerEvents = 'auto';
      document.body.appendChild(canvas);
      console.log('✅ Canvas created and appended to body');
      
      // Renderer
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      console.log('✅ Renderer created');
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in 3D init:', error);
      alert('3D initialization failed: ' + error.message);
      throw error;
    }
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    this.scene.add(sun);
    
    // Ground - MATCH MAP SIZE!
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000), // Bigger than 5000 map
      new THREE.MeshLambertMaterial({ color: 0x7FFF00 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Grid - MATCH MAP SIZE!
    const grid = new THREE.GridHelper(6000, 120, 0x000000, 0x333333);
    this.scene.add(grid);
    
    console.log('✅ World created');
    
    // Mouse controls
    let dragging = false;
    let lastX = 0, lastY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      
      this.cameraAngle.h -= dx * 0.005;
      this.cameraAngle.v -= dy * 0.005;
      this.cameraAngle.v = Math.max(-1, Math.min(1, this.cameraAngle.v));
      
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    canvas.addEventListener('mouseup', () => dragging = false);
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDist += e.deltaY * 0.05;
      this.cameraDist = Math.max(10, Math.min(100, this.cameraDist));
    });
    
    // WASD controls - send to server!
    this.keys = {};
    
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        this.keys[key] = true;
        console.log('⌨️ Key pressed:', key);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        this.keys[key] = false;
        console.log('⌨️ Key released:', key);
      }
    });
    
    console.log('✅ Controls setup - WASD ready!');
    
    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start rendering
    this.animate();
    
    console.log('🎮 3D Engine ready!');
  }
  
  // Update from server data
  updateFromServer(gameState) {
    if (!gameState || !gameState.players) return;
    
    const currentPlayers = new Set();
    
    // Update/create players
    gameState.players.forEach(player => {
      currentPlayers.add(player.id);
      
      if (!this.playerMeshes[player.id]) {
        // Create new player
        this.playerMeshes[player.id] = this.createPlayer(player);
        console.log('✅ Created player:', player.username, 'at', player.x, player.y);
      }
      
      // Update position
      const mesh = this.playerMeshes[player.id];
      const oldX = mesh.position.x;
      const oldZ = mesh.position.z;
      
      mesh.position.x = player.x - gameState.map.size / 2;
      mesh.position.z = player.y - gameState.map.size / 2;
      
      // Log if MY player moved
      if (player.id === this.myPlayerId && (oldX !== mesh.position.x || oldZ !== mesh.position.z)) {
        console.log('🏃 MY PLAYER MOVED!', {
          from: {x: oldX, z: oldZ},
          to: {x: mesh.position.x, z: mesh.position.z},
          serverPos: {x: player.x, y: player.y}
        });
      }
      
      // Update rotation based on velocity
      if (player.velocityX || player.velocityY) {
        const angle = Math.atan2(player.velocityX, -player.velocityY);
        mesh.rotation.y = angle;
      }
    });
    
    // Remove disconnected players
    Object.keys(this.playerMeshes).forEach(id => {
      if (!currentPlayers.has(id)) {
        this.scene.remove(this.playerMeshes[id]);
        delete this.playerMeshes[id];
        console.log('Removed player:', id);
      }
    });
  }
  
  createPlayer(playerData) {
    const group = new THREE.Group();
    
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(8, 12, 6),
      new THREE.MeshLambertMaterial({ color: 0x667eea })
    );
    body.position.y = 6;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0x667eea })
    );
    head.position.y = 15;
    head.castShadow = true;
    group.add(head);
    
    // Eyes
    const eyeGeo = new THREE.BoxGeometry(1, 1, 0.5);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-1.5, 15.5, 3);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(1.5, 15.5, 3);
    group.add(rightEye);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(2, 8, 2);
    const leftArm = new THREE.Mesh(armGeo, new THREE.MeshLambertMaterial({ color: 0x667eea }));
    leftArm.position.set(-5, 7, 0);
    leftArm.castShadow = true;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeo, new THREE.MeshLambertMaterial({ color: 0x667eea }));
    rightArm.position.set(5, 7, 0);
    rightArm.castShadow = true;
    group.add(rightArm);
    
    // Legs  
    const legGeo = new THREE.BoxGeometry(3, 7, 3);
    const leftLeg = new THREE.Mesh(legGeo, new THREE.MeshLambertMaterial({ color: 0x5568d3 }));
    leftLeg.position.set(-2, 0, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeo, new THREE.MeshLambertMaterial({ color: 0x5568d3 }));
    rightLeg.position.set(2, 0, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    // Name label
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerData.username || 'Player', 128, 42);
    
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.position.y = 22;
    sprite.scale.set(16, 4, 1);
    group.add(sprite);
    
    this.scene.add(group);
    return group;
  }
  
  setMyPlayer(playerId) {
    this.myPlayerId = playerId;
  }
  
  // Send WASD inputs to server
  sendInputs(socket) {
    if (!socket) {
      console.warn('⚠️ No socket in sendInputs!');
      return;
    }
    
    const input = {
      up: this.keys['w'] || false,
      down: this.keys['s'] || false,
      left: this.keys['a'] || false,
      right: this.keys['d'] || false,
      mouseX: 0,
      mouseY: 0
    };
    
    // Debug: log when keys are pressed
    if (input.up || input.down || input.left || input.right) {
      console.log('📤 Sending input:', input);
    }
    
    socket.emit('player-input', input);
  }
  
  createBuildings(buildings, mapSize) {
    // Clear old buildings
    this.buildingMeshes.forEach(b => this.scene.remove(b));
    this.buildingMeshes = [];
    
    buildings.forEach(building => {
      const colors = {
        shop: 0x87CEEB,
        tower: 0x9370DB,
        warehouse: 0xFFD700,
        restaurant: 0xFF6347,
        apartment: 0xFFD54F,
        house: 0x98FB98
      };
      
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(building.width, building.height, building.depth),
        new THREE.MeshLambertMaterial({ color: colors[building.type] || 0xCCCCCC })
      );
      
      mesh.position.x = building.x - mapSize / 2;
      mesh.position.y = building.height / 2;
      mesh.position.z = building.y - mapSize / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      this.scene.add(mesh);
      this.buildingMeshes.push(mesh);
    });
    
    console.log(`✅ Created ${buildings.length} buildings`);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update camera to follow my player
    if (this.myPlayerId && this.playerMeshes[this.myPlayerId]) {
      const myPlayer = this.playerMeshes[this.myPlayerId];
      const pos = myPlayer.position;
      
      const x = pos.x + this.cameraDist * Math.sin(this.cameraAngle.h) * Math.cos(this.cameraAngle.v);
      const y = pos.y + this.cameraDist * Math.sin(this.cameraAngle.v) + 10;
      const z = pos.z + this.cameraDist * Math.cos(this.cameraAngle.h) * Math.cos(this.cameraAngle.v);
      
      this.camera.position.set(x, y, z);
      this.camera.lookAt(pos.x, pos.y + 10, pos.z);
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Export
window.Pixelio3D = Pixelio3D;
