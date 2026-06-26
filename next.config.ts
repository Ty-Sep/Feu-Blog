// =============================================================================
// Next.js 15 configuration — App Router, Markdown via react-markdown.
// =============================================================================

import type { NextConfig } from 'next'

// ---------------------------------------------------------------------------
// Base Next.js config
// ---------------------------------------------------------------------------

const nextConfig: NextConfig = {
  // Support .md files as pages (if needed).  Default ts/tsx extensions are kept.
  pageExtensions: ['ts', 'tsx', 'md'],

  // Server-only packages — prevent bundling into client.
  serverExternalPackages: ['gray-matter'],

  // Strict TypeScript + ESLint during build.
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimisation.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
