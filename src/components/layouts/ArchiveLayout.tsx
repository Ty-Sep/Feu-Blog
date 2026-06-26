// =============================================================================
// ArchiveLayout — archive page two-panel layout.
//
// Structure:
//   SiteShell
//     ┌─ Left (categories card) ─┬─ Right (profile card) ─┐
//
// Responsive: stacks vertically on mobile, side-by-side at md+.
// PaperCSS-style sketch containers, vertically centered in viewport.
//
// Dependencies:
//   - SiteShell        (Phase 4D)
//   - CategoryList     (Phase 4E)
//   - ProfileCard      (Phase 4E)
//   - HandDrawnBorder  (Phase 4A)
//   - PaperPlane       (Phase 3C — global rAF physics)
// =============================================================================

'use client'

import React, { useRef } from 'react'

import type { Locale, CategoryLink, ProfileData } from '@/lib/types'

import { SiteShell } from '@/components/layouts/SiteShell'
import { CategoryList } from '@/components/sections/CategoryList'
import { ProfileCard } from '@/components/sections/ProfileCard'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'
import { PaperPlane } from '@/components/interactive/PaperPlane'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArchiveLayoutProps {
  locale: Locale
  categories: CategoryLink[]
  profile: ProfileData
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArchiveLayout({
  locale,
  categories,
  profile,
  className = '',
}: ArchiveLayoutProps): React.ReactElement {
  const pageRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={pageRef} style={{ position: 'relative' }}>
      {/* ── Paper plane mouse trail ── */}
      <PaperPlane containerRef={pageRef} />

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SiteShell locale={locale} className={className}>
          {/* 内容整体垂直居中，上下留白均等 */}
          <div className="min-h-[82vh] flex flex-col justify-center py-[var(--space-8)]">
            <div
              className="
                grid grid-cols-1
                md:grid-cols-[1.1fr_0.9fr]
                gap-[var(--space-10)]
                items-stretch
              "
            >
              {/* ── Left panel: 分类卡片，与右侧对称容器感 ── */}
              <div>
                <HandDrawnBorder variant="sketch">
                  <div className="py-[var(--space-6)] px-[var(--space-6)]">
                    <CategoryList categories={categories} />
                  </div>
                </HandDrawnBorder>
              </div>

              {/* ── Right panel: 个人卡片（集成语言切换） ── */}
              <aside className="flex">
                <ProfileCard profile={profile} locale={locale} className="w-full flex flex-col" />
              </aside>
            </div>
          </div>
        </SiteShell>
      </div>
    </div>
  )
}