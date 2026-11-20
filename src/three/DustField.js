import * as THREE from 'three';

/** Campo de partículas douradas com "bokeh" para fundos (CTA). Transparente sobre a imagem. */
export class DustField {
  constructor(canvas, { count = 260, reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.running = false;
    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50);
    this.camera.position.z = 10;

    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.uniforms = { uTime: { value: 0 }, uPR: { value: this.renderer.getPixelRatio() }, uProgress: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uPR; uniform float uProgress;
        attribute float aSeed; varying float vA;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * (0.2 + aSeed * 0.4) + aSeed * 30.0) * 0.6 + uProgress * (aSeed - 0.5) * 3.0;
          p.x += cos(uTime * 0.15 + aSeed * 12.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (2.0 + aSeed * 10.0) * uPR * (10.0 / -mv.z);
          vA = 0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0));
        }`,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(1.0, 0.8, 0.45, a * vA * 0.55);
        }`,
    });
    this.scene.add(new THREE.Points(geo, mat));
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  set progress(v) { this.uniforms.uProgress.value = v; }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.running || this.reduced) return;
    this.running = true;
    this.clock.getDelta();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  loop() {
    if (!this.running) return;
    this.uniforms.uTime.value += Math.min(this.clock.getDelta(), 0.05);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    this.scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
    this.renderer.dispose();
  }
}
