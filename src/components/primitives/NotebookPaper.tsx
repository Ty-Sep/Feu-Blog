// =============================================================================
// NotebookPaper — paper-texture background with optional ruled lines.
//
// Used as the inner reading surface for article content areas and code blocks.
// Ruled lines (lined=true) are rendered via a CSS repeating-linear-gradient.
//
// Design tokens consumed:
//   --bg-prose       (paper background)
//   --ink-muted      (ruled line colour, very low opacity)
//   --content-max-width
// =============================================================================

import React, { forwardRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotebookPaperProps {
  children: React.ReactNode
  /** When true, renders ruled horizontal lines like a physical notebook. */
  lined?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const NotebookPaper = forwardRef<HTMLDivElement, NotebookPaperProps>(
  function NotebookPaper({ children, lined = false, className = '' }, ref) {
    const base = `w-full max-w-[var(--content-max-width)] mx-auto px-[var(--space-6)] py-[var(--space-8)] ${className}`

    const style: React.CSSProperties = {
      backgroundColor: 'var(--bg-prose)',
      ...(lined && {
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent calc(1.75rem - 1px),
            color-mix(in srgb, var(--ink-muted) 8%, transparent) calc(1.75rem - 1px),
            color-mix(in srgb, var(--ink-muted) 8%, transparent) 1.75rem
          )
        `,
      }),
    }

    return (
      <div ref={ref} className={base} style={style}>
        {children}
      </div>
    )
  },
)
