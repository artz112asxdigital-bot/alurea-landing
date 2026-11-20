import { useRef } from 'react';
import { content } from '../content.js';
import { Button, SplitText } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { useWebGLScene } from '../lib/useWebGL.js';
import { gsap, reveal, revealWords, prefersReducedMotion } from '../lib/motion.js';
import { DustField } from '../three/DustField.js';

const { cta } = content;

export default function Cta() {
  const root = useRef(null);
  const canvas = useRef(null);
  const dust = useRef(null);

  useWebGLScene(canvas, (c) => new DustField(c, { reduced: prefersReducedMotion(), count: window.innerWidth < 768 ? 120 : 260 }), {
    onCreate: (s) => { dust.current = s; },
  });

  useGsap(root, (el) => {
    const rm = prefersReducedMotion();
    revealWords(el.querySelector('.cta__title'), { stagger: 0.07 });
    reveal('.cta__text', { trigger: '.cta__text', delay: 0.2 });
    reveal('.cta__btn', { trigger: '.cta__text', delay: 0.35, scale: rm ? 1 : 0.9 });
    if (rm) return;
    gsap.fromTo('.cta__img', { scale: 1.25, yPercent: -8 }, {
      scale: 1, yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (st) => { if (dust.current) dust.current.progress = st.progress; } },
    });
  });

  return (
    <section ref={root} id="cta" className="section cta" aria-labelledby="cta-title">
      <div className="cta__bg" aria-hidden="true">
        <img className="cta__img" src="/img/cta.webp" alt="" width="2400" height="1600" loading="lazy" />
        <div className="cta__shade" />
        <canvas ref={canvas} className="cta__canvas" />
      </div>
      <div className="container cta__content">
        <SplitText as="h2" id="cta-title" className="cta__title t-maior" text={cta.title} />
        <p className="cta__text t-menor">{cta.text}</p>
        <Button href="#hoteis" variant="gold" size="md" className="cta__btn">{cta.button}</Button>
      </div>
    </section>
  );
}
