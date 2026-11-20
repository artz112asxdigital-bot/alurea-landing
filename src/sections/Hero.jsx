import { useRef } from 'react';
import { content } from '../content.js';
import { SplitText, Button, Logo } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { useWebGLScene } from '../lib/useWebGL.js';
import { gsap, EASE_OUT, prefersReducedMotion } from '../lib/motion.js';
import { HeroScene } from '../three/HeroScene.js';

const { hero } = content;

export default function Hero() {
  const root = useRef(null);
  const canvas = useRef(null);
  const sceneRef = useRef(null);

  useWebGLScene(canvas, (c) => new HeroScene(c, { src: '/img/hero-hd.webp', reduced: prefersReducedMotion() }), {
    onCreate: (s) => { sceneRef.current = s; },
  });

  useGsap(root, (el) => {
    const reduced = prefersReducedMotion();
    const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

    // Entrada orquestrada (≤ 1.2s até o CTA): logo → headline por palavra → sub → CTAs
    tl.from('.hero__logo', { autoAlpha: 0, y: reduced ? 0 : -16, duration: 0.8 }, 0)
      .from('.hero__title .split-inner', { yPercent: reduced ? 0 : 110, autoAlpha: reduced ? 0 : 1, duration: 1, stagger: reduced ? 0 : 0.04 }, 0.1)
      .from('.hero__sub', { autoAlpha: 0, y: reduced ? 0 : 24, duration: 0.8 }, 0.45)
      .from('.hero__ctas > *', { autoAlpha: 0, y: reduced ? 0 : 24, duration: 0.7, stagger: 0.08 }, 0.6)
      .from('.hero__scroll', { autoAlpha: 0, duration: 0.6 }, 1.1);

    // "Acender" a cena WebGL
    const intro = { v: reduced ? 1 : 0 };
    gsap.to(intro, {
      v: 1, duration: reduced ? 0 : 2.4, ease: 'power2.inOut', delay: 0.1,
      onUpdate: () => { if (sceneRef.current) sceneRef.current.intro = intro.v; },
    });

    if (reduced) return;

    // Saída no scroll: conteúdo sobe e some, cena dá zoom e escurece
    gsap.to('.hero__content', {
      yPercent: -18, autoAlpha: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom 20%', scrub: true },
    });
    gsap.to({}, {
      scrollTrigger: {
        trigger: el, start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (st) => { if (sceneRef.current) sceneRef.current.scroll = st.progress; },
      },
    });
  });

  return (
    <header ref={root} className="hero" id="topo">
      <div className="hero__bg" aria-hidden="true">
        <img className="hero__fallback" src="/img/hero.webp" alt="" width="1024" height="576" fetchpriority="high" />
        <canvas ref={canvas} className="hero__canvas" />
        <div className="hero__shade" />
      </div>

      <div className="hero__content container">
        <a href="#topo" className="hero__logo" aria-label="Alurea — hotels & stays, início">
          <Logo size="sm" as="span" />
        </a>

        <div className="hero__copy">
          <SplitText as="h1" className="hero__title t-maior" text={hero.title} />
          <p className="hero__sub t-sub">{hero.subtitle}</p>
        </div>

        <div className="hero__ctas">
          <Button href="#cta" variant="green" size="lg">{hero.ctaPrimary}</Button>
          <Button href="#hoteis" variant="glass" size="lg">{hero.ctaSecondary}</Button>
        </div>
      </div>

      <a href="#sobre" className="hero__scroll" aria-label="Rolar para a próxima seção">
        <span />
      </a>
    </header>
  );
}
