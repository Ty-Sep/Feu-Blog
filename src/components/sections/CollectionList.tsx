// =============================================================================
// CollectionList — archive left-panel "notes collections" links.
//
// Renders a simple list of labelled links.  No hardcoded routes — all hrefs
// arrive via props.
//
// Dependencies:
//   - @/lib/types.ts: CollectionLink
// =============================================================================

import React from 'react'
import Link from 'next/link'

import type { CollectionLink } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollectionListProps {
  collections: CollectionLink[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionList({
  collections,
  className = '',
}: CollectionListProps): React.ReactElement | null {
  if (collections.length === 0) {
    return null
  }

  return (
    <nav aria-label="Collections" className={className}>
      <h2
        className="font-title text-lg mb-[var(--space-3)]"
        style={{ fontFamily: 'var(--font-title)', color: 'var(--ink-primary)' }}
      >
        Collections
      </h2>

      <ul className="flex flex-col gap-[var(--space-1)]">
        {collections.map((col) => (
          <li key={col.href}>
            <Link
              href={col.href}
              className="
                block
                px-[var(--space-2)] py-[var(--space-1)]
                rounded-sketch
                text-sm
                transition-colors duration-fade
                hover:bg-[var(--bg-card)]
                focus-visible:outline-2 focus-visible:outline-offset-[-2px]
              "
              style={{ outlineColor: 'var(--ink-primary)' }}
            >
              {col.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
