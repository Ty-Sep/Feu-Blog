// =============================================================================
// SiteShell — site-wide shared shell.
//
// Wraps every page with a lightweight structural main content area
// and minimal footer.  Navigation is handled by FloatingActionButton
// which is rendered once in the [lang] layout.
//
// hideHeader is used on the homepage where HeroSection provides
// its own toolbar (search + language toggle).
//
// Dependencies:
//   - SketchDivider (Phase 4A)
// =============================================================================

import React from 'react'

import type { Locale } from '@/types'

import { SketchDivider } from '@/components/primitives/SketchDivider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SiteShellProps {
  locale: Locale
  children: React.ReactNode
  className?: string
  /** When true the sticky header is not rendered (used on the homepage). */
  hideHeader?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SiteShell({
  locale,
  children,
  className = '',
  hideHeader = false,
}: SiteShellProps): React.ReactElement {
  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        backgroundColor: 'var(--bg-page)',
        backgroundImage: 'url("/images/wall.png")',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* ── Main content ── */}
      <main className="flex-1 w-full max-w-[var(--homepage-max-width)] mx-auto px-[var(--space-6)] py-[var(--space-8)]">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="
          w-full max-w-[var(--homepage-max-width)] mx-auto
          px-[var(--space-6)] py-[var(--space-6)]
          text-center text-xs
        "
        style={{ color: 'var(--ink-muted)' }}
      >
        <SketchDivider className="mb-[var(--space-4)]" />
        <p>&copy; {new Date().getFullYear()} &middot; Notebook Blog</p>
      </footer>
    </div>
  )
}
