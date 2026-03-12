// BrainStorm Royale - INTEGRATED 3D ENGINE
// Connects 3D rendering with multiplayer backend

class BrainStormGame3D {
  constructor(gameState, socket) {
    this.gameState = gameState;
    this.socket = socket;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.players = new Map(); // 3D player meshes
    this.buildings = [];
    this.localPlayer = null;
    
    this.controls = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    
    this.velocity = new THREE.Vector3();
    this.canJump = false;
    
    this.init();
  }
  
  init() {
    console.log('🎮 Initializing 3D Engine...');
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue!
    this.scene.fog = new THREE.Fog(0x87CEEB, 200, 1000);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 100, 200);
    this.camera.lookAt(0, 0, 0); // Look at center of map
    
    // Create renderer
    const container = document.getElementById('game-3d-container');
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
    
    // Lighting
    this.setupLighting();
    
    // Create world
    this.createGround();
    this.createBuildings();
    this.createTrees();
    
    // Setup controls
    this.setupControls();
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation
    this.clock = new THREE.Clock();
    this.animate();
    
    console.log('✅ 3D Engine initialized!');
  }
  
  setupLighting() {
    // Sun
    const sun = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    sun.position.set(100, 200, 100);
    sun.castShadow = true;
    sun.shadow.camera.left = -500;
    sun.shadow.camera.right = 500;
    sun.shadow.camera.top = 500;
    sun.shadow.camera.bottom = -500;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    this.scene.add(sun);
    
    // Ambient
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.6);
    this.scene.add(ambient);
    
    // Hemisphere
    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x7FFF00, 0.7);
    this.scene.add(hemi);
  }
  
  createGround() {
    const mapSize = this.gameState.map.size;
    
    // Ground plane
    const geometry = new THREE.PlaneGeometry(mapSize, mapSize, 50, 50);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x7FFF00, // Bright lime green!
      side: THREE.DoubleSide 
    });
    
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Colorful patches
    const colors = [0xFFD700, 0xFF69B4, 0x87CEEB, 0xFF6347, 0x9370DB];
    for (let i = 0; i < 80; i++) {
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(Math.random() * 15 + 8, 32),
        new THREE.MeshLambertMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.25
        })
      );
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(
        Math.random() * mapSize - mapSize/2,
        0.2,
        Math.random() * mapSize - mapSize/2
      );
      this.scene.add(patch);
    }
  }
  
  createBuildings() {
    if (!this.gameState.buildings) return;
    
    const buildingColors = {
      'Shop': 0x87CEEB,
      'Tower': 0x9370DB,
      'Warehouse': 0xFFD700,
      'Restaurant': 0xFF6347,
      'Apartment': 0xFFD54F,
      'House': 0x98FB98
    };
    
    this.gameState.buildings.forEach(b => {
      // Determine color
      let color = 0xFF69B4; // Default pink
      for (let type in buildingColors) {
        if (b.name && b.name.includes(type)) {
          color = buildingColors[type];
          break;
        }
      }
      
      // Create building
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(b.width, b.height, b.height), // Use height for depth too
        new THREE.MeshLambertMaterial({ color })
      );
      
      building.position.set(
        b.x + b.width/2 - this.gameState.map.size/2,
        b.height/2,
        b.y + b.height/2 - this.gameState.map.size/2
      );
      building.castShadow = true;
      building.receiveShadow = true;
      
      this.scene.add(building);
      this.buildings.push(building);
      
      // Add windows
      const windowCount = Math.floor(b.width / 30);
      const floorCount = Math.floor(b.height / 40);
      
      for (let floor = 0; floor < floorCount; floor++) {
        for (let i = 0; i < windowCount; i++) {
          const window = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 1),
            new THREE.MeshLambertMaterial({ 
              color: 0x87CEEB,
              emissive: 0x87CEEB,
              emissiveIntensity: 0.5
            })
          );
          
          window.position.set(
            b.x + (i + 1) * (b.width / (windowCount + 1)) - this.gameState.map.size/2,
            (floor + 1) * 40,
            b.y + b.height/2 + 0.6 - this.gameState.map.size/2
          );
          
          this.scene.add(window);
        }
      }
    });
  }
  
  createTrees() {
    const mapSize = this.gameState.map.size;
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * mapSize - mapSize/2;
      const z = Math.random() * mapSize - mapSize/2;
      
      // Check if too close to buildings
      let tooClose = false;
      for (let b of this.gameState.buildings || []) {
        const bx = b.x + b.width/2 - mapSize/2;
        const bz = b.y + b.height/2 - mapSize/2;
        const dist = Math.sqrt((x - bx)**2 + (z - bz)**2);
        if (dist < 100) {
          tooClose = true;
          break;
        }
      }
      
      if (tooClose) continue;
      
      // Trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 15, 8),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
      );
      trunk.position.set(x, 7.5, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      
      // Leaves
      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(8, 8, 8),
        new THREE.MeshLambertMaterial({ color: 0x228B22 })
      );
      leaves.position.set(x, 18, z);
      leaves.castShadow = true;
      this.scene.add(leaves);
    }
  }
  
  createPlayer(playerData) {
    const group = new THREE.Group();
    
    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(8, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x667eea })
    );
    head.position.y = 18;
    head.castShadow = true;
    group.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    
    const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeL.position.set(-2, 19, 4.1);
    group.add(eyeL);
    
    const eyeR = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeR.position.set(2, 19, 4.1);
    group.add(eyeR);
    
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(10, 12, 6),
      new THREE.MeshLambertMaterial({ color: 0x764ba2 })
    );
    body.position.y = 8;
    body.castShadow = true;
    group.add(body);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(3, 10, 3);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x667eea });
    
    const armL = new THREE.Mesh(armGeometry, armMaterial);
    armL.position.set(-7, 9, 0);
    armL.castShadow = true;
    group.add(armL);
    
    const armR = new THREE.Mesh(armGeometry, armMaterial);
    armR.position.set(7, 9, 0);
    armR.castShadow = true;
    group.add(armR);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(4, 8, 4);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x667eea });
    
    const legL = new THREE.Mesh(legGeometry, legMaterial);
    legL.position.set(-3, 0, 0);
    legL.castShadow = true;
    group.add(legL);
    
    const legR = new THREE.Mesh(legGeometry, legMaterial);
    legR.position.set(3, 0, 0);
    legR.castShadow = true;
    group.add(legR);
    
    // Name label (2D sprite)
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(playerData.username || 'Player', 128, 42);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.y = 28;
    sprite.scale.set(16, 4, 1);
    group.add(sprite);
    
    // Position player
    const mapSize = this.gameState.map.size;
    group.position.set(
      playerData.x - mapSize/2,
      0,
      playerData.y - mapSize/2
    );
    
    this.scene.add(group);
    return group;
  }
  
  updatePlayers() {
    if (!this.gameState || !this.gameState.players) return;
    
    // Update or create players
    this.gameState.players.forEach(playerData => {
      if (!this.players.has(playerData.id)) {
        // Create new player
        const playerMesh = this.createPlayer(playerData);
        this.players.set(playerData.id, playerMesh);
        
        // Check if this is local player
        if (playerData.id === this.socket.id) {
          this.localPlayer = playerMesh;
          this.canJump = true;
        }
      } else {
        // Update existing player
        const playerMesh = this.players.get(playerData.id);
        const mapSize = this.gameState.map.size;
        
        // Smooth position update
        playerMesh.position.x = playerData.x - mapSize/2;
        playerMesh.position.z = playerData.y - mapSize/2;
        
        // Update rotation based on velocity
        if (playerData.velocityX || playerData.velocityY) {
          const angle = Math.atan2(playerData.velocityX, -playerData.velocityY);
          playerMesh.rotation.y = angle;
        }
      }
    });
    
    // Remove disconnected players
    this.players.forEach((mesh, id) => {
      const playerExists = this.gameState.players.some(p => p.id === id);
      if (!playerExists) {
        this.scene.remove(mesh);
        this.players.delete(id);
      }
    });
  }
  
  setupControls() {
    console.log('🎮 Setting up 3D controls...');
    
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'KeyW': 
          this.controls.forward = true;
          console.log('W pressed - moving forward');
          break;
        case 'KeyS': 
          this.controls.backward = true;
          console.log('S pressed - moving backward');
          break;
        case 'KeyA': 
          this.controls.left = true;
          console.log('A pressed - moving left');
          break;
        case 'KeyD': 
          this.controls.right = true;
          console.log('D pressed - moving right');
          break;
        case 'Space': 
          if (this.canJump) {
            this.velocity.y = 25;
            this.canJump = false;
            console.log('SPACE pressed - jumping');
          }
          e.preventDefault();
          break;
        case 'Escape':
          console.log('ESC pressed - returning to menu');
          // Return to menu
          if (this.socket) {
            this.socket.emit('leave-game');
          }
          window.location.reload();
          break;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'KeyW': this.controls.forward = false; break;
        case 'KeyS': this.controls.backward = false; break;
        case 'KeyA': this.controls.left = false; break;
        case 'KeyD': this.controls.right = false; break;
      }
    });
    
    // Mouse for shooting
    this.renderer.domElement.addEventListener('click', (e) => {
      if (this.socket && this.localPlayer) {
        // Get click position in 3D world
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x, y }, this.camera);
        
        // Cast ray to ground
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, target);
        
        if (target) {
          const mapSize = this.gameState.map.size;
          this.socket.emit('player-shoot', {
            targetX: target.x + mapSize/2,
            targetY: target.z + mapSize/2
          });
        }
      }
    });
  }
  
  sendInputs() {
    if (!this.socket) return;
    
    // Send WASD state to server
    this.socket.emit('player-input', {
      up: this.controls.forward,
      down: this.controls.backward,
      left: this.controls.left,
      right: this.controls.right,
      mouseX: 0, // Not used in 3D
      mouseY: 0
    });
  }
  
  updateCamera() {
    if (!this.localPlayer) return;
    
    // Third-person camera
    const distance = 80;
    const height = 50;
    
    const targetPos = this.localPlayer.position.clone();
    const cameraPos = targetPos.clone();
    cameraPos.y += height;
    cameraPos.z += distance;
    
    this.camera.position.lerp(cameraPos, 0.1);
    this.camera.lookAt(targetPos.clone().add(new THREE.Vector3(0, 10, 0)));
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    // Update players from game state
    this.updatePlayers();
    
    // Send inputs to server
    this.sendInputs();
    
    // Update camera
    this.updateCamera();
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
      const container = document.getElementById('game-3d-container');
      if (container && this.renderer.domElement) {
        container.removeChild(this.renderer.domElement);
      }
    }
  }
}

// Export
window.BrainStormGame3D = BrainStormGame3D;
