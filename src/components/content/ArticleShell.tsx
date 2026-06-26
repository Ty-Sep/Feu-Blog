// =============================================================================
// ArticleShell — unified detail-page article wrapper.
//
// Wraps MDX content in notebook styling:
//   NotebookPaper
//     Title (h1)
//     metadata (date + tags)
//     SketchDivider
//     Body (prose children)
//
// Dependencies:
//   - NotebookPaper  (Phase 4A)
//   - Title          (Phase 4A)
//   - SketchDivider  (Phase 4A)
//   - Body           (Phase 4A)
// =============================================================================

import React from 'react'

import { NotebookPaper } from '@/components/primitives/NotebookPaper'
import { Title } from '@/components/typography/Title'
import { SketchDivider } from '@/components/primitives/SketchDivider'
import { Body } from '@/components/typography/Body'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArticleShellProps {
  title: string
  date?: string
  tags?: string[]
  children: React.ReactNode
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  } catch {
    return date
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArticleShell({
  title,
  date,
  tags,
  children,
  className = '',
}: ArticleShellProps): React.ReactElement {
  return (
    <article className={className}>
      {/* 背景向左扩展10px，内容位置保持不变 */}
      <div style={{ marginLeft: '-10px' }}>
        <NotebookPaper>
          <div style={{ paddingLeft: '10px' }}>
            {/* ── Heading ── */}
            <Title as="h1" className="mb-[var(--space-2)]">
              {title}
            </Title>

            {/* ── Metadata row ── */}
            {(date || (tags && tags.length > 0)) && (
              <div className="flex items-center gap-[var(--space-3)] flex-wrap mb-[var(--space-4)]">
                {date && (
                  <time
                    dateTime={date}
                    className="text-sm"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    {formatDate(date)}
                  </time>
                )}

                {tags && tags.length > 0 && (
                  <ul
                    className="inline-flex gap-[var(--space-1)] flex-wrap"
                    aria-label="Tags"
                  >
                    {tags.map((tag) => (
                      <li key={tag}>
                        <span
                          className="
                            inline-block
                            px-[var(--space-1)] py-px
                            text-[0.6875rem] leading-relaxed
                            rounded-full
                            select-none
                          "
                          style={{
                            backgroundColor: 'var(--sticky-yellow)',
                            color: 'var(--ink-primary)',
                          }}
                        >
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── Divider ── */}
            <SketchDivider className="mb-[var(--space-6)]" />

            {/* ── Article body ── */}
            <Body>{children}</Body>
          </div>
        </NotebookPaper>
      </div>
    </article>
  )
}