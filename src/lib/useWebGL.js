import { useEffect } from 'react';

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/**
 * Cria uma cena Three.js num canvas e só anima enquanto ela está visível
 * (economiza GPU/bateria). `factory(canvas)` retorna um objeto com start/stop/dispose.
 */
export function useWebGLScene(canvasRef, factory, { rootMargin = '100px', onCreate } = {}) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) return undefined;
    let scene;
    try {
      scene = factory(canvas);
    } catch (err) {
      console.warn('WebGL indisponível:', err);
      return undefined;
    }
    canvas.dataset.ready = 'true';
    onCreate?.(scene);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? scene.start() : scene.stop()), { rootMargin });
    io.observe(canvas);
    const onVis = () => (document.hidden ? scene.stop() : null);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      scene.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
