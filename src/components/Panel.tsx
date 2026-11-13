'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, Download, LoaderCircle, Plus, RectangleHorizontal, RectangleVertical, TriangleAlert } from 'lucide-react';
import {
  COLORES, DEF, ETIQUETA_ESPACIADO, LOGOS, PAPELES, PATRONES,
  type Ajustes, type PapelClave,
} from '@/lib/constantes';
import { dotsD, geom, layout, linesD } from '@/lib/geometria';
import { fmt } from '@/lib/formato';
import { PLANTILLAS, coincide } from '@/lib/plantillas';
import { Miniatura } from './Hoja';
import { Casilla, Segmentado, Seccion, Stepper } from './ui';

const MAX_LADO_PAPEL = Math.max(...Object.values(PAPELES).map((p) => p.h));

/** Reduce el logo subido a ≤1200 px en PNG: así cabe en localStorage y en el PDF. */
function leerLogo(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const k = Math.min(1, 1200 / Math.max(img.naturalWidth || 1200, img.naturalHeight || 1200));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round((img.naturalWidth || 1200) * k));
        c.height = Math.max(1, Math.round((img.naturalHeight || 1200) * k));
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function Panel({ s, update, ph, avisos, generando, onDescargar, onPedirReset }: {
  s: Ajustes;
  update: (p: Partial<Ajustes>) => void;
  ph: number;
  avisos: string[];
  generando: boolean;
  onDescargar: () => void;
  onPedirReset: () => void;
}) {
  const archivo = useRef<HTMLInputElement>(null);
  const [soltando, setSoltando] = useState(false);

  const miniaturas = useMemo(() => Object.fromEntries(PATRONES.map((p) => {
    const g = geom(p.key, 1, 1, 58, 42, p.thumb, null);
    return [p.key, { lines: linesD(g.lines), lines2: linesD(g.lines2), dots: dotsD(g.dots) }];
  })), []);

  const minisPlantillas = useMemo(() => PLANTILLAS.map((p) => {
    const m = { ...DEF, ...p.ajustes, showLogo: false, marks: false };
    const L = layout(m, 0, 1);
    return { key: p.key, pw: L.pw, ph: L.ph, lines: linesD(L.g.lines), lines2: linesD(L.g.lines2), dots: dotsD(L.g.dots), m };
  }), []);

  const subir = async (file: File | undefined | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const data = await leerLogo(file);
      update({ customLogo: data, logo: 'custom', showLogo: true });
    } catch { /* imagen dañada */ }
  };

  const patron = PATRONES.find((p) => p.key === s.pattern) ?? PATRONES[0];
  const P = PAPELES[s.paper];
  const land = s.orientation === 'landscape';
  const colorPropio = !COLORES.some((c) => c.hex.toLowerCase() === s.color.toLowerCase());

  return (
    <aside className="panel" aria-label="Ajustes de la hoja">
      <div className="panel-scroll">
        <Seccion etiqueta="Plantillas" valor="Un clic y listo">
          <div className="plantillas">
            {PLANTILLAS.map((p, i) => {
              const mini = minisPlantillas[i];
              const k = 52 / Math.max(mini.pw, mini.ph);
              return (
                <button key={p.key} type="button" className="tile plantilla" aria-pressed={coincide(s, p)} title={p.hint}
                  onClick={() => update(p.ajustes)}>
                  <span className="plantilla-mini" aria-hidden>
                    <svg width={mini.pw * k} height={mini.ph * k} viewBox={`0 0 ${mini.pw} ${mini.ph}`}>
                      <path d={mini.lines} stroke={mini.m.color} strokeOpacity={mini.m.opacity} strokeWidth={0.5} fill="none" />
                      <path d={mini.lines2} stroke={mini.m.color} strokeOpacity={mini.m.opacity * 0.5} strokeWidth={0.4} fill="none" />
                      <path d={mini.dots} stroke={mini.m.color} strokeOpacity={mini.m.opacity} strokeWidth={1.1} strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                  <span className="plantilla-label">{p.label}</span>
                </button>
              );
            })}
          </div>
        </Seccion>

        <Seccion etiqueta="Patrón" valor={patron.label}>
          <div className="patrones">
            {PATRONES.map((p, i) => (
              <button key={p.key} type="button" className="tile patron" aria-pressed={s.pattern === p.key}
                onClick={() => update({ pattern: p.key, spacing: p.def })}>
                <span className="patron-thumb"><Miniatura d={miniaturas[p.key]} /></span>
                <span className="patron-label">{p.label}<span className="tecla" aria-hidden>{i + 1}</span></span>
              </button>
            ))}
          </div>
        </Seccion>

        <Seccion etiqueta="Papel" valor={`${P.label} · ${fmt(P.w, 1)} × ${fmt(P.h, 1)} mm`}>
          <div className="papeles">
            {(Object.entries(PAPELES) as [PapelClave, typeof P][]).map(([k, p]) => {
              const f = 34 / MAX_LADO_PAPEL;
              return (
                <button key={k} type="button" className="tile papel" aria-pressed={s.paper === k}
                  title={`${fmt(p.w, 1)} × ${fmt(p.h, 1)} mm`} onClick={() => update({ paper: k })}>
                  <span className="papel-forma" style={{ width: Math.round((land ? p.h : p.w) * f), height: Math.round((land ? p.w : p.h) * f) }} />
                  <span className="papel-label">{p.label}</span>
                </button>
              );
            })}
          </div>
          <Segmentado etiqueta="Orientación" valor={s.orientation} onChange={(v) => update({ orientation: v })}
            opciones={[
              { key: 'portrait', label: <><RectangleVertical size={15} strokeWidth={1.75} />Vertical</> },
              { key: 'landscape', label: <><RectangleHorizontal size={15} strokeWidth={1.75} />Horizontal</> },
            ]} />
        </Seccion>

        <Seccion etiqueta="Trazo">
          <Stepper label={ETIQUETA_ESPACIADO[s.pattern]} value={s.spacing} min={s.pattern === 'music' ? 10 : 2} max={30} step={0.5} dec={1} unit="mm"
            onChange={(v) => update({ spacing: v })} />
          <Stepper label={s.pattern === 'dots' ? 'Tamaño del punto' : 'Grosor de línea'} value={s.weight} min={0.1} max={1.2} step={0.05} dec={2} unit="mm"
            onChange={(v) => update({ weight: v })} />
          <Stepper label="Intensidad" value={s.opacity} min={0.1} max={1} step={0.05} dec={0} unit="%" mult={100}
            onChange={(v) => update({ opacity: v })} />
          <div className="fila">
            <span className="fila-label">Color</span>
            <div className="colores">
              {COLORES.map((c) => (
                <button key={c.hex} type="button" className="tile color" title={c.label} aria-label={c.label}
                  aria-pressed={c.hex.toLowerCase() === s.color.toLowerCase()} onClick={() => update({ color: c.hex })}>
                  <span className="color-punto" style={{ background: c.hex }} />
                </button>
              ))}
              <label className="tile color color-otro" title="Otro color" aria-pressed={colorPropio}
                style={colorPropio ? { borderColor: 'var(--portal-tinta)', borderStyle: 'solid', boxShadow: 'inset 0 0 0 1px var(--portal-tinta)' } : undefined}>
                {colorPropio
                  ? <span className="color-punto" style={{ background: s.color }} />
                  : <Plus size={15} strokeWidth={1.75} />}
                <input type="color" value={s.color} aria-label="Otro color" onChange={(e) => update({ color: e.target.value })} />
              </label>
            </div>
          </div>
        </Seccion>

        <Seccion etiqueta="Márgenes">
          <Stepper label="Superior" value={s.mTop} min={0} max={50} step={1} dec={0} unit="mm" onChange={(v) => update({ mTop: v })} />
          <Stepper label="Inferior" value={s.mBottom} min={0} max={50} step={1} dec={0} unit="mm" onChange={(v) => update({ mBottom: v })} />
          <Stepper label="Laterales" value={s.mSide} min={0} max={40} step={1} dec={0} unit="mm" onChange={(v) => update({ mSide: v })} />
          <p className="nota">El patrón se centra solo dentro de los márgenes, para que el sobrante quede igual a cada lado.</p>
        </Seccion>

        <Seccion etiqueta="Encabezado" accion={
          <Casilla compacta on={s.showHeader} onToggle={() => update({ showHeader: !s.showHeader })}>Mostrar</Casilla>
        }>
          {s.showHeader && (
            <div className="aparecer" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className="campo">Nombre
                <input className="input" type="text" value={s.name} placeholder="Tu nombre" maxLength={60} autoComplete="name"
                  onChange={(e) => update({ name: e.target.value })} />
              </label>
              <label className="campo">Carnet o código
                <input className="input mono-in" type="text" value={s.cardId} placeholder="0000-00-000" maxLength={30}
                  onChange={(e) => update({ cardId: e.target.value })} />
              </label>
              <div className="fila">
                <span className="fila-label">Posición</span>
                <Segmentado etiqueta="Posición del encabezado" ancho={184} valor={s.headerPos} onChange={(v) => update({ headerPos: v })}
                  opciones={[{ key: 'bottom', label: 'Abajo' }, { key: 'top', label: 'Arriba' }]} />
              </div>
              <Stepper label="Tamaño de letra" value={s.headerSize} min={7} max={16} step={0.5} dec={1} unit="pt" onChange={(v) => update({ headerSize: v })} />
              <p className="nota">También podés arrastrarlo sobre la hoja.</p>
            </div>
          )}
        </Seccion>

        <Seccion etiqueta="Logo" accion={
          <Casilla compacta on={s.showLogo} onToggle={() => update({ showLogo: !s.showLogo })}>Mostrar</Casilla>
        }>
          <div className="logos">
            {LOGOS.map((l) => (
              <button key={l.key} type="button" className="tile logo-tile" title={l.label} aria-pressed={s.showLogo && s.logo === l.key}
                onClick={() => update({ logo: l.key, showLogo: true })}>
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura local */}
                <img src={l.src} alt="" width={34} height={34} />
                <span>{l.label}</span>
              </button>
            ))}
            {s.customLogo && (
              <button type="button" className="tile logo-tile" title="Tu logo" aria-pressed={s.showLogo && s.logo === 'custom'}
                onClick={() => update({ logo: 'custom', showLogo: true })}>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                <img src={s.customLogo} alt="" width={34} height={34} />
                <span>Tuyo</span>
              </button>
            )}
            <button type="button" className={`tile logo-tile subir${soltando ? ' activo' : ''}`} title="Subir tu logo (o arrastrá una imagen)"
              onClick={() => archivo.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setSoltando(true); }}
              onDragLeave={() => setSoltando(false)}
              onDrop={(e) => { e.preventDefault(); setSoltando(false); void subir(e.dataTransfer.files?.[0]); }}>
              <span className="mas"><Plus size={20} strokeWidth={1.5} /></span>
              <span>Subir</span>
            </button>
          </div>
          <input ref={archivo} type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => { void subir(e.target.files?.[0]); e.target.value = ''; }} />
          {s.showLogo && (
            <div className="aparecer" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Stepper label="Ancho" value={s.logoW} min={10} max={80} step={1} dec={0} unit="mm" onChange={(v) => update({ logoW: v })} />
              <Stepper label="Distancia al borde inferior" value={s.logoBottom} min={0} max={Math.floor(ph / 2)} step={1} dec={0} unit="mm" onChange={(v) => update({ logoBottom: v })} />
              <Stepper label="Intensidad" value={s.logoOpacity} min={0.1} max={1} step={0.05} dec={0} unit="%" mult={100} onChange={(v) => update({ logoOpacity: v })} />
              <Casilla on={s.clearLogo} onToggle={() => update({ clearLogo: !s.clearLogo })}>Dejar libre el área detrás del logo</Casilla>
            </div>
          )}
        </Seccion>

        <Seccion etiqueta="Impresión">
          <Stepper label="Páginas en el PDF" value={s.pages} min={1} max={100} step={1} dec={0} unit={s.pages === 1 ? 'pág.' : 'págs.'} onChange={(v) => update({ pages: v })} />
          <Casilla on={s.pageNumbers} onToggle={() => update({ pageNumbers: !s.pageNumbers })} hint="El número va abajo a la derecha, en el margen.">Numerar páginas</Casilla>
          <Casilla on={s.duplex} onToggle={() => update({ duplex: !s.duplex })} hint="Agrega un margen para encuadernar que alterna de lado en cada página.">Imprimir a doble cara</Casilla>
          {s.duplex && (
            <div className="sangria aparecer">
              <Stepper label="Margen para encuadernar" value={s.gutter} min={0} max={25} step={1} dec={0} unit="mm" onChange={(v) => update({ gutter: v })} />
            </div>
          )}
          <Casilla on={s.marks} onToggle={() => update({ marks: !s.marks })} hint="Pequeñas esquinas que muestran dónde empieza el área del patrón.">Marcas de margen</Casilla>
        </Seccion>
      </div>

      <div className="pie">
        {avisos.length > 0 ? (
          <div className="avisos" role="status">
            {avisos.map((t) => (
              <div key={t} className="aviso aparecer"><TriangleAlert size={15} strokeWidth={2} /><span>{t}</span></div>
            ))}
          </div>
        ) : (
          <div><span className="chip" role="status"><Check size={13} strokeWidth={2.5} />Lista para imprimir</span></div>
        )}
        <div className="pie-fila">
          <div className="pie-info">
            <span className="pie-resumen">{`${s.pages} ${s.pages === 1 ? 'página' : 'páginas'} · PDF vectorial`}</span>
            <button type="button" className="enlace" onClick={onPedirReset}>Restablecer ajustes</button>
          </div>
          <button type="button" className="btn btn-primario btn-alto" onClick={onDescargar} disabled={generando}>
            {generando ? <LoaderCircle size={16} className="girando" /> : <Download size={16} strokeWidth={2} />}
            {generando ? 'Generando…' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </aside>
  );
}
