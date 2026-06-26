// =============================================================================
// ListLayout — shared layout for all five content-type list pages.
//
// Structure:
//   SiteShell
//     Title (h1)
//     CardList
//     ContentPagination  (hidden when pagination is absent)
//
// Used by: /java, /408, /software-exam, /articles, /projects
//
// Dependencies:
//   - SiteShell           (Phase 4D)
//   - Title               (Phase 4A)
//   - CardList            (Phase 4C)
//   - ContentPagination   (Phase 4C)
// =============================================================================

import React from 'react'

import type { Locale, ContentType, ContentCardProps, Pagination } from '@/lib/types'

import { SiteShell } from '@/components/layouts/SiteShell'
import { Title } from '@/components/typography/Title'
import { CardList } from '@/components/cards/CardList'
import { ContentPagination } from '@/components/content/ContentPagination'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ListLayoutProps {
  locale: Locale
  /** Content type — required by ContentPagination to build detail-page URLs. */
  type: ContentType
  title: string
  cards: ContentCardProps[]
  pagination?: Pagination
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ListLayout({
  locale,
  type,
  title,
  cards,
  pagination,
  className = '',
}: ListLayoutProps): React.ReactElement {
  return (
    <SiteShell locale={locale} className={className}>
      <Title as="h1" className="mb-[var(--space-8)]">
        {title}
      </Title>

      <CardList cards={cards} />

      {pagination && (
        <ContentPagination
          pagination={pagination}
          type={type}
          locale={locale}
        />
      )}
    </SiteShell>
  )
}
