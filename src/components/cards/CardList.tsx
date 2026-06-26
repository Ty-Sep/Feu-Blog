// =============================================================================
// CardList — vertical stacked card layout.
//
// A pure layout component.  Renders ContentCard instances in a single-column
// flex stack.  Owns no card logic — delegates everything to ContentCard.
//
// Empty array → null.
// =============================================================================

import React, { forwardRef } from 'react'

import type { ContentCardProps } from '@/types'
import { ContentCard } from '@/components/cards/ContentCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardListProps {
  cards: ContentCardProps[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CardList = forwardRef<HTMLDivElement, CardListProps>(
  function CardList({ cards, className = '' }, ref) {
    if (cards.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`flex flex-col gap-[var(--space-3)] ${className}`}
      >
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
