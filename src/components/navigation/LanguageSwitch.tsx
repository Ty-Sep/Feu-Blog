// =============================================================================
// LanguageSwitch — pill-shaped locale toggle slider for the archive page.
//
// Clicking either side slides the highlight and navigates to the other locale.
//
// Dependencies:
//   - @/lib/locale.ts: switchLocalePathname, SUPPORTED_LOCALES
//   - @/types.ts:   Locale
// =============================================================================

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { switchLocalePathname, SUPPORTED_LOCALES } from '@/lib/locale'
import type { Locale } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LanguageSwitchProps {
  currentLocale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABEL: Record<Locale, string> = {
  zh: '中',
  en: 'EN',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LanguageSwitch({
  currentLocale,
  className = '',
}: LanguageSwitchProps): React.ReactElement {
  const pathname = usePathname()
  const targetLocale: Locale = currentLocale === 'zh' ? 'en' : 'zh'
  const targetPath = switchLocalePathname(pathname, targetLocale)
  const isZh = currentLocale === 'zh'

  return (
    <Link
      href={targetPath}
      aria-label={targetLocale === 'zh' ? '切换为中文' : 'Switch to English'}
      className={`
        group
        relative inline-flex items-center
        rounded-full
        transition-colors duration-300
        ${className}
      `.replace(/\s+/g, ' ')}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1.5px solid var(--ink-primary)',
        boxShadow: 'var(--shadow-note)',
        padding: '3px',
        width: 'fit-content',
      }}
    >
      {/* ── Sliding highlight ── */}
      <div
        className="
          absolute top-[3px] bottom-[3px]
          rounded-full
          transition-all duration-300 ease-out
        "
        style={{
          backgroundColor: 'var(--ink-primary)',
          width: 'calc(50% - 3px)',
          left: isZh ? '3px' : '50%',
        }}
      />

      {/* ── Labels ── */}
      {SUPPORTED_LOCALES.map((code) => (
        <span
          key={code}
          className="
            relative z-[1]
            inline-flex items-center justify-center
            text-sm font-medium
            transition-colors duration-300
            select-none
          "
          style={{
            fontFamily: 'var(--font-title)',
            color: code === currentLocale ? 'var(--bg-card)' : 'var(--ink-primary)',
            width: '2.5rem',
            height: '1.75rem',
          }}
        >
          {LABEL[code]}
        </span>
      ))}
    </Link>
  )
}
