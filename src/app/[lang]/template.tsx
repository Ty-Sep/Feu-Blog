// =============================================================================
// LangTemplate — notebook page-flip transition.
//
// Simulates turning a physical notebook page using 3D CSS transforms.
//
// Design:
//   Both pages are stacked in the same CSS grid cell.  The exiting page
//   (top layer) folds to the left while the entering page (bottom layer)
//   flattens into view — just like turning a real page.
//
//   - perspective: 1500 px for depth
//   - exit:  rotateY  0 → -18 deg  (fold left),  opacity 1 → 0
//   - enter: rotateY 18 →   0 deg  (flatten),     opacity 0 → 1
//   - duration: 0.4 s, easeInOut
//   - GPU-accelerated (transform3d), no layout thrashing
//
// Mobile safe: rotation angle is small (18°) — readable at every frame.
// SSG safe:   AnimatePresence runs only on the client.
//
// Dependencies:
//   - framer-motion
// =============================================================================

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: {
    rotateY: 18,
    opacity: 0,
  },
  animate: {
    rotateY: 0,
    opacity: 1,
  },
  exit: {
    rotateY: -18,
    opacity: 0,
  },
}

const pageTransition = {
  duration: 0.4,
  ease: 'easeInOut' as const,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LangTemplate({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const pathname = usePathname()

  return (
    <div
      style={{
        perspective: '1500px',
        display: 'grid',
        minHeight: '100vh',
      }}
    >
      <AnimatePresence>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          style={{
            gridArea: '1 / 1',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
