// =============================================================================
// SmartRouteLoading — overlay that only appears when navigation exceeds ~180ms.
//
// Receives `isLoading` from RouteLoadingProvider.  Internally manages its own
// visibility with a two-phase approach:
//   1. When isLoading becomes true, double-rAF waits two paint frames so
//      content that is already in the JS bundle has a chance to paint first.
//   2. After the double-rAF:
//      - A MutationObserver watches for new DOM (streaming RSC / slow MDX).
//      - A short settle timeout (~500ms) acts as a fallback for static pages
//        where the content was already painted before the overlay appeared.
//   3. When either signal fires, the overlay fades out and unmounts.
// =============================================================================

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SmartRouteLoadingProps {
  isLoading: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FADE_IN_MS = 150
const FADE_OUT_MS = 220
const HIDE_DELAY_MS = 80
/** Absolute safety net — prevent infinite loading (ms) */
const SAFETY_TIMEOUT_MS = 10_000
/** Short fallback for already-rendered static pages (ms) */
const SETTLE_TIMEOUT_MS = 500

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SmartRouteLoading({
  isLoading,
}: SmartRouteLoadingProps): React.ReactElement | null {
  // ---- internal visibility ------------------------------------------------
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ---- refs ---------------------------------------------------------------
  const observerRef = useRef<MutationObserver | null>(null)
  const rafRef = useRef<number>(0)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const safetyRef = useRef<ReturnType<typeof setTimeout>>()
  const settleRef = useRef<ReturnType<typeof setTimeout>>()
  const hidingRef = useRef(false)

  // -------------------------------------------------------------------------
  // hideOverlay — triggers fade-out, then unmounts
  // -------------------------------------------------------------------------
  const hideOverlay = useCallback(() => {
    if (hidingRef.current) return
    hidingRef.current = true

    // Small delay so content has a moment to settle before fade-out begins
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)

      // After CSS fade-out completes, unmount the canvas element
      setTimeout(() => {
        setMounted(false)
        hidingRef.current = false
      }, FADE_OUT_MS + 20)
    }, HIDE_DELAY_MS)
  }, [])

  // -------------------------------------------------------------------------
  // cleanup — tear down timers, observer, rAF
  // -------------------------------------------------------------------------
  const cleanup = useCallback(() => {
    clearTimeout(hideTimerRef.current)
    clearTimeout(safetyRef.current)
    clearTimeout(settleRef.current)
    cancelAnimationFrame(rafRef.current)
    observerRef.current?.disconnect()
    observerRef.current = null
  }, [])

  // -------------------------------------------------------------------------
  // Effect: when isLoading flips to true, start the show / content-detect flow
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoading) {
      cleanup()
      hidingRef.current = false
      setVisible(false)
      setMounted(false)
      return
    }

    // isLoading just became true
    setMounted(true)
    hidingRef.current = false
    let contentReady = false

    // Phase 1: double-rAF — wait two paint frames.
    // If the page is static (already in the JS bundle), React will have
    // painted the content by the time these frames complete.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        if (hidingRef.current) return

        if (contentReady) {
          hideOverlay()
          return
        }

        // Content still hasn't painted → show loading overlay
        setVisible(true)

        // Phase 2: MutationObserver — detect content arriving via RSC stream
        const observer = new MutationObserver((mutations) => {
          // Skip mutations that come from our own overlay element
          const allOurs = mutations.every((m) => {
            const el = m.target as HTMLElement | null
            return el?.closest?.('[data-smart-loading]')
          })

          if (!allOurs && !hidingRef.current) {
            contentReady = true
            observer.disconnect()
            hideOverlay()
          }
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false,
        })

        observerRef.current = observer

        // Phase 3: settle fallback
        // For static pages content was already painted before the overlay
        // appeared — the observer won't fire (no new mutations).  This
        // short timeout catches that case.
        settleRef.current = setTimeout(() => {
          observer.disconnect()
          if (!hidingRef.current && !contentReady) {
            hideOverlay()
          }
        }, SETTLE_TIMEOUT_MS)

        // Phase 4: safety net (should never be reached)
        safetyRef.current = setTimeout(() => {
          observer.disconnect()
          if (!hidingRef.current) {
            hideOverlay()
          }
        }, SAFETY_TIMEOUT_MS)
      })
    })

    return () => {
      cleanup()
    }
  }, [isLoading, hideOverlay, cleanup])

  // -------------------------------------------------------------------------
  // Early return — nothing rendered until the 180ms delay has passed
  // -------------------------------------------------------------------------
  if (!mounted) return null

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      data-smart-loading
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: visible
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(255, 255, 255, 0)',
        backdropFilter: visible ? 'blur(2px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(2px)' : 'blur(0px)',
        opacity: visible ? 1 : 0,
        transition: `
          opacity ${visible ? FADE_IN_MS : FADE_OUT_MS}ms ease-out,
          background ${FADE_IN_MS}ms ease-out,
          backdrop-filter ${FADE_IN_MS}ms ease-out
        `,
        willChange: 'opacity',
      }}
    >
      {/* Lottie — 100–120px, centred */}
      <div
        style={{
          width: 120,
          height: 120,
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_IN_MS}ms ease-out`,
        }}
      >
        <DotLottieReact
          src="/loading.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}
