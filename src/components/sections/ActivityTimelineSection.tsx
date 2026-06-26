// =============================================================================
// ActivityTimelineSection — recent activity in a sketch-style vertical timeline.
//
// Each entry shows: date, content-type badge, title, and a detail link.
// Timeline connector is a hand-drawn SVG path running down the left edge.
//
// Phase 9: emoji replaced with hand-drawn clock SVG, scroll-triggered stagger.
//
// Dependencies:
//   - Title           (Phase 4A)
//   - card-config     (Phase 2)
//   - framer-motion
// =============================================================================

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import type { Locale, ContentType } from '@/lib/types'
import { getDetailRoute, getCardConfig, getAccentVariable } from '@/tokens/card-config'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'
import { Title } from '@/components/typography/Title'
import { fadeUpContainer, fadeUpItem } from '@/components/animations/ScrollReveal'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimelineItem {
  date: string
  title: string
  type: ContentType
  slug: string
}

export interface ActivityTimelineSectionProps {
  items: TimelineItem[]
  locale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Locale labels
// ---------------------------------------------------------------------------

const SECTION_TITLE: Record<Locale, string> = {
  zh: '最近更新',
  en: 'Recent Activity',
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------

function formatDate(date: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
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

export function ActivityTimelineSection({
  items,
  locale,
  className = '',
}: ActivityTimelineSectionProps): React.ReactElement | null {
  if (items.length === 0) return null

  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeUpContainer}
    >
      {/* ════════════ Hand-drawn paper sheet container ════════════ */}
      <HandDrawnBorder variant="square">
        <div className="px-[var(--space-6)] py-[var(--space-8)] sm:px-[var(--space-10)] sm:py-[var(--space-10)]">
          {/* Section heading with hand-drawn clock icon */}
          <motion.div variants={fadeUpItem} className="mb-[var(--space-6)]">
            <Title as="h2">
              <svg
                className="inline-block w-5 h-5 mr-[var(--space-2)] -mt-0.5 align-middle"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M 10 5 L 10 10 L 13.5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              {SECTION_TITLE[locale]}
            </Title>
          </motion.div>

          {/* ── Timeline ── */}
          <div className="relative pl-[var(--space-8)]">
            {/* ── Hand-drawn vertical line (加粗笔触) ── */}
            <svg
              className="absolute left-[5px] top-1 h-full w-3"
              style={{ maxHeight: 'calc(100% - 0.5rem)' }}
              viewBox="0 0 12 400"
              preserveAspectRatio="none"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M 6 0 Q 4 50, 6 100 T 6 200 T 6 300 T 6 400"
                stroke="var(--ink-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="5 4"
              />
            </svg>

            {/* ── Entries ── */}
            <motion.ul
              className="flex flex-col gap-[var(--space-5)]"
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {items.map((item) => {
                const config = getCardConfig(item.type)
                const href = getDetailRoute(item.type, locale, item.slug)
                const accent = getAccentVariable(item.type)
                const typeLabel = config.label[locale]
                const formattedDate = formatDate(item.date, locale)

                return (
                  <motion.li
                    key={`${item.type}-${item.slug}`}
                    variants={fadeUpItem}
                    className="relative"
                  >
                    {/* ── Dot marker (加粗描边) ── */}
                    <svg
                      className="absolute -left-[calc(var(--space-8)-1px)] top-[0.4rem] w-[13px] h-[13px]"
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                      fill="none"
                    >
                      <circle
                        cx="6" cy="6" r="4"
                        fill="var(--bg-page)"
                        stroke={accent}
                        strokeWidth="2"
                      />
                    </svg>

                    {/* ── Content ── */}
                    <Link
                      href={href}
                      className="
                        group block
                        rounded-sketch
                        p-[var(--space-2)]
                        transition-colors duration-fade
                        hover:bg-[var(--bg-page)]
                        focus-visible:outline-2 focus-visible:outline-offset-[-2px]
                      "
                      style={{ outlineColor: 'var(--ink-primary)' }}
                    >
                      <div className="flex items-center gap-[var(--space-2)] flex-wrap text-xs mb-[var(--space-1)]">
                        {/* Date */}
                        <time dateTime={item.date} style={{ color: 'var(--ink-muted)' }}>
                          {formattedDate}
                        </time>

                        {/* Type badge */}
                        <span
                          className="
                            inline-block
                            px-[var(--space-1)] py-px
                            rounded-full
                            text-[0.625rem] font-medium
                          "
                          style={{
                            backgroundColor: accent,
                            color: 'var(--bg-page)',
                          }}
                        >
                          {typeLabel}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="
                          font-title leading-tight
                          text-sm sm:text-base
                          group-hover:underline underline-offset-[3px]
                        "
                        style={{
                          fontFamily: 'var(--font-title)',
                          color: 'var(--ink-primary)',
                        }}
                      >
                        {item.title}
                      </h3>
                    </Link>
                  </motion.li>
                )
              })}
            </motion.ul>
          </div>
        </div>
      </HandDrawnBorder>
    </motion.section>
  )
}