import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { COLORES, DEF, LOGOS, PAPELES, PATRONES, type Ajustes } from './constantes';

/**
 * La hoja viaja entera en el hash de la URL (`#h=…`): nunca llega a ningún
 * servidor y el enlace funciona aunque no haya backend. El logo subido
 * (una data URL de cientos de KB) no viaja: quien abre el enlace ve el
 * logo institucional por defecto.
 */
const PARAM = 'h';

/** Solo las claves que difieren del valor por defecto, para que el enlace sea corto. */
export function codificar(s: Ajustes): string {
  const diff: Partial<Record<keyof Ajustes, unknown>> = {};
  for (const k of Object.keys(DEF) as (keyof Ajustes)[]) {
    if (k === 'customLogo') continue;
    if (s[k] !== DEF[k]) diff[k] = s[k];
  }
  if (s.logo === 'custom') diff.logo = DEF.logo;
  return compressToEncodedURIComponent(JSON.stringify(diff));
}

const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : undefined;
const bool = (v: unknown) => (typeof v === 'boolean' ? v : undefined);
const str = (v: unknown, max = 60) => (typeof v === 'string' ? v.slice(0, max) : undefined);
const oneOf = <T extends string>(v: unknown, xs: readonly T[]) =>
  (typeof v === 'string' && (xs as readonly string[]).includes(v) ? (v as T) : undefined);

/** Valida cada campo: el hash lo puede escribir cualquiera. */
export function sanear(raw: Record<string, unknown>): Partial<Ajustes> {
  const color = typeof raw.color === 'string' && /^#[0-9a-f]{6}$/i.test(raw.color) ? raw.color : undefined;
  const out: Partial<Ajustes> = {
    name: str(raw.name),
    cardId: str(raw.cardId, 30),
    paper: oneOf(raw.paper, Object.keys(PAPELES) as (keyof typeof PAPELES)[]),
    orientation: oneOf(raw.orientation, ['portrait', 'landscape'] as const),
    pattern: oneOf(raw.pattern, PATRONES.map((p) => p.key)),
    spacing: num(raw.spacing, 2, 30),
    weight: num(raw.weight, 0.1, 1.2),
    color: color ?? (COLORES.some((c) => c.hex === raw.color) ? (raw.color as string) : undefined),
    opacity: num(raw.opacity, 0.1, 1),
    mTop: num(raw.mTop, 0, 50),
    mBottom: num(raw.mBottom, 0, 50),
    mSide: num(raw.mSide, 0, 40),
    showHeader: bool(raw.showHeader),
    headerSize: num(raw.headerSize, 7, 16),
    headerPos: oneOf(raw.headerPos, ['top', 'bottom'] as const),
    showLogo: bool(raw.showLogo),
    logo: oneOf(raw.logo, LOGOS.map((l) => l.key)),
    logoW: num(raw.logoW, 10, 80),
    logoBottom: num(raw.logoBottom, 0, 150),
    logoOpacity: num(raw.logoOpacity, 0.1, 1),
    clearLogo: bool(raw.clearLogo),
    pages: num(raw.pages, 1, 100),
    pageNumbers: bool(raw.pageNumbers),
    duplex: bool(raw.duplex),
    gutter: num(raw.gutter, 0, 25),
    marks: bool(raw.marks),
  };
  for (const k of Object.keys(out) as (keyof Ajustes)[]) if (out[k] === undefined) delete out[k];
  return out;
}

export function enlaceDe(s: Ajustes): string {
  const u = new URL(window.location.href);
  u.hash = `${PARAM}=${codificar(s)}`;
  u.search = '';
  return u.toString();
}

/** Lee la hoja compartida del hash actual (o null si no hay). */
export function leerHash(): Partial<Ajustes> | null {
  const m = new RegExp(`(?:^#|&)${PARAM}=([^&]+)`).exec(window.location.hash);
  if (!m) return null;
  try {
    const json = decompressFromEncodedURIComponent(m[1]);
    if (!json) return null;
    const raw: unknown = JSON.parse(json);
    if (!raw || typeof raw !== 'object') return null;
    return sanear(raw as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function limpiarHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
