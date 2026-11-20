import { useRef } from 'react';
import { content } from '../content.js';
import { SplitText } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { useWebGLScene } from '../lib/useWebGL.js';
import { gsap, reveal, revealWords, prefersReducedMotion, ScrollTrigger } from '../lib/motion.js';
import { PartnersCarousel } from '../three/PartnersCarousel.js';

const { parceria } = content;

export default function Parceria() {
  const root = useRef(null);
  const canvas = useRef(null);
  const carousel = useRef(null);

  useWebGLScene(canvas, (c) => new PartnersCarousel(c, parceria.partners, { reduced: prefersReducedMotion() }), {
    onCreate: (s) => { carousel.current = s; },
  });

  useGsap(root, (el) => {
    const rm = prefersReducedMotion();
    revealWords(el.querySelector('.parceria__title'));
    reveal('.parceria__text', { trigger: '.parceria__text', delay: 0.15 });
    gsap.from('.parceria__stage', {
      autoAlpha: 0, scale: rm ? 1 : 0.85, y: rm ? 0 : 48, duration: rm ? 0.3 : 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.parceria__stage', start: 'top 85%', once: true },
    });
    if (rm) return;
    // a velocidade do scroll empurra o anel 3D
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onUpdate: (st) => carousel.current?.boost(st.getVelocity()),
    });
  });

  return (
    <section ref={root} id="parceiros" className="section parceria" aria-labelledby="parceria-title">
      <div className="container">
        <header className="section-head parceria__head">
          <SplitText as="h2" id="parceria-title" className="parceria__title t-titulo" text={parceria.title} />
          <p className="parceria__text t-sub">{parceria.text}</p>
        </header>

        <div className="parceria__stage">
          <canvas ref={canvas} className="parceria__canvas" aria-hidden="true" />
          {/* fallback sem WebGL e conteúdo acessível */}
          <ul className="parceria__fallback">
            {parceria.partners.map((p) => (
              <li key={p.name} className="partner-card">
                <img src={`/img/partners/${p.photo}.webp`} alt="" className="partner-card__photo" loading="lazy" />
                <img src={`/img/partners/${p.logo}.svg`} alt={p.name} className="partner-card__logo" loading="lazy" />
              </li>
            ))}
          </ul>
          <div className="parceria__mask-sides" aria-hidden="true" />
          <p className="parceria__hint" aria-hidden="true">arraste para explorar</p>
        </div>
      </div>
    </section>
  );
}
