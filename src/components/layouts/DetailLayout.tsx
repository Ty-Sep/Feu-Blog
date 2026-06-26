// =============================================================================
// DetailLayout — shared layout for standalone content-type detail pages.
//
// Structure (no TOC):
//   SiteShell → ArticleShell → children → ContentPagination
//
// Structure (with TOC):
//   SiteShell → flex row [TOC sidebar | ArticleShell + children] → ContentPagination
//
// Book pages use BookPage instead — this layout is for standalone articles only.
//
// Dependencies:
//   - SiteShell, ArticleShell, ContentPagination, TableOfContents
// =============================================================================

import React from 'react'

import type { Locale, Pagination, ContentItem } from '@/lib/types'
import type { TocItem } from '@/components/content/TableOfContents'

import { SiteShell } from '@/components/layouts/SiteShell'
import { ArticleShell } from '@/components/content/ArticleShell'
import { ContentPagination } from '@/components/content/ContentPagination'
import { TableOfContents } from '@/components/content/TableOfContents'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DetailLayoutProps {
  locale: Locale
  article: ContentItem
  /** Compiled Markdown content — injected by the page component. */
  children: React.ReactNode
  pagination?: Pagination
  /** TOC items for study-notes pages (optional). */
  toc?: TocItem[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DetailLayout({
  locale,
  article,
  children,
  pagination,
  toc,
  className = '',
}: DetailLayoutProps): React.ReactElement {
  const { frontmatter, type } = article
  const hasToc = toc && toc.length > 0

  return (
    <SiteShell
      locale={locale}
      className={`${className} [--homepage-max-width:96rem]`}
    >
      {hasToc ? (
        /* ── Two-column layout with sidebar ── */
        <div className="flex gap-0 -mt-[var(--space-3)]">
          {/* ── Desktop sidebar ── */}
          <div className="hidden lg:block self-stretch flex-shrink-0 w-[17.5rem] -ml-[var(--space-3)]">
            <TableOfContents items={toc!} locale={locale} />
          </div>

          {/* ── Content column ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile TOC (hidden on desktop via wrapper) */}
            <div className="lg:hidden">
              <TableOfContents items={toc!} locale={locale} />
            </div>

            <ArticleShell
              title={frontmatter.title}
              date={frontmatter.date}
              tags={frontmatter.tags}
            >
              {children}
            </ArticleShell>
          </div>
        </div>
      ) : (
        /* ── Full-width layout (default) ── */
        <ArticleShell
          title={frontmatter.title}
          date={frontmatter.date}
          tags={frontmatter.tags}
        >
          {children}
        </ArticleShell>
      )}

      {pagination && (
        <ContentPagination
          pagination={pagination}
          type={type}
          locale={locale}
          className="mt-[var(--space-12)]"
        />
      )}
    </SiteShell>
  )
}