# GridJ3 v2 · Hojas imprimibles

Generador de hojas de cuaderno imprimibles: puntos, líneas, cuadrícula, isométrico, caligrafía y pentagrama, con tu nombre, carnet y logo. PDF vectorial al tamaño físico exacto del papel.

**En vivo:** https://gridj3.admin24-337.workers.dev

## Qué trae

- 6 patrones, 5 papeles, márgenes, doble cara, numeración y marcas de margen.
- Encabezado y logo arrastrables sobre la hoja; logos UMG/USAC/URL/UVG o el tuyo.
- **Plantillas rápidas** (Apuntes, Bullet journal, Ingeniería, Isométrico, Caligrafía, Partitura).
- **Compartir por enlace**: la hoja entera viaja en el hash de la URL (`#h=…`), nunca llega a un servidor.
- **PWA offline**: instalable; el PDF se genera sin internet (jsPDF queda en caché).
- **Modo oscuro** y **atajos**: `1–6` patrón · `O` girar · `← →` páginas · `Ctrl+P` PDF · `C` compartir · `T` tema · `?` ayuda.
- Barrido de “impresora” al cambiar de patrón y transición de tamaño de la hoja.

## Stack

Next.js 16 (App Router, `output: 'export'`) · React 19 · TypeScript 7 · Oxlint · Bun (instalador) · jsPDF · motion · lucide-react.
Se publica como **Cloudflare Worker con static assets** (`wrangler.jsonc` sirve `out/`). Cabeceras de seguridad en `public/_headers`.

## Comandos

```bash
bun install
bun run dev        # http://localhost:3000
bun run revisar    # oxlint + tsc
bun run preview    # build + wrangler dev (igual que producción)
bun run deploy     # build + wrangler deploy
bun run iconos     # regenera los PNG de la PWA
```

## Estructura

- `src/lib/geometria.ts` — patrones, recorte del área del logo, layout de página y avisos de impresión (lo comparten vista y PDF).
- `src/lib/pdf.ts` — PDF vectorial con jsPDF (import dinámico).
- `src/lib/compartir.ts` — codificación del enlace (lz-string) y validación de lo que llega.
- `src/hooks/` — ajustes + localStorage, tema, atajos.
- `src/components/` — `GridJ3` (shell), `Hoja` (SVG en mm), `Panel`, `ui`.
- `public/sw.js` — service worker.
