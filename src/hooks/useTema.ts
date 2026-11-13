'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { CLAVE_TEMA as CLAVE } from '@/lib/tema';

export type Tema = 'claro' | 'oscuro';

function leer(): Tema {
  return document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro';
}

function suscribir(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  return () => obs.disconnect();
}

export function useTema() {
  const tema = useSyncExternalStore(suscribir, leer, () => 'claro' as Tema);
  const alternar = useCallback(() => {
    const next: Tema = leer() === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.dataset.tema = next;
    try { localStorage.setItem(CLAVE, next); } catch { /* modo privado */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'oscuro' ? '#232220' : '#ffffff');
  }, []);
  return { tema, alternar };
}
