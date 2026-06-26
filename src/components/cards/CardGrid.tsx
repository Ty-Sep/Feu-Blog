// =============================================================================
// CardGrid — responsive card grid.
//
// A pure layout component.  It owns no card logic — it receives ContentCard
// props and delegates rendering to <ContentCard />.  Responsive breakpoints:
//
//   mobile  (< 768 px)  → 1 column
//   tablet  (≥ 768 px)  → 2 columns
//   desktop (≥ 1024 px) → 3 columns
//
// An empty-card array renders nothing (no placeholder, no error).
// =============================================================================

import React, { forwardRef } from 'react'

import type { ContentCardProps } from '@/lib/types'
import { ContentCard } from '@/components/cards/ContentCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardGridProps {
  cards: ContentCardProps[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  function CardGrid({ cards, className = '' }, ref) {
    if (cards.length === 0) {
      return null
    }

    const gridClasses = `
      grid
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      gap-[var(--space-4)]
      ${className}
    `

    return (
      <div ref={ref} className={gridClasses}>
        {cards.map((card) => (
          <ContentCard
            key={`${card.type}-${card.slug}-${card.lang}`}
            {...card}
          />
        ))}
      </div>
    )
  },
)
