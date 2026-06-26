// =============================================================================
// LanguageToggle — locale switcher (zh ↔ en).
//
// Preserves the current pathname so the user stays on the same page when
// switching languages.  Uses usePathname() from next/navigation for the
// current path; navigation happens via next/link (not useRouter).
//
// Dependencies:
//   - @/lib/locale.ts: switchLocalePathname, SUPPORTED_LOCALES
//   - @/lib/types.ts:   Locale
// =============================================================================

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { switchLocalePathname, SUPPORTED_LOCALES } from '@/lib/locale'
import type { Locale } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LanguageToggleProps {
  currentLocale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Locale display labels
// ---------------------------------------------------------------------------

const LABEL: Record<Locale, string> = {
  zh: '中',
  en: 'EN',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LanguageToggle({
  currentLocale,
  className = '',
}: LanguageToggleProps): React.ReactElement {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Language switcher"
      className={`inline-flex items-center gap-[var(--space-1)] text-sm ${className}`}
    >
      {SUPPORTED_LOCALES.map((code, i) => {
        const isActive = code === currentLocale

        return (
          <React.Fragment key={code}>
            {i > 0 && (
              <span aria-hidden="true" style={{ color: 'var(--ink-muted)' }}>
                /
              </span>
            )}

            {isActive ? (
              <span
                aria-current="page"
                className="font-bold underline decoration-[var(--ink-primary)] underline-offset-[3px] select-none"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                {LABEL[code]}
              </span>
            ) : (
              <Link
                href={switchLocalePathname(pathname, code)}
                className="hover:underline underline-offset-[3px] transition-colors"
                style={{ color: 'var(--ink-secondary)' }}
                lang={code}
                hrefLang={code}
              >
                {LABEL[code]}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
