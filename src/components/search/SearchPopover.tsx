// =============================================================================
// SearchPopover — workbench-style search popover anchored to paper plane.
//
// Behaviour:
//   - Position computed ONCE at open time from the plane's bounding rect
//   - Smart four-quadrant placement + viewport clamping (16 px margin)
//   - Fixed position after opening — does NOT follow the plane's animation
//   - Resize listener recalculates from the SAME anchor (not plane position)
//   - Expand animation (scale up from plane center) on mount
//   - Collapse animation (scale down to plane center) on close
//   - Auto-focus input after expand animation completes
//   - Click outside → close
//   - ESC → close
//   - Fuzzy search across title / description / tags
//
// Dependencies:
//   - SearchProvider (useSearchEntries)
//   - next/navigation (useRouter)
// =============================================================================

'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { useRouter } from 'next/navigation'

import { useSearchEntries } from '@/components/search/SearchProvider'
import type { SearchEntry } from '@/lib/search-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchPopoverProps {
  /** Anchor rect from the plane at click time (fixed, never updated). */
  anchorRect: Anchor
  locale: string
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Phase = 'entering' | 'visible' | 'exiting'

const EXPAND_DURATION = 320 // ms
const VIEWPORT_MARGIN = 16 // px
const PANEL_WIDTH = 520 // px max (design spec)
const PANEL_HEIGHT_EST = 420 // px (rough estimate for quadrant selection)

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS = {
  zh: { placeholder: '搜索文章...', empty: '没有找到结果' },
  en: { placeholder: 'Search articles...', empty: 'No results found' },
} as const

// ---------------------------------------------------------------------------
// Anchor type + smart position calculator
// ---------------------------------------------------------------------------

export interface Anchor {
  left: number
  right: number
  top: number
  bottom: number
}

function computePosition(anchor: Anchor): { left: number; top: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const m = VIEWPORT_MARGIN

  const pw = Math.min(PANEL_WIDTH, vw - m * 2)
  const ph = PANEL_HEIGHT_EST

  const spaceRight = vw - anchor.right - m
  const spaceLeft = anchor.left - m
  const spaceBottom = vh - anchor.bottom - m
  const spaceTop = anchor.top - m

  // Horizontal: prefer right, fallback left, then centre
  let left: number
  if (spaceRight >= pw) {
    left = anchor.right
  } else if (spaceLeft >= pw) {
    left = anchor.left - pw
  } else {
    left = Math.max(m, (vw - pw) / 2)
  }

  // Vertical: prefer bottom, fallback top, then centre
  let top: number
  if (spaceBottom >= ph) {
    top = anchor.bottom + 12
  } else if (spaceTop >= ph) {
    top = anchor.top - ph - 12
  } else {
    top = Math.max(m, (vh - ph) / 2)
  }

  // Viewport clamp
  left = clamp(left, m, vw - pw - m)
  top = clamp(top, m, vh - ph - m)

  return { left, top }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// ---------------------------------------------------------------------------
// Fuzzy match
// ---------------------------------------------------------------------------

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().trim()
  if (!q) return true
  const t = text.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchPopover({
  anchorRect,
  locale,
  onClose,
}: SearchPopoverProps): React.ReactElement {
  const entries = useSearchEntries()
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('entering')
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState(() => computePosition(anchorRect))
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const t = locale === 'zh' ? LABELS.zh : LABELS.en

  // ── 计算缩放原点：始终对准纸飞机中心 ──
  const transformOrigin = useMemo(() => {
    const planeCenterX = (anchorRect.left + anchorRect.right) / 2
    const planeCenterY = (anchorRect.top + anchorRect.bottom) / 2
    const originX = planeCenterX - pos.left
    const originY = planeCenterY - pos.top
    return `${originX}px ${originY}px`
  }, [anchorRect, pos])

  // ── Resize listener — recalculate from the SAME fixed anchor ──
  useEffect(() => {
    const update = () => setPos(computePosition(anchorRect))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [anchorRect])

  // ── Prevent body scrollbar overflow ──
  useEffect(() => {
    const prev = document.documentElement.style.overflowX
    document.documentElement.style.overflowX = 'hidden'
    return () => { document.documentElement.style.overflowX = prev }
  }, [])

  // ── Auto-focus after expand animation ──
  useEffect(() => {
    if (phase === 'entering') {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        setPhase('visible')
      }, EXPAND_DURATION)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // ── Close with collapse animation ──
  const startClose = useCallback(() => {
    setPhase('exiting')
    setTimeout(() => onClose(), EXPAND_DURATION)
  }, [onClose])

  // ── Click outside ──
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target as Node)) {
        startClose()
      }
    }
    const id = setTimeout(() => {
      document.addEventListener('pointerdown', handler)
    }, 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('pointerdown', handler)
    }
  }, [startClose])

  // ── ESC ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') startClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [startClose])

  // ── Filter results ──
  const results = useMemo(() => {
    if (!query.trim()) return entries.slice(0, 8)
    const q = query.trim()
    return entries
      .filter(
        (e) =>
          fuzzyMatch(q, e.title) ||
          fuzzyMatch(q, e.description) ||
          fuzzyMatch(q, e.tags),
      )
      .slice(0, 12)
  }, [entries, query])

  // ── Navigate + close ──
  const handleSelect = useCallback(
    (href: string) => {
      startClose()
      setTimeout(() => router.push(href), EXPAND_DURATION)
    },
    [router, startClose],
  )

  // ── Animation styles：从纸飞机中心缩放弹出/收回 ──
  const isCollapsed = phase === 'entering' || phase === 'exiting'
  const animStyle: React.CSSProperties = {
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'scale(0.12)' : 'scale(1)',
    transformOrigin: transformOrigin,
    transition: `opacity ${EXPAND_DURATION}ms cubic-bezier(0.16,1,0.3,1), transform ${EXPAND_DURATION}ms cubic-bezier(0.16,1,0.3,1)`,
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-[200] rounded-sketch overflow-hidden"
      style={{
        left: pos.left,
        top: pos.top,
        width: `clamp(320px, 90vw, ${PANEL_WIDTH}px)`,
        maxWidth: `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`,
        backgroundColor: 'var(--bg-card)',
        boxShadow: 'var(--shadow-note)',
        border: '2px solid var(--ink-primary)',
        ...animStyle,
      }}
    >
      {/* ── Search input ── */}
      <div className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)]">
        <svg
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className="flex-shrink-0"
          style={{ color: 'var(--ink-primary)' }}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="
            flex-1 bg-transparent text-sm outline-none
            placeholder:select-none
          "
          style={{
            color: 'var(--ink-primary)',
            fontFamily: 'var(--font-body)',
            height: '48px',
          }}
        />
      </div>

      {/* ── Divider 手绘风格分割线 ── */}
      <div
        className="mx-[var(--space-4)]"
        style={{
          borderTop: '2px dashed',
          borderColor: 'color-mix(in srgb, var(--ink-primary) 30%, transparent)',
        }}
      />

      {/* ── Results ── */}
      <div
        className="overflow-y-auto px-[var(--space-3)] py-[var(--space-2)]"
        style={{
          maxHeight: 'calc(5 * 5rem + var(--space-4))',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--ink-muted) transparent',
        }}
      >
        {results.length === 0 ? (
          <p
            className="py-[var(--space-8)] text-center text-sm"
            style={{ color: 'var(--ink-muted)' }}
          >
            {t.empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-[var(--space-1)]">
            {results.map((entry) => (
              <SearchResultItem
                key={`${entry.type}-${entry.slug}`}
                entry={entry}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchResultItem — 对齐全站手绘便签卡片风格
// ---------------------------------------------------------------------------

function SearchResultItem({
  entry,
  onSelect,
}: {
  entry: SearchEntry
  onSelect: (href: string) => void
}): React.ReactElement {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry.href)}
        className="
          w-full text-left
          px-[var(--space-3)] py-[var(--space-2)]
          rounded-sketch
          transition-all duration-200
          hover:-translate-y-[1px]
          focus-visible:outline-2 focus-visible:outline-offset-[-2px]
        "
        style={{
          backgroundColor: 'var(--bg-page)',
          outlineColor: 'var(--ink-primary)',
          border: '1.5px solid var(--border-sketch)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--ink-primary)'
          e.currentTarget.style.boxShadow = 'var(--shadow-note)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-sketch)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-1)]">
          <span
            className="
              inline-block flex-shrink-0
              px-[var(--space-1)] py-px
              rounded-full
              text-[0.625rem] font-medium leading-relaxed
            "
            style={{
              backgroundColor: 'var(--sticky-yellow)',
              color: 'var(--ink-primary)',
              border: '1.5px solid var(--ink-primary)',
            }}
          >
            {entry.typeLabel}
          </span>
          <span
            className="text-sm font-medium leading-tight truncate"
            style={{
              color: 'var(--ink-primary)',
              fontFamily: 'var(--font-title)',
            }}
          >
            {entry.title}
          </span>
        </div>

        {entry.description && (
          <p
            className="text-xs leading-relaxed line-clamp-1"
            style={{ color: 'var(--ink-secondary)' }}
          >
            {entry.description}
          </p>
        )}
      </button>
    </li>
  )
}