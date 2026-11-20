import { useRef, useEffect } from 'react';
import { gsap, finePointer, prefersReducedMotion, scrollToTarget } from '../lib/motion.js';

/** Divide o texto em palavras com máscara para o reveal; leitores de tela leem o texto inteiro. */
export function SplitText({ as: Tag = 'span', text, className = '', ...rest }) {
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text} {...rest}>
      {words.map((w, i) => (
        <span className="split-word" aria-hidden="true" key={i}>
          <span className="split-inner">{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/** Botão/link com efeito magnético (apenas desktop com ponteiro fino). */
export function Button({ href = '#', variant = 'green', size = 'md', magnetic = true, children, className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !magnetic || !finePointer() || prefersReducedMotion()) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [magnetic]);

  const onClick = (e) => {
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      scrollToTarget(href);
    }
  };

  return (
    <a ref={ref} href={href} onClick={onClick} className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {children}
    </a>
  );
}

export function Icon({ name, size = 24, className = '' }) {
  return (
    <img
      src={`/img/icons/${name}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={`icon icon-${size} ${className}`}
      loading="lazy"
    />
  );
}

export function Stars({ color = 'white', label = '5 de 5 estrelas' }) {
  return (
    <span className="stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <img key={i} src={`/img/icons/star-${color}.svg`} width="16" height="16" alt="" aria-hidden="true" />
      ))}
    </span>
  );
}

export function Logo({ size = 'sm', as: Tag = 'div' }) {
  return (
    <Tag className={`logo logo--${size}`}>
      <span className="logo__name">alurea</span>
      <span className="logo__tag">hotels &amp; stays</span>
    </Tag>
  );
}
