// =============================================================================
// MDXRenderer — MDX content display wrapper.
//
// Wraps compiled MDX output (already processed by @next/mdx at build time)
// in the prose-notebook typography context.  Performs no runtime compilation —
// that is handled by the build pipeline.
//
// The mdx-components.tsx file at the project root provides element overrides
// (CodeBlock, headings, etc.) — this component only supplies the prose wrapper.
//
// Dependencies:
//   - Body (Phase 4A) — applies font-body + line-height
// =============================================================================

import React from 'react'

import { Body } from '@/components/typography/Body'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MDXRendererProps {
  /** Compiled MDX content — injected by the page component. */
  children: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MDXRenderer({
  children,
  className = '',
}: MDXRendererProps): React.ReactElement {
  return (
    <div className={`prose-notebook ${className}`}>
      <Body>{children}</Body>
    </div>
  )
}
