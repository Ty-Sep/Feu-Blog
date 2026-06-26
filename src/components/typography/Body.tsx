// =============================================================================
// Body — prose body-text wrapper.
//
// Applies the body font stack (Noto Sans SC / Source Han Sans) and the
// design-system line-height.  Wraps MDX article content inside ArticleShell
// and is consumed by MDXRenderer.
//
// Design tokens consumed:
//   --font-body       (Noto Sans SC / Source Han Sans)
//   --ink-primary     (text colour)
// =============================================================================

import React, { forwardRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BodyProps {
  children: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Body = forwardRef<HTMLDivElement, BodyProps>(
  function Body({ children, className = '' }, ref) {
    const classes = `font-body leading-[1.75] text-[1rem] sm:text-[0.9375rem] ${className}`

    const style: React.CSSProperties = {
      fontFamily: 'var(--font-body)',
      color:      'var(--ink-primary)',
    }

    return (
      <div ref={ref} className={classes} style={style}>
        {children}
      </div>
    )
  },
)
