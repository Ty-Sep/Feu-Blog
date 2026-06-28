// =============================================================================
// BookItem — single book on the shelf, hover-expand effect.
// Pure CSS animation, Server Component compatible.
// Visual enhanced: paper texture, spine indent, inner border, random size, hover lift.
// Added: JS precise truncation — 7 chars + ellipsis on spine, full text on hover.
// =============================================================================

import React from 'react'
import Link from 'next/link'

import type { ContentCardProps } from '@/types'
import { getDetailRoute } from '@/tokens/card-config'

// ---------------------------------------------------------------------------
// Book spine colors — low saturation, hand-drawn paper palette
// ---------------------------------------------------------------------------

const BOOK_COLORS = [
  '#f8f5f0', // 米白
  '#e8dcc8', // 牛皮纸
  '#d8e2e8', // 浅灰蓝
  '#d8e8d8', // 浅绿色
  '#f0e0e4', // 淡粉色
  '#f0ecc8', // 浅黄色
]

// ---------------------------------------------------------------------------
// Book size presets — loop by index, SSR stable, no random function
// ---------------------------------------------------------------------------

/** 书本高度选项，循环使用 */
const BOOK_HEIGHTS = [100, 96, 102, 104, 108]
/** 书本默认宽度选项，循环使用，hover 统一展开为 160px */
const BOOK_WIDTHS = [50, 64, 68, 72]

// ---------------------------------------------------------------------------
// Typography constants
// ---------------------------------------------------------------------------

/** 书脊最多显示的字符数（不含省略号） */
const MAX_SPINE_CHARS = 8
/** 短标题字体大小 */
const FONT_SIZE_NORMAL = '0.9rem'
/** 达到最大字符数时的字体大小 */
const FONT_SIZE_SMALL = '0.86rem'

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------

const TRANSITION_DURATION = 260
const TRANSITION_EASE = 'cubic-bezier(.22,.61,.36,1)'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BookItemProps {
  card: ContentCardProps
  index: number
}

export function BookItem({ card, index }: BookItemProps): React.ReactElement {
  // 基础属性按索引循环，保证 SSR 输出稳定
  const bgColor = BOOK_COLORS[index % BOOK_COLORS.length]
  const bookHeight = BOOK_HEIGHTS[index % BOOK_HEIGHTS.length]
  const baseWidth = BOOK_WIDTHS[index % BOOK_WIDTHS.length]
  // 奇偶索引决定 hover 旋转方向，幅度控制在 0.5° 以内
  const rotateDeg = index % 2 === 0 ? 0.5 : -0.5

  const href = getDetailRoute(card.type, card.lang, card.slug)

  // 书脊标题：精确截断为 7 字 + 省略号，竖排只占 1 个字符高度
  const isLongTitle = card.title.length > MAX_SPINE_CHARS
  const spineTitle = isLongTitle
    ? card.title.slice(0, MAX_SPINE_CHARS) + '…'
    : card.title
  // 达到阈值自动缩小字号
  const spineFontSize = isLongTitle ? FONT_SIZE_SMALL : FONT_SIZE_NORMAL

  // 纸张纹理 + 顶部纸页高光 + 底部纸页厚度
  // 纹理透明度控制在 3% 以内，无明显条纹，模拟手工纸质感
  const paperBackground = `
    linear-gradient(to bottom, rgba(255,255,255,0.45) 0 1px, transparent 1px),
    linear-gradient(to top, rgba(0,0,0,0.05) 0 1px, transparent 1px),
    repeating-linear-gradient(45deg, rgba(0,0,0,0.015) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(-45deg, rgba(0,0,0,0.015) 0 1px, transparent 1px 4px)
  `

  return (
    <Link
      href={href}
      aria-label={card.title}
      className="
        group
        relative
        flex-shrink-0
        flex flex-col items-center justify-end
        pb-1
        rounded-sm
        overflow-hidden
        cursor-pointer
        select-none
        /* 动态尺寸通过 CSS 变量控制 */
        w-[var(--base-width)]
        h-[var(--book-height)]
        z-1
        shadow-[var(--shadow-card)]
        /* Hover 状态：展开宽度 + 轻微抬起 + 微旋转 + 柔和阴影 */
        hover:w-[160px]
        hover:z-10
        hover:transform-[translateY(-5px)_rotate(var(--rotate-deg))]
        hover:shadow-[2px_3px_8px_rgba(0,0,0,0.08)]
        transition-all

        /* === 伪元素：左侧书脊压痕 === */
        [&::before]:content-['']
        [&::before]:absolute
        [&::before]:left-[7px]
        [&::before]:top-[5%]
        [&::before]:h-[90%]
        [&::before]:w-[1.5px]
        [&::before]:bg-black/12
        [&::before]:pointer-events-none

        /* === 伪元素：内侧压印边框 === */
        [&::after]:content-['']
        [&::after]:absolute
        [&::after]:top-1
        [&::after]:left-1
        [&::after]:right-1
        [&::after]:bottom-1
        [&::after]:border
        [&::after]:border-black/8
        [&::after]:pointer-events-none
      "
      style={{
        backgroundColor: bgColor,
        backgroundImage: paperBackground,
        border: '1px solid rgba(44, 44, 44, 0.15)',
        transitionDuration: `${TRANSITION_DURATION}ms`,
        transitionTimingFunction: TRANSITION_EASE,
        // 尺寸与旋转角度变量，供 CSS 类调用
        '--base-width': `${baseWidth}px`,
        '--book-height': `${bookHeight}px`,
        '--rotate-deg': `${rotateDeg}deg`,
      } as React.CSSProperties}
    >
      {/* Title container — two layers overlap */}
      <div className="relative flex-1 w-full flex items-center justify-center">
        {/* Default: vertical upright spine title — JS truncated, no CSS ellipsis */}
        <span
          className="
            absolute
            top-[5%]
            left-1/2
            -translate-x-1/2
            font-title
            text-center
            [writing-mode:vertical-lr]
            [text-orientation:upright]
            opacity-100
            group-hover:opacity-0
          "
          style={{
            color: 'var(--ink-primary)',
            fontSize: spineFontSize,
          }}
        >
          {spineTitle}
        </span>

        {/* Hover: horizontal title — smooth rotate, show full original text */}
        <span
          className="
            absolute
            font-title
            text-[0.8rem]
            whitespace-nowrap
            text-center
            -rotate-90
            opacity-0
            group-hover:rotate-0
            group-hover:opacity-100
            transition-transform
          "
          style={{
            color: 'var(--ink-primary)',
            transitionDuration: `${TRANSITION_DURATION}ms`,
            transitionTimingFunction: TRANSITION_EASE,
          }}
        >
          {card.title}
        </span>
      </div>

      {/* Date — visible only on hover */}
      {card.date && (
        <time
          dateTime={card.date}
          className="
            text-[0.625rem]
            mt-1
            opacity-0
            group-hover:opacity-100
          "
          style={{ color: 'var(--ink-muted)' }}
        >
          {new Date(card.date).toLocaleDateString(
            card.lang === 'zh' ? 'zh-CN' : 'en-US',
            { year: 'numeric', month: 'short' }
          )}
        </time>
      )}
    </Link>
  )
}