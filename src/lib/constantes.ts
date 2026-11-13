/** 1 mm en px CSS (96 dpi) y 1 pt en mm. */
export const MM = 96 / 25.4;
export const PT = 25.4 / 72;

export type PapelClave = 'letter' | 'a4' | 'halfLetter' | 'a5' | 'moleskine';
export type PatronClave = 'dots' | 'lines' | 'grid' | 'isometric' | 'calligraphy' | 'music';
export type Orientacion = 'portrait' | 'landscape';
export type PosEncabezado = 'top' | 'bottom';

export const PAPELES: Record<PapelClave, { label: string; w: number; h: number }> = {
  letter: { label: 'Carta', w: 215.9, h: 279.4 },
  a4: { label: 'A4', w: 210, h: 297 },
  halfLetter: { label: 'Media carta', w: 139.7, h: 215.9 },
  a5: { label: 'A5', w: 148, h: 210 },
  moleskine: { label: 'Moleskine', w: 130, h: 210 },
};

export const PATRONES: { key: PatronClave; label: string; def: number; thumb: number }[] = [
  { key: 'dots', label: 'Puntos', def: 5, thumb: 4 },
  { key: 'lines', label: 'Líneas', def: 7, thumb: 5 },
  { key: 'grid', label: 'Cuadrícula', def: 5, thumb: 4 },
  { key: 'isometric', label: 'Isométrico', def: 5, thumb: 5 },
  { key: 'calligraphy', label: 'Caligrafía', def: 10, thumb: 9 },
  { key: 'music', label: 'Pentagrama', def: 16, thumb: 13 },
];

export const ETIQUETA_ESPACIADO: Record<PatronClave, string> = {
  dots: 'Distancia entre puntos',
  lines: 'Alto de renglón',
  grid: 'Tamaño de celda',
  isometric: 'Tamaño de celda',
  calligraphy: 'Alto de renglón',
  music: 'Distancia entre pentagramas',
};

export const LOGOS = [
  { key: 'umg', label: 'UMG', src: '/logos/logo-mariano.webp', aspect: 685 / 662 },
  { key: 'usac', label: 'USAC', src: '/logos/logo-usac.webp', aspect: 1 },
  { key: 'url', label: 'URL', src: '/logos/logo-url.webp', aspect: 577 / 474 },
  { key: 'uvg', label: 'UVG', src: '/logos/logo-uvg.webp', aspect: 273 / 868 },
] as const;

export const COLORES = [
  { hex: '#9AA0A6', label: 'Gris' },
  { hex: '#C4C7CA', label: 'Gris claro' },
  { hex: '#4A5350', label: 'Grafito' },
  { hex: '#2E5AAC', label: 'Azul' },
];

export interface Ajustes {
  name: string;
  cardId: string;
  paper: PapelClave;
  orientation: Orientacion;
  pattern: PatronClave;
  spacing: number;
  weight: number;
  color: string;
  opacity: number;
  mTop: number;
  mBottom: number;
  mSide: number;
  showHeader: boolean;
  headerSize: number;
  headerPos: PosEncabezado;
  showLogo: boolean;
  logo: string;
  customLogo: string | null;
  logoW: number;
  logoBottom: number;
  logoOpacity: number;
  clearLogo: boolean;
  pages: number;
  pageNumbers: boolean;
  duplex: boolean;
  gutter: number;
  marks: boolean;
}

export const DEF: Ajustes = {
  name: 'Josue C.',
  cardId: '2024-01-847',
  paper: 'letter',
  orientation: 'portrait',
  pattern: 'dots',
  spacing: 5,
  weight: 0.35,
  color: '#9AA0A6',
  opacity: 0.7,
  mTop: 15,
  mBottom: 18,
  mSide: 15,
  showHeader: true,
  headerSize: 10,
  headerPos: 'bottom',
  showLogo: true,
  logo: 'umg',
  customLogo: null,
  logoW: 26,
  logoBottom: 9,
  logoOpacity: 1,
  clearLogo: true,
  pages: 1,
  pageNumbers: false,
  duplex: false,
  gutter: 6,
  marks: true,
};

export const CLAVE_STORAGE = 'gridj3-v2-ajustes';
