/** Número corto con coma decimal: 5 → "5", 0.35 → "0,35", 7.50 → "7,5". */
export const fmt = (v: number, d: number) =>
  d === 0 ? String(Math.round(v)) : v.toFixed(d).replace(/\.?0+$/, '').replace('.', ',');

/** Número con decimales fijos y coma: 215.9 → "215,9". */
export const fmtFix = (v: number, d: number) => v.toFixed(d).replace('.', ',');
