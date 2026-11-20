import { useRef } from 'react';
import { content } from '../content.js';
import { SplitText, Stars } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { gsap, revealWords, prefersReducedMotion, EASE_OUT } from '../lib/motion.js';

const { depoimentos } = content;

export default function Depoimentos() {
  const root = useRef(null);

  useGsap(root, (el) => {
    const rm = prefersReducedMotion();
    revealWords(el.querySelector('.depoimentos__title'), { stagger: 0.05 });
    const cards = el.querySelectorAll('.depo');
    gsap.from(cards, {
      autoAlpha: 0, y: rm ? 0 : 80, rotation: rm ? 0 : (i) => [-4, 0, 4][i % 3],
      duration: rm ? 0.3 : 1.1, ease: EASE_OUT, stagger: rm ? 0 : 0.12,
      scrollTrigger: { trigger: '.depoimentos__grid', start: 'top 82%', once: true },
    });
    if (rm) return;
    // estrelas acendem uma a uma
    gsap.from('.depo .stars img', {
      scale: 0, duration: 0.4, ease: 'back.out(2.5)', stagger: 0.05,
      scrollTrigger: { trigger: '.depoimentos__grid', start: 'top 75%', once: true },
    });
    // cards em profundidades diferentes no scroll
    el.querySelectorAll('.depo-wrap').forEach((c, i) => {
      gsap.fromTo(c, { y: [24, 48, 24][i % 3] }, { y: [-24, -48, -24][i % 3], ease: 'none', scrollTrigger: { trigger: el, scrub: true } });
    });
  });

  return (
    <section ref={root} id="depoimentos" className="section depoimentos" aria-labelledby="depoimentos-title">
      <div className="container">
        <SplitText as="h2" id="depoimentos-title" className="depoimentos__title t-maior" text={depoimentos.title} />
        <ul className="depoimentos__grid">
          {depoimentos.items.map((d) => (
            <li key={d.author} className="depo-wrap">
              <figure className="depo">
                <div className="depo__head">
                  <img className="depo__avatar" src={`/img/${d.avatar}.webp`} alt="" width="40" height="40" loading="lazy" />
                  <Stars color="gold" />
                </div>
                <blockquote className="depo__quote">{d.quote}</blockquote>
                <figcaption className="depo__author">{d.author}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
