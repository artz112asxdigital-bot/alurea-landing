import { useRef } from 'react';
import { content } from '../content.js';
import { Icon, SplitText } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { gsap, reveal, revealWords, prefersReducedMotion } from '../lib/motion.js';

const { beneficios } = content;
const MAP_W = 875;
const MAP_H = 479;
const PIN = { w: 26.7, h: 32.3 };
const PIN_MAIN = { w: 39.3, h: 47.4 };

const pins = beneficios.pins.map((p) => {
  const s = p.main ? PIN_MAIN : PIN;
  return { ...p, ...s, tipX: p.x + s.w / 2, tipY: p.y + s.h };
});
const origin = pins.find((p) => p.main);

function arcPath(a, b) {
  const mx = (a.tipX + b.tipX) / 2;
  const my = (a.tipY + b.tipY) / 2;
  const dist = Math.hypot(b.tipX - a.tipX, b.tipY - a.tipY);
  return `M${a.tipX},${a.tipY} Q${mx},${my - dist * 0.35} ${b.tipX},${b.tipY}`;
}

export default function Beneficios() {
  const root = useRef(null);
  const reduced = typeof window !== 'undefined' && prefersReducedMotion();

  useGsap(root, (el) => {
    const rm = prefersReducedMotion();
    revealWords(el.querySelector('.beneficios__title'));
    reveal('.beneficio', { trigger: '.beneficios__grid', stagger: 0.1, y: 32 });
    if (!rm) {
      gsap.from('.beneficio__icon', {
        scale: 0, rotation: -90, duration: 0.9, ease: 'back.out(1.8)', stagger: 0.1,
        scrollTrigger: { trigger: '.beneficios__grid', start: 'top 82%', once: true },
      });
    }

    // Mapa — momento wow: mapa entra em 3D, pinos caem em sequência e rotas são traçadas com o scroll
    revealWords(el.querySelector('.mapa__title'), { stagger: 0.08 });
    const map = el.querySelector('.mapa');
    gsap.from('.mapa__img', {
      autoAlpha: 0, y: rm ? 0 : 64, rotationX: rm ? 0 : 35, scale: rm ? 1 : 0.9, transformOrigin: '50% 100%',
      duration: rm ? 0.3 : 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: map, start: 'top 85%', once: true },
    });
    const pinsEls = el.querySelectorAll('.pin');
    gsap.from(pinsEls, {
      y: rm ? 0 : -48, autoAlpha: 0, duration: rm ? 0.3 : 0.8, ease: 'bounce.out', stagger: rm ? 0 : 0.12,
      scrollTrigger: { trigger: map, start: 'top 65%', once: true },
    });

    const routes = el.querySelectorAll('.mapa__route');
    routes.forEach((r) => {
      const len = r.getTotalLength();
      r.style.strokeDasharray = `${len}`;
      r.style.strokeDashoffset = rm ? '0' : `${len}`;
    });
    if (!rm) {
      gsap.to(routes, {
        strokeDashoffset: 0, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: map, start: 'top 70%', end: 'center 45%', scrub: 0.6 },
      });
      gsap.from('.mapa__dots', { autoAlpha: 0, duration: 0.6, scrollTrigger: { trigger: map, start: 'center 50%', once: true } });
      // leve parallax do mapa
      gsap.fromTo('.mapa__stage', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: map, scrub: true } });
    }
  });

  return (
    <section ref={root} id="beneficios" className="section beneficios" aria-labelledby="beneficios-title">
      <div className="container">
        <SplitText as="h2" id="beneficios-title" className="beneficios__title t-titulo" text={beneficios.title} />
        <ul className="beneficios__grid">
          {beneficios.items.map((b) => (
            <li key={b.title} className="beneficio">
              <span className="beneficio__icon"><Icon name={b.icon} size={32} /></span>
              <h3 className="beneficio__title">{b.title}</h3>
              <p className="beneficio__text">{b.text}</p>
            </li>
          ))}
        </ul>

        <SplitText as="h2" className="mapa__title t-maior" text={beneficios.mapTitle} />

        <div className="mapa">
          <div className="mapa__stage" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
            <img className="mapa__img" src="/img/world-map.svg" alt="Mapa-múndi com destinos atendidos pela Alurea" width={MAP_W} height={MAP_H} loading="lazy" />

            <svg className="mapa__routes" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
              <defs>
                <linearGradient id="route-g" x1="0" x2="1">
                  <stop offset="0" stopColor="#1b453d" />
                  <stop offset="1" stopColor="#d5ab71" />
                </linearGradient>
              </defs>
              {pins.filter((p) => !p.main).map((p) => (
                <path key={p.label} id={`route-${p.label}`} className="mapa__route" d={arcPath(origin, p)} />
              ))}
              {!reduced && (
                <g className="mapa__dots">
                  {pins.filter((p) => !p.main).map((p, i) => (
                    <circle key={p.label} r="3" className="mapa__dot">
                      <animateMotion dur={`${3 + (i % 3)}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" rotate="auto">
                        <mpath href={`#route-${p.label}`} />
                      </animateMotion>
                    </circle>
                  ))}
                </g>
              )}
            </svg>

            {pins.map((p) => (
              <div
                key={p.label}
                className={`pin ${p.main ? 'pin--main' : ''}`}
                style={{ left: `${(p.x / MAP_W) * 100}%`, top: `${(p.y / MAP_H) * 100}%` }}
              >
                <span className="pin__pulse" aria-hidden="true" />
                <img src={p.main ? '/img/pin-lg.svg' : '/img/pin.svg'} alt="" aria-hidden="true" className="pin__icon" />
                <span className="pin__label">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
