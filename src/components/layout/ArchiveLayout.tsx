// =============================================================================
// ArchiveLayout — archive page two-panel layout.
//
// Structure:
//   SiteShell
//     ┌─ Left (categories card) ─┬─ Right (profile card) ─┐
//
// Responsive: stacks vertically on mobile, side-by-side at md+.
// PaperCSS-style sketch containers, vertically centered in viewport.
// =============================================================================

'use client'

import React, { useRef, useState, useCallback } from 'react'

import type { Locale, CategoryLink, ProfileData } from '@/types'

import { SiteShell } from '@/components/layout/SiteShell'
import { CategoryList } from '@/components/sections/CategoryList'
import { ProfileCard } from '@/components/sections/ProfileCard'
import { HandDrawnBorder } from '@/components/primitives/HandDrawnBorder'
import { PaperPlane } from '@/components/interactive/PaperPlane'
import { SearchPopover } from '@/components/search/SearchPopover'
import type { Anchor } from '@/components/search/SearchPopover'

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
  const [searchOpen, setSearchOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<Anchor>({ left: 0, right: 0, top: 0, bottom: 0 })

  // 点击纸飞机：toggle 开关
  const handlePlaneClick = useCallback((rect: DOMRect) => {
    if (searchOpen) {
      setSearchOpen(false)
    } else {
      setAnchorRect({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      })
      setSearchOpen(true)
    }
  }, [searchOpen])

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false)
  }, [])

  return (
    <div ref={pageRef} style={{ position: 'relative' }}>
      {/* ── Paper plane (search trigger) ── */}
      <PaperPlane containerRef={pageRef} onClick={handlePlaneClick} />

      {/* ── Search popover ── */}
      {searchOpen && (
        <SearchPopover
          anchorRect={anchorRect}
          locale={locale}
          onClose={handleSearchClose}
        />
      )}

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
              {/* ── Left panel: 分类卡片 ── */}
              <div>
                <HandDrawnBorder variant="sketch">
                  <div className="py-[var(--space-6)] px-[var(--space-6)]">
                    <CategoryList categories={categories} />
                  </div>
                </HandDrawnBorder>
              </div>

              {/* ── Right panel: 个人卡片 ── */}
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