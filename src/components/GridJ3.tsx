'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft, ChevronRight, CodeXml, Download as Instalar, Keyboard, Link2, Minus, Moon, Sun, WifiOff,
} from 'lucide-react';
import { MM, PATRONES } from '@/lib/constantes';
import { avisos as calcularAvisos, dims, layout } from '@/lib/geometria';
import { fmtFix } from '@/lib/formato';
import { descargarPdf, precargarJsPdf } from '@/lib/pdf';
import { enlaceDe } from '@/lib/compartir';
import { logoSrc, useAjustes } from '@/hooks/useAjustes';
import { useTema } from '@/hooks/useTema';
import { useAtajos } from '@/hooks/useAtajos';
import { Hoja } from './Hoja';
import { Panel } from './Panel';

interface EventoInstalar extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const ATAJOS: [string, string][] = [
  ['1 – 6', 'Elegir patrón'],
  ['O', 'Girar la hoja'],
  ['← →', 'Página anterior / siguiente'],
  ['Ctrl + P', 'Descargar el PDF'],
  ['C', 'Copiar enlace para compartir'],
  ['T', 'Modo claro / oscuro'],
  ['?', 'Ver estos atajos'],
];

const animDialogo = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] as const },
};

export function GridJ3() {
  const { s, update, reset, compartida, aspect, cargado } = useAjustes();
  const [animar, setAnimar] = useState(false);
  const { tema, alternar } = useTema();
  const [vista, setVista] = useState(0);
  const [ppm, setPpm] = useState(0);
  const [generando, setGenerando] = useState(false);
  const [confirmarReset, setConfirmarReset] = useState(false);
  const [verAtajos, setVerAtajos] = useState(false);
  const [toast, setToast] = useState<{ id: number; texto: string; icono?: 'link' | 'offline' } | null>(null);
  const [instalar, setInstalar] = useState<EventoInstalar | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback((texto: string, icono?: 'link' | 'offline') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), texto, icono });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const pagina = Math.min(vista, s.pages - 1);
  const { P, pw, ph } = dims(s);
  const L = useMemo(() => layout(s, pagina, aspect), [s, pagina, aspect]);
  const listaAvisos = useMemo(() => calcularAvisos(s, L), [s, L]);
  const logo = logoSrc(s);

  // Las transiciones de tamaño se activan después de cargar, no desde DEF.
  useEffect(() => {
    if (!cargado) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimar(true)));
    return () => cancelAnimationFrame(id);
  }, [cargado]);

  useEffect(() => {
    if (compartida) queueMicrotask(() => avisar('Abriste una hoja compartida', 'link'));
  }, [compartida, avisar]);

  // PWA: service worker + precarga de jsPDF para que el PDF funcione sin internet.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      const primeraVez = !navigator.serviceWorker.controller;
      const ocioso = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
      ocioso(() => { void precargarJsPdf(); });
      if (primeraVez) {
        reg.addEventListener('updatefound', () => {
          reg.installing?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') avisar('Listo: GridJ3 ya funciona sin internet', 'offline');
          });
        });
      }
    }).catch(() => { /* sin SW */ });
    const onPrompt = (e: Event) => { e.preventDefault(); setInstalar(e as EventoInstalar); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [avisar]);

  const descargar = useCallback(async () => {
    if (generando) return;
    setGenerando(true);
    try { await descargarPdf(s, aspect, logo); }
    catch (e) { console.error(e); avisar('No se pudo generar el PDF. Probá de nuevo.'); }
    finally { setGenerando(false); }
  }, [generando, s, aspect, logo, avisar]);

  const compartir = useCallback(async () => {
    const url = enlaceDe(s);
    const nota = s.logo === 'custom' ? ' (tu logo no viaja en el enlace)' : '';
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: 'Mi hoja de GridJ3', url }); return; } catch { /* cancelado */ return; }
    }
    try { await navigator.clipboard.writeText(url); avisar(`Enlace copiado${nota}`, 'link'); }
    catch { window.prompt('Copiá este enlace', url); }
  }, [s, avisar]);

  const girar = useCallback(() => update({ orientation: s.orientation === 'portrait' ? 'landscape' : 'portrait' }), [s.orientation, update]);

  useAtajos({
    ArrowLeft: () => setVista(Math.max(0, pagina - 1)),
    ArrowRight: () => setVista(Math.min(s.pages - 1, pagina + 1)),
    ...Object.fromEntries(PATRONES.map((p, i) => [String(i + 1), () => update({ pattern: p.key, spacing: p.def })])),
    o: girar,
    t: alternar,
    c: () => { void compartir(); },
    '?': () => setVerAtajos((v) => !v),
    'mod+p': () => { void descargar(); },
    'mod+s': () => { void descargar(); },
    Escape: () => { setVerAtajos(false); setConfirmarReset(false); },
  });

  return (
    <div className="app">
      <header className="cabecera">
        <div className="marca">
          <svg className="marca-logo" viewBox="0 0 100 100" aria-hidden>
            <rect width="100" height="100" rx="24" fill="var(--portal-primario)" />
            <g fill="var(--portal-primario-tinta)">
              {[30, 50, 70].flatMap((y) => [30, 50, 70].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" />))}
            </g>
          </svg>
          <span className="marca-nombre">GridJ3</span>
          <span className="marca-sub">Hojas de cuaderno imprimibles con tu nombre y logo</span>
        </div>
        <nav className="cab-acciones" aria-label="Acciones">
          {instalar && (
            <button type="button" className="cab-btn" onClick={async () => { await instalar.prompt(); setInstalar(null); }}>
              <Instalar size={16} strokeWidth={1.75} /><span className="texto">Instalar</span>
            </button>
          )}
          <button type="button" className="cab-btn" onClick={() => void compartir()} title="Compartir (C)">
            <Link2 size={16} strokeWidth={1.75} /><span className="texto">Compartir</span>
          </button>
          <button type="button" className="cab-btn" onClick={() => setVerAtajos(true)} title="Atajos de teclado (?)" aria-label="Atajos de teclado">
            <Keyboard size={16} strokeWidth={1.75} />
          </button>
          <button type="button" className="cab-btn" onClick={alternar} title="Modo claro / oscuro (T)"
            aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            {tema === 'oscuro' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
          </button>
          <a className="cab-btn" href="https://github.com/J3EJosue/gridj3" target="_blank" rel="noopener noreferrer" title="Código en GitHub" aria-label="Código en GitHub">
            <CodeXml size={16} strokeWidth={1.75} />
          </a>
        </nav>
      </header>

      <main className="main">
        <section className="vista" aria-label="Vista previa">
          <div className="vista-barra">
            <span className="mono">{`${P.label} · ${s.orientation === 'landscape' ? 'horizontal' : 'vertical'} · ${fmtFix(pw, 1)} × ${fmtFix(ph, 1)} mm`}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {s.pages > 1 && (
                <div className="paginador">
                  <button type="button" aria-label="Página anterior" disabled={pagina <= 0} onClick={() => setVista(pagina - 1)}><ChevronLeft size={16} /></button>
                  <span>{`Página ${pagina + 1} de ${s.pages}`}</span>
                  <button type="button" aria-label="Página siguiente" disabled={pagina >= s.pages - 1} onClick={() => setVista(pagina + 1)}><ChevronRight size={16} /></button>
                </div>
              )}
              <span className="mono">{ppm ? `Escala ${Math.round((ppm / MM) * 100)} %` : ''}</span>
            </div>
          </div>
          <div className="escenario">
            <Hoja s={s} L={L} logo={logo} pagina={pagina} animar={animar} onUpdate={update} onEscala={setPpm} />
          </div>
        </section>

        <Panel s={s} update={update} ph={ph} avisos={listaAvisos} generando={generando}
          onDescargar={() => void descargar()} onPedirReset={() => setConfirmarReset(true)} />
      </main>

      <AnimatePresence>
        {confirmarReset && (
          <motion.div key="reset" className="velo" onClick={() => setConfirmarReset(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <motion.div {...animDialogo} className="dialogo" role="dialog" aria-modal="true" aria-label="¿Restablecer todos los ajustes?" onClick={(e) => e.stopPropagation()}>
              <div className="dialogo-cuerpo">
                <span className="dialogo-titulo">¿Restablecer todos los ajustes?</span>
                <p className="dialogo-desc">La hoja vuelve a puntos de 5 mm en tamaño carta. No se puede deshacer.</p>
              </div>
              <div className="cambios">
                {['tu nombre y carnet', 'el logo que subiste', 'patrón, papel y márgenes'].map((t) => (
                  <div key={t} className="cambio"><span className="cambio-icono"><Minus size={12} strokeWidth={3} /></span><span>Pierde <strong>{t}</strong></span></div>
                ))}
              </div>
              <div className="dialogo-pie">
                <button type="button" className="btn" onClick={() => setConfirmarReset(false)} autoFocus>Cancelar</button>
                <button type="button" className="btn btn-destructivo" onClick={() => { reset(); setVista(0); setConfirmarReset(false); }}>Restablecer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {verAtajos && (
          <motion.div key="atajos" className="velo" onClick={() => setVerAtajos(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <motion.div {...animDialogo} className="dialogo" role="dialog" aria-modal="true" aria-label="Atajos de teclado" onClick={(e) => e.stopPropagation()}>
              <div className="dialogo-cuerpo">
                <span className="dialogo-titulo">Atajos de teclado</span>
                <p className="dialogo-desc">Para diseñar la hoja sin soltar el teclado.</p>
              </div>
              <div className="atajos">
                {ATAJOS.map(([k, d]) => <Fragment key={k}><kbd>{k}</kbd><span>{d}</span></Fragment>)}
              </div>
              <div className="dialogo-pie">
                <button type="button" className="btn btn-primario" onClick={() => setVerAtajos(false)} autoFocus>Entendido</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id} className="toast" role="status"
            initial={{ opacity: 0, y: 16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 10, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}>
            {toast.icono === 'link' && <Link2 size={16} strokeWidth={2} />}
            {toast.icono === 'offline' && <WifiOff size={16} strokeWidth={2} />}
            {toast.texto}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

