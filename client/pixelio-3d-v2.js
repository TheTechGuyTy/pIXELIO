// Builds a rounded humanoid matching the reference screenshot
// Returns a THREE.Group — no GLB needed, pure geometry
function buildPixelioCharacter(colorHex) {
  const group = new THREE.Group();
  const col   = colorHex || 0x8899cc;

  // Materials
  const mat      = new THREE.MeshLambertMaterial({ color: col });
  const darkMat  = new THREE.MeshLambertMaterial({ color: new THREE.Color(col).multiplyScalar(0.55) });
  const eyeMat   = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshLambertMaterial({ color: 0x111122 });

  function add(geo, m, x, y, z, rx, ry, rz) {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    if (rx) mesh.rotation.x = rx;
    if (ry) mesh.rotation.y = ry;
    if (rz) mesh.rotation.z = rz;
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  }

  // ── HEAD ──────────────────────────────────────────────
  // Main head — slightly squashed sphere
  add(new THREE.SphereGeometry(5.2, 10, 8), mat, 0, 30, 0);
  // Flatten top
  add(new THREE.SphereGeometry(4.8, 10, 8), mat, 0, 33.5, 0);

  // Eyes
  add(new THREE.SphereGeometry(1.4, 8, 6), eyeMat,   -2.2, 30.5, 4.8);
  add(new THREE.SphereGeometry(1.4, 8, 6), eyeMat,    2.2, 30.5, 4.8);
  add(new THREE.SphereGeometry(0.7, 8, 6), pupilMat, -2.2, 30.5, 5.8);
  add(new THREE.SphereGeometry(0.7, 8, 6), pupilMat,  2.2, 30.5, 5.8);

  // ── NECK ──────────────────────────────────────────────
  add(new THREE.CylinderGeometry(2.2, 2.5, 3, 8), darkMat, 0, 24.5, 0);

  // ── TORSO ─────────────────────────────────────────────
  // Main torso block — rounded box using sphere-scaled box
  const torsoGeo = new THREE.BoxGeometry(11, 14, 7);
  add(torsoGeo, mat, 0, 16, 0);
  // Chest bump
  add(new THREE.SphereGeometry(3.5, 8, 6), mat, 0, 18, 3.2);

  // Belt/waist divider
  add(new THREE.CylinderGeometry(5, 4.5, 1.5, 8), darkMat, 0, 9.5, 0);

  // ── UPPER ARMS ────────────────────────────────────────
  // Shoulder balls
  add(new THREE.SphereGeometry(3.2, 8, 6), mat, -7.5, 21, 0);
  add(new THREE.SphereGeometry(3.2, 8, 6), mat,  7.5, 21, 0);

  // Upper arm cylinders (pill shape)
  const uArmGeo = new THREE.CapsuleGeometry ? 
    new THREE.CapsuleGeometry(2, 6, 6, 8) : 
    new THREE.CylinderGeometry(2.2, 2.0, 7, 8);
  add(uArmGeo, mat, -12, 18, 0, 0, 0, Math.PI * 0.12);
  add(uArmGeo, mat,  12, 18, 0, 0, 0, -Math.PI * 0.12);

  // Elbow joints
  add(new THREE.SphereGeometry(2.0, 8, 6), darkMat, -15.5, 14.5, 0);
  add(new THREE.SphereGeometry(2.0, 8, 6), darkMat,  15.5, 14.5, 0);

  // ── FOREARMS ─────────────────────────────────────────
  const fArmGeo = new THREE.CylinderGeometry(1.8, 1.6, 6, 8);
  add(fArmGeo, mat, -17.5, 11, 0, 0, 0, Math.PI * 0.08);
  add(fArmGeo, mat,  17.5, 11, 0, 0, 0, -Math.PI * 0.08);

  // ── HANDS ────────────────────────────────────────────
  const handGeo = new THREE.SphereGeometry(2.2, 8, 6);
  // Scale into hand shape
  const lHand = new THREE.Mesh(handGeo, mat);
  lHand.scale.set(1.4, 0.9, 0.7);
  lHand.position.set(-19.5, 8, 0);
  lHand.castShadow = true;
  group.add(lHand);

  const rHand = new THREE.Mesh(handGeo.clone(), mat);
  rHand.scale.set(1.4, 0.9, 0.7);
  rHand.position.set(19.5, 8, 0);
  rHand.castShadow = true;
  group.add(rHand);

  // Thumb nubs
  add(new THREE.SphereGeometry(0.9, 6, 4), mat, -21, 9.5, 1);
  add(new THREE.SphereGeometry(0.9, 6, 4), mat,  21, 9.5, 1);

  // ── PELVIS ────────────────────────────────────────────
  add(new THREE.SphereGeometry(4.8, 8, 6), mat, 0, 7.5, 0);

  // ── THIGHS ────────────────────────────────────────────
  // Hip joints
  add(new THREE.SphereGeometry(2.8, 8, 6), darkMat, -3.5, 5.5, 0);
  add(new THREE.SphereGeometry(2.8, 8, 6), darkMat,  3.5, 5.5, 0);

  const thighGeo = new THREE.CylinderGeometry(2.6, 2.2, 8, 8);
  add(thighGeo, mat, -3.5, 0, 0);
  add(thighGeo, mat,  3.5, 0, 0);

  // ── KNEES ─────────────────────────────────────────────
  add(new THREE.SphereGeometry(2.2, 8, 6), darkMat, -3.5, -4.5, 0);
  add(new THREE.SphereGeometry(2.2, 8, 6), darkMat,  3.5, -4.5, 0);

  // ── CALVES ────────────────────────────────────────────
  const calfGeo = new THREE.CylinderGeometry(2.0, 1.8, 7, 8);
  add(calfGeo, mat, -3.5, -8.5, 0);
  add(calfGeo, mat,  3.5, -8.5, 0);

  // ── FEET ──────────────────────────────────────────────
  const footGeo = new THREE.SphereGeometry(2.4, 8, 6);
  const lFoot = new THREE.Mesh(footGeo, mat);
  lFoot.scale.set(0.9, 0.65, 1.4);
  lFoot.position.set(-3.5, -12.8, 1);
  lFoot.castShadow = true;
  group.add(lFoot);

  const rFoot = new THREE.Mesh(footGeo.clone(), mat);
  rFoot.scale.set(0.9, 0.65, 1.4);
  rFoot.position.set(3.5, -12.8, 1);
  rFoot.castShadow = true;
  group.add(rFoot);

  // Scale whole character to game size
  group.scale.setScalar(1.8);
  // Lift so feet sit on ground (feet local y≈-12.8, × scale 1.8 = 23 units below origin)
  group.position.y = 23;

  return group;
}

window.buildPixelioCharacter = buildPixelioCharacter;
class Pixelio3D {
  constructor() {
    console.log('🎮 Pixelio 3D v4 Starting...');
    this.scene      = null;
    this.camera     = null;
    this.renderer   = null;
    this.players    = new Map();   // socketId -> { group, x, y }
    this.myPlayerId = null;
    this.buildings  = [];

    // Client-side prediction state
    this._localX    = null;  // predicted local player position
    this._localZ    = null;
    this._localFacing = 0;   // facing angle in radians
    this._mapHalf   = 2500;
    this._speed     = 5;     // must match server speed

    this.skinColors = {
      default: 0x8899cc, pink: 0xFF69B4, gold:   0xFFD700,
      shadow:  0x444466, galaxy: 0x9370DB, cyber: 0x00FFFF,
      flame:   0xFF4500, ocean:  0x1E90FF
    };
    this._init();
  }

  _init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6aabdb);  // Pixelio blue sky
    this.scene.fog = new THREE.FogExp2(0x8ec8e8, 0.00018); // exponential fog, softer

    // Camera starts behind — will be repositioned every frame
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 12000);

    const canvas = document.createElement('canvas');
    canvas.id = 'pixelio-3d-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;pointer-events:none;';
    document.body.appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // === LIGHTING — three-point setup for depth ===
    // Soft ambient — no harsh shadows in flat areas
    this.scene.add(new THREE.AmbientLight(0xd4e8ff, 0.5));

    // Main sun — warm, angled to cast long shadows
    const sun = new THREE.DirectionalLight(0xffe8b0, 1.3);
    sun.position.set(400, 600, 200);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -700;
    sun.shadow.camera.right = sun.shadow.camera.top = 700;
    sun.shadow.camera.far = 2500;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    // Fill light from opposite side — blue-tinted sky bounce
    const fill = new THREE.DirectionalLight(0x8ab4f8, 0.4);
    fill.position.set(-300, 200, -400);
    this.scene.add(fill);

    // Rim light from behind — gives models a slight glow outline
    const rim = new THREE.DirectionalLight(0xffd6a0, 0.25);
    rim.position.set(0, 100, -600);
    this.scene.add(rim);

    // === GROUND — layered for visual interest ===
    // Base grass layer
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(8000, 8000),
      new THREE.MeshLambertMaterial({ color: 0x4a7c3f })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Dirt path cross through center
    const pathMat = new THREE.MeshLambertMaterial({ color: 0x8b6914 });
    [[8000,80,0,0], [80,8000,0,0]].forEach(([w,h,x,z]) => {
      const path = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(x, 0.2, z);
      this.scene.add(path);
    });

    // Subtle grid just on the dirt paths
    const grid = new THREE.GridHelper(8000, 60, 0x000000, 0x3a5a2a);
    grid.material.opacity = 0.08;
    grid.material.transparent = true;
    this.scene.add(grid);

    this._clock = new THREE.Clock();
    this._animate();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log('✅ 3D Engine v4 ready');
  }

  _buildPlayerMesh(colorHex) {
    // Fallback procedural model — used until FBX is loaded
    const group = buildPixelioCharacter(colorHex);
    group.rotation.y = Math.PI;
    return group;
  }

  _applyColorToFBX(fbxGroup, colorHex) {
    const color = new THREE.Color(colorHex);
    fbxGroup.traverse(child => {
      if (child.isMesh && child.material) {
        // Clone material so each player has their own color
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        child.material = mats.map(m => {
          const nm = m.clone();
          nm.color = color;
          return nm;
        });
        if (!Array.isArray(child.material) && mats.length === 1) {
          child.material = child.material[0];
        }
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });
  }

  _spawnPlayer(socketId, skinId) {
    if (this.players.has(socketId)) return;
    const color = this.skinColors[skinId] || this.skinColors.default;

    if (window._fbxModelCache) {
      // FBX already loaded — clone it
      const fbx = window._fbxModelCache.clone();
      this._applyColorToFBX(fbx, color);
      this._fixFBXTransform(fbx);
      this.scene.add(fbx);
      this.players.set(socketId, { group: fbx, x: 0, y: 0, groundY: fbx.position.y });
      console.log(`👤 Spawned (FBX): ${socketId}`);
    } else if (!window._fbxLoading) {
      // Start loading FBX, use procedural in meantime
      const tempGroup = this._buildPlayerMesh(color);
      this.scene.add(tempGroup);
      this.players.set(socketId, { group: tempGroup, x: 0, y: 0, temp: true });

      const engine = this;
      loadFBXModel((fbx) => {
        if (!fbx) return; // load failed, keep procedural
        const entry = engine.players.get(socketId);
        if (!entry) return; // player left
        // Swap out temp model for real FBX
        engine.scene.remove(entry.group);
        engine._applyColorToFBX(fbx, color);
        engine._fixFBXTransform(fbx);
        fbx.position.x = entry.group.position.x;
        fbx.position.z = entry.group.position.z;
        fbx.rotation.y = entry.group.rotation.y;
        engine.scene.add(fbx);
        entry.group    = fbx;
        entry.groundY  = fbx.position.y;
        entry.temp     = false;
        console.log(`🔄 Swapped to FBX: ${socketId}`);
      });
    } else {
      // FBX loading in progress — use procedural
      const group = this._buildPlayerMesh(color);
      this.scene.add(group);
      this.players.set(socketId, { group, x: 0, y: 0 });
      console.log(`👤 Spawned (procedural): ${socketId}`);
    }
  }

  _fixFBXTransform(fbx) {
    // Blender FBX export quirks: scale is often 100x and rotated -90° on X
    // Detect and correct automatically
    const box = new THREE.Box3().setFromObject(fbx);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Target height ~45 units (matches procedural model at scale 1.8)
    const targetHeight = 45;
    const scaleFactor  = maxDim > 0 ? targetHeight / maxDim : 1;
    fbx.scale.setScalar(scaleFactor);

    // Fix Blender's -90° X rotation on FBX export
    fbx.rotation.x = 0;
    fbx.rotation.y = Math.PI; // face forward

    // Recalculate bounding box after scale fix and lift to ground
    const box2 = new THREE.Box3().setFromObject(fbx);
    const minY  = box2.min.y;
    fbx.position.y = -minY; // feet on ground
  }

  setMyPlayer(id, mapSize) {
    this.myPlayerId = id;
    if (mapSize) {
      this._mapHalf = mapSize / 2;
      // Start at map center until first server update arrives
      this._localX = 0;
      this._localZ = 0;
    }
    console.log('🎮 My player ID:', id);
  }

  // Called every frame to apply client-side prediction to local player
  _applyPrediction(delta) {
    if (!this.myPlayerId || !window._pixelioKeys || !window._gameActive) return;
    if (this._localX === null) return;

    const frameSpeed = this._speed * (delta * 60);  // scale to 60fps baseline

    const k = window._pixelioKeys;
    let dx = 0, dz = 0;
    if (k['w'] || k['arrowup'])    dz += frameSpeed;  // forward = +Z (away from camera)
    if (k['s'] || k['arrowdown'])  dz -= frameSpeed;  // back = -Z
    if (k['a'] || k['arrowleft'])  dx -= frameSpeed;  // left = -X
    if (k['d'] || k['arrowright']) dx += frameSpeed;  // right = +X

    // Normalize diagonal
    if (dx !== 0 && dz !== 0) {
      const mag = Math.sqrt(dx*dx + dz*dz);
      dx = (dx / mag) * frameSpeed;
      dz = (dz / mag) * frameSpeed;
    }

    const moving = dx !== 0 || dz !== 0;

    if (moving) {
      this._localX += dx;
      this._localZ += dz;
      // Smoothly rotate toward new facing direction instead of snapping
      const targetFacing = Math.atan2(dx, dz);
      // Shortest-path angle lerp
      let diff = targetFacing - this._localFacing;
      if (diff > Math.PI)  diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      this._localFacing += diff * 0.4; // snappier turning
    }

    const me = this.players.get(this.myPlayerId);
    if (!me) return;

    me.group.position.set(this._localX, 0, this._localZ);
    me.group.rotation.y = this._localFacing + Math.PI;

    // Subtle idle bob — gentle up/down so model feels alive without animation
    const t = performance.now() / 1000;
    const bobAmt = moving ? 1.8 : 0.4;
    const bobSpeed = moving ? 8 : 2;
    const groundY = me.groundY ?? 23;
      me.group.position.y = groundY + Math.sin(t * bobSpeed) * bobAmt;
  }

  updatePlayers(playersArray, mapSize) {
    if (!playersArray) return;
    const half = mapSize / 2;
    const seen  = new Set();

    playersArray.forEach(p => {
      seen.add(p.id);
      if (!this.players.has(p.id)) this._spawnPlayer(p.id, p.skin || 'default');

      const entry = this.players.get(p.id);
      if (!entry) return;

      const wx = p.x - half;
      const wz = p.y - half;

      if (p.id === this.myPlayerId) {
        // Server reconciliation — only snap if too far off (>50 units)
        if (this._localX === null) {
          // First update — initialize prediction from server
          this._localX = wx;
          this._localZ = wz;
        } else if (Math.hypot(this._localX - wx, this._localZ - wz) > 50) {
          // Drift correction — snap back
          this._localX = wx;
          this._localZ = wz;
        }
        // Don't overwrite position here — prediction handles it in _animate
      } else {
        // Other players: interpolate smoothly toward server position
        entry.x += (wx - entry.x) * 0.25;
        entry.y += (wz - entry.y) * 0.25;
        entry.group.position.set(entry.x, entry.groundY ?? 23, entry.y);
        if (p.vx !== undefined && p.vy !== undefined && (Math.abs(p.vx) + Math.abs(p.vy) > 0.1)) {
          entry.group.rotation.y = Math.atan2(p.vx, p.vy);
        }
      }
    });

    // Remove gone players
    this.players.forEach((entry, id) => {
      if (!seen.has(id)) {
        this.scene.remove(entry.group);
        this.players.delete(id);
      }
    });
  }

  _updateCamera() {
    if (!this.myPlayerId) return;
    const me = this.players.get(this.myPlayerId);
    if (!me) return;

    const camDist   = 180;
    const camHeight = 120;
    const facing    = this._localFacing || 0;

    // Camera sits BEHIND player: opposite of facing direction
    // facing=0 means player faces +Z, so camera goes to -Z side
    const targetX = me.group.position.x - Math.sin(facing) * camDist;
    const targetZ = me.group.position.z - Math.cos(facing) * camDist;

    this.camera.position.x += (targetX - this.camera.position.x) * 0.15;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.15;
    this.camera.position.y += (camHeight - this.camera.position.y) * 0.15;

    // Look slightly ahead of player
    this.camera.lookAt(
      me.group.position.x + Math.sin(facing) * 50,
      20,
      me.group.position.z + Math.cos(facing) * 50
    );
  }

  createBuildings(buildings, mapSize) {
    const half = mapSize / 2;

    // Wall palettes — warm/cool/neutral mixes
    const wallColors = [
      0xd4a96a, 0xc8b89a, 0x8fa8b8, 0xb8c4a0,
      0xe8c89a, 0xa89878, 0x7898a8, 0xc0a870,
      0x9ab0c8, 0xb8d0a8, 0xe0c0a0, 0xa0b8d0
    ];
    const roofColors = [
      0x7a4030, 0x506070, 0x405840, 0x604830,
      0x384858, 0x583828, 0x486058, 0x703830
    ];
    const windowColor = 0xc8e8ff;

    buildings.forEach((b, i) => {
      const h = b.height || 60;
      const w = b.width  || 80;
      const d = b.depth  || 80;
      const wx = b.x - half;
      const wz = b.y - half;

      const wallMat = new THREE.MeshLambertMaterial({ color: wallColors[i % wallColors.length] });
      const roofMat = new THREE.MeshLambertMaterial({ color: roofColors[i % roofColors.length] });
      const winMat  = new THREE.MeshLambertMaterial({ color: windowColor, emissive: 0x446688, emissiveIntensity: 0.3 });

      // Main building body
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      body.position.set(wx, h / 2, wz);
      body.castShadow = body.receiveShadow = true;
      this.scene.add(body);

      // Flat roof slab (slightly wider for overhang)
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 6, d + 6), roofMat);
      roof.position.set(wx, h + 3, wz);
      roof.castShadow = true;
      this.scene.add(roof);

      // Rooftop detail — small box on larger buildings
      if (h > 60) {
        const detail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, 12, d * 0.3), roofMat);
        detail.position.set(wx, h + 12, wz);
        this.scene.add(detail);
      }

      // Windows — add a row of windows on each face for taller buildings
      if (h > 40) {
        const floors = Math.floor(h / 40);
        const winSize = 10;
        for (let floor = 0; floor < floors; floor++) {
          const wy = 25 + floor * 38;
          // Front and back faces
          [-1, 1].forEach(side => {
            const winsPerSide = Math.max(1, Math.floor(w / 35));
            for (let wi = 0; wi < winsPerSide; wi++) {
              const wx2 = wx - (w / 2) + (w / (winsPerSide + 1)) * (wi + 1);
              const win = new THREE.Mesh(new THREE.BoxGeometry(winSize, winSize * 1.4, 2), winMat);
              win.position.set(wx2, wy, wz + side * (d / 2 + 1));
              this.scene.add(win);
            }
          });
          // Side faces
          [-1, 1].forEach(side => {
            const winsPerSide = Math.max(1, Math.floor(d / 35));
            for (let wi = 0; wi < winsPerSide; wi++) {
              const wz2 = wz - (d / 2) + (d / (winsPerSide + 1)) * (wi + 1);
              const win = new THREE.Mesh(new THREE.BoxGeometry(2, winSize * 1.4, winSize), winMat);
              win.position.set(wx + side * (w / 2 + 1), wy, wz2);
              this.scene.add(win);
            }
          });
        }
      }

      this.buildings.push(body);
    });

    console.log(`🏗️ ${buildings.length} buildings created`);
  }

  sendInputs(socket) {
    // No-op — inputs are sent from the global interval in index.html
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const delta = this._clock.getDelta();
    this._applyPrediction(delta);
    this._updateCamera();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
      document.getElementById('pixelio-3d-canvas')?.remove();
    }
    this.players.clear();
    this.buildings = [];
    this._localX = null;
    this._localZ = null;
    console.log('🗑️ 3D Engine destroyed');
  }
}

window.Pixelio3D = Pixelio3D;


function renderModelPreview(canvas, skinId, skinColors) {
  if (!canvas || typeof THREE === 'undefined') return;
  if (canvas._previewCleanup) { canvas._previewCleanup(); canvas._previewCleanup = null; }

  const w = canvas.width, h = canvas.height;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  camera.position.set(0, 18, 80);
  camera.lookAt(0, 10, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(50, 80, 50);
  scene.add(sun);

  const colorHex = (skinColors && skinColors[skinId]) ? skinColors[skinId] : 0x8899cc;
  const group = buildPixelioCharacter(colorHex);
  scene.add(group);

  let frame, angle = 0;
  function animate() {
    frame = requestAnimationFrame(animate);
    angle += 0.012;
    group.rotation.y = angle;
    renderer.render(scene, camera);
  }
  animate();

  canvas._previewCleanup = () => { cancelAnimationFrame(frame); renderer.dispose(); };
}

window.renderModelPreview = renderModelPreview;

// ============ FBX MODEL LOADER ============
window._fbxModelCache = null;
window._fbxLoading    = false;

function loadFBXModel(onLoaded) {
  if (window._fbxModelCache) { onLoaded(window._fbxModelCache.clone()); return; }
  if (window._fbxLoading)    { setTimeout(() => loadFBXModel(onLoaded), 200); return; }
  if (typeof THREE.FBXLoader === 'undefined') {
    console.warn('FBXLoader not available — using procedural model');
    onLoaded(null); return;
  }

  window._fbxLoading = true;
  console.log('⏳ Loading FBX model...');
  const loader = new THREE.FBXLoader();
  loader.load('/playermodel.fbx',
    (fbx) => {
      console.log('✅ FBX loaded!');
      window._fbxModelCache = fbx;
      window._fbxLoading    = false;
      onLoaded(fbx.clone());
    },
    (xhr) => {
      if (xhr.total) console.log(`FBX: ${Math.round(xhr.loaded/xhr.total*100)}%`);
    },
    (err) => {
      console.warn('FBX load failed, using procedural:', err.message || err);
      window._fbxLoading = false;
      onLoaded(null);
    }
  );
}

// Pre-load FBX as soon as Three.js is ready
window._fbxPreloadDone = false;
function preloadFBX() {
  if (window._fbxPreloadDone) return;
  window._fbxPreloadDone = true;
  loadFBXModel(() => console.log('FBX preload complete'));
}
// Call after page loads
window.addEventListener('load', () => setTimeout(preloadFBX, 500));

window.enableFBXModel = function() {
  window._fbxModelCache = null;
  window._fbxPreloadDone = false;
  preloadFBX();
};
