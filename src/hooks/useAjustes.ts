'use client';

import { useCallback, useEffect, useState } from 'react';
import { CLAVE_STORAGE, DEF, LOGOS, type Ajustes } from '@/lib/constantes';
import { leerHash, limpiarHash, sanear } from '@/lib/compartir';

function leerGuardado(): Ajustes {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    if (!raw) return DEF;
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const s: Ajustes = { ...DEF, ...sanear(obj) };
    // El logo subido no pasa por sanear (es una data URL): se valida aparte.
    if (typeof obj.customLogo === 'string' && obj.customLogo.startsWith('data:image/')) {
      s.customLogo = obj.customLogo;
      if (obj.logo === 'custom') s.logo = 'custom';
    }
    return s;
  } catch {
    return DEF;
  }
}

function guardar(s: Ajustes) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(s));
  } catch {
    // Sin espacio (logo muy pesado): se guarda todo menos el logo.
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify({ ...s, customLogo: null, logo: s.logo === 'custom' ? DEF.logo : s.logo }));
    } catch { /* modo privado */ }
  }
}

export function logoSrc(s: Ajustes) {
  if (s.logo === 'custom' && s.customLogo) return s.customLogo;
  return (LOGOS.find((l) => l.key === s.logo) ?? LOGOS[0]).src;
}

/**
 * Ajustes de la hoja: arrancan en DEF (lo que sale en el HTML estático),
 * luego se cargan los guardados y, si la URL trae una hoja compartida,
 * esa manda.
 */
export function useAjustes() {
  const [s, setS] = useState<Ajustes>(DEF);
  const [cargado, setCargado] = useState(false);
  const [compartida, setCompartida] = useState(false);
  const [aspectoCustom, setAspectoCustom] = useState<number | null>(null);

  useEffect(() => {
    const guardado = leerGuardado();
    const delHash = leerHash();
    if (delHash) limpiarHash();
    // Carga diferida a propósito: el HTML estático se generó con DEF.
    queueMicrotask(() => {
      setS(delHash ? { ...guardado, ...delHash } : guardado);
      setCompartida(!!delHash);
      setCargado(true);
    });
  }, []);

  useEffect(() => {
    if (cargado) guardar(s);
  }, [s, cargado]);

  // Proporción del logo subido (los institucionales ya la traen).
  const custom = s.logo === 'custom' ? s.customLogo : null;
  useEffect(() => {
    if (!custom) return;
    const img = new Image();
    img.onload = () => { if (img.naturalWidth) setAspectoCustom(img.naturalHeight / img.naturalWidth); };
    img.src = custom;
  }, [custom]);

  const update = useCallback((patch: Partial<Ajustes>) => setS((prev) => ({ ...prev, ...patch })), []);
  const reset = useCallback(() => setS(DEF), []);

  const aspect = custom
    ? (aspectoCustom ?? 1)
    : (LOGOS.find((l) => l.key === s.logo) ?? LOGOS[0]).aspect;

  return { s, update, reset, cargado, compartida, aspect };
}
