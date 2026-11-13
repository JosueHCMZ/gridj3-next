'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { fmt } from '@/lib/formato';

export function Seccion({ etiqueta, valor, accion, children }: {
  etiqueta: string; valor?: ReactNode; accion?: ReactNode; children?: ReactNode;
}) {
  return (
    <section className="seccion" aria-label={etiqueta}>
      <div className="seccion-cab">
        <span className="etiqueta">{etiqueta}</span>
        {valor !== undefined && <span className="valor">{valor}</span>}
        {accion}
      </div>
      {children}
    </section>
  );
}

/**
 * − valor + con autorepetición: mantené apretado y acelera.
 * El valor se redondea al paso para no acumular errores de coma flotante.
 */
export function Stepper({ label, value, min, max, step, dec, unit, mult = 1, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  dec: number; unit: string; mult?: number; onChange: (v: number) => void;
}) {
  const clamp = (x: number) => Math.min(max, Math.max(min, parseFloat((Math.round(x / step) * step).toFixed(4))));
  const actual = useRef(value);
  const cb = useRef(onChange);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { actual.current = value; cb.current = onChange; });
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const paso = (dir: 1 | -1) => {
    const next = clamp(actual.current + dir * step);
    if (next === actual.current) return false;
    actual.current = next;
    cb.current(next);
    return true;
  };
  const parar = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const empezar = (dir: 1 | -1) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    paso(dir);
    let espera = 380;
    const repetir = () => {
      if (!paso(dir)) return;
      espera = Math.max(45, espera * 0.8);
      timer.current = setTimeout(repetir, espera);
    };
    timer.current = setTimeout(repetir, espera);
  };
  const teclado = (dir: 1 | -1) => (e: React.MouseEvent) => {
    // Clic con teclado (Enter/Espacio) no trae pointerdown.
    if (e.detail === 0) paso(dir);
  };
  const minOff = value <= min + 1e-9, maxOff = value >= max - 1e-9;

  return (
    <div className="fila">
      <span className="fila-label">{label}</span>
      <div className="stepper" role="group" aria-label={label}>
        <button type="button" aria-label={`Menos ${label.toLowerCase()}`} disabled={minOff}
          onPointerDown={empezar(-1)} onPointerUp={parar} onPointerLeave={parar} onPointerCancel={parar} onClick={teclado(-1)}>
          <Minus size={15} strokeWidth={2} />
        </button>
        <output aria-live="polite">{`${fmt(value * mult, dec)} ${unit}`}</output>
        <button type="button" aria-label={`Más ${label.toLowerCase()}`} disabled={maxOff}
          onPointerDown={empezar(1)} onPointerUp={parar} onPointerLeave={parar} onPointerCancel={parar} onClick={teclado(1)}>
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function Segmentado<T extends string>({ opciones, valor, onChange, ancho, etiqueta }: {
  opciones: { key: T; label: ReactNode }[]; valor: T; onChange: (v: T) => void; ancho?: number; etiqueta: string;
}) {
  return (
    <div className="segmentado" role="group" aria-label={etiqueta} style={ancho ? { width: ancho } : undefined}>
      {opciones.map((o) => (
        <button key={o.key} type="button" aria-pressed={valor === o.key} onClick={() => onChange(o.key)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Casilla({ on, onToggle, children, hint, compacta }: {
  on: boolean; onToggle: () => void; children: ReactNode; hint?: string; compacta?: boolean;
}) {
  const cls = ['casilla', compacta && 'compacta', hint && 'con-hint'].filter(Boolean).join(' ');
  const caja = <span className="caja" aria-hidden><Check size={12} strokeWidth={3} /></span>;
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={onToggle} className={cls}>
      {compacta ? <>{children}{caja}</> : caja}
      {!compacta && (hint
        ? <span className="casilla-texto"><span className="casilla-titulo">{children}</span><span className="casilla-hint">{hint}</span></span>
        : <span>{children}</span>)}
    </button>
  );
}
