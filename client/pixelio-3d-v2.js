// Builds a rounded humanoid matching the reference screenshot
// Returns a THREE.Group — no GLB needed, pure geometry
function buildPixelioCharacter(colorHex) {
  // Simple, friendly default character - easy to read at game scale
  const group   = new THREE.Group();
  const col     = new THREE.Color(colorHex || 0x667eea);
  const mat     = new THREE.MeshLambertMaterial({ color: col });
  const darkCol = col.clone().multiplyScalar(0.6);
  const darkMat = new THREE.MeshLambertMaterial({ color: darkCol });
  const eyeMat  = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const pupMat  = new THREE.MeshLambertMaterial({ color: 0x111111 });

  function mesh(geo, m, x, y, z) {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    group.add(o);
    return o;
  }

  // Head
  mesh(new THREE.SphereGeometry(6, 12, 10), mat, 0, 28, 0);
  // Eyes
  mesh(new THREE.SphereGeometry(1.5, 8, 6), eyeMat, -2.5, 29, 5.2);
  mesh(new THREE.SphereGeometry(1.5, 8, 6), eyeMat,  2.5, 29, 5.2);
  mesh(new THREE.SphereGeometry(0.8, 8, 6), pupMat, -2.5, 29, 6.2);
  mesh(new THREE.SphereGeometry(0.8, 8, 6), pupMat,  2.5, 29, 6.2);
  // Smile
  for (let i = -1; i <= 1; i += 0.5) {
    mesh(new THREE.SphereGeometry(0.5, 6, 4), darkMat, i * 1.5, 25.5 + (i*i)*0.4, 5.8);
  }

  // Neck
  mesh(new THREE.CylinderGeometry(2.5, 3, 4, 8), darkMat, 0, 22, 0);

  // Body
  mesh(new THREE.CylinderGeometry(5, 4.5, 14, 10), mat, 0, 12, 0);

  // Arms
  const armGeo = new THREE.CylinderGeometry(2, 1.8, 12, 8);
  mesh(armGeo, mat, -8, 14, 0);
  mesh(armGeo, mat,  8, 14, 0);

  // Hands
  mesh(new THREE.SphereGeometry(2.5, 8, 6), darkMat, -8, 6, 0);
  mesh(new THREE.SphereGeometry(2.5, 8, 6), darkMat,  8, 6, 0);

  // Legs
  const legGeo = new THREE.CylinderGeometry(2.5, 2.2, 12, 8);
  mesh(legGeo, darkMat, -3.5, 0, 0);
  mesh(legGeo, darkMat,  3.5, 0, 0);

  // Feet
  const footGeo = new THREE.SphereGeometry(3, 8, 6);
  const lf = new THREE.Mesh(footGeo, mat);
  lf.scale.set(1.2, 0.6, 1.6); lf.position.set(-3.5, -6.5, 1.5);
  lf.castShadow = true; group.add(lf);
  const rf = lf.clone(); rf.position.set(3.5, -6.5, 1.5); group.add(rf);

  group.scale.setScalar(1.6);
  group.position.y = 11; // lift so feet are at ground
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
    this._localX      = null;
    this._localZ      = null;
    this._localFacing = 0;
    this._cameraYaw   = 0;    // horizontal camera angle — mouse controlled
    this._cameraPitch = 0.25; // vertical tilt (radians, fixed)
    this._mapHalf     = 2500;
    this._speed       = 5;    // must match server speed

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

    const container = document.getElementById('game-3d-container') || document.body;
    const canvas = document.createElement('canvas');
    canvas.id = 'pixelio-3d-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    // Always use window dimensions — container may be 0 if browser hasnt painted yet
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

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

    this._clock  = new THREE.Clock();
    this._socket = window._gameSocket; // set by game init
    // Send input to server at 20hz
    this._inputInterval = setInterval(() => {
      if (!window._gameActive || !this._socket) return;
      const k = window._pixelioKeys || {};
      this._socket.emit('player-input', {
        up:    !!(k['w'] || k['arrowup']),
        down:  !!(k['s'] || k['arrowdown']),
        left:  !!(k['a'] || k['arrowleft']),
        right: !!(k['d'] || k['arrowright']),
        x: this._localX,
        y: this._localZ,
        facing: this._cameraYaw
      });
    }, 50);
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
      this._localX  = 0;
      this._localZ  = 0;
    }
    // Spawn local player immediately — don't wait for first game-update
    if (!this.players.has(id)) {
      this._spawnPlayer(id, 'default');
    }
    console.log('🎮 My player ID:', id);
  }

  // Called every frame to apply client-side prediction to local player
  _applyPrediction(delta) {
    if (!this.myPlayerId || !window._pixelioKeys || !window._gameActive) return;
    if (this._localX === null) return;

    const me = this.players.get(this.myPlayerId);
    if (!me) return;

    // ── MOUSE LOOK ──────────────────────────────────────────────────────
    // Accumulate mouse X delta for camera yaw
    if (window._mouseDX) {
      this._cameraYaw -= window._mouseDX * 0.003; // sensitivity
      window._mouseDX = 0;
    }

    // ── KEYBOARD MOVEMENT (relative to camera direction) ─────────────
    const frameSpeed = this._speed * (delta * 60);
    const k = window._pixelioKeys;

    // Forward/back move along camera yaw, strafe is 90° from it
    const fwdX = Math.sin(this._cameraYaw);
    const fwdZ = Math.cos(this._cameraYaw);
    const strX = Math.sin(this._cameraYaw + Math.PI / 2);
    const strZ = Math.cos(this._cameraYaw + Math.PI / 2);

    let moveX = 0, moveZ = 0;
    if (k['w'] || k['arrowup'])    { moveX += fwdX; moveZ += fwdZ; }
    if (k['s'] || k['arrowdown'])  { moveX -= fwdX; moveZ -= fwdZ; }
    if (k['a'] || k['arrowleft'])  { moveX -= strX; moveZ -= strZ; }
    if (k['d'] || k['arrowright']) { moveX += strX; moveZ += strZ; }

    const moving = moveX !== 0 || moveZ !== 0;
    if (moving) {
      // Normalize diagonal
      const mag = Math.sqrt(moveX * moveX + moveZ * moveZ);
      this._localX += (moveX / mag) * frameSpeed;
      this._localZ += (moveZ / mag) * frameSpeed;
      // Character faces the direction of movement (camera yaw when moving fwd)
      this._localFacing = this._cameraYaw;
    }

    // ── POSITION & BOB ───────────────────────────────────────────────
    const groundY  = me.groundY ?? 11;
    const t        = performance.now() / 1000;
    const bobAmt   = moving ? 1.2 : 0.2;
    const bobSpeed = moving ? 9 : 1.5;

    me.group.position.set(
      this._localX,
      groundY + Math.sin(t * bobSpeed) * bobAmt,
      this._localZ
    );
    // Character faces direction of travel
    me.group.rotation.y = this._localFacing;
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
        entry.group.position.set(entry.x, entry.groundY ?? 11, entry.y);
        // Use server facing if available, otherwise infer from velocity
        if (p.facing !== undefined) {
          entry.group.rotation.y = p.facing;
        } else if (p.vx !== undefined && p.vy !== undefined && (Math.abs(p.vx) + Math.abs(p.vy) > 0.1)) {
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

    const px = me.group.position.x;
    const py = me.group.position.y;
    const pz = me.group.position.z;

    // Roblox-style third person: camera orbits behind player
    // _cameraYaw  = horizontal angle (mouse left/right)
    // _cameraPitch = vertical angle (fixed tilt down)
    const camDist  = 22;   // units behind player
    const camHeight = 8;   // units above player

    const yaw   = this._cameraYaw;
    const pitch = this._cameraPitch;

    // Camera position: behind player based on yaw, elevated by pitch
    const targetCamX = px - Math.sin(yaw) * camDist * Math.cos(pitch);
    const targetCamY = py + camHeight + Math.sin(pitch) * camDist;
    const targetCamZ = pz - Math.cos(yaw) * camDist * Math.cos(pitch);

    // Smooth follow — fast enough to feel responsive
    const lerpSpeed = 0.18;
    this.camera.position.x += (targetCamX - this.camera.position.x) * lerpSpeed;
    this.camera.position.y += (targetCamY - this.camera.position.y) * lerpSpeed;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * lerpSpeed;

    // Always look at player (slightly above feet for nice angle)
    this.camera.lookAt(px, py + 6, pz);
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
    if (this._inputInterval) { clearInterval(this._inputInterval); this._inputInterval = null; }
    if (this.renderer) {
      this.renderer.dispose();
      document.getElementById('pixelio-3d-canvas')?.remove();
    }
    this.players.clear();
    this.buildings = [];
    document.exitPointerLock?.();
    this._localX = null;
    this._localZ = null;
    console.log('🗑️ 3D Engine destroyed');
  }
}

window.Pixelio3D = Pixelio3D;


function renderModelPreview(canvas, skinId, skinColors) {
  if (!canvas || typeof THREE === 'undefined') return;
  if (canvas._previewCleanup) { canvas._previewCleanup(); canvas._previewCleanup = null; }

  const w = canvas.width  || 160;
  const h = canvas.height || 200;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(50, 80, 50);
  scene.add(sun);

  const colorHex = (skinColors && skinColors[skinId]) ? skinColors[skinId] : 0x8899cc;

  let frame, angle = 0;

  function startPreview(group) {
    // Auto-fit camera to model
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(center.x, center.y, center.z + maxDim * 1.6);
    camera.lookAt(center);

    function animate() {
      frame = requestAnimationFrame(animate);
      angle += 0.012;
      group.rotation.y = angle;
      renderer.render(scene, camera);
    }
    animate();
  }

  if (window._fbxModelCache) {
    const fbx = window._fbxModelCache.clone();
    // Apply color tint
    const col = new THREE.Color(colorHex);
    fbx.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        child.material = mats.map(m => { const nm = m.clone(); nm.color = col; return nm; });
        if (mats.length === 1 && Array.isArray(child.material)) child.material = child.material[0];
      }
    });
    // Scale to preview size
    const box = new THREE.Box3().setFromObject(fbx);
    const sz = new THREE.Vector3(); box.getSize(sz);
    const maxD = Math.max(sz.x, sz.y, sz.z);
    if (maxD > 0) fbx.scale.setScalar(45 / maxD);
    fbx.rotation.x = 0;
    const box2 = new THREE.Box3().setFromObject(fbx);
    fbx.position.y = -box2.min.y;
    scene.add(fbx);
    startPreview(fbx);
  } else {
    // Fallback procedural
    const group = buildPixelioCharacter(colorHex);
    scene.add(group);
    startPreview(group);
  }

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
