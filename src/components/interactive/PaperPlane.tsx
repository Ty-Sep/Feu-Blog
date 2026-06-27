// =============================================================================
// PaperPlane — global paper plane with rAF physics (Phase 7C — smooth flip).
//
// PNG asset: nose points RIGHT by default.
// Sprite-facing: rotation clamped to ±90°; scaleX lerps smoothly when flipping,
// hysteresis prevents rapid oscillation near vertical, and a transient bank
// angle creates a natural banking-toward-turn feel.
// =============================================================================

'use client'

import React, { useRef, useEffect, forwardRef, useCallback } from 'react'

import paperPlanePng from '@/image/paper-plane.png'
import { clamp } from '@/lib/common'

// ---------------------------------------------------------------------------
// Physics constants
// ---------------------------------------------------------------------------

/** Max speed — pixels per frame at ~60 fps. */
const MAX_SPEED = 4.0
/** Velocity blend factor toward desired direction. */
const VELOCITY_BLEND = 0.10
/** Per-frame velocity decay during glide (mouse leave). */
const GLIDE_DECAY = 0.988
/** Shortest-angle lerp factor for heading smoothing. */
const ANGLE_SMOOTH = 0.08
/** Cap on per-frame rotation change (degrees). */
const MAX_TURN_RATE = 2.5
/** Minimum speed for heading updates (avoids twitch at rest). */
const HEADING_SPEED_THRESHOLD = 0.08

// ---------------------------------------------------------------------------
// Idle-cruise constants
// ---------------------------------------------------------------------------

/** Cruise speed when drifting toward an idle target. */
const IDLE_SPEED = 1.4
/** Idle velocity blend — gentler than mouse-follow. */
const IDLE_VELOCITY_BLEND = 0.04
/** Min / max interval between idle target changes (ms). */
const IDLE_TARGET_INTERVAL_MIN = 3000
const IDLE_TARGET_INTERVAL_MAX = 6000
/** Distance threshold to consider a target "reached". */
const IDLE_REACHED_DIST = 12
/** Margin from container edges when picking idle targets. */
const IDLE_EDGE_MARGIN = 80

// ---------------------------------------------------------------------------
// Flip-smoothing constants
// ---------------------------------------------------------------------------

/** Lerp factor for currentScaleX → targetScaleX. */
const SCALE_SMOOTH = 0.12
/** Hysteresis: enter left-facing when |rawAngle| > this. */
const FLIP_ENTER_THRESHOLD = 120
/** Hysteresis: exit left-facing when |rawAngle| < this. */
const FLIP_EXIT_THRESHOLD = 60
/** Peak bank angle during flip (degrees). */
const BANK_PEAK = 10
/** Lerp factor for bankAngle → bankTarget. */
const BANK_SMOOTH = 0.1

// ---------------------------------------------------------------------------
// Angle helpers
// ---------------------------------------------------------------------------

/** Returns the shortest signed difference from `from` to `to` in degrees. */
function angleDiff(from: number, to: number): number {
  let d = to - from
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaperPlaneProps {
  /** Ref to the container element the plane is confined within. */
  containerRef: React.RefObject<HTMLElement | null>
  /** Called when the plane is clicked, with its current bounding rect. */
  onClick?: (rect: DOMRect) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PaperPlane = forwardRef<HTMLDivElement, PaperPlaneProps>(
  function PaperPlane({ containerRef, onClick }, ref) {
  const internalRef = useRef<HTMLDivElement | null>(null)

  // Merge forwarded ref + internal ref so the parent can read the DOM node
  const setPlaneRef = useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
    },
    [ref],
  )

  // Alias for internal use — always use internalRef
  const planeRef = internalRef

  useEffect(() => {
    const container = containerRef.current
    const planeEl = planeRef.current
    if (!container || !planeEl) return

    // ── Mutable state (closure vars avoid React re-renders) ──
    let posX = 0
    let posY = 0
    let vx = 0
    let vy = 0
    let currentAngle = 0
    let mouseX = 0
    let mouseY = 0
    let mouseActive = false
    let idleActive = true // starts cruising on mount
    let idleTargetX = 0
    let idleTargetY = 0
    let planeW = 72 // updated by ResizeObserver
    let planeH = 54

    let animId = 0
    let lastTime = 0
    let idleTimerId = 0
    let initialized = false

    // ── Sprite-facing — smooth scaleX mirror + bank angle ──
    let targetScaleX = 1
    let currentScaleX = 1
    let bankAngle = 0

    // ── Derived centre helpers ──
    const centreX = () => posX + planeW / 2
    const centreY = () => posY + planeH / 2

    // ── ResizeObserver — track plane dimensions for clamping ──
    const planeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        planeW = entry.contentRect.width
        planeH = entry.contentRect.height
      }
    })
    planeObserver.observe(planeEl)

    // ── Initialise — prefer hero-window centre, fallback to container ──
    const initPosition = () => {
      const containerRect = container.getBoundingClientRect()
      const hero = document.getElementById('hero-window')

      if (hero) {
        const heroRect = hero.getBoundingClientRect()
        posX = heroRect.left - containerRect.left + (heroRect.width - planeW) / 2
        posY = heroRect.top - containerRect.top + (heroRect.height - planeH) / 2
      } else {
        posX = Math.max(0, (containerRect.width - planeW) / 2)
        posY = Math.max(0, (containerRect.height - planeH) / 2)
      }

      vx = 0
      vy = 0
      currentAngle = -15
      initialized = true
      applyTransform()
    }

    // ── Apply transform to DOM ──
    const applyTransform = () => {
      if (!planeEl) return
      planeEl.style.transform =
        `translate(${posX}px, ${posY}px) scaleX(${currentScaleX}) rotate(${currentAngle + bankAngle}deg)`
    }

    // ── Clamp position to container bounds ──
    const clampPosition = () => {
      const rect = container.getBoundingClientRect()
      const maxX = Math.max(0, rect.width - planeW)
      const maxY = Math.max(0, rect.height - planeH)

      if (posX < 0) { posX = 0; vx = 0 }
      else if (posX > maxX) { posX = maxX; vx = 0 }

      if (posY < 0) { posY = 0; vy = 0 }
      else if (posY > maxY) { posY = maxY; vy = 0 }
    }

    // ── Idle target management ──
    const pickIdleTarget = () => {
      const rect = container.getBoundingClientRect()
      const margin = IDLE_EDGE_MARGIN
      const w = Math.max(0, rect.width - margin * 2)
      const h = Math.max(0, rect.height - margin * 2)
      idleTargetX = margin + Math.random() * w
      idleTargetY = margin + Math.random() * h
    }

    const scheduleNextIdleTarget = () => {
      const delay =
        IDLE_TARGET_INTERVAL_MIN +
        Math.random() * (IDLE_TARGET_INTERVAL_MAX - IDLE_TARGET_INTERVAL_MIN)
      idleTimerId = window.setTimeout(() => {
        pickIdleTarget()
        scheduleNextIdleTarget()
      }, delay)
    }

    // ── Mouse handlers ──
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      mouseActive = true
      idleActive = false
    }

    const onMouseLeave = () => {
      mouseActive = false
    }

    // ── Animation loop (rAF) ──
    const animate = (timestamp: number) => {
      if (!initialized) {
        initPosition()
        lastTime = timestamp
        animId = requestAnimationFrame(animate)
        return
      }

      if (lastTime === 0) lastTime = timestamp
      lastTime = timestamp

      // ── Multi-sine jitter (turbulence feel, ±2°) ──
      const t = timestamp * 0.001
      const rawJitter =
        Math.sin(t * 2.17) * 1.1 +
        Math.sin(t * 3.83) * 0.55 +
        Math.sin(t * 5.41) * 0.3
      const jitter = clamp(rawJitter, -2, 2)

      // ════════════════════════════════════════════════════════
      // Physics — mouse-follow / idle-cruise / glide
      // ════════════════════════════════════════════════════════

      if (mouseActive) {
  // ── Mouse follow — stop near cursor instead of touching it ──
  const cx = centreX()
  const cy = centreY()

  let dx = mouseX - cx
  let dy = mouseY - cy
  let dist = Math.sqrt(dx * dx + dy * dy)
  

  if (dist > 0.001) {
    const nx = dx / dist
    const ny = dy / dist

    /**
     * 希望停留的距离（飞机中心距离鼠标）
     */
    const STOP_DISTANCE = 50

    /**
     * 开始减速的范围
     */
    const SLOW_RADIUS = 110

    /**
     * 当距离进入减速区以后，
     * 实际追逐目标改为距离鼠标 STOP_DISTANCE 的位置。
     */
    if (dist < SLOW_RADIUS) {
      const targetDist = Math.max(dist - STOP_DISTANCE, 0)

      dx = nx * targetDist
      dy = ny * targetDist
      dist = targetDist
    }

    if (dist > 0.5) {
      const desiredSpeed = Math.min(dist * 0.065, MAX_SPEED)

      vx += (dx / Math.max(dist, 1)) * desiredSpeed - vx
      vy += (dy / Math.max(dist, 1)) * desiredSpeed - vy

      vx *= (1 - VELOCITY_BLEND)
      vy *= (1 - VELOCITY_BLEND)

      vx += ((dx / Math.max(dist, 1)) * desiredSpeed) * VELOCITY_BLEND
      vy += ((dy / Math.max(dist, 1)) * desiredSpeed) * VELOCITY_BLEND
    } else {
      vx *= 0.85
      vy *= 0.85
    }
  }
} else if (idleActive) {
        // ── Idle cruise — drift toward random target ──
        const cx = centreX()
        const cy = centreY()
        const dx = idleTargetX - cx
        const dy = idleTargetY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > IDLE_REACHED_DIST) {
          const nx = dx / dist
          const ny = dy / dist
          const desiredSpeed = Math.min(dist * 0.025, IDLE_SPEED)
          vx += (nx * desiredSpeed - vx) * IDLE_VELOCITY_BLEND
          vy += (ny * desiredSpeed - vy) * IDLE_VELOCITY_BLEND
        } else {
          vx *= 0.94
          vy *= 0.94
        }
      } else {
        // ── Inertial glide (mouse just left) ──
        vx *= GLIDE_DECAY
        vy *= GLIDE_DECAY

        if (Math.abs(vx) < 0.02) vx = 0
        if (Math.abs(vy) < 0.02) vy = 0

        const speed = Math.sqrt(vx * vx + vy * vy)
        if (speed < 0.08) {
          idleActive = true
        }
      }

      posX += vx
      posY += vy
      clampPosition()

      // ════════════════════════════════════════════════════════
      // Sprite-facing heading — hysteresis + smooth flip + bank
      // ════════════════════════════════════════════════════════

      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed > HEADING_SPEED_THRESHOLD) {
        const rawAngle = Math.atan2(vy, vx) * (180 / Math.PI)

        // ── Hysteresis: avoid rapid flipping near ±90° ──
        const absRaw = Math.abs(rawAngle)
        if (absRaw > FLIP_ENTER_THRESHOLD) {
          targetScaleX = -1
        } else if (absRaw < FLIP_EXIT_THRESHOLD) {
          targetScaleX = 1
        }
        // otherwise keep current targetScaleX (dead zone 60°–120°)

        // ── Compute displayAngle from targetScaleX ──
        let displayAngle: number
        if (targetScaleX === -1) {
          if (rawAngle > 90) {
            displayAngle = 180 - rawAngle
          } else if (rawAngle < -90) {
            displayAngle = -180 - rawAngle
          } else {
            displayAngle = rawAngle
          }
        } else {
          displayAngle = rawAngle
        }

        // ── Smooth angle toward displayAngle (max-turn-rate clamped) ──
        const diff = angleDiff(currentAngle, displayAngle)
        let step = diff * ANGLE_SMOOTH
        step = clamp(step, -MAX_TURN_RATE, MAX_TURN_RATE)
        currentAngle += step
      }

      // ── Smooth scaleX transition ──
      currentScaleX += (targetScaleX - currentScaleX) * SCALE_SMOOTH

      // ── Bank angle — transient tilt during flip ──
      const flipProgress = Math.abs(targetScaleX - currentScaleX) // 0 → 2 → 0
      const bankTarget = flipProgress > 0.03
        ? clamp((targetScaleX - currentScaleX) * (BANK_PEAK / 2), -BANK_PEAK, BANK_PEAK)
        : 0
      bankAngle += (bankTarget - bankAngle) * BANK_SMOOTH

      // ── Apply to DOM — translate + scaleX + rotate ──
      if (planeEl) {
        planeEl.style.transform =
          `translate(${posX}px, ${posY}px) scaleX(${currentScaleX}) rotate(${currentAngle + jitter + bankAngle}deg)`
      }

      animId = requestAnimationFrame(animate)
    }

    // ── Start ──
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    pickIdleTarget()
    scheduleNextIdleTarget()

    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      planeObserver.disconnect()
      window.clearTimeout(idleTimerId)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [containerRef])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onClick || !planeRef.current) return
    onClick(planeRef.current.getBoundingClientRect())
  }

  return (
    <div
      ref={setPlaneRef}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="打开搜索"
      className="
        pointer-events-auto cursor-pointer
        w-[48px] sm:w-[56px] md:w-[72px] lg:w-[84px]
        h-auto
      "
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 5,
        willChange: 'transform',
        transformOrigin: 'center center',
        opacity: 0.75,
      }}
    >
      <img
        src={paperPlanePng.src}
        alt=""
        aria-hidden="true"
        className="block w-full h-auto"
        draggable={false}
      />
    </div>
  )
})
