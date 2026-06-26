// =============================================================================
// StickyNote — decorative sticky-note wrapper.
//
// An absolutely-positioned container with a slightly rotated, coloured
// background and a subtle shadow.  Three semantic colours map to CSS
// variables defined in the design system.
//
// Rotation is controlled by the parent via the `rotation` prop so SSR
// and hydration produce identical output.
//
// Design tokens consumed:
//   --sticky-yellow / --sticky-blue / --sticky-pink   (background)
//   --ink-primary                                       (text)
//   --shadow-note                                       (box-shadow)
// =============================================================================

import React, { forwardRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StickyColor = 'yellow' | 'blue' | 'pink'

export interface StickyNoteProps {
  children: React.ReactNode
  color?: StickyColor
  /** Rotation in degrees. Parent should seed this deterministically. */
  rotation?: number
  className?: string
}

// ---------------------------------------------------------------------------
// Colour → CSS variable map
// ---------------------------------------------------------------------------

const COLOR_MAP: Record<StickyColor, string> = {
  yellow: 'var(--sticky-yellow)',
  blue:   'var(--sticky-blue)',
  pink:   'var(--sticky-pink)',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StickyNote = forwardRef<HTMLDivElement, StickyNoteProps>(
  function StickyNote(
    { children, color = 'yellow', rotation = 0, className = '' },
    ref,
  ) {
    const bg = COLOR_MAP[color]

    const style: React.CSSProperties = {
      backgroundColor: bg,
      color:        'var(--ink-primary)',
      boxShadow:    'var(--shadow-note)',
      transform:    `rotate(${rotation}deg)`,
      padding:      'var(--space-4)',
      borderRadius: '0.125rem',
    }

    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    )
  },
)
