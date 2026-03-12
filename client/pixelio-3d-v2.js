// PIXELIO 3D ENGINE V2 - REBUILT WITH WORKING MOVEMENT
class Pixelio3D {
  constructor() {
    console.log('🎮 Pixelio 3D v2 Starting...');
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.players = new Map();
    this.myPlayerId = null;
    this.buildings = [];
    
    this.init();
  }
  
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 8000);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 100, 200);
    
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'pixelio-3d-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999';
    document.body.appendChild(canvas);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    
    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    this.scene.add(sun);
    
    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshLambertMaterial({ color: 0x7FFF00 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Grid
    this.scene.add(new THREE.GridHelper(6000, 120, 0x000000, 0x333333));
    
    console.log('✅ 3D Engine initialized');
    
    // Animate
    this.animate();
    
    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  setMyPlayer(id) {
    this.myPlayerId = id;
    console.log('👤 My ID:', id);
  }
  
  updatePlayers(playersArray, mapSize) {
    if (!playersArray) return;
    
    const currentIds = new Set();
    
    playersArray.forEach(p => {
      currentIds.add(p.id);
      
      if (!this.players.has(p.id)) {
        const mesh = this.createPlayer();
        this.players.set(p.id, { mesh, x: p.x, y: p.y });
        console.log('✅ Player created:', p.username);
      }
      
      const player = this.players.get(p.id);
      player.x = p.x;
      player.y = p.y;
      player.mesh.position.x = p.x - mapSize / 2;
      player.mesh.position.z = p.y - mapSize / 2;
    });
    
    // Remove old
    this.players.forEach((player, id) => {
      if (!currentIds.has(id)) {
        this.scene.remove(player.mesh);
        this.players.delete(id);
      }
    });
    
    // Follow my player
    if (this.myPlayerId && this.players.has(this.myPlayerId)) {
      const me = this.players.get(this.myPlayerId);
      this.camera.position.x = me.mesh.position.x;
      this.camera.position.z = me.mesh.position.z + 100;
      this.camera.lookAt(me.mesh.position.x, 0, me.mesh.position.z);
    }
  }
  
  createPlayer() {
    const group = new THREE.Group();
    
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(8, 12, 6),
      new THREE.MeshLambertMaterial({ color: 0x667eea })
    );
    body.position.y = 6;
    body.castShadow = true;
    group.add(body);
    
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6),
      new THREE.MeshLambertMaterial({ color: 0x667eea })
    );
    head.position.y = 15;
    head.castShadow = true;
    group.add(head);
    
    this.scene.add(group);
    return group;
  }
  
  createBuildings(buildings, mapSize) {
    console.log(`🏗️ Creating ${buildings.length} buildings...`);
    
    buildings.forEach(b => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.width, b.height, b.depth),
        new THREE.MeshLambertMaterial({ color: b.color })
      );
      
      mesh.position.set(
        b.x - mapSize / 2,
        b.height / 2,
        b.y - mapSize / 2
      );
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      this.scene.add(mesh);
      this.buildings.push(mesh);
    });
    
    console.log(`✅ ${buildings.length} buildings created`);
  }
  
  sendInputs(socket) {
    if (!socket || !window._pixelioKeys) return;
    const keys = window._pixelioKeys;
    socket.emit('player-input', {
      up:    keys['w'] || keys['arrowup']    || false,
      down:  keys['s'] || keys['arrowdown']  || false,
      left:  keys['a'] || keys['arrowleft']  || false,
      right: keys['d'] || keys['arrowright'] || false,
      mouseX: window._pixelioMouseX || 0,
      mouseY: window._pixelioMouseY || 0
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
  
  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
      document.getElementById('pixelio-3d-canvas')?.remove();
    }
  }
}

window.Pixelio3D = Pixelio3D;
