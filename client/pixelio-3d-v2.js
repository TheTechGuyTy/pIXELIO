// PIXELIO 3D ENGINE V3 - GLB MODEL + WORKING MOVEMENT
class Pixelio3D {
  constructor() {
    console.log('🎮 Pixelio 3D v3 Starting...');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.players = new Map();   // socketId -> { group, mixer, x, y }
    this.myPlayerId = null;
    this.buildings = [];
    this.playerTemplate = null; // Loaded GLB scene, cloned per player
    this.modelLoaded = false;
    this.pendingPlayers = [];   // Players added before model loaded
    this.skinColors = {
      default: 0x667eea,
      pink:    0xFF69B4,
      gold:    0xFFD700,
      shadow:  0x2d2d2d,
      galaxy:  0x9370DB,
      cyber:   0x00FFFF,
      flame:   0xFF4500,
      ocean:   0x1E90FF
    };
    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 1500, 9000);

    // Camera - third person
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 12000);
    this.camera.position.set(0, 180, 320);

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'pixelio-3d-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;';
    canvas.setAttribute('tabindex', '0'); // Make focusable
    document.body.appendChild(canvas);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
    sun.position.set(200, 400, 200);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 2000;
    sun.shadow.camera.left = -500;
    sun.shadow.camera.right = 500;
    sun.shadow.camera.top = 500;
    sun.shadow.camera.bottom = -500;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xadd8e6, 0.4);
    fill.position.set(-200, 100, -200);
    this.scene.add(fill);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(8000, 8000, 40, 40);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8a3c });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid lines subtle
    const grid = new THREE.GridHelper(8000, 80, 0x000000, 0x2a5a1a);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Load GLB player model
    this._loadPlayerModel();

    // Animate loop
    this._clock = new THREE.Clock();
    this._animate();

    // Resize handler
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log('✅ 3D Engine v3 initialized');
  }

  _loadPlayerModel() {
    // THREE r128 has GLTFLoader available via THREE.GLTFLoader if included,
    // but since we only load three.min.js, we use a built-in fallback loader approach.
    // We'll do a fetch + parse using the built-in GLTFLoader from three.js addons CDN.
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.min.js';
    script.onerror = () => {
      console.warn('GLTFLoader CDN failed, using built-in box model');
      this.playerTemplate = null;
      this.modelLoaded = true;
      this._flushPendingPlayers();
    };
    script.onload = () => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        '/playermodel.glb',
        (gltf) => {
          console.log('✅ Player GLB loaded!');
          this.playerTemplate = gltf.scene;
          // Normalize scale - model comes in at a large scale, bring it down
          this.playerTemplate.scale.set(8, 8, 8);
          this.modelLoaded = true;
          this._flushPendingPlayers();
        },
        undefined,
        (err) => {
          console.warn('GLB load error, using box model:', err);
          this.playerTemplate = null;
          this.modelLoaded = true;
          this._flushPendingPlayers();
        }
      );
    };
    document.head.appendChild(script);
  }

  _flushPendingPlayers() {
    this.pendingPlayers.forEach(p => this._spawnPlayer(p.id, p.skinId));
    this.pendingPlayers = [];
  }

  _makeFallbackModel(color) {
    // Simple boxy humanoid if GLB fails
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(18, 24, 12), mat);
    body.position.y = 20; body.castShadow = true; group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), mat);
    head.position.y = 40; head.castShadow = true; group.add(head);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    [-4, 4].forEach(x => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 1), eyeMat);
      eye.position.set(x, 41, 7); group.add(eye);
      const pupil = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1), pupilMat);
      pupil.position.set(x, 41, 7.5); group.add(pupil);
    });

    // Arms
    const armGeo = new THREE.BoxGeometry(6, 20, 8);
    const lArm = new THREE.Mesh(armGeo, mat);
    lArm.position.set(-14, 20, 0); lArm.castShadow = true; group.add(lArm);
    const rArm = new THREE.Mesh(armGeo, mat);
    rArm.position.set(14, 20, 0); rArm.castShadow = true; group.add(rArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(8, 20, 10);
    const lLeg = new THREE.Mesh(legGeo, mat);
    lLeg.position.set(-5, 0, 0); lLeg.castShadow = true; group.add(lLeg);
    const rLeg = new THREE.Mesh(legGeo, mat);
    rLeg.position.set(5, 0, 0); rLeg.castShadow = true; group.add(rLeg);

    return group;
  }

  _spawnPlayer(socketId, skinId) {
    if (this.players.has(socketId)) return;

    const colorHex = this.skinColors[skinId] || this.skinColors.default;
    let group;

    if (this.playerTemplate) {
      // Clone the GLB
      group = this.playerTemplate.clone(true);
      // Apply skin color to all meshes
      group.traverse(child => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(colorHex);
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      group.scale.set(8, 8, 8);
    } else {
      group = this._makeFallbackModel(colorHex);
    }

    // Name label above player
    group.userData.socketId = socketId;
    this.scene.add(group);
    this.players.set(socketId, { group, x: 0, y: 0, skinId });
    console.log(`✅ Player spawned: ${socketId}`);
  }

  setMyPlayer(id) {
    this.myPlayerId = id;
    console.log('👤 My player ID:', id);
  }

  updatePlayers(playersArray, mapSize) {
    if (!playersArray) return;
    const half = mapSize / 2;
    const currentIds = new Set();

    playersArray.forEach(p => {
      currentIds.add(p.id);

      if (!this.players.has(p.id)) {
        if (this.modelLoaded) {
          this._spawnPlayer(p.id, p.skin || 'default');
        } else {
          // Queue until model is ready
          if (!this.pendingPlayers.find(pp => pp.id === p.id)) {
            this.pendingPlayers.push({ id: p.id, skinId: p.skin || 'default' });
          }
        }
      }

      const entry = this.players.get(p.id);
      if (!entry) return;

      // Convert 2D game coords to 3D world coords
      const wx = p.x - half;
      const wz = p.y - half;
      entry.x = wx;
      entry.y = wz;
      entry.group.position.set(wx, 0, wz);

      // Rotate player to face movement direction
      if (p.vx !== undefined && p.vy !== undefined && (p.vx !== 0 || p.vy !== 0)) {
        const angle = Math.atan2(p.vx, p.vy);
        entry.group.rotation.y = angle;
      }
    });

    // Remove players who left
    this.players.forEach((entry, id) => {
      if (!currentIds.has(id)) {
        this.scene.remove(entry.group);
        this.players.delete(id);
      }
    });

    // Follow local player with smooth camera
    if (this.myPlayerId && this.players.has(this.myPlayerId)) {
      const me = this.players.get(this.myPlayerId);
      const target = new THREE.Vector3(me.x, 0, me.y);

      // Smooth camera follow
      this.camera.position.x += (me.x - this.camera.position.x) * 0.08;
      this.camera.position.z += (me.y + 320 - this.camera.position.z) * 0.08;
      this.camera.position.y = 180;
      this.camera.lookAt(target);
    }
  }

  createBuildings(buildings, mapSize) {
    const half = mapSize / 2;
    const colors = [0x8B7355, 0x708090, 0xA0522D, 0x696969, 0x8FBC8F];

    buildings.forEach((b, i) => {
      const h = b.height || 60;
      const w = b.width || 80;
      const d = b.depth || 80;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshLambertMaterial({ color: colors[i % colors.length] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x - half, h / 2, b.y - half);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.buildings.push(mesh);
    });

    console.log(`🏗️ ${buildings.length} buildings created`);
  }

  sendInputs(socket) {
    if (!socket || !window._pixelioKeys) return;
    const k = window._pixelioKeys;
    socket.emit('player-input', {
      up:    k['w'] || k['arrowup']    || false,
      down:  k['s'] || k['arrowdown']  || false,
      left:  k['a'] || k['arrowleft']  || false,
      right: k['d'] || k['arrowright'] || false,
      mouseX: window._pixelioMouseX || 0,
      mouseY: window._pixelioMouseY || 0
    });
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const delta = this._clock.getDelta();

    // Tick any animation mixers
    this.players.forEach(entry => {
      if (entry.mixer) entry.mixer.update(delta);
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
      document.getElementById('pixelio-3d-canvas')?.remove();
    }
    this.players.clear();
    this.buildings = [];
  }
}

window.Pixelio3D = Pixelio3D;
