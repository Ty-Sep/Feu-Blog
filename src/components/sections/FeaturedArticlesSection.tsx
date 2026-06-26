// =============================================================================
// FeaturedArticlesSection — hand-picked articles in a hand-drawn layout.
//
// Renders a horizontal scrollable row of article cards, each wrapped in a
// HandDrawnBorder (square).  Cards show title, description, date, and tags.
//
// Phase 9: emoji replaced with hand-drawn star SVG, scroll-triggered stagger.
//
// Dependencies:
//   - HandDrawnBorder (Phase 4A)
//   - Title           (Phase 4A)
//   - card-config     (Phase 2)
//   - framer-motion
// =============================================================================

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import type { Locale, ContentCardProps } from '@/lib/types'
import { getDetailRoute, getCardConfig, getAccentVariable } from '@/tokens/card-config'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'
import { Title } from '@/components/typography/Title'
import { fadeUpContainer, fadeUpItem } from '@/components/animations/ScrollReveal'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeaturedArticlesSectionProps {
  articles: ContentCardProps[]
  locale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Locale labels
// ---------------------------------------------------------------------------

const SECTION_TITLE: Record<Locale, string> = {
  zh: '精选文章',
  en: 'Featured Articles',
}

// ---------------------------------------------------------------------------
// Date formatter (SSR-safe)
// ---------------------------------------------------------------------------

function formatDate(date: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
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

export function FeaturedArticlesSection({
  articles,
  locale,
  className = '',
}: FeaturedArticlesSectionProps): React.ReactElement | null {
  if (articles.length === 0) return null

  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeUpContainer}
    >
      {/* ════════════ Paper sheet container ════════════ */}
      <div
        className="px-[var(--space-6)] py-[var(--space-8)] sm:px-[var(--space-10)] sm:py-[var(--space-10)]"
        style={{
          backgroundColor: '#faf7f0',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Section heading with hand-drawn star icon */}
        <motion.div variants={fadeUpItem}>
          <Title as="h2" className="mb-[var(--space-6)]">
          <svg
            className="inline-block w-5 h-5 mr-[var(--space-2)] -mt-0.5 align-middle"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 10 2 L 12 7.5 L 18 8 L 13.5 12 L 14.5 18 L 10 15 L 5.5 18 L 6.5 12 L 2 8 L 8 7.5 Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          {SECTION_TITLE[locale]}
        </Title>
      </motion.div>

      {/* ── Horizontal scrollable row ── */}
      <motion.div
        className="
          flex gap-[var(--space-4)]
          overflow-x-auto
          pl-[var(--space-4)] pt-[var(--space-2)] pb-[var(--space-2)]
          snap-x snap-mandatory
          scroll-pl-[var(--space-4)]
          scrollbar-thin
        "
        style={{ scrollbarColor: 'var(--ink-muted) transparent' }}
        variants={fadeUpContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {articles.map((article) => {
          const config = getCardConfig(article.type)
          const href = getDetailRoute(article.type, locale, article.slug)
          const accent = getAccentVariable(article.type)
          const typeLabel = config.label[locale]
          const formattedDate = article.date ? formatDate(article.date, locale) : null

          return (
            <motion.div
              key={`${article.type}-${article.slug}`}
              variants={fadeUpItem}
            >
              <Link
                href={href}
                className="
                  group block
                  min-w-[16rem] max-w-[18rem]
                  flex-shrink-0
                  snap-start
                  transition-transform duration-fade
                  hover:scale-[1.02]
                "
              >
                <HandDrawnBorder variant="square">
                  <div className="p-[var(--space-3)]">
                    {/* ── Type badge ── */}
                    <span
                      className="
                        inline-block
                        mb-[var(--space-2)]
                        text-[0.6875rem] font-medium tracking-wide uppercase
                      "
                      style={{ color: accent }}
                    >
                      {typeLabel}
                    </span>

                    {/* ── Title ── */}
                    <h3
                      className="
                        font-title leading-tight
                        text-base sm:text-lg
                        mb-[var(--space-2)]
                        group-hover:underline underline-offset-[3px]
                      "
                      style={{
                        fontFamily: 'var(--font-title)',
                        color: 'var(--ink-primary)',
                      }}
                    >
                      {article.title}
                    </h3>

                    {/* ── Description ── */}
                    {article.description && (
                      <p
                        className="
                          text-sm leading-relaxed
                          mb-[var(--space-2)]
                          line-clamp-2
                        "
                        style={{ color: 'var(--ink-secondary)' }}
                      >
                        {article.description}
                      </p>
                    )}

                    {/* ── Footer ── */}
                    <div className="flex items-center gap-[var(--space-2)] flex-wrap">
                      {formattedDate && (
                        <time
                          dateTime={article.date}
                          className="text-xs"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          {formattedDate}
                        </time>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <ul className="inline-flex gap-[var(--space-1)] flex-wrap">
                          {article.tags.slice(0, 3).map((tag) => (
                            <li key={tag}>
                              <span
                                className="
                                  inline-block
                                  px-[var(--space-1)] py-px
                                  text-[0.625rem] leading-relaxed
                                  rounded-full
                                  select-none
                                "
                                style={{
                                  backgroundColor: accent,
                                  color: 'var(--bg-page)',
                                }}
                              >
                                {tag}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </HandDrawnBorder>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
      </div>
    </motion.section>
  )
}
