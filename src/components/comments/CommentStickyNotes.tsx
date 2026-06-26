// =============================================================================
// CommentStickyNotes — Giscus comment section wrapped in notebook styling.
//
// Renders the Giscus widget inside a StickyNote container.  All browser-only
// APIs (iframe injection, Giscus script) are scoped to this Client Component.
//
// Requires: @giscus/react (npm install @giscus/react)
//
// Dependencies:
//   - StickyNote (Phase 4A) — visual wrapper
// =============================================================================

'use client'

import React, { Suspense } from 'react'
import Giscus from '@giscus/react'

import { StickyNote } from '@/components/primitives/StickyNote'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommentStickyNotesProps {
  /** GitHub repository in "owner/name" format. */
  repo: `${string}/${string}`
  repoId: string
  category: string
  categoryId: string
  /** Page → discussion mapping strategy ("pathname" is recommended). */
  mapping?: 'specific' | 'number' | 'pathname' | 'title' | 'og:title'
  /** Giscus theme name — should match the site theme. */
  theme?: string
  /** ISO 639-1 language code. */
  lang?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function CommentSkeleton(): React.ReactElement {
  return (
    <div
      className="animate-pulse p-[var(--space-8)] text-center text-sm"
      style={{ color: 'var(--ink-muted)' }}
      aria-busy="true"
    >
      Loading comments…
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error boundary fallback
// ---------------------------------------------------------------------------

function CommentFallback(): React.ReactElement {
  return (
    <p
      className="p-[var(--space-6)] text-center text-sm"
      style={{ color: 'var(--ink-muted)' }}
      role="status"
    >
      Comments are unavailable right now.
    </p>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommentStickyNotes({
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  theme = 'light',
  lang = 'en',
  className = '',
}: CommentStickyNotesProps): React.ReactElement {
  return (
    <StickyNote color="yellow" rotation={-0.8} className={className}>
      <section aria-label="Comments">
        <h2
          className="font-title text-xl mb-[var(--space-4)]"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--ink-primary)' }}
        >
          Comments
        </h2>

        <React.Suspense fallback={<CommentSkeleton />}>
          <ErrorBoundary fallback={<CommentFallback />}>
            <Giscus
              repo={repo}
              repoId={repoId}
              category={category}
              categoryId={categoryId}
              mapping={mapping}
              theme={theme}
              lang={lang}
              strict="0"
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              loading="lazy"
            />
          </ErrorBoundary>
        </React.Suspense>
      </section>
    </StickyNote>
  )
}

// ---------------------------------------------------------------------------
// Minimal ErrorBoundary (class component required by React)
// ---------------------------------------------------------------------------

type EBProps = { fallback: React.ReactNode; children: React.ReactNode }
type EBState = { hasError: boolean }

class ErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): EBState {
    return { hasError: true }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
