import { useRef } from 'react';
import { content } from '../content.js';
import { Button, Icon, SplitText } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { gsap, reveal, revealWords, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

const { experiencia } = content;

export default function Experiencia() {
  const root = useRef(null);

  useGsap(root, (el) => {
    const rm = prefersReducedMotion();
    revealWords(el.querySelector('.experiencia__title'));
    reveal('.experiencia__sub', { trigger: '.experiencia__sub', delay: 0.15 });
    // itens entram alternando dos lados
    gsap.from('.exp-item', {
      autoAlpha: 0, x: rm ? 0 : (i) => (i % 2 === 0 ? -64 : 64), duration: rm ? 0.3 : 1, ease: EASE_OUT, stagger: rm ? 0 : 0.1,
      scrollTrigger: { trigger: '.experiencia__grid', start: 'top 82%', once: true },
    });
    if (!rm) {
      gsap.from('.exp-item .icon', {
        scale: 0, rotation: -180, duration: 0.8, ease: 'back.out(2)', stagger: 0.1, delay: 0.3,
        scrollTrigger: { trigger: '.experiencia__grid', start: 'top 82%', once: true },
      });
    }
    reveal('.experiencia__cta', { trigger: '.experiencia__cta' });
  });

  return (
    <section ref={root} id="experiencias" className="section experiencia" aria-labelledby="experiencia-title">
      <div className="container">
        <header className="section-head">
          <SplitText as="h2" id="experiencia-title" className="experiencia__title t-titulo" text={experiencia.title} />
          <p className="experiencia__sub t-sub">{experiencia.subtitle}</p>
        </header>
        <ul className="experiencia__grid">
          {experiencia.items.map((item) => (
            <li key={item} className="exp-item t-menor">
              <Icon name="check-dark" size={24} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="experiencia__cta">
          <Button href="#cta" variant="gold" size="md">{experiencia.cta}</Button>
        </div>
      </div>
    </section>
  );
}
