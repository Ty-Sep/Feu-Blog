// =============================================================================
// CategoryList — archive left-panel category navigation.
//
// PaperCSS imperfect button style, with numbered index and muted counts.
//
// Dependencies:
//   - @/lib/types.ts: CategoryLink
// =============================================================================

import React from 'react'
import Link from 'next/link'

import type { CategoryLink } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryListProps {
  categories: CategoryLink[]
  className?: string
}

// PaperCSS 风格不规则圆角，模拟手绘感
const paperBorderRadius = '255px 15px 225px 15px / 15px 225px 15px 255px'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryList({
  categories,
  className = '',
}: CategoryListProps): React.ReactElement | null {
  if (categories.length === 0) {
    return null
  }

  return (
    <nav aria-label="Categories" className={className}>
      <h2
        className="font-title text-3xl mb-[var(--space-6)]"
        style={{ fontFamily: 'var(--font-title)', color: 'var(--ink-primary)' }}
      >
        Categories
      </h2>

      <ul className="flex flex-col gap-[var(--space-4)]">
        {categories.map((cat, idx) => {
          const index = String(idx + 1).padStart(2, '0')
          return (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="
                  group flex items-center gap-[var(--space-4)]
                  px-[var(--space-5)] py-[var(--space-3)]
                  text-2xl
                  transition-all duration-fade
                  hover:-rotate-[0.5deg] hover:bg-[var(--bg-card)]
                  focus-visible:outline-2 focus-visible:outline-offset-2
                "
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--ink-primary)',
                  border: '2px solid var(--ink-primary)',
                  borderRadius: paperBorderRadius,
                  outlineColor: 'var(--ink-primary)',
                }}
              >
                {/* 手绘序号 */}
                <span
                  className="text-lg tabular-nums flex-shrink-0"
                  style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-title)' }}
                >
                  {index}
                </span>

                {/* 分类标题 */}
                <span className="flex-1">{cat.label}</span>

                {/* 弱化的文章计数 */}
                <span
                  className="text-base tabular-nums flex-shrink-0"
                  style={{ color: 'var(--ink-muted)' }}
                  aria-label={`${cat.count} articles`}
                >
                  {cat.count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}