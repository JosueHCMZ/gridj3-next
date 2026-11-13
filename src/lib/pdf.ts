import { PAPELES, PATRONES, type Ajustes } from './constantes';
import { dims, layout } from './geometria';

/** Convierte cualquier imagen (webp, svg, data URL) a PNG para jsPDF, a ≥1600 px por lado. */
function aPng(src: string): Promise<string> {
  return new Promise((res, rej) => {
    if (src.startsWith('data:image/png') || src.startsWith('data:image/jpeg')) { res(src); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.max(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/png'));
    };
    img.onerror = rej;
    img.src = src;
  });
}

/** Precarga jsPDF (lo usa el service worker para dejarlo en caché y funcionar offline). */
export const precargarJsPdf = () => import('jspdf');

/** Genera y descarga el PDF vectorial al tamaño físico exacto del papel. */
export async function descargarPdf(s: Ajustes, aspect: number, logoSrc: string) {
  const { jsPDF } = await import('jspdf');
  const { pw, ph } = dims(s);
  const orient = pw > ph ? 'landscape' : 'portrait';
  const doc = new jsPDF({ unit: 'mm', format: [pw, ph], orientation: orient, compress: true });
  const patron = PATRONES.find((p) => p.key === s.pattern) ?? PATRONES[0];
  doc.setProperties({ title: `Hoja ${patron.label} · ${PAPELES[s.paper].label}`, creator: 'GridJ3' });

  let logo: string | null = null;
  if (s.showLogo) {
    try { logo = await aPng(logoSrc); } catch { /* sin logo si no carga */ }
  }
  const lwLine = Math.max(s.weight * 0.5, 0.1);

  for (let i = 0; i < s.pages; i++) {
    if (i > 0) doc.addPage([pw, ph], orient);
    const L = layout(s, i, aspect);
    doc.setDrawColor(s.color);
    doc.setFillColor(s.color);
    doc.setLineCap('butt');

    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: s.opacity, 'stroke-opacity': s.opacity }));
    doc.setLineWidth(lwLine);
    for (const l of L.g.lines) doc.line(l[0], l[1], l[2], l[3]);
    for (const p of L.g.dots) doc.circle(p[0], p[1], s.weight / 2, 'F');
    doc.restoreGraphicsState();

    if (L.g.lines2.length) {
      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: s.opacity * 0.5, 'stroke-opacity': s.opacity * 0.5 }));
      doc.setLineWidth(lwLine * 0.7);
      for (const l of L.g.lines2) doc.line(l[0], l[1], l[2], l[3]);
      doc.restoreGraphicsState();
    }
    if (L.marks.length) {
      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: 0.45, 'stroke-opacity': 0.45 }));
      doc.setLineWidth(0.2);
      for (const l of L.marks) doc.line(l[0], l[1], l[2], l[3]);
      doc.restoreGraphicsState();
    }

    doc.setFont('helvetica', 'normal');
    if (s.showHeader && (s.name || s.cardId)) {
      doc.setFontSize(s.headerSize);
      doc.setTextColor('#5C6663');
      doc.text(s.name || '', L.mL, L.baseline);
      const w = s.name ? doc.getTextWidth(s.name) + 2 : 0;
      doc.setFontSize(s.headerSize * 0.85);
      doc.setTextColor('#898781');
      doc.text(s.cardId || '', L.mL + w, L.baseline);
    }
    if (s.pageNumbers) {
      doc.setFontSize(s.headerSize * 0.85);
      doc.setTextColor('#898781');
      doc.text(String(i + 1), pw - L.mR, L.numBaseline, { align: 'right' });
    }
    if (logo) {
      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: s.logoOpacity }));
      doc.addImage(logo, 'PNG', L.lx, L.ly, L.lw, L.lh, 'logo', 'SLOW');
      doc.restoreGraphicsState();
    }
  }
  doc.save(`hoja-${s.pattern}-${s.paper}${s.pages > 1 ? `-${s.pages}p` : ''}.pdf`);
}
