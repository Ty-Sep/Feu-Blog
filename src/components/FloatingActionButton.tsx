// =============================================================================
// FloatingActionButton — unified 3D push-button FAB.
//
// Visual: circular "paper stamp" that presses into a dark base.
// Structure follows the reference 3D push pattern:
//   outer (.outer) = dark "shadow" layer
//     inner (.top) = light "stamp" face, translates on hover/active
//
// Route-driven icon switching (automatic, no per-page config):
//   Homepage (/)        → Archive icon  → Link to /[locale]/archive
//   Archive  (/archive) → Home icon     → Link to /[locale]
//   Any other page      → Back arrow    → router.back()
//
// Dependencies:
//   - next/navigation (usePathname, useRouter)
//   - next/link
// =============================================================================

'use client'

import React, { useId, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import styles from './FloatingActionButton.module.css'

// ---------------------------------------------------------------------------
// SVG filter constants (hand-drawn wobble)
// ---------------------------------------------------------------------------

const FILTER_SEED = 13
const TURBULENCE_BASE_FREQ = 0.045
const TURBULENCE_OCTAVES = 3
const DISPLACEMENT_SCALE = 1.6

// ---------------------------------------------------------------------------
// Icons — hand-drawn line-art, 28×28 viewBox
// ---------------------------------------------------------------------------

/** Notebook-with-bookmark — "go to archive" */
function ArchiveIcon(): React.ReactElement {
  return (
    <svg
      width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"
      style={{ color: 'var(--ink-primary)' }}
    >
      <rect x="4" y="2" width="18" height="23" rx="1.5"
        stroke="currentColor" strokeWidth="1.3" fill="none" />
      <line x1="4" y1="8" x2="4" y2="20"
        stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="9" y1="8"  x2="19" y2="7.5"  stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="9" y1="12" x2="19" y2="11.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <line x1="9" y1="16" x2="16" y2="15.5" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M 13 2 L 13 7 L 11 5.5 L 9 7 L 9 2"
        stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

/** Simple house — "go home" */
function HomeIcon(): React.ReactElement {
  return (
    <svg
      width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"
      style={{ color: 'var(--ink-primary)' }}
    >
      <path d="M 4 13 L 14 4 L 24 13"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 7 10 L 7 24 L 21 24 L 21 10"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11" y="16" width="6" height="8" rx="0.5"
        stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  )
}

/** Left arrow — "go back" */
function BackIcon(): React.ReactElement {
  return (
    <svg
      width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"
      style={{ color: 'var(--ink-primary)' }}
    >
      <path d="M 19 6 L 9 14 L 19 22"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FabVariant = 'archive' | 'home' | 'back'

// ---------------------------------------------------------------------------
// Labels (bilingual)
// ---------------------------------------------------------------------------

const LABEL: Record<FabVariant, Record<string, string>> = {
  archive: { zh: '归档', en: 'Archive' },
  home: { zh: '首页', en: 'Home' },
  back: { zh: '返回', en: 'Back' },
}

const ICON: Record<FabVariant, () => React.ReactElement> = {
  archive: ArchiveIcon,
  home: HomeIcon,
  back: BackIcon,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLocale(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)
  return seg[0] || 'zh'
}

/**
 *   /[locale]              → archive  (homepage → go to archive)
 *   /[locale]/archive      → home     (archive  → go home)
 *   /[locale]/anything/*   → back     (any other page → go back)
 */
function getVariant(pathname: string): FabVariant {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0 || segments.length === 1) {
    return 'archive'
  }

  if (segments.length === 2 && segments[1] === 'archive') {
    return 'home'
  }

  return 'back'
}

// ---------------------------------------------------------------------------
// Hand-drawn border SVG overlay
//
// Applied inside .top as a subtle wobble on top of the CSS 2px border.
// ---------------------------------------------------------------------------

function HandDrawnBorder({ filterId }: { filterId: string }): React.ReactElement {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      viewBox="0 0 60 60"
    >
      <defs>
        <filter
          id={filterId}
          x="-12%" y="-12%" width="124%" height="124%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={String(TURBULENCE_BASE_FREQ)}
            numOctaves={TURBULENCE_OCTAVES}
            seed={FILTER_SEED}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={DISPLACEMENT_SCALE}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {/* Single wobble ring — the CSS border handles the primary stroke */}
      <circle cx="30" cy="30" r="27.5"
        fill="none" stroke="var(--ink-primary)" strokeWidth="0.8"
        filter={`url(#${filterId})`} opacity="0.5" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Inner stamp face — shared by all variants
// ---------------------------------------------------------------------------

function StampFace({
  filterId,
  children,
}: {
  filterId: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <span className={styles.top}>
      <HandDrawnBorder filterId={filterId} />
      <span className="relative z-[1] flex items-center justify-center">
        {children}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FloatingActionButton(): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const filterId = useId()

  const variant = useMemo(() => getVariant(pathname), [pathname])
  const locale = useMemo(() => getLocale(pathname), [pathname])

  const Icon = ICON[variant]
  const label = LABEL[variant]?.[locale] ?? LABEL[variant]?.zh ?? ''

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // ── back variant: <button> outer + router.back() ──
  if (variant === 'back') {
    return (
      <div className={styles.container}>
        <button
          type="button"
          onClick={handleBack}
          aria-label={label}
          className={styles.outer}
        >
          <StampFace filterId={filterId}>
            <Icon />
          </StampFace>
        </button>
      </div>
    )
  }

  // ── archive / home variants: <Link> outer ──
  const href = variant === 'home' ? `/${locale}` : `/${locale}/archive`

  return (
    <div className={styles.container}>
      <Link
        href={href}
        aria-label={label}
        className={styles.outer}
      >
        <StampFace filterId={filterId}>
          <Icon />
        </StampFace>
      </Link>
    </div>
  )
}
