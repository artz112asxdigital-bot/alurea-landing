import { useRef } from 'react';
import { content } from '../content.js';
import { Button, SplitText, Stars } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { gsap, reveal, revealWords, finePointer, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

const { hoteis } = content;

export default function Hoteis() {
  const root = useRef(null);

  useGsap(root, (el) => {
    const reduced = prefersReducedMotion();
    revealWords(el.querySelector('.hoteis__title'));
    reveal('.hoteis__sub', { trigger: '.hoteis__sub', delay: 0.15 });

    // cards: sobem em sequência e a foto "desembaça" com zoom-out
    const cards = el.querySelectorAll('.hotel-card');
    gsap.from(cards, {
      y: reduced ? 0 : 64, autoAlpha: 0, rotationX: reduced ? 0 : 12, transformOrigin: '50% 100%',
      duration: reduced ? 0.3 : 1.1, ease: EASE_OUT, stagger: reduced ? 0 : 0.1,
      scrollTrigger: { trigger: '.hoteis__cards', start: 'top 80%', once: true },
    });
    if (!reduced) {
      gsap.from('.hotel-card__img', {
        scale: 1.35, duration: 1.6, ease: EASE_OUT, stagger: 0.1,
        scrollTrigger: { trigger: '.hoteis__cards', start: 'top 80%', once: true },
      });
    }
    reveal('.hoteis__cta', { trigger: '.hoteis__cta' });

    if (reduced || !finePointer()) return;
    cards.forEach((card) => {
      const img = card.querySelector('.hotel-card__img');
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const ix = gsap.quickTo(img, 'x', { duration: 0.8, ease: 'power3.out' });
      const iy = gsap.quickTo(img, 'y', { duration: 0.8, ease: 'power3.out' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 10); rx(-py * 10); ix(-px * 16); iy(-py * 16);
        card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
        card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); ix(0); iy(0); });
    });
  });

  return (
    <section ref={root} id="hoteis" className="section hoteis" aria-labelledby="hoteis-title">
      <div className="container">
        <header className="section-head">
          <SplitText as="h2" id="hoteis-title" className="hoteis__title t-titulo" text={hoteis.title} />
          <p className="hoteis__sub t-sub">{hoteis.subtitle}</p>
        </header>

        <ul className="hoteis__cards">
          {hoteis.cards.map((c) => (
            <li key={c.city} className="hotel-card">
              <img className="hotel-card__img" src={`/img/${c.img}.webp`} alt={`${c.hotel}, ${c.city}`} width="900" height="640" loading="lazy" />
              <div className="hotel-card__overlay" aria-hidden="true" />
              <div className="hotel-card__shine" aria-hidden="true" />
              <div className="hotel-card__info">
                <h3 className="hotel-card__city">{c.city}</h3>
                <p className="hotel-card__hotel">{c.hotel}</p>
                <Stars color="white" />
              </div>
            </li>
          ))}
        </ul>

        <div className="hoteis__cta">
          <Button href="#cta" variant="navy" size="md">{hoteis.cta}</Button>
        </div>
      </div>
    </section>
  );
}
