import { PAPELES, PT, type Ajustes, type PatronClave } from './constantes';

export type Seg = [number, number, number, number];
export type Punto = [number, number];
export interface Geometria {
  dots: Punto[];
  lines: Seg[];
  lines2: Seg[];
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Liang–Barsky: devuelve [t0, t1] del tramo del segmento dentro del rectángulo, o null. */
export function clipT(
  x1: number, y1: number, x2: number, y2: number,
  xmin: number, ymin: number, xmax: number, ymax: number,
): [number, number] | null {
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  const p = [-dx, dx, -dy, dy], q = [x1 - xmin, xmax - x1, y1 - ymin, ymax - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
      else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
  }
  return [t0, t1];
}

/**
 * Geometría de un patrón dentro del rectángulo (x0, y0, w, h) con paso s.
 * El patrón se centra para que el sobrante quede igual a cada lado.
 * `hole` es un rectángulo [x0, y0, x1, y1] que se deja libre (detrás del logo).
 */
export function geom(
  pat: PatronClave, x0: number, y0: number, w: number, h: number, s: number,
  hole: [number, number, number, number] | null,
): Geometria {
  const dots: Punto[] = [], lines: Seg[] = [], lines2: Seg[] = [];
  const x1 = x0 + w, y1 = y0 + h;
  const nx = Math.floor(w / s + 1e-6), ny = Math.floor(h / s + 1e-6);
  const ox = x0 + (w - nx * s) / 2, oy = y0 + (h - ny * s) / 2;

  const push = (arr: Seg[], a: number, b: number, c: number, d: number) => {
    if (!hole) { arr.push([a, b, c, d]); return; }
    const t = clipT(a, b, c, d, hole[0], hole[1], hole[2], hole[3]);
    if (!t || t[1] - t[0] < 1e-6) { arr.push([a, b, c, d]); return; }
    const dx = c - a, dy = d - b;
    if (t[0] > 1e-4) arr.push([a, b, a + dx * t[0], b + dy * t[0]]);
    if (t[1] < 1 - 1e-4) arr.push([a + dx * t[1], b + dy * t[1], c, d]);
  };
  const inHole = (x: number, y: number) =>
    !!hole && x >= hole[0] && x <= hole[2] && y >= hole[1] && y <= hole[3];

  if (pat === 'dots') {
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const x = ox + i * s, y = oy + j * s;
      if (!inHole(x, y)) dots.push([x, y]);
    }
  } else if (pat === 'lines') {
    for (let j = 0; j <= ny; j++) push(lines, x0, oy + j * s, x1, oy + j * s);
  } else if (pat === 'grid') {
    for (let j = 0; j <= ny; j++) push(lines, ox, oy + j * s, ox + nx * s, oy + j * s);
    for (let i = 0; i <= nx; i++) push(lines, ox + i * s, oy, ox + i * s, oy + ny * s);
  } else if (pat === 'calligraphy') {
    for (let j = 1; j <= ny; j++) {
      const base = oy + j * s;
      push(lines, x0, base, x1, base);
      push(lines2, x0, base - s * 0.42, x1, base - s * 0.42);
    }
  } else if (pat === 'music') {
    const g = Math.min(2.4, Math.max(1.2, s * 0.13)), st = 4 * g;
    const n = Math.max(1, Math.floor((h - st) / s + 1e-6) + 1);
    const top = y0 + (h - ((n - 1) * s + st)) / 2;
    for (let k = 0; k < n; k++) for (let l = 0; l < 5; l++) {
      const y = top + k * s + l * g;
      push(lines, x0, y, x1, y);
    }
  } else if (pat === 'isometric') {
    for (let i = 0; i <= nx; i++) push(lines, ox + i * s, y0, ox + i * s, y1);
    const L = (2 * s) / Math.sqrt(3), k = 1 / Math.sqrt(3);
    const span = w * k;
    const jMin = Math.floor((y0 - oy - span) / L) - 1, jMax = Math.ceil((y1 - oy + span) / L) + 1;
    for (const sg of [1, -1]) {
      for (let j = jMin; j <= jMax; j++) {
        const c = oy + j * L;
        const ya = c + sg * (x0 - ox) * k, yb = c + sg * (x1 - ox) * k;
        const t = clipT(x0, ya, x1, yb, x0, y0, x1, y1);
        if (!t || t[1] - t[0] < 1e-6) continue;
        const dx = x1 - x0, dy = yb - ya;
        push(lines, x0 + dx * t[0], ya + dy * t[0], x0 + dx * t[1], ya + dy * t[1]);
      }
    }
  }
  return { dots, lines, lines2 };
}

export const dotsD = (a: Punto[]) => a.map((p) => `M${r2(p[0])} ${r2(p[1])}h0`).join('');
export const linesD = (a: Seg[]) => a.map((l) => `M${r2(l[0])} ${r2(l[1])}L${r2(l[2])} ${r2(l[3])}`).join('');

/** Luminancia relativa WCAG de un #rrggbb. */
export function lum(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function dims(s: Ajustes) {
  const P = PAPELES[s.paper] ?? PAPELES.letter;
  const land = s.orientation === 'landscape';
  return { P, pw: land ? P.h : P.w, ph: land ? P.w : P.h };
}

export type Diseno = ReturnType<typeof layout>;

/** Todo lo que hace falta para dibujar la página `idx` (vista previa y PDF usan lo mismo). */
export function layout(s: Ajustes, idx: number, aspect: number) {
  const { pw, ph } = dims(s);
  let mL = s.mSide, mR = s.mSide;
  if (s.duplex && s.gutter) { if (idx % 2 === 0) mL += s.gutter; else mR += s.gutter; }
  const area: [number, number, number, number] = [mL, s.mTop, pw - mR, ph - s.mBottom];
  const fs = s.headerSize * PT;
  const baseline = s.headerPos === 'top'
    ? Math.max(s.mTop, 6) / 2 + fs * 0.35
    : ph - Math.max(s.mBottom, 6) / 2 + fs * 0.35;
  const numBaseline = ph - Math.max(s.mBottom, 6) / 2 + fs * 0.35;
  const lw = s.logoW, lh = lw * aspect;
  const lx = (mL + pw - mR) / 2 - lw / 2, ly = ph - s.logoBottom - lh;
  const pad = 1.5;
  const hole: [number, number, number, number] | null =
    s.showLogo && s.clearLogo ? [lx - pad, ly - pad, lx + lw + pad, ly + lh + pad] : null;
  const g = geom(s.pattern, area[0], area[1], area[2] - area[0], area[3] - area[1], s.spacing, hole);
  const t = 4;
  const marks: Seg[] = [];
  if (s.marks) {
    const [a, b, c, d] = area;
    marks.push(
      [a, b, a + t, b], [a, b, a, b + t], [c, b, c - t, b], [c, b, c, b + t],
      [a, d, a + t, d], [a, d, a, d - t], [c, d, c - t, d], [c, d, c, d - t],
    );
  }
  return { pw, ph, mL, mR, area, fs, baseline, numBaseline, lw, lh, lx, ly, g, marks };
}

/** Avisos de impresión: cosas que en papel salen mal aunque en pantalla se vean bien. */
export function avisos(s: Ajustes, L: Diseno): string[] {
  const out: string[] = [];
  const eff = 1 - s.opacity * (1 - lum(s.color));
  if (eff > 0.8) out.push('El trazo es muy claro para el papel. En impresoras láser puede no salir; subí la opacidad o elegí un color más oscuro.');
  if (s.pattern === 'dots' && s.weight < 0.25) out.push('Los puntos de menos de 0,25 mm se pierden en muchas impresoras de tinta.');
  if (Math.min(s.mTop, s.mBottom, s.mSide) < 5) out.push('Con márgenes de menos de 5 mm, la mayoría de las impresoras recorta el borde.');
  if (s.showLogo && (L.ly < 0 || L.ly + L.lh > L.ph)) out.push('El logo se sale de la hoja.');
  if (s.showLogo && s.showHeader && (s.name || s.cardId)) {
    const hw = ((s.name || '').length + (s.cardId || '').length * 0.85) * L.fs * 0.52 + 2;
    const hx0 = L.mL, hx1 = L.mL + hw, hy0 = L.baseline - L.fs, hy1 = L.baseline + L.fs * 0.3;
    if (hx1 > L.lx && hx0 < L.lx + L.lw && hy1 > L.ly && hy0 < L.ly + L.lh) out.push('El logo tapa el encabezado. Mové uno de los dos.');
  }
  return out;
}
