// =============================================================================
// BookPage — client-side book reading experience.
//
// Receives pre-rendered chapter content from the server and manages active
// chapter state.  Chapter switching is instant — no page reload, no URL change.
//
// Layout:
//   SiteShell → two-column [TocTabs sidebar | chapter content + BookNavigation]
//
// Dependencies:
//   - SiteShell, TocTabs, TableOfContents, BookNavigation
// =============================================================================

'use client'

import React, { useState } from 'react'

import type { Locale } from '@/lib/types'
import type { TocItem } from '@/components/content/TableOfContents'
import type { BookChapterContent } from '@/lib/content'

import { SiteShell } from '@/components/layouts/SiteShell'
import { TocTabs } from '@/components/content/TocTabs'
import { TableOfContents } from '@/components/content/TableOfContents'
import { BookNavigation } from '@/components/content/BookNavigation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookPageProps {
  locale: Locale
  /** Book title (e.g. "软件设计师"). */
  bookTitle: string
  /** All chapters with pre-extracted TOC. */
  chapters: (BookChapterContent & { toc: TocItem[] })[]
  /** Pre-rendered React nodes — one per chapter (server-rendered ArticleShell + Markdown). */
  renderedChapters: React.ReactNode[]
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BookPage({
  locale,
  bookTitle,
  chapters,
  renderedChapters,
  className = '',
}: BookPageProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeChapter = chapters[activeIndex]!

  return (
    <SiteShell
      locale={locale}
      className={`${className} [--homepage-max-width:96rem]`}
    >
      {/* 移除 items-start，默认 stretch 对齐，让左侧边栏自动拉伸到与右侧等高 */}
      <div className="flex gap-0 -mt-[var(--space-3)]">
        {/* ── Desktop sidebar ── */}
        <div className="hidden lg:block self-stretch flex-shrink-0 w-[17.5rem] -ml-[var(--space-3)]">
          <TocTabs
            locale={locale}
            seriesTab={
              <BookNavigation
                chapters={chapters}
                activeIndex={activeIndex}
                onChapterChange={setActiveIndex}
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

          {/* Active chapter content — key forces remount, keeping only one
              chapter's headings in the DOM at a time for correct TOC tracking. */}
          <div key={activeIndex}>
            {renderedChapters[activeIndex]}
          </div>

          {/* Chapter prev/next navigation (bottom) */}
          <BookNavigation
            chapters={chapters}
            activeIndex={activeIndex}
            onChapterChange={setActiveIndex}
            variant="nav"
          />
        </div>
      </div>
    </SiteShell>
  )
}