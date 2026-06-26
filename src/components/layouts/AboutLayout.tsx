// =============================================================================
// AboutLayout — about page layout.
//
// Reuses SiteShell + ArticleShell for a single flowing page.  No pagination,
// no comments — just the MDX content wrapped in the article shell.
//
// Structure:
//   SiteShell
//     ArticleShell (title, children = compiled MDX)
//
// Dependencies:
//   - SiteShell     (Phase 4D)
//   - ArticleShell  (Phase 4D)
// =============================================================================

import React from 'react'

import type { Locale } from '@/lib/types'
import type { Frontmatter } from '@/lib/types'

import { SiteShell } from '@/components/layouts/SiteShell'
import { ArticleShell } from '@/components/content/ArticleShell'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AboutLayoutProps {
  locale: Locale
  /** Frontmatter extracted from the about MDX file. */
  frontmatter: Frontmatter
  /** Compiled MDX content. */
  children: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AboutLayout({
  locale,
  frontmatter,
  children,
  className = '',
}: AboutLayoutProps): React.ReactElement {
  return (
    <SiteShell locale={locale} className={className}>
      <ArticleShell
        title={frontmatter.title}
        date={frontmatter.date}
        tags={frontmatter.tags}
      >
        {children}
      </ArticleShell>
    </SiteShell>
  )
}
