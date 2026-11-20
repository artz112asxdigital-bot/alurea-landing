import { useLayoutEffect } from 'react';
import { gsap } from './motion.js';

/** Executa animações GSAP com escopo no ref e limpa tudo no unmount. */
export function useGsap(scopeRef, fn, deps = []) {
  useLayoutEffect(() => {
    if (!scopeRef.current) return undefined;
    const ctx = gsap.context(() => fn(scopeRef.current), scopeRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
