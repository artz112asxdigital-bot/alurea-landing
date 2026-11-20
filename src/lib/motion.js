import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
if (import.meta.env.DEV && typeof window !== 'undefined') Object.assign(window, { __gsap: gsap, __ST: ScrollTrigger });

export { gsap, ScrollTrigger };

export const EASE_OUT = 'expo.out';
export const EASE = 'power3.out';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis = null;
export const getLenis = () => lenis;

/** Scroll suave (Lenis) sincronizado com o ScrollTrigger. Desligado em reduced motion. */
export function initSmoothScroll() {
  if (prefersReducedMotion() || lenis) return () => {};
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  if (import.meta.env.DEV) window.__lenis = lenis;
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = null;
  };
}

/** Rola até uma âncora usando Lenis quando disponível. */
export function scrollToTarget(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/**
 * Reveal padrão da SPEC: fade + translateY(24px), dispara 1x a ~15–20% da viewport.
 * Em reduced motion: apenas fade curto.
 */
export function reveal(targets, opts = {}) {
  const reduced = prefersReducedMotion();
  const { trigger, stagger = 0.08, y = 24, delay = 0, start = 'top 82%', duration = 0.8, ...rest } = opts;
  return gsap.from(targets, {
    autoAlpha: 0,
    y: reduced ? 0 : y,
    duration: reduced ? 0.3 : duration,
    ease: EASE,
    stagger: reduced ? 0 : stagger,
    delay,
    clearProps: 'transform,visibility,opacity',
    scrollTrigger: { trigger: trigger || targets, start, once: true },
    ...rest,
  });
}

/** Revela as palavras de um <SplitText> com máscara. */
export function revealWords(root, opts = {}) {
  const words = root.querySelectorAll('.split-inner');
  if (!words.length) return null;
  const reduced = prefersReducedMotion();
  const { trigger = root, start = 'top 85%', delay = 0, stagger = 0.06, scroll = true } = opts;
  return gsap.from(words, {
    yPercent: reduced ? 0 : 110,
    autoAlpha: reduced ? 0 : 1,
    duration: reduced ? 0.3 : 1,
    ease: EASE_OUT,
    stagger: reduced ? 0 : stagger,
    delay,
    scrollTrigger: scroll ? { trigger, start, once: true } : undefined,
  });
}

/** Contador animado ao entrar na viewport; reduced motion mostra o valor final. */
export function countUp(el, value, suffix = '') {
  if (prefersReducedMotion()) {
    el.textContent = `${value}${suffix}`;
    return null;
  }
  const obj = { v: 0 };
  el.textContent = `0${suffix}`;
  return gsap.to(obj, {
    v: value,
    duration: 2,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    onUpdate: () => { el.textContent = `${Math.round(obj.v)}${suffix}`; },
  });
}
