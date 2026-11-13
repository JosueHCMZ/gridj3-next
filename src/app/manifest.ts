import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GridJ3 · Hojas imprimibles',
    short_name: 'GridJ3',
    description: 'Hojas de cuaderno imprimibles con tu nombre y logo, en PDF vectorial. Funciona sin internet.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7f6f2',
    theme_color: '#ffffff',
    lang: 'es',
    categories: ['education', 'productivity', 'utilities'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
