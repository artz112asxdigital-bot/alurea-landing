import { useEffect, useRef } from 'react';
import Hero from './sections/Hero.jsx';
import Sobre from './sections/Sobre.jsx';
import Hoteis from './sections/Hoteis.jsx';
import Beneficios from './sections/Beneficios.jsx';
import Depoimentos from './sections/Depoimentos.jsx';
import Experiencia from './sections/Experiencia.jsx';
import Parceria from './sections/Parceria.jsx';
import Cta from './sections/Cta.jsx';
import Footer from './sections/Footer.jsx';
import { gsap, initSmoothScroll, ScrollTrigger } from './lib/motion.js';

export default function App() {
  const progress = useRef(null);

  useEffect(() => {
    const stop = initSmoothScroll();
    const bar = gsap.to(progress.current, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
    // recalcula posições quando fontes e imagens terminam de carregar
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      stop();
      bar.scrollTrigger?.kill();
      bar.kill();
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div ref={progress} className="scroll-progress" aria-hidden="true" />
      <Hero />
      <main id="conteudo">
        <Sobre />
        <Hoteis />
        <Beneficios />
        <Depoimentos />
        <Experiencia />
        <Parceria />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
