// =============================================================================
// Locale middleware — Edge Runtime.
//
// Runs on every navigation.  Two responsibilities:
//   1. When the URL already contains a valid locale (/zh/...), refresh the
//      NEXT_LOCALE cookie so the preference survives across sessions.
//   2. When the URL is missing a locale prefix (/articles/...), detect the
//      user's preferred locale (cookie → Accept-Language → default) and
//      redirect to the locale-prefixed URL.
//
// Static files (_next, images, favicon, etc.) are excluded via the matcher
// so they are never intercepted.
// =============================================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { detectLocale, SUPPORTED_LOCALES } from '@/lib/locale'

// ---------------------------------------------------------------------------
// Cookie config
// ---------------------------------------------------------------------------

const COOKIE_NAME = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // ── 1. Extract the first path segment ──
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // ── 2. Already locale-prefixed? Refresh cookie, pass through ──
  if (
    firstSegment &&
    (SUPPORTED_LOCALES as readonly string[]).includes(firstSegment)
  ) {
    const response = NextResponse.next()
    response.cookies.set(COOKIE_NAME, firstSegment, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    })
    return response
  }

  // ── 3. No locale prefix — detect and redirect ──
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  const acceptLanguage = request.headers.get('accept-language')
  const locale = detectLocale(cookieLocale, acceptLanguage)

  // Build the destination pathname.
  const destination = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`

  const url = request.nextUrl.clone()
  url.pathname = destination

  const response = NextResponse.redirect(url)
  response.cookies.set(COOKIE_NAME, locale, {
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  return response
}

// ---------------------------------------------------------------------------
// Route matcher — exclude static assets and Next.js internals
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *   /api/*          — API routes (future)
     *   /_next/*        — Next.js build artefacts
     *   /images/*       — Static images
     *   /favicon.ico    — Browser favicon
     *   /*.svg|png|jpg  — Inline image references
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.svg$|.*\\.png$|.*\\.jpg$).*)',
  ],
}
