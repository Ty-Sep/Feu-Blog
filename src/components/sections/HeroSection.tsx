// =============================================================================
// HeroSection — sketchbook hero: hand-drawn window (Phase Hero-Animation).
//
// Full-viewport scene with an animated window illustration (HeroWindowScene).
//
// z-index layers inside the window:
//   z:10  sky background
//   z:15  clouds / waves
//   z:20  plane / boat
//   z:40  Window frame SVG  (hand-drawn border, glass fill)
//   z:50  Welcome text      (greeting / name / subtitle)
//
// Dependencies:
//   - HeroWindowScene (Phase Hero-Animation)
//   - MainNav          (Phase 3C)
// =============================================================================

'use client'

import React, { useId, useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

import type { Locale } from '@/types'

import { HeroWindowScene } from '@/components/interactive/HeroWindowScene'
import miroodlesSticker from '@/image/Miroodles - Sticker.png'
import handsBirdImg from '@/image/Hands - Bird.png'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroSectionProps {
  locale: Locale
  className?: string
}

// ---------------------------------------------------------------------------
// Typewriter subtitle
// ---------------------------------------------------------------------------

const SCENE_TEXTS: Record<Locale, Record<'cloud' | 'space', string>> = {
  zh: {
    cloud: '欢迎来到我的博客',
    space: '记录学习、实验与创作。',
  },
  en: {
    cloud: 'Welcome to my blog',
    space: 'Notes, experiments & creations.',
  },
}

const BLOG_TITLE: Record<Locale, string> = {
  zh: '阿怪的博客',
  en: "Ayla's Blog",
}
const TYPE_SPEED = 100 // ms per character (forward)
const DELETE_SPEED = 60 // ms per character (backward)

function TypewriterText({ scenePhase, locale }: { scenePhase: 'cloud' | 'space'; locale: Locale }) {
  const [textKey, setTextKey] = useState<'cloud' | 'space'>('cloud')
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing')
  const prevSceneRef = useRef(scenePhase)
  const pendingSceneRef = useRef<'cloud' | 'space'>('cloud')
  const prevLocaleRef = useRef(locale)

  // Detect scene change or locale change → start deleting current text
  useEffect(() => {
    const sceneChanged = prevSceneRef.current !== scenePhase
    const localeChanged = prevLocaleRef.current !== locale
    prevSceneRef.current = scenePhase
    prevLocaleRef.current = locale
    if (!sceneChanged && !localeChanged) return
    pendingSceneRef.current = scenePhase
    setPhase('deleting')
  }, [scenePhase, locale])

  // Animate characters one by one
  useEffect(() => {
    const fullText = SCENE_TEXTS[locale][textKey] || ''

    if (phase === 'typing' && displayed.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayed(fullText.slice(0, displayed.length + 1))
      }, TYPE_SPEED)
      return () => clearTimeout(timer)
    }

    if (phase === 'deleting' && displayed.length > 0) {
      const timer = setTimeout(() => {
        setDisplayed(displayed.slice(0, -1))
      }, DELETE_SPEED)
      return () => clearTimeout(timer)
    }

    // Deletion finished → switch to next scene's text and start typing
    if (phase === 'deleting' && displayed.length === 0) {
      setTextKey(pendingSceneRef.current)
      setPhase('typing')
    }
  }, [phase, displayed, textKey])

  return (
    <span>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1.2em',
          backgroundColor: 'var(--ink-secondary)',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
        }}
      />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Framer Motion variants — welcome text stagger
// ---------------------------------------------------------------------------

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const child = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ---------------------------------------------------------------------------
// Window SVG filter constants
// ---------------------------------------------------------------------------

const WINDOW_FILTER_SEED = 7
const WINDOW_BASE_FREQ = 0.03
const WINDOW_OCTAVES = 3
const WINDOW_DISPLACEMENT = 1.8
const WINDOW_PANE_FILL = 'var(--window-pane-fill)'

// ---------------------------------------------------------------------------
// WindowFrame — hand-drawn four-pane window (visual only, no logic)
// ---------------------------------------------------------------------------

function WindowFrame({
  filterId,
  children,
}: {
  filterId: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <>
      {/* ── SVG overlay — z-2 ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 40 }}
      >
        <defs>
          <filter
            id={filterId}
            x="-4%" y="-4%" width="108%" height="108%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={String(WINDOW_BASE_FREQ)}
              numOctaves={WINDOW_OCTAVES}
              seed={WINDOW_FILTER_SEED}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={WINDOW_DISPLACEMENT}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <rect
          x="2.5" y="2.5" width="95" height="95"
          fill={WINDOW_PANE_FILL}
          stroke="var(--ink-primary)"
          strokeWidth="1.6"
          filter={`url(#${filterId})`}
        />
        <line
          x1="2.5" y1="50" x2="97.5" y2="50"
          stroke="var(--ink-primary)" strokeWidth="1.3"
          filter={`url(#${filterId})`}
        />
        <line
          x1="50" y1="2.5" x2="50" y2="97.5"
          stroke="var(--ink-primary)" strokeWidth="1.3"
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* ── Content — z-50 (always on top) ── */}
      <div className="relative" style={{ zIndex: 50 }}>
        {children}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// HeroSection
// ---------------------------------------------------------------------------

export function HeroSection({
  locale,
  className = '',
}: HeroSectionProps): React.ReactElement {
  const windowFilterId = useId()
  const windowRef = useRef<HTMLDivElement>(null)
  const [scenePhase, setScenePhase] = useState<'cloud' | 'space'>('cloud')

  const handleSceneChange = useCallback((scene: 'cloud' | 'space') => {
    setScenePhase(scene)
  }, [])

  return (
    <motion.section
      className={`relative flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: '100vh' }}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* ════════════════════════════════════════════
          Window container — relative positioning context
          ════════════════════════════════════════════ */}
      <div
        id="hero-window"
        ref={windowRef}
        className="relative"
        style={{
          zIndex: 30,
          maxWidth: 'clamp(600px, 90vw, 960px)',
          width: '100%',
        }}
      >
        {/* ── Window scene animation (z:10–20) ── */}
        <HeroWindowScene windowRef={windowRef} onSceneChange={handleSceneChange} />

        {/* ── Window frame (z:40) + Welcome text (z:50) ── */}
        <WindowFrame filterId={windowFilterId}>
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              padding: 'clamp(100px, 6vw, 80px) clamp(30px, 5vw, 70px)',
              gap: '20px',
            }}
          >
            {/* ── Blog name (static, never changes) ── */}
            <motion.h1
              variants={child}
              className="font-title leading-tight"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 'clamp(4rem, 8vw, 7rem)',
                fontWeight: 700,
                color: 'var(--ink-primary)',
              }}
            >
              {BLOG_TITLE[locale]}
            </motion.h1>

            {/* ── Typewriter subtitle ── */}
            <motion.p
              variants={child}
              className="leading-relaxed max-w-[32rem]"
              style={{
                fontSize: '1.3rem',
                color: 'var(--ink-secondary)',
                opacity: 0.85,
                minHeight: '1.75em',
              }}
            >
              <TypewriterText scenePhase={scenePhase} locale={locale} />
            </motion.p>
          </div>
        </WindowFrame>
      </div>

      {/* ════════════════════════════════════════════
          Layer 10 — Stickers
          ════════════════════════════════════════════ */}
      <img
        src={handsBirdImg.src}
        alt=""
        aria-hidden="true"
        className="hidden sm:block"
        style={{
          position: 'absolute',
          top: '85px',
          left: '20px',
          width: '120px',
          height: 'auto',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      <img
        src={miroodlesSticker.src}
        alt=""
        aria-hidden="true"
        className="hidden sm:block"
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '24px',
          width: '140px',
          height: 'auto',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </motion.section>
  )
}
