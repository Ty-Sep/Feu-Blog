// =============================================================================
// BookDecoration — static shelf ornaments.
//
// Pure decorative elements, no animation, no interaction.
// Hand-drawn SVG style, matches notebook aesthetic.
// =============================================================================

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecorationType = 'plant' | 'inkwell' | 'feather'

interface BookDecorationProps {
  type: DecorationType
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookDecoration({ type }: BookDecorationProps): React.ReactElement {
  const baseClass = 'flex-shrink-0 flex items-end justify-center h-[140px] pb-2'

  if (type === 'plant') {
    return (
      <div className={baseClass} style={{ width: '56px' }}>
        <svg viewBox="0 0 48 80" fill="none" aria-hidden="true">
          {/* Pot */}
          <path d="M12 60 L36 60 L34 76 L14 76 Z"
            fill="#c9a67c" stroke="var(--ink-primary)" strokeWidth="1.2" />
          {/* Leaves */}
          <path d="M24 60 Q10 40 16 20 Q24 30 24 60"
            fill="#9bb38b" stroke="var(--ink-primary)" strokeWidth="1" />
          <path d="M24 60 Q38 38 32 18 Q24 28 24 60"
            fill="#8ba67c" stroke="var(--ink-primary)" strokeWidth="1" />
        </svg>
      </div>
    )
  }

  if (type === 'inkwell') {
    return (
      <div className={baseClass} style={{ width: '52px' }}>
        <svg viewBox="0 0 44 60" fill="none" aria-hidden="true">
          {/* Base */}
          <ellipse cx="22" cy="52" rx="18" ry="6"
            fill="#3a3a3a" stroke="var(--ink-primary)" strokeWidth="1.2" />
          {/* Body */}
          <path d="M8 52 L12 28 L32 28 L36 52 Z"
            fill="#4a4a4a" stroke="var(--ink-primary)" strokeWidth="1.2" />
          {/* Neck */}
          <ellipse cx="22" cy="28" rx="10" ry="4"
            fill="#2a2a2a" stroke="var(--ink-primary)" strokeWidth="1" />
        </svg>
      </div>
    )
  }

  // feather
  return (
    <div className={baseClass} style={{ width: '48px' }}>
      <svg viewBox="0 0 40 80" fill="none" aria-hidden="true">
        <path d="M20 76 Q8 50 12 20 Q20 4 28 20 Q32 50 20 76 Z"
          fill="#e8dcc8" stroke="var(--ink-primary)" strokeWidth="1.2" />
        <line x1="20" y1="12" x2="20" y2="76"
          stroke="var(--ink-primary)" strokeWidth="0.8" />
      </svg>
    </div>
  )
}