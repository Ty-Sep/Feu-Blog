// =============================================================================
// SearchPopover — workbench-style search popover anchored to paper plane.
// =============================================================================

'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

import { useSearchEntries } from '@/components/search/SearchProvider'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useEscapeKey } from '@/hooks/useEscapeKey'
import { useLoading } from '@/components/navigation/LoadingContext'
import { clamp } from '@/lib/common'
import type { SearchEntry } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchPopoverProps {
  anchorRect: Anchor
  locale: string
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Phase = 'entering' | 'visible' | 'exiting'

const EXPAND_DURATION = 320
const VIEWPORT_MARGIN = 16
const PANEL_WIDTH = 520
const PANEL_HEIGHT_EST = 420
const GAP = 8 // 弹窗与纸飞机的间距

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS = {
  zh: { placeholder: '搜索文章...', empty: '没有找到结果' },
  en: { placeholder: 'Search articles...', empty: 'No results found' },
} as const

// ---------------------------------------------------------------------------
// Anchor + position calculator
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

  // 从坐标计算飞机宽高
  const planeW = anchor.right - anchor.left
  const planeH = anchor.bottom - anchor.top
  const planeCenterX = anchor.left + planeW / 2
  const planeCenterY = anchor.top + planeH / 2

  // 四个方向的可用空间
  const spaceRight = vw - anchor.right - m
  const spaceLeft = anchor.left - m
  const spaceBottom = vh - anchor.bottom - m
  const spaceTop = anchor.top - m

  let left: number
  let top: number

  // 优先级：右 > 左 > 下 > 上 > 居中
  if (spaceRight >= pw) {
    left = anchor.right + GAP
    top = planeCenterY - ph / 2
  } else if (spaceLeft >= pw) {
    left = anchor.left - pw - GAP
    top = planeCenterY - ph / 2
  } else if (spaceBottom >= ph) {
    top = anchor.bottom + GAP
    left = planeCenterX - pw / 2
  } else if (spaceTop >= ph) {
    top = anchor.top - ph - GAP
    left = planeCenterX - pw / 2
  } else {
    left = (vw - pw) / 2
    top = (vh - ph) / 2
  }

  // 最终视口边界约束
  left = clamp(left, m, vw - pw - m)
  top = clamp(top, m, vh - ph - m)

  return { left, top }
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
}: SearchPopoverProps): React.ReactElement | null {
  const entries = useSearchEntries()
  const router = useRouter()
  const { startLoading } = useLoading()
  const [phase, setPhase] = useState<Phase>('entering')
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState(() => computePosition(anchorRect))
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const t = locale === 'zh' ? LABELS.zh : LABELS.en

  // SSR 兼容：客户端挂载后再渲染 Portal
  useEffect(() => setMounted(true), [])

  // anchor 变化时重新计算位置
  useEffect(() => {
    setPos(computePosition(anchorRect))
  }, [anchorRect])

  // 缩放原点：对准纸飞机中心
  const transformOrigin = useMemo(() => {
    const cx = (anchorRect.left + anchorRect.right) / 2
    const cy = (anchorRect.top + anchorRect.bottom) / 2
    return `${cx - pos.left}px ${cy - pos.top}px`
  }, [anchorRect, pos])

  // 窗口大小变化时重算
  useEffect(() => {
    const update = () => setPos(computePosition(anchorRect))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [anchorRect])

  // 防止横向滚动条溢出
  useEffect(() => {
    const prev = document.documentElement.style.overflowX
    document.documentElement.style.overflowX = 'hidden'
    return () => { document.documentElement.style.overflowX = prev }
  }, [])

  // 动画结束后自动聚焦（不滚动页面）
  useEffect(() => {
    if (phase === 'entering') {
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true })
        setPhase('visible')
      }, EXPAND_DURATION)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // 关闭动画
  const startClose = useCallback(() => {
    setPhase('exiting')
    setTimeout(() => onClose(), EXPAND_DURATION)
  }, [onClose])

  useClickOutside(panelRef, startClose)
  useEscapeKey(startClose)

  // 搜索结果
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

  // 跳转并关闭：先启动 Loading，再执行跳转
  const handleSelect = useCallback(
    (href: string) => {
      startClose()
      setTimeout(() => {
        startLoading()
        router.push(href)
      }, EXPAND_DURATION)
    },
    [router, startClose, startLoading],
  )

  // 动画样式
  const isCollapsed = phase === 'entering' || phase === 'exiting'
  const animStyle: React.CSSProperties = {
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? 'scale(0.12)' : 'scale(1)',
    transformOrigin,
    transition: `opacity ${EXPAND_DURATION}ms cubic-bezier(0.16,1,0.3,1), transform ${EXPAND_DURATION}ms cubic-bezier(0.16,1,0.3,1)`,
  }

  if (!mounted) return null

  return createPortal(
    <div
      ref={panelRef}
      className="z-[200] rounded-sketch overflow-hidden"
      style={{
        position: 'fixed',
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
      {/* 搜索输入框 */}
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
          className="flex-1 bg-transparent text-sm outline-none placeholder:select-none"
          style={{
            color: 'var(--ink-primary)',
            fontFamily: 'var(--font-body)',
            height: '48px',
          }}
        />
      </div>

      {/* 分割线 */}
      <div
        className="mx-[var(--space-4)]"
        style={{
          borderTop: '2px dashed',
          borderColor: 'color-mix(in srgb, var(--ink-primary) 30%, transparent)',
        }}
      />

      {/* 结果列表 */}
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
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// SearchResultItem
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