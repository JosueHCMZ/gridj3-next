import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from 'next/font/google';
import { SCRIPT_TEMA } from '@/lib/tema';
import './globals.css';

const sora = Sora({ variable: '--font-sora', subsets: ['latin'], weight: ['400', '500'] });
const plexSans = IBM_Plex_Sans({ variable: '--font-plex-sans', subsets: ['latin'], weight: ['400', '500', '600'] });
const plexMono = IBM_Plex_Mono({ variable: '--font-plex-mono', subsets: ['latin'], weight: ['400', '500'] });

const URL_SITIO = 'https://gridj3.admin24-337.workers.dev';
const descripcion = 'Diseñá hojas de cuaderno imprimibles — puntos, líneas, cuadrícula, isométrico, caligrafía y pentagrama — con tu nombre, carnet y logo. PDF vectorial al tamaño exacto del papel.';

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: 'GridJ3 · Hojas imprimibles',
  description: descripcion,
  applicationName: 'GridJ3',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'GridJ3 · Hojas de cuaderno imprimibles',
    description: descripcion,
    url: URL_SITIO,
    siteName: 'GridJ3',
    locale: 'es_GT',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'GridJ3 · Hojas imprimibles', description: descripcion },
  appleWebApp: { capable: true, title: 'GridJ3', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${sora.variable} ${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
