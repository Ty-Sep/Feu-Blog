// =============================================================================
// ContentPagination — previous / next article navigation.
//
// Renders hand-drawn-styled prev/next links for navigating between articles
// of the same content type.  Each link is hidden when that direction has no
// article (e.g. the newest article has no "next").
//
// Uses getDetailRoute() from CARD_CONFIG — routing is always derived, never
// hardcoded.
//
// Dependencies:
//   - @/types.ts:          Pagination, ContentType, Locale
//   - @/tokens/card-config.ts: getDetailRoute
// =============================================================================

import React from 'react'
import Link from 'next/link'

import type { Pagination, ContentType, Locale } from '@/types'
import { getDetailRoute } from '@/tokens/card-config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContentPaginationProps {
  pagination: Pagination
  /** Content type — needed to build the detail-page URL. */
  type: ContentType
  /** Current locale — needed for the localised URL. */
  locale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function PaginationLink({
  direction,
  title,
  href,
}: {
  direction: 'prev' | 'next'
  slug: string
  title: string
  href: string
}): React.ReactElement {
  const label = direction === 'prev' ? '← Previous' : 'Next →'

  return (
    <Link
      href={href}
      className="
        group flex flex-col
        max-w-[48%]
        p-[var(--space-3)]
        rounded-sketch
        transition-colors duration-fade
        hover:bg-[var(--bg-card)]
        focus-visible:outline-2 focus-visible:outline-offset-2
      "
      style={{ outlineColor: 'var(--ink-primary)' }}
    >
      <span
        className="text-xs mb-[var(--space-1)]"
        style={{ color: 'var(--ink-muted)' }}
      >
        {label}
      </span>
      <span
        className="
          text-sm font-medium
          group-hover:underline underline-offset-[3px]
        "
        style={{
          fontFamily: 'var(--font-title)',
          color: 'var(--ink-primary)',
        }}
      >
        {title}
      </span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContentPagination({
  pagination,
  type,
  locale,
  className = '',
}: ContentPaginationProps): React.ReactElement | null {
  const { prev, next } = pagination

  // Neither direction available — render nothing.
  if (!prev && !next) {
    return null
  }

  return (
    <nav
      aria-label="Article navigation"
      className={`flex items-center justify-between gap-[var(--space-4)] pt-[var(--space-8)] ${className}`}
    >
      {prev ? (
        <PaginationLink
          direction="prev"
          slug={prev.slug}
          title={prev.title}
          href={getDetailRoute(type, locale, prev.slug)}
        />
      ) : (
        /* Spacer so "next" stays right-aligned when "prev" is absent. */
        <div />
      )}

      {next && (
        <PaginationLink
          direction="next"
          slug={next.slug}
          title={next.title}
          href={getDetailRoute(type, locale, next.slug)}
        />
      )}
    </nav>
  )
}
