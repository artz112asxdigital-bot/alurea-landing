import * as THREE from 'three';

/**
 * Carrossel curvo 3D dos parceiros (o "cilindro" côncavo do Figma).
 * Cards no lado interno de um cilindro; a câmera fica dentro dele.
 * Gira sozinho, acelera com a velocidade do scroll e aceita arrastar.
 */
const CARD_W = 336.7;
const CARD_H = 399;
const GAP = 12.5;
const SETS = 4; // 3 parceiros x 4 = 12 cards no anel

const cardVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const cardFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uHover;
  uniform vec2 uSize;
  float roundedBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundedBox(p, uSize * 0.5, 8.0);
    float alpha = 1.0 - smoothstep(-1.0, 1.0, d);
    vec2 uv = (vUv - 0.5) / (1.0 + uHover * 0.04) + 0.5;
    vec3 col = texture2D(uTex, uv).rgb;
    col *= 0.92 + uHover * 0.18;
    gl_FragColor = vec4(col, alpha);
  }
`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Compõe foto + overlay + logo num canvas (2x) para virar textura. */
async function buildTexture(partner, maxAniso) {
  const [photo, logo] = await Promise.all([
    loadImage(`/img/partners/${partner.photo}.webp`),
    loadImage(`/img/partners/${partner.logo}.svg`),
  ]);
  const s = 2;
  const c = document.createElement('canvas');
  c.width = Math.round(CARD_W * s);
  c.height = Math.round(CARD_H * s);
  const ctx = c.getContext('2d');
  // foto em "cover"
  const r = Math.max(c.width / photo.width, c.height / photo.height) * 1.08;
  const w = photo.width * r;
  const h = photo.height * r;
  ctx.drawImage(photo, (c.width - w) / 2, (c.height - h) / 2, w, h);
  // overlay escuro para contraste do logo (como no Figma)
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, 'rgba(7,18,29,0.35)');
  g.addColorStop(1, 'rgba(7,18,29,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const [lx, ly, lw, lh] = partner.logoBox;
  ctx.drawImage(logo, lx * s, ly * s, lw * s, lh * s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export class PartnersCarousel {
  constructor(canvas, partners, { reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.running = false;
    this.rotation = 0;
    this.velocity = 0;
    this.scrollBoost = 0;
    this.drag = null;
    this.hovered = null;
    this.pointer = new THREE.Vector2(-10, -10);
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 1, 5000);
    this.ring = new THREE.Group();
    this.scene.add(this.ring);

    const total = partners.length * SETS;
    this.step = CARD_W + GAP;
    this.radius = (total * this.step) / (Math.PI * 2);
    this.angleStep = (Math.PI * 2) / total;
    this.cards = [];

    // geometria curva acompanhando o cilindro
    const arc = CARD_W / this.radius;
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 24, 1);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const theta = (p.getX(i) / CARD_W) * arc;
      p.setX(i, Math.sin(theta) * this.radius);
      p.setZ(i, this.radius - Math.cos(theta) * this.radius);
    }
    geo.computeVertexNormals();

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    for (let i = 0; i < total; i++) {
      const partner = partners[i % partners.length];
      const uniforms = { uTex: { value: null }, uHover: { value: 0 }, uSize: { value: new THREE.Vector2(CARD_W, CARD_H) } };
      const mat = new THREE.ShaderMaterial({ vertexShader: cardVert, fragmentShader: cardFrag, uniforms, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      const holder = new THREE.Group();
      holder.rotation.y = -i * this.angleStep;
      mesh.position.z = -this.radius; // lado interno do cilindro, virado para o centro
      holder.add(mesh);
      this.ring.add(holder);
      mesh.userData = { uniforms, partner, hover: 0 };
      this.cards.push(mesh);
    }

    this.ready = Promise.all(partners.map((pt) => buildTexture(pt, maxAniso))).then((textures) => {
      this.cards.forEach((m, i) => { m.material.uniforms.uTex.value = textures[i % partners.length]; });
      this.textures = textures;
      this.render();
    });

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onLeave = () => { this.pointer.set(-10, -10); };
    window.addEventListener('resize', this.resize);
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerleave', this.onLeave);
    window.addEventListener('pointerup', this.onUp);
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // enquadra ~3 cards na largura (≈ 1048px no Figma), com a câmera um pouco atrás do centro
    const visible = Math.min(3.1, Math.max(1.25, w / 340)) * this.step;
    this.camera.position.set(0, 0, this.radius * 0.08);
    const dist = this.radius + this.camera.position.z;
    const hFov = 2 * Math.atan(visible / 2 / dist);
    this.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hFov / 2) / this.camera.aspect));
    this.camera.updateProjectionMatrix();
    this.render();
  }

  onDown(e) {
    this.drag = { x: e.clientX, rot: this.rotation, t: performance.now() };
    this.canvas.setPointerCapture?.(e.pointerId);
    this.canvas.style.cursor = 'grabbing';
  }

  onMove(e) {
    const r = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (!this.drag) return;
    const dx = e.clientX - this.drag.x;
    const next = this.drag.rot + (dx / this.radius) * 0.9;
    this.velocity = (next - this.rotation) * 0.6;
    this.rotation = next;
    if (!this.running) this.render();
  }

  onUp() {
    if (!this.drag) return;
    this.drag = null;
    this.canvas.style.cursor = '';
  }

  /** Recebe a velocidade do scroll (px/s) para dar "inércia" ao anel. */
  boost(v) { this.scrollBoost = THREE.MathUtils.clamp(v / 4000, -0.02, 0.02); }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.getDelta();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  loop() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.drag) {
      const auto = this.reduced ? 0 : -0.08 * dt;
      this.velocity *= 0.92;
      this.scrollBoost *= 0.9;
      this.rotation += auto + this.velocity + this.scrollBoost;
    }
    // hover
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.cards, false)[0]?.object || null;
    this.canvas.style.cursor = this.drag ? 'grabbing' : hit ? 'grab' : '';
    this.cards.forEach((m) => {
      const target = m === hit ? 1 : 0;
      m.userData.hover += (target - m.userData.hover) * 0.12;
      m.material.uniforms.uHover.value = m.userData.hover;
    });
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  }

  render() {
    this.ring.rotation.y = this.rotation;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
    this.cards[0]?.geometry.dispose();
    this.cards.forEach((m) => m.material.dispose());
    this.textures?.forEach((t) => t.dispose());
    this.renderer.dispose();
  }
}
