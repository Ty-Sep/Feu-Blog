// =============================================================================
// HomepageLayout — notebook-workspace homepage.
//
// Phase 10 structure:
//   1. HeroSection              — fade-in greeting
//   2. WorkspaceSection         — 4 static entry sticky notes
//   3. FeaturedArticlesSection  — horizontal scrollable article cards
//   4. ActivityTimelineSection  — recent updates timeline
//
// Phase 3C: hosts a global PaperPlane that flies across all sections.
//   z-5  PaperPlane         (between background and content)
//   z-1  Content wrapper    (SiteShell background + wall.png)
//
// Dependencies:
//   - SiteShell, HeroSection, WorkspaceSection,
//     FeaturedArticlesSection, ActivityTimelineSection
//   - PaperPlane (Phase 3C — global rAF physics)
// =============================================================================

'use client'

import React, { useRef, useState, useCallback } from 'react'

import type { Locale } from '@/lib/types'
import type { TimelineItem } from '@/components/sections/ActivityTimelineSection'

import { SiteShell } from '@/components/layouts/SiteShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { WorkspaceSection } from '@/components/sections/WorkspaceSection'
import { FeaturedArticlesSection } from '@/components/sections/FeaturedArticlesSection'
import { ActivityTimelineSection } from '@/components/sections/ActivityTimelineSection'
import { SketchDivider } from '@/components/primitives/SketchDivider'
import { PaperPlane } from '@/components/interactive/PaperPlane'
import { SearchPopover } from '@/components/search/SearchPopover'
import type { Anchor } from '@/components/search/SearchPopover'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HomepageLayoutProps {
  locale: Locale
  featuredArticles: import('@/lib/types').ContentCardProps[]
  recentItems: TimelineItem[]
  className?: string
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

function SectionSeparator(): React.ReactElement {
  return <SketchDivider className="my-[var(--space-12)]" />
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomepageLayout({
  locale,
  featuredArticles,
  recentItems,
  className = '',
}: HomepageLayoutProps): React.ReactElement {
  const pageRef = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<Anchor>({ left: 0, right: 0, top: 0, bottom: 0 })

  const handlePlaneClick = useCallback((rect: DOMRect) => {
    setAnchorRect({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom })
    setSearchOpen(true)
  }, [])

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false)
  }, [])

  return (
    <div ref={pageRef} style={{ position: 'relative' }}>
      {/* ════════════════════════════════════════════════
          Paper plane (search trigger) — z-5
          ════════════════════════════════════════════════ */}
      <PaperPlane containerRef={pageRef} onClick={handlePlaneClick} />

      {/* ════════════════════════════════════════════════
          Search popover
          ════════════════════════════════════════════════ */}
      {searchOpen && (
        <SearchPopover
          anchorRect={anchorRect}
          locale={locale}
          onClose={handleSearchClose}
        />
      )}

      {/* ════════════════════════════════════════════════
          Content — z-1 carries the SiteShell background
          ════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SiteShell locale={locale} className={className} hideHeader>
          {/* 1. Hero (includes playground placeholder) */}
          <HeroSection locale={locale} />

          <SectionSeparator />

          {/* 2. Workspace — 4 static entries */}
          <WorkspaceSection locale={locale} />

          <SectionSeparator />

          {/* 3. Featured articles */}
          <FeaturedArticlesSection articles={featuredArticles} locale={locale} />

          <SectionSeparator />

          {/* 4. Activity timeline */}
          <ActivityTimelineSection items={recentItems} locale={locale} />
        </SiteShell>
      </div>
    </div>
  )
}
