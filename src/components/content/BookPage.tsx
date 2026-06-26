// =============================================================================
// BookPage — client-side book reading experience.
//
// Receives the SSR-rendered first chapter from the server.  Other chapters are
// loaded on demand via Server Action and cached client-side so subsequent
// switches are instant.
//
// Layout:
//   SiteShell → two-column [TocTabs sidebar | chapter content + BookNavigation]
//
// Dependencies:
//   - SiteShell, TocTabs, TableOfContents, BookNavigation
//   - NotebookPaper, Title, SketchDivider, Body (for lazy-chapter wrappers)
// =============================================================================

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import type { Locale } from '@/types'
import type { TocItem } from '@/types'
import type { BookChapterContent } from '@/types'

import { SiteShell } from '@/components/layout/SiteShell'
import { TocTabs } from '@/components/content/TocTabs'
import { TableOfContents } from '@/components/content/TableOfContents'
import { BookNavigation } from '@/components/content/BookNavigation'
import { NotebookPaper } from '@/components/primitives/NotebookPaper'
import { Title } from '@/components/typography/Title'
import { SketchDivider } from '@/components/primitives/SketchDivider'
import { Body } from '@/components/typography/Body'
import { loadChapter, loadCachedChapter } from '@/app/actions/loadChapter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookPageProps {
  locale: Locale
  /** Book title (e.g. "软件设计师"). */
  bookTitle: string
  /** All chapters with pre-extracted TOC + rawContent for lazy loading. */
  chapters: (BookChapterContent & { toc: TocItem[] })[]
  /** SSR-rendered first chapter (ArticleShell + MarkdownAsync or cached HTML). */
  initialRenderedChapter: React.ReactNode
  /**
   * Build-time cache lookup: chapter slug → htmlPath.
   * When provided, chapter switching reads pre-rendered HTML from cache
   * instead of running the full remark/rehype/Shiki pipeline at runtime.
   */
  chapterHtmlPaths?: Map<string, string>
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
// LazyChapterShell — ArticleShell-alike for client-rendered HTML chapters.
// ---------------------------------------------------------------------------

function LazyChapterShell({
  title,
  date,
  tags,
  html,
}: {
  title: string
  date?: string
  tags?: string[]
  html: string
}): React.ReactElement {
  return (
    <article>
      <div style={{ marginLeft: '-10px' }}>
        <NotebookPaper>
          <div style={{ paddingLeft: '10px' }}>
            <Title as="h1" className="mb-[var(--space-2)]">
              {title}
            </Title>

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

            <SketchDivider className="mb-[var(--space-6)]" />

            <Body>
              <div
                className="prose-notebook"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </Body>
          </div>
        </NotebookPaper>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// ChapterLoadingShell — placeholder shown while a chapter is being fetched.
// ---------------------------------------------------------------------------

function ChapterLoadingShell({
  title,
  date,
  tags,
}: {
  title: string
  date?: string
  tags?: string[]
}): React.ReactElement {
  return (
    <article>
      <div style={{ marginLeft: '-10px' }}>
        <NotebookPaper>
          <div style={{ paddingLeft: '10px' }}>
            <Title as="h1" className="mb-[var(--space-2)]">
              {title}
            </Title>

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
                            rounded-full select-none
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

            <SketchDivider className="mb-[var(--space-6)]" />

            <Body>
              <div
                className="prose-notebook animate-pulse"
                style={{ color: 'var(--ink-muted)' }}
              >
                <p className="text-sm">Loading…</p>
              </div>
            </Body>
          </div>
        </NotebookPaper>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookPage({
  locale,
  bookTitle,
  chapters,
  initialRenderedChapter,
  chapterHtmlPaths,
  className = '',
}: BookPageProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const [htmlCache, setHtmlCache] = useState<Map<number, string>>(new Map())
  const loadingRef = useRef<Set<number>>(new Set())

  const activeChapter = chapters[activeIndex]!

  // ── Load a chapter via cache or Server Action ──
  const loadChapterHtml = useCallback(
    async (index: number) => {
      // Skip chapter 0 — it's already SSR-rendered
      if (index === 0) return
      if (htmlCache.has(index) || loadingRef.current.has(index)) return

      loadingRef.current.add(index)

      try {
        // Prefer build-time cache (instant file read, no pipeline)
        const chapterSlug = chapters[index]!.slug
        const htmlPath = chapterHtmlPaths?.get(chapterSlug)

        let result = htmlPath ? await loadCachedChapter(htmlPath) : null

        // Fallback to runtime rendering (full remark/rehype/Shiki pipeline)
        if (!result) {
          result = await loadChapter(chapters[index]!.rawContent)
        }

        setHtmlCache((prev) => {
          const next = new Map(prev)
          next.set(index, result!.html)
          return next
        })
      } finally {
        loadingRef.current.delete(index)
      }
    },
    [chapters, htmlCache, chapterHtmlPaths],
  )

  // ── Chapter switch handler ──
  const handleChapterChange = useCallback(
    (index: number) => {
      setActiveIndex(index)
      // Trigger load if not already cached or loading
      if (index !== 0 && !htmlCache.has(index)) {
        loadChapterHtml(index)
      }
    },
    [htmlCache, loadChapterHtml],
  )

  // ── Preload next chapter when scroll > 70% ──
  useEffect(() => {
    const onScroll = () => {
      const scrollPercent =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight

      if (scrollPercent > 0.7) {
        const nextIndex = activeIndex + 1
        if (
          nextIndex < chapters.length &&
          nextIndex !== 0 &&
          !htmlCache.has(nextIndex) &&
          !loadingRef.current.has(nextIndex)
        ) {
          const schedule =
            typeof requestIdleCallback !== 'undefined'
              ? requestIdleCallback
              : (cb: () => void) => setTimeout(cb, 200)

          schedule(() => loadChapterHtml(nextIndex))
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeIndex, chapters.length, htmlCache, loadChapterHtml])

  // ── Render current chapter content ──
  const renderContent = (): React.ReactNode => {
    // Chapter 0: use the SSR-rendered React element
    if (activeIndex === 0) {
      return initialRenderedChapter
    }

    // Cached: render with ArticleShell-equivalent wrapper
    const html = htmlCache.get(activeIndex)
    if (html) {
      return (
        <LazyChapterShell
          title={activeChapter.title}
          date={activeChapter.frontmatter.date}
          tags={activeChapter.frontmatter.tags}
          html={html}
        />
      )
    }

    // Loading: show placeholder with chapter metadata
    return (
      <ChapterLoadingShell
        title={activeChapter.title}
        date={activeChapter.frontmatter.date}
        tags={activeChapter.frontmatter.tags}
      />
    )
  }

  return (
    <SiteShell
      locale={locale}
      className={`${className} [--homepage-max-width:96rem]`}
    >
      <div className="flex gap-0 -mt-[var(--space-3)]">
        {/* ── Desktop sidebar ── */}
        <div className="hidden lg:block self-stretch flex-shrink-0 w-[17.5rem] -ml-[var(--space-3)]">
          <TocTabs
            locale={locale}
            seriesTab={
              <BookNavigation
                chapters={chapters}
                activeIndex={activeIndex}
                onChapterChange={handleChapterChange}
                variant="list"
              />
            }
            tocTab={
              activeChapter.toc.length > 0 ? (
                <TableOfContents
                  items={activeChapter.toc}
                  locale={locale}
                  variant="embedded"
                />
              ) : (
                <></>
              )
            }
          />
        </div>

        {/* ── Content column ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile TOC (hidden on desktop) */}
          {activeChapter.toc.length > 0 && (
            <div className="lg:hidden">
              <TableOfContents
                items={activeChapter.toc}
                locale={locale}
              />
            </div>
          )}

          {/* Active chapter content — key forces remount for correct TOC tracking */}
          <div key={activeIndex}>
            {renderContent()}
          </div>

          {/* Chapter prev/next navigation (bottom) */}
          <BookNavigation
            chapters={chapters}
            activeIndex={activeIndex}
            onChapterChange={handleChapterChange}
            variant="nav"
          />
        </div>
      </div>
    </SiteShell>
  )
}
