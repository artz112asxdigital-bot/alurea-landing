import { useRef } from 'react';
import { content } from '../content.js';
import { Icon, SplitText } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { gsap, reveal, revealWords, countUp, finePointer, prefersReducedMotion } from '../lib/motion.js';

const { sobre } = content;

export default function Sobre() {
  const root = useRef(null);

  useGsap(root, (el) => {
    revealWords(el.querySelector('.sobre__title'));
    reveal('.sobre__text', { trigger: '.sobre__text', delay: 0.2 });
    reveal('.sobre__list li', { trigger: '.sobre__list', x: -24, y: 0, stagger: 0.1 });
    reveal('.stat', { trigger: '.sobre__stats', y: 32, stagger: 0.1, scale: prefersReducedMotion() ? 1 : 0.94 });
    el.querySelectorAll('[data-count]').forEach((n) => countUp(n, Number(n.dataset.count), n.dataset.suffix));

    if (prefersReducedMotion()) return;
    // parallax sutil do grid de métricas
    gsap.fromTo('.sobre__stats', { y: 32 }, { y: -32, ease: 'none', scrollTrigger: { trigger: el, scrub: true } });

    // tilt 3D nos cards (desktop)
    if (!finePointer()) return;
    el.querySelectorAll('.stat').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 16); rx(-py * 16);
        card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
        card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  });

  return (
    <section ref={root} id="sobre" className="section sobre" aria-labelledby="sobre-title">
      <div className="container sobre__grid">
        <div className="sobre__copy">
          <SplitText as="h2" id="sobre-title" className="sobre__title t-titulo" text={sobre.title} />
          <p className="sobre__text t-sub">{sobre.text}</p>
          <ul className="sobre__list">
            {sobre.list.map((item) => (
              <li key={item} className="t-menor">
                <Icon name="check" size={20} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <ul className="sobre__stats">
          {sobre.stats.map((s) => (
            <li key={s.label} className="stat">
              <Icon name={s.icon} size={32} className="stat__icon" />
              <strong className="stat__value" data-count={s.value} data-suffix={s.suffix}>
                {s.value}{s.suffix}
              </strong>
              <span className="stat__label">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
