// =============================================================================
// TableOfContents — sidebar TOC for study-notes detail pages.
//
// Structure (desktop):
//   aside (sticky)
//     header    — fixed "目录" title, never scrolls
//     content   — scrollable tree, overflow-y:auto
//
// Tree behaviour:
//   H1 → collapsible section root (bold, 18px)
//   H2 → collapsible subsection   (16px, indented 16px)
//   H3 → leaf item                (14px, indented 32px, not collapsible)
//
// Non-current sections default collapsed.  IntersectionObserver auto-expands
// the parent chain (H1 + H2) of the currently visible heading.
//
// Mobile: collapsed into a <details> dropdown at the top.
// =============================================================================

'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TocItem {
  id: string
  text: string
  level: 1 | 2 | 3
}

export interface TableOfContentsProps {
  items: TocItem[]
  locale: string
  /** When "embedded", renders only the tocTree content (no sticky aside wrapper). Default: "full". */
  variant?: 'full' | 'embedded'
}

interface TocNode {
  id: string
  text: string
  level: 1 | 2 | 3
  children: TocNode[]
}

/** Maps a heading id → its parent H1/H2 ids (for auto-expand). */
interface ParentChain {
  h1: string
  h2?: string
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS: Record<string, string> = {
  zh: '目录',
  en: 'On this page',
}

// ---------------------------------------------------------------------------
// Tree builder — groups H2/H3 under their preceding H1
// ---------------------------------------------------------------------------

function buildTree(items: TocItem[]): TocNode[] {
  const tree: TocNode[] = []
  let curH1: TocNode | null = null
  let curH2: TocNode | null = null

  for (const item of items) {
    const node: TocNode = { id: item.id, text: item.text, level: item.level, children: [] }

    if (item.level === 1) {
      tree.push(node)
      curH1 = node
      curH2 = null
    } else if (item.level === 2) {
      if (curH1) curH1.children.push(node)
      else tree.push(node) // orphan H2
      curH2 = node
    } else {
      if (curH2) curH2.children.push(node)
      else if (curH1) curH1.children.push(node)
      else tree.push(node) // orphan H3
    }
  }

  return tree
}

// ---------------------------------------------------------------------------
// Parent map — every heading id → its parent H1 and (if under H2) parent H2
// ---------------------------------------------------------------------------

function buildParentMap(tree: TocNode[]): Map<string, ParentChain> {
  const map = new Map<string, ParentChain>()

  for (const h1 of tree) {
    map.set(h1.id, { h1: h1.id })
    for (const h2 of h1.children) {
      map.set(h2.id, { h1: h1.id, h2: h2.id })
      for (const h3 of h2.children) {
        map.set(h3.id, { h1: h1.id, h2: h2.id })
      }
    }
  }

  return map
}

// ---------------------------------------------------------------------------
// Collect all collapsible ids (H1 + H2) from a tree — used for default state
// ---------------------------------------------------------------------------

function collectCollapsibleIds(tree: TocNode[]): string[] {
  const ids: string[] = []
  for (const h1 of tree) {
    ids.push(h1.id)
    for (const h2 of h1.children) ids.push(h2.id)
  }
  return ids
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TableOfContents({
  items,
  locale,
  variant = 'full',
}: TableOfContentsProps): React.ReactElement | null {
  const [activeId, setActiveId] = useState<string>('')

  // ── Derived data ──
  const tree = useMemo(() => buildTree(items), [items])
  const parentMap = useMemo(() => buildParentMap(tree), [tree])

  // ── Collapse state — non-current sections default collapsed ──
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() =>
    new Set(collectCollapsibleIds(buildTree(items))),
  )

  const t = locale === 'zh' ? LABELS.zh : LABELS.en

  // ── IntersectionObserver ──
  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[]

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [items])

  // ── Auto-expand parent chain of current heading ──
  useEffect(() => {
    if (!activeId) return
    const chain = parentMap.get(activeId)
    if (!chain) return

    setCollapsedIds((prev) => {
      const next = new Set(prev)
      let changed = false
      if (next.has(chain.h1)) { next.delete(chain.h1); changed = true }
      if (chain.h2 && next.has(chain.h2)) { next.delete(chain.h2); changed = true }
      return changed ? next : prev
    })
  }, [activeId, parentMap])

  // ── Toggle handler ──
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── Scroll-to-heading handler ──
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setActiveId(id)
      }
    },
    [],
  )

  if (items.length === 0) return null

  // ── Shared: collapsible-tree nav ──
  const tocTree = (
    <nav aria-label={t} className="min-w-0 w-full">
      <ul className="flex flex-col gap-[var(--space-1)] w-full">
        {tree.map((h1) => {
          const h1Collapsed = collapsedIds.has(h1.id)
          const hasH1Children = h1.children.length > 0

          return (
            <li key={h1.id} className="min-w-0 w-full">
              {/* ── H1 row ── */}
              <div className="flex items-start gap-[var(--space-1)] min-w-0 w-full">
                {hasH1Children ? (
                  <button
                    type="button"
                    onClick={() => toggleCollapse(h1.id)}
                    className="flex-shrink-0 mt-[var(--space-1)] leading-none select-none"
                    style={{ color: '#000', width: '1rem', fontSize: '1rem' }}
                    aria-label={h1Collapsed ? '展开' : '折叠'}
                  >
                    {h1Collapsed ? '▸' : '▾'}
                  </button>
                ) : (
                  <span className="flex-shrink-0" style={{ width: '1rem' }} />
                )}

                <a
                  href={`#${h1.id}`}
                  onClick={(e) => handleClick(e, h1.id)}
                  className="block flex-1 min-w-0 leading-relaxed py-[var(--space-1)]
                             transition-colors duration-fade hover:underline underline-offset-[3px]"
                  style={{
                    fontSize: '1.125rem',
                    color: 'var(--ink-primary)',
                    fontWeight: activeId === h1.id ? 700 : 400,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {h1.text}
                </a>
              </div>

              {/* ── H2 / H3 children ── */}
              {hasH1Children && !h1Collapsed && (
                <ul className="flex flex-col gap-[var(--space-1)] w-full">
                  {h1.children.map((h2) => {
                    const h2Collapsed = collapsedIds.has(h2.id)
                    const hasH2Children = h2.children.length > 0

                    return (
                      <li key={h2.id} className="min-w-0 w-full">
                        {/* ── H2 row ── */}
                        <div
                          className="flex items-start gap-[var(--space-1)] min-w-0 w-full"
                          style={{ paddingLeft: 'var(--space-4)' }}
                        >
                          {hasH2Children ? (
                            <button
                              type="button"
                              onClick={() => toggleCollapse(h2.id)}
                              className="flex-shrink-0 mt-[var(--space-1)] leading-none select-none"
                              style={{ color: '#000', width: '1rem', fontSize: '1rem' }}
                              aria-label={h2Collapsed ? '展开' : '折叠'}
                            >
                              {h2Collapsed ? '▸' : '▾'}
                            </button>
                          ) : (
                            <span className="flex-shrink-0" style={{ width: '1rem' }} />
                          )}

                          <a
                            href={`#${h2.id}`}
                            onClick={(e) => handleClick(e, h2.id)}
                            className="block flex-1 min-w-0 leading-relaxed py-[var(--space-1)]
                                       transition-colors duration-fade hover:underline underline-offset-[3px]"
                            style={{
                              fontSize: '1rem',
                              color: 'var(--ink-primary)',
                              fontWeight: activeId === h2.id ? 700 : 400,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {h2.text}
                          </a>
                        </div>

                        {/* ── H3 children (not collapsible) ── */}
                        {hasH2Children && !h2Collapsed && (
                          <ul className="w-full">
                            {h2.children.map((h3) => (
                              <li key={h3.id} className="min-w-0 w-full">
                                <a
                                  href={`#${h3.id}`}
                                  onClick={(e) => handleClick(e, h3.id)}
                                  className="block min-w-0 leading-relaxed py-[var(--space-1)]
                                             transition-colors duration-fade hover:underline underline-offset-[3px]"
                                  style={{
                                    paddingLeft: 'var(--space-8)',
                                    fontSize: '0.875rem',
                                    color: 'var(--ink-primary)',
                                    fontWeight: activeId === h3.id ? 700 : 400,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                  }}
                                >
                                  {h3.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )

  // ── Embedded mode: only the nav tree, no wrapper ──
  if (variant === 'embedded') {
    return tocTree
  }

  return (
    <>
      {/* ── Desktop: sticky sidebar with fixed header + scrollable content ── */}
      <aside
        className="
          hidden lg:flex lg:flex-col
          relative
          sticky top-[2rem]
          w-full flex-shrink-0 h-full min-w-0
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

        {/* Fixed header */}
        <div className="flex-shrink-0 pb-[var(--space-2)] min-w-0 w-full">
          <h4
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--ink-primary)',
              fontFamily: 'var(--font-title)',
            }}
          >
            {t}
          </h4>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto mt-[var(--space-3)] min-w-0 w-full overflow-x-hidden"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--ink-muted) transparent' }}
        >
          {tocTree}
        </div>
      </aside>

      {/* ── Mobile: collapsible dropdown ── */}
      <details className="lg:hidden mb-[var(--space-4)]">
        <summary
          className="text-xs cursor-pointer select-none"
          style={{ color: 'var(--ink-muted)' }}
        >
          {t}
        </summary>
        <div
          className="mt-[var(--space-2)] pl-[var(--space-2)] border-l-2"
          style={{ borderColor: 'var(--ink-muted)' }}
        >
          {tocTree}
        </div>
      </details>
    </>
  )
}