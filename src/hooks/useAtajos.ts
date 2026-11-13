'use client';

import { useEffect, useRef } from 'react';

export type MapaAtajos = Record<string, (e: KeyboardEvent) => void>;

/**
 * Atajos de teclado. Claves: 'ArrowLeft', '1', 'o', 'mod+p' (Ctrl o ⌘), '?'.
 * Las teclas sueltas no se disparan mientras escribís en un campo.
 */
export function useAtajos(mapa: MapaAtajos) {
  const ref = useRef(mapa);
  useEffect(() => { ref.current = mapa; });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const escribiendo = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      const mod = e.ctrlKey || e.metaKey;
      const tecla = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const clave = mod ? `mod+${tecla}` : tecla;
      const fn = ref.current[clave];
      if (!fn) return;
      if (!mod && (escribiendo || e.altKey)) return;
      e.preventDefault();
      fn(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
