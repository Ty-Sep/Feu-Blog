// =============================================================================
// BookNavigation — chapter list & prev/next navigation for Book mode.
//
// variant="list"  → sidebar chapter list (full width)
// variant="nav"   → bottom prev/next bar
//
// Uses onChapterChange callback for client-side switching — no page reload.
//
// Dependencies: none (zero external packages)
// =============================================================================

'use client'

import React from 'react'

import type { BookChapter } from '@/lib/content'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookNavigationProps {
  /** All chapters in the book, sorted by chapter number. */
  chapters: BookChapter[]
  /** Index of the currently active chapter (0-based). */
  activeIndex: number
  /** Called when the user selects a chapter or clicks prev/next. */
  onChapterChange: (index: number) => void
  variant: 'list' | 'nav'
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS = {
  zh: { prev: '← 上一章', next: '下一章 →' },
  en: { prev: '← Previous', next: 'Next →' },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookNavigation({
  chapters,
  activeIndex,
  onChapterChange,
  variant,
}: BookNavigationProps): React.ReactElement | null {
  if (chapters.length === 0) return null

  const labels = LABELS.zh

  // ── Variant: list (sidebar) ──
  if (variant === 'list') {
    return (
      <nav aria-label="章节导航">
        <ul className="flex flex-col gap-[var(--space-1)]">
          {chapters.map((chapter, idx) => {
            const isCurrent = idx === activeIndex
            return (
              <li key={chapter.slug}>
                <button
                  type="button"
                  onClick={() => onChapterChange(idx)}
                  className="
                    block w-full text-left text-sm leading-relaxed py-[var(--space-1)]
                    transition-colors duration-fade
                    hover:underline underline-offset-[3px]
                  "
                  style={{
                    color: 'var(--ink-primary)',
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  {chapter.title}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  // ── Variant: nav (bottom prev/next) ──
  const prev = activeIndex > 0 ? chapters[activeIndex - 1] : undefined
  const next = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : undefined

  return (
    <nav
      aria-label="章节导航"
      className="flex items-center justify-between mt-[var(--space-12)]"
    >
      {prev ? (
        <button
          type="button"
          onClick={() => onChapterChange(activeIndex - 1)}
          className="
            text-sm leading-relaxed
            transition-colors duration-fade
            hover:underline underline-offset-[3px]
          "
          style={{ color: 'var(--ink-primary)', fontWeight: 500 }}
        >
          {labels.prev}
        </button>
      ) : (
        <span />
      )}

      {next ? (
        <button
          type="button"
          onClick={() => onChapterChange(activeIndex + 1)}
          className="
            text-sm leading-relaxed
            transition-colors duration-fade
            hover:underline underline-offset-[3px]
          "
          style={{ color: 'var(--ink-primary)', fontWeight: 500 }}
        >
          {labels.next}
        </button>
      ) : (
        <span />
      )}
    </nav>
  )
}
