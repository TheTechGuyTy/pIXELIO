// ============================================================
//  PIXELIO GAME ENGINE  —  clean rewrite
//  Roblox-style third-person, pointer-lock mouse look
// ============================================================

class PixelioGame {
  constructor(mySocketId, mapSize) {
    this.myId     = mySocketId;
    this.mapSize  = mapSize || 2000;
    this.half     = this.mapSize / 2;
    this.players  = new Map();   // socketId → { mesh, x, z, ry }
    this.destroyed = false;

    // Player state
    this.px = (Math.random() - 0.5) * 800;  // random spawn X
    this.pz = (Math.random() - 0.5) * 800;  // random spawn Z
    this.ry = 0;          // player yaw (horizontal rotation)
    this.camPitch = 0.3;  // camera pitch (vertical angle)
    this.speed = 18;      // units/second

    this._initScene();
    this._initMyPlayer();
    this._clock = new THREE.Clock();
    this._animate();
  }

  // ----------------------------------------------------------
  //  SCENE SETUP
  // ----------------------------------------------------------
  _initScene() {
    const container = document.getElementById('game-3d-container');
    if (!container) throw new Error('game-3d-container not found');

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'pixelio-3d-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    container.innerHTML = '';
    container.appendChild(canvas);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 400, 1200);

    // Camera — behind player, Roblox-style
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xfffbe8, 1.2);
    sun.position.set(200, 400, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far  = 1500;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -600;
    sun.shadow.camera.right = sun.shadow.camera.top   =  600;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.mapSize, this.mapSize, 40, 40),
      new THREE.MeshLambertMaterial({ color: 0x4a7c3f })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid overlay — subtle
    const grid = new THREE.GridHelper(this.mapSize, 80, 0x000000, 0x000000);
    grid.material.opacity = 0.06;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Map border walls (visual only)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x334422 });
    const wallGeo = new THREE.BoxGeometry(this.mapSize, 20, 8);
    [-1,1].forEach(sign => {
      const wN = new THREE.Mesh(wallGeo, wallMat);
      wN.position.set(0, 10, sign * this.half);
      this.scene.add(wN);
      const wE = new THREE.Mesh(new THREE.BoxGeometry(8, 20, this.mapSize), wallMat);
      wE.position.set(sign * this.half, 10, 0);
      this.scene.add(wE);
    });

    // Resize handler
    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this._onResize);
  }

  // ----------------------------------------------------------
  //  SPAWN MY PLAYER
  // ----------------------------------------------------------
  _initMyPlayer() {
    const mesh = this._makeProcedural(0x667eea);
    mesh.position.set(this.px, 0, this.pz);
    this.scene.add(mesh);
    this.myMesh = mesh;

    // Also put in players map
    this.players.set(this.myId, { mesh, x: this.px, z: this.pz, ry: 0 });

    // Try FBX if loaded
    if (window._fbxModelCache) {
      this._swapToFBX(this.myId, 0x667eea);
    } else {
      loadFBXModel((fbx) => {
        if (!fbx || this.destroyed) return;
        this._swapToFBX(this.myId, 0x667eea);
      });
    }
  }

  _makeProcedural(colorHex) {
    if (typeof buildPixelioCharacter === 'function')
      return buildPixelioCharacter(colorHex);
    // Fallback capsule
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: colorHex });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(4, 10, 4, 8) : new THREE.CylinderGeometry(4, 4, 14, 8), mat);
    body.position.y = 12;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 8), mat);
    head.position.y = 24;
    head.castShadow = true;
    g.add(head);
    return g;
  }

  _swapToFBX(socketId, colorHex) {
    const entry = this.players.get(socketId);
    if (!entry || !window._fbxModelCache) return;

    const fbx = window._fbxModelCache.clone();
    // Tint
    const col = new THREE.Color(colorHex);
    fbx.traverse(child => {
      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        child.material = mats.map(m => { const nm = m.clone(); nm.color = col; return nm; });
        if (mats.length === 1 && Array.isArray(child.material)) child.material = child.material[0];
        child.castShadow = true;
      }
    });
    // Scale/orient
    const box = new THREE.Box3().setFromObject(fbx);
    const sz  = new THREE.Vector3(); box.getSize(sz);
    const maxD = Math.max(sz.x, sz.y, sz.z);
    if (maxD > 0) fbx.scale.setScalar(45 / maxD);
    fbx.rotation.set(0, Math.PI, 0);
    const box2 = new THREE.Box3().setFromObject(fbx);
    fbx.position.y = -box2.min.y;

    // Copy position from old mesh
    fbx.position.x = entry.mesh.position.x;
    fbx.position.z = entry.mesh.position.z;
    fbx.rotation.y = entry.mesh.rotation.y;

    this.scene.remove(entry.mesh);
    this.scene.add(fbx);
    entry.mesh = fbx;
    entry.groundY = fbx.position.y;
    if (socketId === this.myId) this.myMesh = fbx;
  }

  // ----------------------------------------------------------
  //  SERVER UPDATE — sync other players
  // ----------------------------------------------------------
  onServerUpdate(playersArray) {
    if (!playersArray || this.destroyed) return;
    const seen = new Set();

    playersArray.forEach(p => {
      seen.add(p.id);
      if (p.id === this.myId) return; // skip self — locally predicted

      if (!this.players.has(p.id)) {
        // Spawn other player
        const color = this._skinColor(p.skin);
        const mesh  = this._makeProcedural(color);
        const wx = p.x - this.half;
        const wz = p.y - this.half; // server uses y for z
        mesh.position.set(wx, 0, wz);
        this.scene.add(mesh);
        this.players.set(p.id, { mesh, x: wx, z: wz, ry: 0 });

        // Try FBX swap
        if (window._fbxModelCache) this._swapToFBX(p.id, color);
      }

      const entry = this.players.get(p.id);
      if (!entry) return;
      const tx = p.x - this.half;
      const tz = p.y - this.half;
      // Smooth interpolation
      entry.x += (tx - entry.x) * 0.25;
      entry.z += (tz - entry.z) * 0.25;
      const gy = entry.mesh.userData.groundY || entry.groundY || 0;
      entry.mesh.position.set(entry.x, gy, entry.z);
      if (p.vx !== undefined && (Math.abs(p.vx) + Math.abs(p.vy)) > 0.1) {
        entry.mesh.rotation.y = Math.atan2(p.vx, p.vy);
      }
    });

    // Remove disconnected
    this.players.forEach((entry, id) => {
      if (id !== this.myId && !seen.has(id)) {
        this.scene.remove(entry.mesh);
        this.players.delete(id);
      }
    });
  }

  _skinColor(skinId) {
    const map = { default:0x667eea, pink:0xFF69B4, gold:0xFFD700, shadow:0x444466,
                  galaxy:0x9370DB, cyber:0x00FFFF, flame:0xFF4500, ocean:0x1E90FF };
    return map[skinId] || 0x667eea;
  }

  // ----------------------------------------------------------
  //  ANIMATION LOOP
  // ----------------------------------------------------------
  _animate() {
    if (this.destroyed) return;
    this._rafId = requestAnimationFrame(() => this._animate());
    const delta = Math.min(this._clock.getDelta(), 0.05);
    this._update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  _update(delta) {
    const k = window._pixelioKeys || {};

    // Mouse look — consume accumulated mouseDX
    const sensitivity = 0.003;
    const dx = window._mouseDX || 0;
    window._mouseDX = 0;
    this.ry -= dx * sensitivity;

    // Camera pitch (scroll wheel or hold nothing — fixed for now)
    const camDist  = 80;   // distance behind player
    const camHeight = 50;  // height above player

    // Movement relative to yaw
    let moveX = 0, moveZ = 0;
    if (k['w'] || k['arrowup'])    { moveX += Math.sin(this.ry); moveZ += Math.cos(this.ry); }
    if (k['s'] || k['arrowdown'])  { moveX -= Math.sin(this.ry); moveZ -= Math.cos(this.ry); }
    if (k['a'] || k['arrowleft'])  { moveX += Math.sin(this.ry - Math.PI/2); moveZ += Math.cos(this.ry - Math.PI/2); }
    if (k['d'] || k['arrowright']) { moveX += Math.sin(this.ry + Math.PI/2); moveZ += Math.cos(this.ry + Math.PI/2); }

    // Normalise diagonal
    const len = Math.sqrt(moveX*moveX + moveZ*moveZ);
    if (len > 0) {
      moveX = (moveX / len) * this.speed * delta;
      moveZ = (moveZ / len) * this.speed * delta;
    }

    // Apply movement — clamp to map bounds
    this.px = Math.max(-this.half + 10, Math.min(this.half - 10, this.px + moveX));
    this.pz = Math.max(-this.half + 10, Math.min(this.half - 10, this.pz + moveZ));

    // Face direction of movement (or keep last facing if still)
    if (len > 0) {
      const targetRY = Math.atan2(moveX, moveZ);
      // Shortest-path lerp
      let diff = targetRY - this._facingRY;
      if (diff >  Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      this._facingRY = (this._facingRY || 0) + diff * 0.25;
    }

    // Apply to mesh
    if (this.myMesh) {
      const gy = this.myMesh.userData?.groundY ?? this.myMesh.position.y;
      const bob = len > 0 ? Math.sin(Date.now() * 0.008) * 0.8 : 0;
      this.myMesh.position.set(this.px, gy + bob, this.pz);
      this.myMesh.rotation.y = (this._facingRY || 0) + Math.PI;
    }

    // Camera — orbit behind player based on yaw
    const camX = this.px - Math.sin(this.ry) * camDist;
    const camZ = this.pz - Math.cos(this.ry) * camDist;
    this.camera.position.set(camX, camHeight, camZ);
    this.camera.lookAt(this.px, 12, this.pz);

    // Emit position to server
    if (window._gameActive && this._emitThrottle === undefined) this._emitThrottle = 0;
    if (window._gameActive && window.socket) {
      this._emitThrottle = (this._emitThrottle || 0) + delta;
      if (this._emitThrottle > 0.05) { // 20hz
        this._emitThrottle = 0;
        window.socket.emit('player-input', {
          x: this.px + this.half,
          y: this.pz + this.half,
          vx: moveX / delta || 0,
          vy: moveZ / delta || 0,
          rotation: this._facingRY || 0
        });
      }
    }
  }

  // ----------------------------------------------------------
  destroy() {
    this.destroyed = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    window.removeEventListener('resize', this._onResize);
    if (this.renderer) this.renderer.dispose();
    const canvas = document.getElementById('pixelio-3d-canvas');
    if (canvas) canvas.remove();
    document.exitPointerLock?.();
  }
}

window.PixelioGame = PixelioGame;
