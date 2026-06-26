// =============================================================================
// ArchiveButton — hand-drawn circular notebook button with paper-flip animation.
//
// Renders a 52 px hand-drawn circle with a 3D flipping icon inside.
// Click triggers a rotateY(180deg) paper-flip animation before navigating.
//
// Behaviour:
//   - On non-archive pages → flips to home icon, navigates to /[locale]/archive
//   - On archive page      → flips to notebook icon, navigates to /[locale] (home)
//
// Visual:
//   - 52 × 52 px circle with hand-drawn SVG border (feTurbulence)
//   - 3D flip container (perspective + preserve-3d + backface-visibility)
//   - Front face: current icon  |  Back face: target icon (rotateY: 180deg)
//   - Hover:  rotate 6°, shadow deepens (disabled during flip)
//   - Active: scale 0.90 (disabled during flip)
//   - Flip:  500ms, ease-out deceleration (paper-tag feel)
//
// Dependencies:
//   - next/navigation (usePathname, useRouter)
//   - framer-motion     (motion.div, animate, onAnimationComplete)
//   - @/lib/types       (Locale)
// =============================================================================

'use client'

import React, { useId, useCallback, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import type { Locale } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArchiveButtonProps {
  locale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// SVG filter constants
// ---------------------------------------------------------------------------

const FILTER_SEED = 7
const TURBULENCE_BASE_FREQ = 0.04
const TURBULENCE_OCTAVES = 2
const DISPLACEMENT_SCALE = 1.6

// ---------------------------------------------------------------------------
// Icons (24 × 24 viewBox in 28 × 28 container — consistent with old icon)
// ---------------------------------------------------------------------------

/** Notebook with bookmark tab — "go to archive" */
function ArchiveIcon(): React.ReactElement {
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

/** Simple house — "go home / back" */
function HomeIcon(): React.ReactElement {
  return (
    <svg
      width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true"
      style={{ color: 'var(--ink-primary)' }}
    >
      <path d="M 5 13 L 14 5 L 23 13"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 7.5 11 V 23 H 20.5 V 11"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="17" x2="12" y2="23" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="12" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArchiveButton({
  locale,
  className = '',
}: ArchiveButtonProps): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const filterId = useId()
  const [flipping, setFlipping] = useState(false)

  // ── Bidirectional target ──
  const isArchive = pathname.endsWith('/archive')
  const href = isArchive ? `/${locale}` : `/${locale}/archive`
  const label = isArchive
    ? (locale === 'zh' ? '返回首页' : 'Back Home')
    : (locale === 'zh' ? '归档' : 'Archive')

  // ── Click → flip → navigate ──
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (flipping) return
    setFlipping(true)
  }, [flipping])

  const handleFlipComplete = useCallback(() => {
    router.push(href)
  }, [href, router])

  // ── Which icon on which face ──
  //    On non-archive → front=archive icon  (current), back=home icon  (target)
  //    On archive     → front=home icon     (current), back=archive icon (target)
  const FrontIcon = isArchive ? HomeIcon : ArchiveIcon
  const BackIcon  = isArchive ? ArchiveIcon : HomeIcon

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={flipping}
      aria-label={label}
      className={`
        group
        relative
        inline-flex items-center justify-center
        w-[52px] h-[52px]
        rounded-full
        transition-all duration-300
        ${!flipping ? 'hover:rotate-[6deg]' : ''}
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${className}
      `.replace(/\s+/g, ' ')}
      style={{
        backgroundColor: 'var(--bg-card)',
        outlineColor: 'var(--ink-primary)',
        boxShadow: 'var(--shadow-note)',
        perspective: '600px',
      }}
    >
      {/* ── Hand-drawn border SVG overlay (outside flip) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        viewBox="0 0 52 52"
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
        <circle cx="26" cy="26" r="23"
          fill="none" stroke="var(--ink-primary)" strokeWidth="1.4"
          filter={`url(#${filterId})`} />
        <circle cx="26" cy="26" r="21.5"
          fill="none" stroke="var(--ink-primary)" strokeWidth="0.7"
          filter={`url(#${filterId})`} opacity="0.5" />
      </svg>

      {/* ── Hover shadow (outside flip) ── */}
      <div
        className="
          absolute inset-0 rounded-full
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
        "
        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
      />

      {/* ═══════════════════════════════════════════
          3D Flip container — the icon card
          ═══════════════════════════════════════════ */}
      <motion.div
        key={pathname}
        className="relative z-[1] w-6 h-6"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipping ? 180 : 0 }}
        transition={flipping
          ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
          : { duration: 0 }
        }
        onAnimationComplete={() => {
          if (flipping) handleFlipComplete()
        }}
      >
        {/* ── Front face ── */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <FrontIcon />
        </div>

        {/* ── Back face (pre-rotated 180°) ── */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <BackIcon />
        </div>
      </motion.div>
    </button>
  )
}
