// =============================================================================
// ContentCard — data-driven content card for all content types.
//
// Shows title, description, and date.  Type badge and tags are intentionally
// hidden to keep the card list clean — detail pages still display full metadata.
// =============================================================================

import React, { forwardRef } from 'react'
import Link from 'next/link'

import type { ContentCardProps } from '@/lib/types'
import {
  getAccentVariable,
  getDetailRoute,
} from '@/tokens/card-config'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: string, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  } catch {
    return date
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  function ContentCard(props, ref) {
    const { type, title, description, date, slug, lang } = props

    const accentVar  = getAccentVariable(type)
    const detailHref = getDetailRoute(type, lang, slug)

    const formattedDate = date ? formatDate(date, lang) : null

    return (
      <HandDrawnBorder ref={ref} variant="square">
        <Link
          href={detailHref}
          className="
            group block
            rounded-sketch
            p-[var(--space-3)]
            transition-colors duration-fade
            hover:bg-[var(--bg-page)]
            focus-visible:outline-2 focus-visible:outline-offset-2
          "
          style={{ outlineColor: accentVar }}
        >
          {/* ── Title ── */}
          <h3
            className="
              font-title leading-tight
              text-[1.125rem] sm:text-[1.25rem]
              mb-[var(--space-1)]
              group-hover:underline
              decoration-[var(--ink-muted)] underline-offset-[3px]
            "
            style={{ fontFamily: 'var(--font-title)', color: 'var(--ink-primary)' }}
          >
            {title}
          </h3>

          {/* ── Description ── */}
          {description && (
            <p
              className="
                text-sm leading-relaxed
                mb-[var(--space-2)]
                line-clamp-2
              "
              style={{ color: 'var(--ink-secondary)' }}
            >
              {description}
            </p>
          )}

          {/* ── Footer: date ── */}
          <div className="flex items-center gap-[var(--space-2)] flex-wrap mt-auto">
            {formattedDate && (
              <time
                dateTime={date}
                className="text-xs"
                style={{ color: 'var(--ink-muted)' }}
              >
                {formattedDate}
              </time>
            )}
          </div>
        </Link>
      </HandDrawnBorder>
    )
  },
)
