// =============================================================================
// MainNav — unified hand-drawn circular floating button (Phase 3C).
//
// A 48 px button with a hand-drawn SVG border (feTurbulence).  Supports three
// variants selected by the `variant` prop:
//
//   archive  — NotebookIcon  → Link to /[locale]/archive
//   home     — HomeIcon       → Link to /[locale]
//   back     — ArrowLeftIcon  → router.back()
//
// All variants share the same visual style:
//   48 px circle · bg-card · shadow-note · hover rotate(6deg)
//
// Dependencies:
//   - next/link
//   - next/navigation (useRouter — back variant only)
//   - @/types (Locale)
// =============================================================================

'use client'

import React, { useId, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { Locale } from '@/types'

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABEL: Record<MainNavVariant, Record<Locale, string>> = {
  archive: { zh: '归档', en: 'Archive' },
  home: { zh: '首页', en: 'Home' },
  back: { zh: '返回', en: 'Back' },
}

// ---------------------------------------------------------------------------
// SVG filter constants (hand-drawn wobble)
// ---------------------------------------------------------------------------

const FILTER_SEED = 11
const TURBULENCE_BASE_FREQ = 0.04
const TURBULENCE_OCTAVES = 2
const DISPLACEMENT_SCALE = 1.6

// ---------------------------------------------------------------------------
// Icons (24 × 24 viewBox in 28 × 28 container)
// ---------------------------------------------------------------------------

function NotebookIcon(): React.ReactElement {
  return (
    <svg
      width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true"
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

function HomeIcon(): React.ReactElement {
  return (
    <svg
      width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true"
      style={{ color: 'var(--ink-primary)' }}
    >
      <path d="M 4 13 L 14 4 L 24 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 7 10 L 7 24 L 21 24 L 21 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11" y="16" width="6" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  )
}

function ArrowLeftIcon(): React.ReactElement {
  return (
    <svg
      width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true"
      style={{ color: 'var(--ink-primary)' }}
    >
      <path d="M 18 6 L 8 14 L 18 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ICON: Record<MainNavVariant, () => React.ReactElement> = {
  archive: NotebookIcon,
  home: HomeIcon,
  back: ArrowLeftIcon,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MainNavVariant = 'archive' | 'home' | 'back'

export interface MainNavProps {
  locale: Locale
  variant?: MainNavVariant
  className?: string
}

// ---------------------------------------------------------------------------
// Shared button shell (visual chrome shared by all variants)
// ---------------------------------------------------------------------------

function ButtonShell({
  filterId,
  children,
}: {
  filterId: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <>
      {/* ── Hand-drawn border SVG overlay ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        viewBox="0 0 48 48"
      >
        <defs>
          <filter
            id={filterId}
            x="-10%" y="-10%" width="120%" height="120%"
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
        <circle cx="24" cy="24" r="21"
          fill="none" stroke="var(--ink-primary)" strokeWidth="1.3"
          filter={`url(#${filterId})`} />
        <circle cx="24" cy="24" r="19.5"
          fill="none" stroke="var(--ink-primary)" strokeWidth="0.6"
          filter={`url(#${filterId})`} opacity="0.45" />
      </svg>

      {/* ── Hover shadow ring ── */}
      <div
        className="
          absolute inset-0 rounded-full
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
        "
        style={{ boxShadow: 'var(--shadow-hover)' }}
      />

      {/* ── Icon ── */}
      <span className="relative z-[1]">
        {children}
      </span>
    </>
  )
}

// ---------------------------------------------------------------------------
// Shared className builder
// ---------------------------------------------------------------------------

function navClassName(extra = ''): string {
  return `
    group
    relative
    inline-flex items-center justify-center
    w-[48px] h-[48px]
    rounded-full
    transition-all duration-300
    hover:rotate-[6deg]
    focus-visible:outline-2 focus-visible:outline-offset-2
    ${extra}
  `.replace(/\s+/g, ' ')
}

const NAV_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  outlineColor: 'var(--ink-primary)',
  boxShadow: 'var(--shadow-note)',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MainNav({
  locale,
  variant = 'archive',
  className = '',
}: MainNavProps): React.ReactElement {
  const filterId = useId()
  const router = useRouter()
  const Icon = ICON[variant]
  const label = LABEL[variant][locale]

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // ── Back variant: button (needs onClick) ──
  if (variant === 'back') {
    return (
      <button
        type="button"
        onClick={handleBack}
        aria-label={label}
        className={navClassName(className)}
        style={NAV_STYLE}
      >
        <ButtonShell filterId={filterId}>
          <Icon />
        </ButtonShell>
      </button>
    )
  }

  // ── archive / home variants: Link ──
  const href = variant === 'home' ? `/${locale}` : `/${locale}/archive`

  return (
    <Link
      href={href}
      aria-label={label}
      className={navClassName(className)}
      style={NAV_STYLE}
    >
      <ButtonShell filterId={filterId}>
        <Icon />
      </ButtonShell>
    </Link>
  )
}
