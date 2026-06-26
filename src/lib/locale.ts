// =============================================================================
// Locale utilities — server + client safe.
//
// LanguageToggle (client) imports switchLocalePathname and SUPPORTED_LOCALES.
// Middleware imports detectLocale for cookie-based negotiation.
// =============================================================================

import type { Locale } from '@/lib/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SUPPORTED_LOCALES: readonly Locale[] = ['zh', 'en'] as const

export const DEFAULT_LOCALE: Locale = 'zh'

// ---------------------------------------------------------------------------
// switchLocalePathname — preserves the current path under a new locale
// ---------------------------------------------------------------------------

/**
 * Swaps the locale segment of a pathname.
 *
 *   switchLocalePathname('/zh/java/spring-ioc', 'en')
 *     → '/en/java/spring-ioc'
 *
 *   switchLocalePathname('/zh', 'en')
 *     → '/en'
 *
 * If the leading segment is not a known locale the path is returned unchanged.
 */
export function switchLocalePathname(
  pathname: string,
  targetLocale: Locale,
): string {
  const segments = pathname.split('/').filter(Boolean)

  const first = segments[0]
  if (
    first &&
    (SUPPORTED_LOCALES as readonly string[]).includes(first)
  ) {
    segments[0] = targetLocale
  }

  return '/' + segments.join('/')
}

// ---------------------------------------------------------------------------
// getAlternateLocale — quick locale flip
// ---------------------------------------------------------------------------

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh'
}

// ---------------------------------------------------------------------------
// detectLocale — server-side locale negotiation
// ---------------------------------------------------------------------------

/**
 * Resolves the active locale from (in priority order):
 *   1. Cookie  (NEXT_LOCALE)
 *   2. Accept-Language header
 *   3. DEFAULT_LOCALE
 *
 * Only used in middleware; kept here so all locale logic lives in one module.
 */
export function detectLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  // 1. Cookie
  if (cookieValue) {
    const trimmed = cookieValue.trim()
    if ((SUPPORTED_LOCALES as readonly string[]).includes(trimmed)) {
      return trimmed as Locale
    }
  }

  // 2. Accept-Language header
  if (acceptLanguage) {
    const first = acceptLanguage.split(',')[0]?.split(';')[0]?.trim()
    if (first && (SUPPORTED_LOCALES as readonly string[]).includes(first)) {
      return first as Locale
    }
    // Handle zh-CN → zh
    if (first?.startsWith('zh')) return 'zh'
    if (first?.startsWith('en')) return 'en'
  }

  // 3. Fallback
  return DEFAULT_LOCALE
}
