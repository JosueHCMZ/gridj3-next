'use client';

import { useEffect, useRef } from 'react';
import type { Ajustes } from '@/lib/constantes';
import { dotsD, linesD, type Diseno } from '@/lib/geometria';

/**
 * Vista previa en SVG, en milímetros reales (viewBox = tamaño del papel).
 * El encabezado se arrastra entre arriba y abajo; el logo, en vertical.
 */
export function Hoja({ s, L, logo, pagina, animar, onUpdate, onEscala }: {
  s: Ajustes; L: Diseno; logo: string; pagina: number; animar: boolean;
  onUpdate: (p: Partial<Ajustes>) => void;
  onEscala: (pxPorMm: number) => void;
}) {
  const marco = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ type: 'header' | 'logo'; y: number; start: number } | null>(null);
  const escala = useRef(onEscala);
  useEffect(() => { escala.current = onEscala; });

  // Escala real (px por mm) para el indicador «Escala %».
  const pw = L.pw;
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => escala.current(e.contentRect.width / pw));
    ro.observe(el);
    return () => ro.disconnect();
  }, [pw]);

  const lw = Math.max(s.weight * 0.5, 0.1);

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !svg.current) return;
    const rect = svg.current.getBoundingClientRect();
    const ppm = rect.width / L.pw;
    if (d.type === 'header') {
      const pos = (e.clientY - rect.top) / ppm < L.ph / 2 ? 'top' : 'bottom';
      if (pos !== s.headerPos) onUpdate({ headerPos: pos });
    } else {
      const next = Math.round(Math.min(L.ph / 2, Math.max(0, d.start - (e.clientY - d.y) / ppm)));
      if (next !== s.logoBottom) onUpdate({ logoBottom: next });
    }
  };
  const fin = () => { drag.current = null; };
  const inicio = (type: 'header' | 'logo') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { type, y: e.clientY, start: s.logoBottom };
  };

  // La clave reinicia el «barrido de impresora» solo cuando cambia la forma de la hoja.
  const claveBarrido = `${s.pattern}-${s.paper}-${s.orientation}`;

  return (
    <div ref={marco} className={animar ? 'hoja-marco animar' : 'hoja-marco'} style={{ '--pw': L.pw, '--ph': L.ph } as React.CSSProperties}>
      <svg
        ref={svg}
        className="hoja"
        viewBox={`0 0 ${L.pw} ${L.ph}`}
        onPointerMove={onMove}
        onPointerUp={fin}
        onPointerCancel={fin}
        role="img"
        aria-label={`Vista previa de la hoja, página ${pagina + 1}`}
      >
        <rect x={0} y={0} width={L.pw} height={L.ph} fill="#fff" />
        <g key={claveBarrido} className="barrido">
          <path d={linesD(L.g.lines)} fill="none" stroke={s.color} strokeOpacity={s.opacity} strokeWidth={lw} />
          <path d={linesD(L.g.lines2)} fill="none" stroke={s.color} strokeOpacity={s.opacity * 0.5} strokeWidth={lw * 0.7} />
          <path d={dotsD(L.g.dots)} fill="none" stroke={s.color} strokeOpacity={s.opacity} strokeWidth={s.weight} strokeLinecap="round" />
        </g>
        <path d={linesD(L.marks)} fill="none" stroke={s.color} strokeOpacity={0.45} strokeWidth={0.2} />

        {s.showHeader && (s.name || s.cardId) && (
          <text
            className="arrastrable"
            x={L.mL} y={L.baseline}
            fontFamily="Helvetica, Arial, sans-serif" fontSize={L.fs} fill="#5C6663"
            style={{ userSelect: 'none', transition: 'y .25s ease' }}
            onPointerDown={inicio('header')}
          >
            <tspan>{s.name || ''}</tspan>
            <tspan dx={s.name ? 2 : 0} fontSize={L.fs * 0.85} fill="#898781">{s.cardId || ''}</tspan>
          </text>
        )}
        {s.pageNumbers && (
          <text x={L.pw - L.mR} y={L.numBaseline} textAnchor="end" fontFamily="Helvetica, Arial, sans-serif" fontSize={L.fs * 0.85} fill="#898781">
            {pagina + 1}
          </text>
        )}
        {s.showLogo && (
          <image
            className="logo-arrastre"
            href={logo} x={L.lx} y={L.ly} width={L.lw} height={L.lh}
            opacity={s.logoOpacity}
            preserveAspectRatio="xMidYMid meet"
            onPointerDown={inicio('logo')}
          />
        )}
      </svg>
    </div>
  );
}

/** Miniatura de un patrón (selector y plantillas). Usa currentColor. */
export function Miniatura({ d }: { d: { lines: string; lines2: string; dots: string } }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 44" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }} aria-hidden>
      <path d={d.lines} stroke="currentColor" strokeWidth={0.45} fill="none" />
      <path d={d.lines2} stroke="currentColor" strokeOpacity={0.45} strokeWidth={0.35} fill="none" />
      <path d={d.dots} stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" fill="none" />
    </svg>
  );
}
