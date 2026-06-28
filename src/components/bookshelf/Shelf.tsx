// =============================================================================
// Shelf — single shelf row.
// Books align to bottom (stand on the board), start from left.
// Fixed layer height: book height grows upward, never breaks through the board.
// =============================================================================

import React from 'react'

import type { ContentCardProps } from '@/types'
import { BookItem } from './BookItem'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShelfProps {
  books: ContentCardProps[]
  layerIndex: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Shelf({ books, layerIndex }: ShelfProps): React.ReactElement {
  return (
    <div
      className="
        flex items-end justify-start
        gap-2
        w-full
        h-[120px] /* 🔧 每层固定高度，调整此值让书本底部刚好对齐层板 */
      "
    >
      {books.map((card, idx) => (
        <BookItem
          key={`${card.type}-${card.slug}-${card.lang}`}
          card={card}
          index={layerIndex * 10 + idx}
        />
      ))}
    </div>
  )
}