// =============================================================================
// Title — semantic heading with hand-drawn font stack.
//
// The `as` prop controls the rendered HTML tag (h1–h4) for SEO and
// accessibility while keeping the visual style driven by the design system.
// Font sizes follow the typographic scale defined in design-system.md.
//
// Design tokens consumed:
//   --font-title      (Caveat / Kalam)
//   --ink-primary     (text colour)
// =============================================================================

import React, { forwardRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

export interface TitleProps {
  /** HTML heading level — controls the rendered tag. */
  as: HeadingLevel
  children: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Per-level sizing (design-system.md typography scale)
// Tailwind is mobile-first: base = mobile, sm: = 640 px ↑
// ┌──────┬──────────┬──────────┐
// │ Tag  │ Mobile   │ Desktop  │
// ├──────┼──────────┼──────────┤
// │ h1   │ 1.75rem  │ 2.25rem  │
// │ h2   │ 1.25rem  │ 1.5rem   │
// │ h3   │ 1.125rem │ 1.25rem  │
// │ h4   │ 1rem     │ 1.125rem │
// └──────┴──────────┴──────────┘
// ---------------------------------------------------------------------------

const SIZE_MAP: Record<HeadingLevel, string> = {
  h1: 'text-[1.75rem] sm:text-[2.25rem]',
  h2: 'text-[1.25rem] sm:text-[1.5rem]',
  h3: 'text-[1.125rem] sm:text-[1.25rem]',
  h4: 'text-[1rem]    sm:text-[1.125rem]',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Title = forwardRef<
  HTMLHeadingElement,
  TitleProps
>(function Title({ as: Tag, children, className = '' }, ref) {
  const sizing  = SIZE_MAP[Tag]
  const classes = `font-title leading-tight ${sizing} ${className}`

  const style: React.CSSProperties = {
    fontFamily: 'var(--font-title)',
    color:      'var(--ink-primary)',
  }

  return (
    <Tag ref={ref} className={classes} style={style}>
      {children}
    </Tag>
  )
})
