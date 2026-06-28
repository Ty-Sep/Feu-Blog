// =============================================================================
// BookshelfLayout — shelf-style layout for note / study list pages.
//
// Same structure as ListLayout, but replaces CardList with Bookshelf.
// Preserves all original functionality: title, pagination, i18n, routing.
// =============================================================================

import React from 'react'

import type { Locale, ContentType, ContentCardProps, Pagination } from '@/types'

import { SiteShell } from '@/components/layout/SiteShell'
import { Title } from '@/components/typography/Title'
import { Bookshelf } from '@/components/bookshelf/Bookshelf'
import { ContentPagination } from '@/components/content/ContentPagination'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookshelfLayoutProps {
  locale: Locale
  type: ContentType
  title: string
  cards: ContentCardProps[]
  pagination?: Pagination
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookshelfLayout({
  locale,
  type,
  title,
  cards,
  pagination,
  className = '',
}: BookshelfLayoutProps): React.ReactElement {
  return (
    <SiteShell locale={locale} className={className}>
      <Title as="h1" className="mb-[var(--space-8)]">
        {title}
      </Title>

      <Bookshelf cards={cards} />

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