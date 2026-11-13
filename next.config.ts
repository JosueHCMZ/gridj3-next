import type { NextConfig } from 'next';

/** Exportación estática: Cloudflare sirve `out/` como static assets de un Worker. */
const nextConfig: NextConfig = {
  output: 'export',
  poweredByHeader: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
