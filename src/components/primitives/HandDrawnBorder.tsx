// =============================================================================
// HandDrawnBorder — SVG hand-drawn border wrapper.
//
// Renders an irregular, sketch-like border around children using an SVG filter
// (feTurbulence + feDisplacementMap).  No CSS border property is used —
// the stroke is a wobbled <rect> inside an absolutely-positioned SVG overlay.
//
// Variants:
//   square       — single rough line, used for cards and article shells
//   sticky-note  — square + corner fold hint
//   sketch       — loose double-line, used for archive panels
//
// Design tokens consumed:
//   --ink-primary   (stroke colour)
//   --bg-card       (fill colour)
// =============================================================================

import React, { forwardRef, useId } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BorderVariant = 'square' | 'sticky-note' | 'sketch'

export interface HandDrawnBorderProps {
  children: React.ReactNode
  variant?: BorderVariant
  className?: string
}

// ---------------------------------------------------------------------------
// Filter constants — tuned to feel hand-drawn without looking childish
// ---------------------------------------------------------------------------

const FILTER_SEED = 3 // deterministic seed so every render is identical
const TURBULENCE_BASE_FREQ = 0.035
const TURBULENCE_OCTAVES = 2
const DISPLACEMENT_SCALE = 1.8

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const HandDrawnBorder = forwardRef<HTMLDivElement, HandDrawnBorderProps>(
  function HandDrawnBorder({ children, variant = 'square', className = '' }, ref) {
    const filterId = useId()

    const padding  = 'p-[var(--space-4)]'
    const base     = `relative ${padding} ${className}`

    return (
      <div ref={ref} className={base}>
        {/* ── SVG overlay (non-interactive) ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <filter
              id={filterId}
              x="-4%"
              y="-4%"
              width="108%"
              height="108%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={String(TURBULENCE_BASE_FREQ)}
                numOctaves={TURBULENCE_OCTAVES}
                seed={FILTER_SEED}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={DISPLACEMENT_SCALE}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          {/* Outer stroke */}
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            fill="var(--bg-card)"
            stroke="var(--ink-primary)"
            strokeWidth="1.5"
            filter={`url(#${filterId})`}
          />

          {variant === 'sketch' && (
            /* Second offset stroke for loose sketch look */
            <rect
              x="5"
              y="5"
              width="calc(100% - 10px)"
              height="calc(100% - 10px)"
              fill="none"
              stroke="var(--ink-primary)"
              strokeWidth="0.8"
              filter={`url(#${filterId})`}
            />
          )}

          {variant === 'sticky-note' && (
            /* Corner fold triangle */
            <path
              d="M calc(100% - 16px) 0 L 100% 0 L 100% 16 Z"
              fill="var(--bg-page)"
              stroke="var(--ink-primary)"
              strokeWidth="1"
              filter={`url(#${filterId})`}
            />
          )}
        </svg>

        {/* ── Content ── */}
        <div className="relative z-[1]">{children}</div>
      </div>
    )
  },
)
