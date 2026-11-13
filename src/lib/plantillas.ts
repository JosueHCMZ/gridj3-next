import type { Ajustes } from './constantes';

export interface Plantilla {
  key: string;
  label: string;
  /** Para qué sirve, en una frase. */
  hint: string;
  /** Solo lo que cambia: nombre, carnet y logo subido se conservan. */
  ajustes: Partial<Ajustes>;
}

export const PLANTILLAS: Plantilla[] = [
  {
    key: 'apuntes',
    label: 'Apuntes',
    hint: 'Renglones de 7 mm en carta, con tu nombre abajo.',
    ajustes: {
      paper: 'letter', orientation: 'portrait', pattern: 'lines', spacing: 7, weight: 0.3,
      color: '#9AA0A6', opacity: 0.7, mTop: 20, mBottom: 18, mSide: 15,
      showHeader: true, headerPos: 'bottom', showLogo: true, marks: false,
    },
  },
  {
    key: 'bullet',
    label: 'Bullet journal',
    hint: 'Puntos de 5 mm en A5, sin logo ni marcas.',
    ajustes: {
      paper: 'a5', orientation: 'portrait', pattern: 'dots', spacing: 5, weight: 0.4,
      color: '#9AA0A6', opacity: 0.75, mTop: 10, mBottom: 12, mSide: 10,
      showHeader: false, showLogo: false, marks: false,
    },
  },
  {
    key: 'ingenieria',
    label: 'Ingeniería',
    hint: 'Cuadrícula azul de 5 mm con marcas de margen.',
    ajustes: {
      paper: 'letter', orientation: 'portrait', pattern: 'grid', spacing: 5, weight: 0.2,
      color: '#2E5AAC', opacity: 0.45, mTop: 15, mBottom: 18, mSide: 15,
      showHeader: true, headerPos: 'top', showLogo: true, marks: true,
    },
  },
  {
    key: 'iso',
    label: 'Isométrico',
    hint: 'Trama de 30° en horizontal para dibujo técnico.',
    ajustes: {
      paper: 'letter', orientation: 'landscape', pattern: 'isometric', spacing: 5, weight: 0.15,
      color: '#9AA0A6', opacity: 0.6, mTop: 12, mBottom: 15, mSide: 12,
      showHeader: true, headerPos: 'bottom', showLogo: false, marks: true,
    },
  },
  {
    key: 'caligrafia',
    label: 'Caligrafía',
    hint: 'Renglón de 10 mm con guía de altura-x.',
    ajustes: {
      paper: 'letter', orientation: 'portrait', pattern: 'calligraphy', spacing: 10, weight: 0.35,
      color: '#4A5350', opacity: 0.6, mTop: 18, mBottom: 18, mSide: 18,
      showHeader: false, showLogo: false, marks: false,
    },
  },
  {
    key: 'partitura',
    label: 'Partitura',
    hint: 'Pentagramas cada 16 mm con encabezado arriba.',
    ajustes: {
      paper: 'letter', orientation: 'portrait', pattern: 'music', spacing: 16, weight: 0.3,
      color: '#4A5350', opacity: 0.75, mTop: 22, mBottom: 15, mSide: 15,
      showHeader: true, headerPos: 'top', showLogo: false, marks: false,
    },
  },
];

/** ¿Los ajustes actuales coinciden con la plantilla? (para marcarla como activa) */
export const coincide = (s: Ajustes, p: Plantilla) =>
  (Object.keys(p.ajustes) as (keyof Ajustes)[]).every((k) => s[k] === p.ajustes[k]);
