// =============================================================================
// SketchDivider — hand-drawn squiggly horizontal rule.
//
// Renders a light-weight SVG path that simulates a quickly-drawn dividing
// line.  Used between homepage sections and inside the archive panel.
//
// Design tokens consumed:
//   --ink-muted   (stroke colour)
// =============================================================================

import React, { forwardRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SketchDividerProps {
  className?: string
}

// ---------------------------------------------------------------------------
// SVG path — a single slightly-irregular horizontal stroke
// ---------------------------------------------------------------------------

const PATH_DATA =
  'M 4 8 Q 32 5, 64 8 T 128 7 T 192 8 T 256 7 T 320 8 T 384 7 T 448 8 T 512 7 T 576 8 T 640 7 T 704 8 T 768 7'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SketchDivider = forwardRef<SVGSVGElement, SketchDividerProps>(
  function SketchDivider({ className = '' }, ref) {
    return (
      <svg
        ref={ref}
        className={`w-full h-4 ${className}`}
        viewBox="0 0 800 16"
        preserveAspectRatio="none"
        aria-hidden="true"
        fill="none"
      >
        <path
          d={PATH_DATA}
          stroke="var(--ink-muted)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)
