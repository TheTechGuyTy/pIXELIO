// ============================================================
// PIXELIO 3D ENGINE — clean rewrite
// Three.js r128 compatible
// ============================================================

// ── DEFAULT CHARACTER (r128 safe, no CapsuleGeometry) ───────
function buildPixelioCharacter(colorHex) {
  const g    = new THREE.Group();
  const col  = new THREE.Color(colorHex || 0x667eea);
  const mat  = new THREE.MeshLambertMaterial({ color: col });
  const dark = new THREE.MeshLambertMaterial({ color: col.clone().multiplyScalar(0.55) });
  const eye  = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const pup  = new THREE.MeshLambertMaterial({ color: 0x111111 });

  const add = (geo, m, x, y, z) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    g.add(o);
  };

  add(new THREE.SphereGeometry(5, 10, 8),          mat,  0, 28,  0); // head
  add(new THREE.SphereGeometry(1.4, 8, 6),         eye, -2.2, 29.5, 4.8);
  add(new THREE.SphereGeometry(1.4, 8, 6),         eye,  2.2, 29.5, 4.8);
  add(new THREE.SphereGeometry(0.7, 6, 4),         pup, -2.2, 29.5, 5.7);
  add(new THREE.SphereGeometry(0.7, 6, 4),         pup,  2.2, 29.5, 5.7);
  add(new THREE.CylinderGeometry(2, 2.5, 3, 8),    dark, 0, 23, 0);   // neck
  add(new THREE.CylinderGeometry(4.5, 4, 12, 10),  mat,  0, 14, 0);   // torso
  add(new THREE.CylinderGeometry(1.8, 1.5, 10, 8), mat, -7, 14, 0);   // L arm
  add(new THREE.CylinderGeometry(1.8, 1.5, 10, 8), mat,  7, 14, 0);   // R arm
  add(new THREE.SphereGeometry(2.2, 8, 6),         dark, -7, 8.5, 0); // L hand
  add(new THREE.SphereGeometry(2.2, 8, 6),         dark,  7, 8.5, 0); // R hand
  add(new THREE.CylinderGeometry(2.5, 2, 10, 8),   dark, -3.5, 1, 0); // L thigh
  add(new THREE.CylinderGeometry(2.5, 2, 10, 8),   dark,  3.5, 1, 0); // R thigh
  add(new THREE.CylinderGeometry(2, 1.8, 9, 8),    mat, -3.5, -7, 0); // L shin
  add(new THREE.CylinderGeometry(2, 1.8, 9, 8),    mat,  3.5, -7, 0); // R shin

  // feet
  [-3.5, 3.5].forEach(x => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(2.3, 8, 6), mat);
    f.scale.set(1, 0.6, 1.5);
    f.position.set(x, -12, 1);
    f.castShadow = true;
    g.add(f);
  });

  g.scale.setScalar(1.6);
  g.position.y = 20; // feet at ground level
  return g;
}
window.buildPixelioCharacter = buildPixelioCharacter;

// ── MAIN ENGINE ──────────────────────────────────────────────
class Pixelio3D {
  constructor() {
    this.scene      = new THREE.Scene();
    this.camera     = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.5, 10000);
    this.renderer   = null;
    this.players    = new Map(); // id -> { group, x, z, groundY }
    this.myId       = null;
    this._mapHalf   = 1000;

    // Movement state
    this._x         = 0;   // local player world X
    this._z         = 0;   // local player world Z
    this._yaw       = 0;   // camera/player horizontal angle (mouse)
    this._speed     = 8;

    // Input interval
    this._inputTick = null;

    this._setup();
    this._loop();
    this._startInputTick();
    console.log('✅ Pixelio3D ready');
  }

  // ── SCENE SETUP ─────────────────────────────────────────
  _setup() {
    // Sky
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 400, 2000);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xfff4cc, 1.2);
    sun.position.set(300, 600, 200);
    sun.castShadow = true;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -600;
    sun.shadow.camera.right = sun.shadow.camera.top   =  600;
    sun.shadow.camera.far   = 2000;
    sun.shadow.mapSize.setScalar(1024);
    this.scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000),
      new THREE.MeshLambertMaterial({ color: 0x5a9e3a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid so you can see movement
    const grid = new THREE.GridHelper(5000, 100, 0x2a6a1a, 0x3a7a2a);
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id    = 'pixelio-3d-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:50;display:block;';
    document.body.appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Clock
    this._clock = new THREE.Clock();
  }

  // ── RENDER LOOP ─────────────────────────────────────────
  _loop() {
    if (!window._gameActive && this._loopStarted) return; // stop if game ended
    this._loopStarted = true;
    requestAnimationFrame(() => this._loop());

    const dt  = Math.min(this._clock.getDelta(), 0.05);
    this._moveLocal(dt);
    this._updateCamera();
    this.renderer.render(this.scene, this.camera);
  }

  // ── LOCAL MOVEMENT ──────────────────────────────────────
  _moveLocal(dt) {
    if (!this.myId) return;
    const k = window._pixelioKeys || {};
    const spd = this._speed;

    const fwdX = Math.sin(this._yaw);
    const fwdZ = Math.cos(this._yaw);
    const strX = Math.sin(this._yaw + Math.PI / 2);
    const strZ = Math.cos(this._yaw + Math.PI / 2);

    let mx = 0, mz = 0;
    if (k['w'] || k['arrowup'])    { mx += fwdX; mz += fwdZ; }
    if (k['s'] || k['arrowdown'])  { mx -= fwdX; mz -= fwdZ; }
    if (k['a'] || k['arrowleft'])  { mx -= strX; mz -= strZ; }
    if (k['d'] || k['arrowright']) { mx += strX; mz += strZ; }

    if (mx !== 0 || mz !== 0) {
      const len = Math.sqrt(mx * mx + mz * mz);
      this._x += (mx / len) * spd * dt * 60;
      this._z += (mz / len) * spd * dt * 60;
    }

    // Apply mouse yaw accumulation
    if (window._mouseDX) {
      this._yaw -= window._mouseDX * 0.003;
      window._mouseDX = 0;
    }

    // Update local player model
    const me = this.players.get(this.myId);
    if (me) {
      const gy = me.groundY ?? 20;
      const bob = (mx !== 0 || mz !== 0)
        ? Math.sin(performance.now() / 120) * 1.5
        : Math.sin(performance.now() / 800) * 0.3;
      me.group.position.set(this._x, gy + bob, this._z);
      me.group.rotation.y = this._yaw;
    }
  }

  // ── CAMERA ──────────────────────────────────────────────
  _updateCamera() {
    const me = this.players.get(this.myId);
    if (!me) {
      // No player yet — default position
      this.camera.position.set(this._x, 30, this._z + 40);
      this.camera.lookAt(this._x, 10, this._z);
      return;
    }

    const px = me.group.position.x;
    const py = me.group.position.y;
    const pz = me.group.position.z;
    const dist   = 28;
    const height = 10;
    const pitch  = 0.22;

    const tCamX = px - Math.sin(this._yaw) * dist * Math.cos(pitch);
    const tCamY = py + height + dist * Math.sin(pitch);
    const tCamZ = pz - Math.cos(this._yaw) * dist * Math.cos(pitch);

    // Smooth follow
    this.camera.position.lerp(new THREE.Vector3(tCamX, tCamY, tCamZ), 0.15);
    this.camera.lookAt(px, py + 8, pz);
  }

  // ── SERVER INPUT TICK ───────────────────────────────────
  _startInputTick() {
    this._inputTick = setInterval(() => {
      if (!window._gameActive) return;
      const sock = window.socket;
      if (!sock) return;
      const k = window._pixelioKeys || {};
      sock.emit('player-input', {
        up:     !!(k['w'] || k['arrowup']),
        down:   !!(k['s'] || k['arrowdown']),
        left:   !!(k['a'] || k['arrowleft']),
        right:  !!(k['d'] || k['arrowright']),
        x:      this._x,
        y:      this._z,
        facing: this._yaw
      });
    }, 50);
  }

  // ── PUBLIC API ───────────────────────────────────────────
  setMyPlayer(id, mapSize) {
    this.myId     = id;
    this._mapHalf = (mapSize || 2000) / 2;
    this._x = 0;
    this._z = 0;
    if (!this.players.has(id)) {
      this._spawn(id, 'default');
    }
  }

  updatePlayers(arr, mapSize) {
    if (!arr) return;
    const half = (mapSize || 2000) / 2;
    const seen = new Set();

    arr.forEach(p => {
      seen.add(p.id);
      if (!this.players.has(p.id)) this._spawn(p.id, p.skin || 'default');

      const entry = this.players.get(p.id);
      if (!entry) return;

      const wx = p.x - half;
      const wz = p.y - half;

      if (p.id === this.myId) {
        // Server reconcile — snap only if very far off
        if (Math.hypot(this._x - wx, this._z - wz) > 80) {
          this._x = wx;
          this._z = wz;
        }
      } else {
        // Smooth interpolate other players
        entry.x = entry.x + (wx - entry.x) * 0.2;
        entry.z = entry.z + (wz - entry.z) * 0.2;
        const gy = entry.groundY ?? 20;
        entry.group.position.set(entry.x, gy, entry.z);
        if (p.facing !== undefined) entry.group.rotation.y = p.facing;
      }
    });

    // Remove players who left
    this.players.forEach((e, id) => {
      if (!seen.has(id)) {
        this.scene.remove(e.group);
        this.players.delete(id);
      }
    });
  }

  createBuildings(buildings, mapSize) {
    if (!buildings) return;
    const half = (mapSize || 2000) / 2;
    buildings.forEach(b => {
      const w  = b.width  || 60;
      const h  = b.height || 50;
      const d  = b.depth  || 60;
      const bx = (b.x || 0) - half;
      const bz = (b.y || 0) - half;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color: 0xc8a870 })
      );
      box.position.set(bx, h / 2, bz);
      box.castShadow = box.receiveShadow = true;
      this.scene.add(box);
    });
  }

  destroy() {
    if (this._inputTick) { clearInterval(this._inputTick); this._inputTick = null; }
    this._loopStarted = false;
    const canvas = document.getElementById('pixelio-3d-canvas');
    if (canvas) canvas.remove();
    if (this.renderer) this.renderer.dispose();
    this.players.clear();
    document.exitPointerLock?.();
    console.log('🗑️ Pixelio3D destroyed');
  }

  // ── INTERNAL SPAWN ───────────────────────────────────────
  _spawn(id, skinId) {
    const color = this.skinColors[skinId] || this.skinColors.default;

    // Try FBX first, fall back to procedural
    if (window._fbxModelCache) {
      const fbx = window._fbxModelCache.clone();
      this._tintFBX(fbx, color);
      this._fitFBX(fbx);
      this.scene.add(fbx);
      this.players.set(id, { group: fbx, x: 0, z: 0, groundY: fbx.position.y });
    } else {
      const grp = buildPixelioCharacter(color);
      this.scene.add(grp);
      this.players.set(id, { group: grp, x: 0, z: 0, groundY: 20 });

      // If FBX still loading, swap when ready
      if (window._fbxLoading) {
        const eng = this;
        const wait = setInterval(() => {
          if (!window._fbxModelCache) return;
          clearInterval(wait);
          const entry = eng.players.get(id);
          if (!entry) return;
          eng.scene.remove(entry.group);
          const fbx2 = window._fbxModelCache.clone();
          eng._tintFBX(fbx2, color);
          eng._fitFBX(fbx2);
          fbx2.position.copy(entry.group.position);
          eng.scene.add(fbx2);
          entry.group   = fbx2;
          entry.groundY = fbx2.position.y;
        }, 200);
      }
    }
  }

  get skinColors() {
    return {
      default: 0x8899cc, pink: 0xFF69B4, gold:   0xFFD700,
      shadow:  0x444466, galaxy: 0x9370DB, cyber: 0x00FFFF,
      flame:   0xFF4500, ocean:  0x1E90FF
    };
  }

  _tintFBX(fbx, color) {
    const c = new THREE.Color(color);
    fbx.traverse(child => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      child.material = mats.map(m => { const n = m.clone(); n.color = c; return n; });
      if (child.material.length === 1) child.material = child.material[0];
      child.castShadow = child.receiveShadow = true;
    });
  }

  _fitFBX(fbx) {
    const box = new THREE.Box3().setFromObject(fbx);
    const sz  = new THREE.Vector3();
    box.getSize(sz);
    const maxDim = Math.max(sz.x, sz.y, sz.z);
    if (maxDim > 0) fbx.scale.setScalar(40 / maxDim);
    fbx.rotation.set(0, Math.PI, 0);
    const box2 = new THREE.Box3().setFromObject(fbx);
    fbx.position.y = -box2.min.y;
  }
}

window.Pixelio3D = Pixelio3D;

// ── MODEL PREVIEW (locker/shop) ─────────────────────────────
function renderModelPreview(canvas, skinId, skinColors) {
  if (!canvas || typeof THREE === 'undefined') return;
  if (canvas._previewCleanup) { canvas._previewCleanup(); canvas._previewCleanup = null; }

  const w = canvas.width || 160, h = canvas.height || 200;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(50, 80, 50);
  scene.add(sun);

  const color = (skinColors && skinColors[skinId]) ? skinColors[skinId] : 0x8899cc;
  const grp = buildPixelioCharacter(color);

  // Fit camera
  scene.add(grp);
  const box = new THREE.Box3().setFromObject(grp);
  const cnt = new THREE.Vector3(); box.getCenter(cnt);
  const sz  = new THREE.Vector3(); box.getSize(sz);
  camera.position.set(cnt.x, cnt.y, cnt.z + Math.max(sz.x, sz.y, sz.z) * 1.6);
  camera.lookAt(cnt);

  let frame, angle = 0;
  function animate() {
    frame = requestAnimationFrame(animate);
    angle += 0.012; grp.rotation.y = angle;
    renderer.render(scene, camera);
  }
  animate();
  canvas._previewCleanup = () => { cancelAnimationFrame(frame); renderer.dispose(); };
}
window.renderModelPreview = renderModelPreview;

// ── FBX LOADER ──────────────────────────────────────────────
window._fbxModelCache = null;
window._fbxLoading    = false;
window._fbxPreloaded  = false;

function preloadFBX() {
  if (window._fbxPreloaded || window._fbxLoading) return;
  if (typeof THREE.FBXLoader === 'undefined') return;
  window._fbxLoading   = true;
  window._fbxPreloaded = true;
  new THREE.FBXLoader().load('/playermodel.fbx',
    fbx => { window._fbxModelCache = fbx; window._fbxLoading = false; console.log('✅ FBX loaded'); },
    null,
    err => { window._fbxLoading = false; console.warn('FBX load failed:', err.message); }
  );
}
window.addEventListener('load', () => setTimeout(preloadFBX, 500));
