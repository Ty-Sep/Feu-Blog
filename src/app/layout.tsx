// =============================================================================
// Root Layout — required by Next.js App Router.
//
// Sets up the <html> shell, loads global CSS, and declares the font loader
// for the hand-drawn notebook aesthetic.
//
// Locale is set to the default ('zh') — individual pages do not reconfigure
// <html lang> because the root layout cannot access route params dynamically.
// =============================================================================

import type { Metadata, Viewport } from 'next'

import { Caveat, Noto_Sans_SC } from 'next/font/google'

import '@/styles/globals.css'

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const titleFont = Caveat({
  subsets: ['latin'],
  variable: '--font-title',
  display: 'swap',
  weight: ['400', '700'],
})

const bodyFont = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '700'],
})

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'MyBlog',
    template: '%s · MyBlog',
  },
  description: 'A bilingual technical blog with hand-drawn notebook aesthetics.',
  metadataBase: new URL('http://localhost:3000'),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="zh" className={`${titleFont.variable} ${bodyFont.variable}`}>
      <body
        className="antialiased"
        style={{
          backgroundColor: 'var(--bg-page)',
          color: 'var(--ink-primary)',
        }}
      >
        {children}
      </body>
    </html>
  )
}
