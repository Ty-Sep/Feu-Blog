// =============================================================================
// HeroPlayground — reserved interactive area beneath the hero cover.
//
// Phase 3A placeholder.  Future contents:
//   - Bird sticker
//   - Coffee sticker
//   - Matter.js hand-drawn mini-game
//
// Currently renders an empty container that reserves space without affecting
// the hero-to-workspace transition.
//
// Dependencies: none (pure static container)
// =============================================================================

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroPlaygroundProps {
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroPlayground({
  className = '',
}: HeroPlaygroundProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{ minHeight: '120px' }}
      aria-hidden="true"
    />
  )
}
