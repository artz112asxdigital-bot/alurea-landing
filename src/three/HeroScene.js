import * as THREE from 'three';

/**
 * Cena WebGL do hero:
 *  - Foto do hotel num plano full-screen com shader: grading noturno do Figma,
 *    "acendimento" das janelas na entrada, parallax de mouse, distorção sutil e zoom no scroll.
 *  - Poeira dourada (Points) subindo em profundidade, reagindo ao mouse.
 */
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uImg;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uIntro;   // 0 -> 1 (entrada)
  uniform float uScroll;  // 0 -> 1 (saída do hero)

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    // cover ancorado no topo (como o Figma), com leve zoom
    vec2 s = uRes / uImg;
    float scale = max(s.x, s.y);
    vec2 size = uImg * scale;
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;
    vec2 px = uv * uRes;
    vec2 offset = vec2((size.x - uRes.x) * 0.5, 0.0);
    vec2 tuv = (px + offset) / size;

    float zoom = 1.12 - 0.08 * uIntro + 0.12 * uScroll;
    vec2 center = vec2(0.5, 0.3);
    tuv = (tuv - center) / zoom + center;
    tuv += uMouse * vec2(-0.012, 0.008);
    // ondulação muito sutil (calor da noite)
    tuv.x += sin(tuv.y * 18.0 + uTime * 0.6) * 0.0012;
    tuv.y = 1.0 - tuv.y;

    vec3 col = texture2D(uTex, tuv).rgb;

    // grading noturno: escurece, dessatura e esfria; mantém luz quente das janelas
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    vec3 desat = mix(vec3(lum), col, 0.55);
    vec3 night = desat * vec3(0.30, 0.33, 0.38);
    float warm = smoothstep(0.55, 0.9, lum) * step(col.b * 1.15, col.r);
    float flicker = 0.9 + 0.1 * sin(uTime * 2.0 + hash(floor(tuv * 80.0)) * 6.28);
    vec3 glow = col * vec3(1.05, 0.82, 0.55) * warm * flicker;
    float lights = smoothstep(0.15, 1.0, uIntro);
    col = night + glow * 0.55 * lights;

    // feixe de luz que cruza na entrada
    float beam = smoothstep(0.12, 0.0, abs(vUv.x - (uIntro * 1.6 - 0.3) + (vUv.y - 0.5) * 0.4));
    col += vec3(0.84, 0.67, 0.44) * beam * 0.12 * (1.0 - uIntro);

    // vinheta + escurecimento base para legibilidade do texto
    vec2 q = vUv - 0.5;
    float vig = smoothstep(0.95, 0.2, length(q * vec2(1.0, 1.25)));
    col *= mix(0.55, 1.0, vig);
    col *= mix(1.0, 0.6, smoothstep(0.45, 0.0, vUv.y));

    // entrada a partir do preto e saída no scroll
    col *= smoothstep(0.0, 0.45, uIntro);
    col *= 1.0 - uScroll * 0.6;

    // grão
    col += (hash(vUv * uRes + uTime) - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const dustVert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uScroll;
  attribute float aScale;
  attribute float aSpeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed + uScroll * 4.0, 12.0) - 6.0;
    p.x += sin(uTime * 0.3 + position.z * 2.0) * 0.25;
    p.xy += uMouse * (0.4 + position.z * 0.08);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (28.0 / -mv.z);
    vAlpha = smoothstep(-6.0, -3.0, p.y) * (1.0 - smoothstep(3.0, 6.0, p.y));
  }
`;

const dustFrag = /* glsl */ `
  uniform float uIntro;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0, 0.78, 0.48), a * vAlpha * 0.65 * uIntro);
  }
`;

export class HeroScene {
  constructor(canvas, { src, reduced = false, onReady } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.mouse = new THREE.Vector2();
    this.mouseTarget = new THREE.Vector2();
    this.running = false;
    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.autoClear = false;

    // plano de fundo
    this.bgScene = new THREE.Scene();
    this.bgCam = new THREE.Camera();
    this.uniforms = {
      uTex: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(1920, 1080) },
      uMouse: { value: this.mouse },
      uTime: { value: 0 },
      uIntro: { value: reduced ? 1 : 0 },
      uScroll: { value: 0 },
    };
    this.bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.uniforms, depthWrite: false })));

    // poeira dourada
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.z = 8;
    const count = window.innerWidth < 768 ? 220 : 520;
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      scale[i] = 0.4 + Math.random() * 1.6;
      speed[i] = 0.08 + Math.random() * 0.25;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    this.dustUniforms = {
      uTime: this.uniforms.uTime,
      uIntro: this.uniforms.uIntro,
      uScroll: this.uniforms.uScroll,
      uMouse: this.uniforms.uMouse,
      uPixelRatio: { value: this.renderer.getPixelRatio() },
    };
    this.scene.add(
      new THREE.Points(
        geo,
        new THREE.ShaderMaterial({ vertexShader: dustVert, fragmentShader: dustFrag, uniforms: this.dustUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
      )
    );

    new THREE.TextureLoader().load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      this.uniforms.uTex.value = tex;
      this.uniforms.uImg.value.set(tex.image.width, tex.image.height);
      this.render();
      onReady?.();
    });

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.onPointer = this.onPointer.bind(this);
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    this.resize();
  }

  onPointer(e) {
    this.mouseTarget.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas.parentElement;
    this.renderer.setSize(w, h, false);
    this.uniforms.uRes.value.set(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  set intro(v) { this.uniforms.uIntro.value = v; if (!this.running) this.render(); }
  get intro() { return this.uniforms.uIntro.value; }
  set scroll(v) { this.uniforms.uScroll.value = v; if (!this.running) this.render(); }

  start() {
    if (this.running || this.reduced) return;
    this.running = true;
    this.clock.getDelta();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  loop() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.uniforms.uTime.value += dt;
    this.mouse.lerp(this.mouseTarget, 0.05);
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  }

  render() {
    if (!this.uniforms.uTex.value) return;
    this.renderer.clear();
    this.renderer.render(this.bgScene, this.bgCam);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointer);
    this.bgScene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    this.scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    this.uniforms.uTex.value?.dispose();
    this.renderer.dispose();
  }
}
