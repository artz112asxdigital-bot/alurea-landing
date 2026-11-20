import { useRef } from 'react';
import { content } from '../content.js';
import { Logo } from '../components/ui.jsx';
import { useGsap } from '../lib/useGsap.js';
import { reveal } from '../lib/motion.js';
import { scrollToTarget } from '../lib/motion.js';

const { footer } = content;

export default function Footer() {
  const root = useRef(null);
  useGsap(root, () => {
    reveal('.footer__logo', { trigger: '.footer__logo', start: 'top 95%' });
    reveal('.footer__links li, .footer__copy', { trigger: '.footer__bottom', start: 'top 98%', stagger: 0.06 });
  });

  return (
    <footer ref={root} className="footer">
      <div className="container">
        <a
          href="#topo"
          className="footer__logo"
          aria-label="Voltar ao topo"
          onClick={(e) => { e.preventDefault(); scrollToTarget('#topo'); }}
        >
          <Logo size="lg" as="span" />
        </a>
        <div className="footer__bottom">
          <ul className="footer__links">
            {footer.links.map((l) => (
              <li key={l.label}><a href={l.href} className="footer__link">{l.label}</a></li>
            ))}
          </ul>
          <p className="footer__copy">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
