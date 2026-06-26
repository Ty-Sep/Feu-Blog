// =============================================================================
// ScrollReveal — scroll-triggered reveal animations via Framer Motion.
//
// Wraps children in a motion.div that animates into view when it enters the
// viewport.  Designed for the notebook / hand-drawn aesthetic:
//
//   fade-up     — opacity 0→1, translateY 24→0   (default)
//   fade-right  — opacity 0→1, translateX -16→0
//
// Stagger support:
//   Set `stagger` on the container and each child with `variants={fadeUpItem}`
//   will animate in sequence.
//
// Dependencies:
//   - framer-motion
// =============================================================================

'use client'

import React from 'react'
import { motion, type Variants } from 'framer-motion'

// ---------------------------------------------------------------------------
// Public variants — import these in section components for stagger
// ---------------------------------------------------------------------------

export const fadeUpContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScrollRevealProps {
  children: React.ReactNode
  /** Animation direction.  Default: 'up'. */
  direction?: 'up' | 'right'
  /** Delay before the animation starts, in seconds. */
  delay?: number
  /** Amount of the element that must be visible before animating (0–1). */
  threshold?: number
  /** If true, animation only plays once (default true). */
  once?: boolean
  className?: string
  /** Use this as a different HTML element.  Default: 'div'. */
  as?: keyof React.JSX.IntrinsicElements
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  threshold = 0.15,
  once = true,
  className = '',
  as: Tag = 'div',
}: ScrollRevealProps): React.ReactElement {
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag
      className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: threshold }}
        variants={{
          hidden: {
            opacity: 0,
            y: direction === 'up' ? 24 : 0,
            x: direction === 'right' ? -16 : 0,
          },
          visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
              delay,
            },
          },
        }}
      >
        {children}
      </MotionTag>
  )
}
