// =============================================================================
// TocTabs — tab-switching container for the sidebar.
//
// Two tabs: 章节 (series chapter list) | 目录 (current-page TOC)
// Default tab: 目录
//
// Dependencies: none (zero external packages)
// =============================================================================

'use client'

import React, { useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TocTabsProps {
  /** Chapter list component (pre-rendered — BookNavigation or similar) */
  seriesTab: React.ReactNode
  /** TableOfContents component (pre-rendered) */
  tocTab: React.ReactNode
  locale: string
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS = {
  zh: { series: '章节', toc: '目录' },
  en: { series: 'Chapters', toc: 'On this page' },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TocTabs({
  seriesTab,
  tocTab,
  locale,
}: TocTabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'toc' | 'series'>('toc')

  const labels = locale === 'en' ? LABELS.en : LABELS.zh

  return (
    <div
      className="
        relative
        hidden lg:flex lg:flex-col
        sticky top-[2rem]
        w-full h-full min-w-0 flex-shrink-0
        max-h-[calc(100vh-4rem)]
      "
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '0 var(--space-2) var(--space-2) var(--space-2)',
      }}
    >
      {/* 手绘黑色垂直分割线 */}
      <svg
        className="absolute top-0 right-0 h-full w-[5px] pointer-events-none"
        viewBox="0 0 5 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M2.5,0 Q0,25 2.5,50 Q5,75 2.5,100 Q0,125 2.5,150 Q5,175 2.5,200"
          fill="none"
          strokeLinecap="round"
          stroke="#000"
        />
      </svg>

      {/* ── Tab bar ── */}
      <div
        className="flex-shrink-0 flex gap-[var(--space-3)] pb-[var(--space-2)] border-b-2 min-w-0 w-full"
        style={{ borderColor: 'var(--ink-muted)' }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('series')}
          className="
            leading-relaxed
            transition-colors duration-fade
            hover:underline underline-offset-[3px]
          "
          style={{
            fontSize: '1.125rem',
            color: 'var(--ink-primary)',
            fontWeight: activeTab === 'series' ? 700 : 400,
            fontFamily: 'var(--font-title)',
          }}
        >
          {labels.series}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('toc')}
          className="
            leading-relaxed
            transition-colors duration-fade
            hover:underline underline-offset-[3px]
          "
          style={{
            fontSize: '1.125rem',
            color: 'var(--ink-primary)',
            fontWeight: activeTab === 'toc' ? 700 : 400,
            fontFamily: 'var(--font-title)',
          }}
        >
          {labels.toc}
        </button>
      </div>

      {/* ── Tab content ── */}
      <div
        className="flex-1 overflow-y-auto mt-[var(--space-3)] min-w-0 w-full overflow-x-hidden"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--ink-muted) transparent',
        }}
      >
        {activeTab === 'series' ? seriesTab : tocTab}
      </div>
    </div>
  )
}