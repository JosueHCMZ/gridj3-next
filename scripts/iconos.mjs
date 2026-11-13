// Genera los PNG de la PWA desde los SVG de public/icons (correr: node scripts/iconos.mjs).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const p = (f) => fileURLToPath(new URL(`../public/icons/${f}`, import.meta.url));
const hacer = (src, out, size) => sharp(p(src), { density: 600 }).resize(size, size).png().toFile(p(out));
await Promise.all([
  hacer('gridj3.svg', 'icon-192.png', 192),
  hacer('gridj3.svg', 'icon-512.png', 512),
  hacer('maskable.svg', 'maskable-512.png', 512),
  hacer('maskable.svg', 'apple-touch-icon.png', 180),
]);
console.log('iconos listos');
