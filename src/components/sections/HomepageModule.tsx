// =============================================================================
// HomepageModule — a single content-type row on the homepage.
//
// Structure:
//   Title (h2)
//   SketchDivider
//   CardGrid (top-N cards for this content type)
//   "View all →" link (route derived from CARD_CONFIG)
//
// Zero hardcoded routing — the "View all" link always uses getListRoute().
//
// Dependencies:
//   - @/components/typography/Title.tsx
//   - @/components/primitives/SketchDivider.tsx
//   - @/components/cards/CardGrid.tsx
//   - @/tokens/card-config.ts: getListRoute
//   - @/lib/types.ts: ContentCardProps, ContentType, Locale
// =============================================================================

import React from 'react'
import Link from 'next/link'

import type { ContentCardProps, ContentType, Locale } from '@/lib/types'
import { getListRoute } from '@/tokens/card-config'

import { Title } from '@/components/typography/Title'
import { SketchDivider } from '@/components/primitives/SketchDivider'
import { CardGrid } from '@/components/cards/CardGrid'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HomepageModuleProps {
  title: string
  cards: ContentCardProps[]
  locale: Locale
  type: ContentType
  className?: string
}

// ---------------------------------------------------------------------------
// Locale-aware "View all" label
// ---------------------------------------------------------------------------

const VIEW_ALL_LABEL: Record<Locale, string> = {
  zh: '查看全部 →',
  en: 'View all →',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomepageModule({
  title,
  cards,
  locale,
  type,
  className = '',
}: HomepageModuleProps): React.ReactElement | null {
  if (cards.length === 0) {
    return null
  }

  const listHref   = getListRoute(type, locale)
  const viewAllText = VIEW_ALL_LABEL[locale]

  return (
    <section className={className}>
      {/* ── Section heading ── */}
      <Title as="h2" className="mb-[var(--space-2)]">
        {title}
      </Title>

      {/* ── Hand-drawn divider ── */}
      <SketchDivider className="mb-[var(--space-4)]" />

      {/* ── Card grid ── */}
      <CardGrid cards={cards} />

      {/* ── View all link ── */}
      <div className="mt-[var(--space-4)] text-right">
        <Link
          href={listHref}
          className="
            inline-flex items-center gap-[var(--space-1)]
            text-sm font-medium
            hover:underline underline-offset-[3px]
            transition-colors
          "
          style={{ color: 'var(--ink-secondary)' }}
        >
          {viewAllText}
        </Link>
      </div>
    </section>
  )
}
